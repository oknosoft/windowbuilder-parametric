
module.exports = function prm_post($p, log, serialize_prod) {

  const {cat, utils, md, classes: {PouchDB}, job_prm, doc: {calc_order}, dp: {buyers_order}, adapters: {pouch}} = $p;

  // формирует json описания продукции заказа
  async function order(req, res) {

    const {parsed: {paths}, body: {action, rows, ...body}, user} = req;
    const ref = (paths[2] || '').toLowerCase();
    const result = {ref, production: []};
    const {contracts, nom, inserts, clrs} = cat;
    const dp = buyers_order.create();
    let o, prod;

    if(!utils.is_guid(result.ref)){
      utils.end.end500({res, err: {
        status: 404,
        message: `Параметр ref=${result.ref} не соответствует маске уникального идентификатора, suffix: '${user.branch.suffix}'`
        }, log});
      return;
    }

    // обработчики действий
    const actions = {

      // заполняет и рассчитывает заказ по массиву входящих параметров
      async prm() {
        o.production.clear();

        // включаем режим загрузки, чтобы в пустую не выполнять обработчики при изменении реквизитов
        o._data._loading = true;

        // заполняем шапку заказа
        o.date = utils.moment(body.date).toDate();
        o.number_internal = body.number_doc;
        if(body.note){
          o.note = body.note;
        }
        o.obj_delivery_state = 'Черновик';
        if(body.partner) {
          o.partner = body.partner;
        }
        if(o.contract.empty() || body.partner) {
          o.contract = contracts.by_partner_and_org(o.partner, o.organization);
        }
        o.vat_consider = o.vat_included = true;

        // допреквизиты: бежим структуре входного параметра, если свойства нет в реквизитах, проверяем доп
        for(const fld in body) {
          if(o._metadata(fld)){
            continue;
          }
          const property = job_prm.properties[fld];
          if(property && !property.empty()){
            const {type} = property;
            let finded;
            let value = body[fld];
            if(type.date_part) {
              value = utils.fix_date(value, !type.hasOwnProperty('str_len'));
            }
            else if(type.digits) {
              value = utils.fix_number(value, !type.hasOwnProperty('str_len'));
            }
            else if(type.types[0] == 'boolean') {
              value = utils.fix_boolean(value);
            }
            o.extra_fields.find_rows({property}, (row) => {
              row.value = value;
              finded = true;
              return false;
            });
            if(!finded){
              o.extra_fields.add({property, value});
            }
          }
        }

        // подготавливаем массив продукций
        for (let row of body.production) {
          if(!nom.by_ref[row.nom] || nom.by_ref[row.nom].is_new()) {
            if(!inserts.by_ref[row.nom] || inserts.by_ref[row.nom].is_new()) {
              utils.end.end500({res, err: {
                  status: 404,
                  message: `Не найдена номенклатура или вставка ${row.nom}, suffix: '${user.branch.suffix}'`}, log});
              return o.unload();
            }
            row.inset = row.nom;
            delete row.nom;
          }
          if(row.clr && row.clr != utils.blank.guid && !clrs.by_ref[row.clr]) {
            utils.end.end500({res, err: {
                status: 404,
                message: `Не найден цвет ${row.clr}, suffix: '${user.branch.suffix}'`}, log});
            return o.unload();
          }
          dp.production.add(row);
        }

        // добавляем строки продукций и материалов
        const ax = await o.process_add_product_list(dp);
        await Promise.all(ax);
        o.obj_delivery_state = body.obj_delivery_state == 'Отозван' ? 'Отозван' : (body.obj_delivery_state == 'Черновик' ? 'Черновик' : 'Отправлен');

        // записываем
        await o.save();

        // формируем ответ
        return serialize_prod({o, prod, res});
      },

      // пересчитывает спецификации и цены
      recalc() {
        return o.recalc({save: true})
          .then(() => {
            res.end(JSON.stringify(o));
          });
      },

      // выполняет пересчет, проверки и присваивает состояние транспорта "отправлен"
      send() {
        throw new Error('Метод "send" не реализован');
      },

      rm_rows() {
        if(!Array.isArray(rows)) {
          throw new Error('Свойство "rows" должно быть массивом');
        }
        const rm = rows.map((rnum) => o.production.get(rnum - 1));
        for(const row of rm) {
          row && o.production.del(row);
        }
        return this.recalc();
      },

    };

    try {
      o = await calc_order.get(ref).load();
      dp.calc_order = o;

      let prod;
      if(o.is_new() || (o.manager !== user && (!action || action === 'prm'))) {
        await o.after_create(user);
      }
      else {
        if(o.posted) {
          utils.end.end500({res, err: {
              status: 403,
              message: `Запрещено изменять проведенный заказ ${result.ref}, suffix: '${user.branch.suffix}'`
            }, log});
          return o.unload();
        }
        if(o.obj_delivery_state == 'Отправлен' && body.obj_delivery_state != 'Отозван') {
          utils.end.end500({res, err: {
              status: 403,
              message: `Запрещено изменять отправленный заказ ${result.ref} - его сначала нужно отозвать, suffix: '${user.branch.suffix}'`
            }, log});
          return o.unload();
        }
        prod = await o.load_production();
      }

      // формируем ответ, действие по умолчанию - классический параметрик
      const response = await actions[action || 'prm']();
      o.unload();
      return response;
    }
    catch (err) {
      o && o.unload();
      throw err;
    }

  }

  // формирует json описания продукций массива заказов
  async function array(req, res) {

    res.end(JSON.stringify({ok: true, message: 'method "array" not implemented'}));
  }

  // перезаполняет даты и время партий доставки
  async function delivery(req, res) {

    const {body, user} = req;

    if(!Array.isArray(body)) {
      return utils.end.end500({
        res,
        err: {status: 403, message: `Тело запроса должно содержать массив, suffix: '${user.branch.suffix}'`},
        log});
    }
    if(!body.length) {
      return utils.end.end500({
        res,
        err: {status: 403, message: `Пустой массив запроса, suffix: '${user.branch.suffix}'`},
        log});
    }
    if(body.length > 50) {
      return utils.end.end500({
        res,
        err: {status: 403, message: `За один запрос можно обработать не более 50 заказов, suffix: '${user.branch.suffix}'`},
        log});
    }

    const {delivery_order, delivery_date, delivery_time} = job_prm.properties;
    const props = {delivery_order, delivery_date, delivery_time};
    const orders = [];
    const keys = body.map((obj) => `doc.calc_order|${obj.ref}`);
    const docs = await pouch.remote.doc.allDocs({keys, limit: keys.length, include_docs: true});

    for(const {doc} of docs.rows) {
      if(doc) {
        let modified;
        const ref = doc._id.substr(15);
        const set = body.reduce((sum, val) => {
          if(sum) {
            return sum;
          }
          if(val.ref === ref) {
            return val;
          }
        }, null);

        // обновляем табчасть extra_fields
        if(!doc.extra_fields) {
          doc.extra_fields = [];
        }
        doc.extra_fields.forEach((row) => {
          if(row.Свойство) {
            row.property = row.Свойство;
            delete row.Свойство;
          }
          if(row.Значение) {
            row.value = row.Значение;
            delete row.Значение;
          }
        });
        for(const name in set) {
          const prop = props[`delivery_${name}`];
          if(!prop) {
            continue;
          }
          const {type} = prop;
          let value = set[name];
          if(type.date_part) {
            value = utils.fix_date(value, !type.hasOwnProperty('str_len'));
          }
          else if(type.digits) {
            value = utils.fix_number(value, !type.hasOwnProperty('str_len'));
          }
          else if(type.types[0] == 'boolean') {
            value = utils.fix_boolean(value);
          }
          if(!doc.extra_fields.some((row) => {
            if(row.property == prop) {
              if(row.value !== value) {
                modified = true;
                row.value = value;
              }
              return true;
            }
          })) {
            doc.extra_fields.push({property: prop.ref, value});
          }
        }

        set.number_doc = doc.number_doc;

        // если изменено, складываем для записи
        if(modified) {
          doc.timestamp = {
            user: req.user.name,
            moment: utils.moment().format('YYYY-MM-DDTHH:mm:ss ZZ'),
          };
          orders.push(doc);
        }
      }
    }

    // если есть, что записывать - записываем
    if(orders.length) {
      await pouch.remote.doc.bulkDocs(orders);
    }

    // тело ответа
    const response = JSON.stringify(body);
    res.end(response);
    return response;

  }

  // сохраняет объект в локальном хранилище отдела абонента
  async function store(req, res) {

    // данные авторизации получаем из контекста
    let {parsed: {paths}, user, body} = req;
    const ref = (paths[2] || 'mapping').toLowerCase();
    const suffix = user.branch.suffix || '0000';

    if(typeof body == 'object'){
      if(Array.isArray(body)){
        body = {rows: body};
      }
      body._id = `_local/store.${suffix}.${ref}`;
      const result = await pouch.remote.doc.get(body._id)
        .catch(() => null)
        .then((rev) => {
          if(rev){
            body._rev = rev._rev;
          }
          return pouch.remote.doc.put(body);
        });
      res.end(JSON.stringify(result));
    }
  }

  // возвращает список документов
  async function docs(req, res) {

    const {user, headers, body} = req;
    const {suffix} = user.branch;
    const {selector} = body;
    const {couch_local, zone} = job_prm;

    //class__name (имя класса) должен быть всегда
    const {class_name} = selector || {};
    if (!class_name) {
      return utils.end.end500({res, err: {status: 404, message: `Не указан класс объектов в селекторе, suffix: '${suffix}'`}, log});
    }

    const point = class_name.indexOf('.');
    const md_class = class_name.substr(0, point);
    const mgr = md.mgr_by_class_name(class_name);
    const meta = mgr.metadata();

    //Работаем только с данными, кешируемыми в doc, для остального есть отдельный endpoint
    let result = {docs: []};
    if(meta.cachable == 'doc') {
      //Сразу соединяемся с pouch базы партнера, чтобы брать данные из нее
      const pouch = new PouchDB(couch_local + zone + `_doc${suffix ? '_' + suffix : ''}`, {
        fetch (url, opts) {
          if(!opts.headers) {
            opts.headers = {};
          }
          opts.headers.authorization = headers.authorization;
          return PouchDB.fetch(url, opts);
        },
        skip_setup: true
      });

      //Если в селекторе есть _id, то запрошен перечень конкретных ссылок, и mango query не нужен
      if ('_id' in selector) {
        const keys = [];

        if(Array.isArray(selector._id)) {
          selector._id.forEach((key) => {
            keys.push(class_name + '|' + key);
          });
        }
        else {
          keys.push(class_name + '|' + selector._id);
        }

        const tmp = await pouch.allDocs({include_docs: true, inclusive_end: true, keys});
        result.docs = tmp.rows;

      }
      else {
        //Нужен mango query, поэтому пересоберем селектор, чтобы были правильные поля в правильном порядке
        const _s = {'class_name': class_name};

        if (md_class == 'doc') {
          if (selector.date) {
            _s.date = selector.date;
          }
          else {
            _s.date = {'$ne': null};
          }
        }

        if (selector.search) {
          _s.search = selector.search;
        }
        else {
          _s.search = {$ne: null};
        }

        const predefined_keys = new Set();
        predefined_keys.add('class_name');
        predefined_keys.add('date');
        predefined_keys.add('search');

        //Добавим в селектор остальные поля, кроме class_name, date и search
        for (const key in selector) {
          if (!predefined_keys.has(key)) {
            _s[key] = selector[key];
          }
        }

        body.selector = _s;

        result = await pouch.find(body);

      }
      pouch.close();

    }
    //расчет презентаций - кода, номера документа, наименования и т.д. для ссылочных реквизитов
    result.docs.forEach((doc) => {
      representation(doc, meta);
    });
    res.end(JSON.stringify(result));
  }

  //Функция смотрит на реквизиты объекта, и подменяет ссылки на объекты,
  //содержащие основные данные - код, наименование, номер документа, и саму ссылку
  function representation(obj, meta) {

    function get_new_field(_obj, field, type) {
      const mgr = calc_order.value_mgr(_obj, field, type, false, _obj[field]);

      if (mgr && (mgr.metadata().cachable == 'ram' || mgr.metadata().cachable == 'doc_ram')) {
        const field_obj = mgr.get(_obj[field]);

        const point = mgr.class_name.indexOf('.');
        const md_class = mgr.class_name.substr(0, point);

        const new_field = {'ref': _obj[field]};
        new_field._mixin(field_obj, (md_class == 'doc') ? ['number_doc', 'date'] : ['id', 'name'], []);

        _obj[field] = new_field;
      }
    }

    //реквизиты
    for (const field in meta.fields) {
      if (obj[field]) {
        get_new_field(obj, field, meta.fields[field].type);
      }
    }

    //табличные части
    for (const ts in meta.tabular_sections) {
      if (obj[ts]) {
        const fields = meta.tabular_sections[ts].fields;

        obj[ts].forEach((row) => {
          //реквизиты табличных частей
          for (const field in fields) {
            if(row[field]){
              get_new_field(row, field, fields[field].type);
            }
          }
        })

      }
    }
  }

  // возаращает конкретный документ по ссылке
  async function doc(req, res) {
    const {parsed: {paths}, user, headers} = req;
    const ref = (paths[2] || '').toLowerCase();
    const {couch_local, zone} = job_prm;
    const suffix = user.branch.suffix || '0000';
    const mgr = md.mgr_by_class_name(paths[1]);
    const meta = mgr.metadata();

    const result = {docs: []};

    if(meta.cachable == 'doc'){
      const pouch = new PouchDB(couch_local + zone + '_doc_' + suffix, {
        fetch (url, opts) {
          if(!opts.headers) {
            opts.headers = {};
          }
          opts.headers.authorization = headers.authorization;
          return PouchDB.fetch(url, opts);
        },
        skip_setup: true
      });

      const obj = await pouch.get(paths[1] + '|' + ref);
      result.docs.push(obj);
      pouch.close();
    }
    else{
      result.docs.push(_clone(mgr.get(ref)._obj));
    }

    representation(res.docs[0], meta);

    res.end(JSON.stringify(result));
  }

  return async (req, res) => {

    const {path, paths} = req.parsed;

    switch (paths[1]) {
    case 'doc.calc_order':
      return await order(req, res);
    case 'array':
      return await array(req, res);
    case 'delivery':
      return await delivery(req, res);
    case 'store':
      return await store(req, res);
    case 'docs':
      return await docs(req, res);
    default:
      if(/(doc|cat|cch)\./.test(paths[1])){
        return await doc(req, res);
      }
      utils.end.end404(res, path);
    }

  };

}

