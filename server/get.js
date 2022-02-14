
module.exports = function prm_get($p, log) {

  const {cat, cch, utils: {end, blank}, job_prm, adapters: {pouch}} = $p;

  function serialize_prod({o, prod = [], res}) {
    const flds = ['margin', 'price_internal', 'amount_internal', 'marginality', 'first_cost', 'discount', 'discount_percent',
      'discount_percent_internal', 'changed', 'ordn', 'characteristic', 'qty'];
    // человекочитаемая информация в табчасть продукции
    for(let row of o._obj.production){
      const ox = cat.characteristics.by_ref[row.characteristic];
      const nom = cat.nom.get(row.nom);
      if(ox){
        row.clr = ox.clr ? ox.clr.ref : '';
        row.clr_name = ox.clr ? ox.clr.name : '';
        if(ox.origin && !ox.origin.empty()){
          row.nom = ox.origin.ref;
        }

        if(ox.calc_order == o && !prod.includes(ox)) {
          prod.push(ox);
        }
      }
      else{
        row.clr = row.clr_name = '';
      }
      row.vat_rate = row.vat_rate.valueOf();
      row.nom_name = nom.toString();
      row.unit_name = cat.nom_units.get(row.unit).toString();
      row.product_name = ox ? ox.toString() : '';
      for (let fld of flds) {
        delete row[fld];
      }
      if(ox && !ox.empty() && !ox.is_new() && !ox.calc_order.empty()) {
        ox.unload();
      }
    }
    // человекочитаемая информация в табчасть допреквизитов
    const {properties} = job_prm;
    o.extra_fields.forEach(({property, _obj}) => {
      let finded;
      for(const prop in properties){
        if(properties[prop] === property) {
          _obj.property_name = prop;
          finded = true;
          break;
        }
      }
      if(!finded) {
        _obj.property_name = property.name;
      }
    });
    // тело ответа
    const response = JSON.stringify(o._obj);
    res.end(response);

    // выгружаем продукцию
    prod.forEach((cx) => {
      if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
        cx.unload();
      }
    });

    return response;
  }

  // формирует json описания продукции заказа
  async function calc_order(req, res) {

    let {parsed: {paths}, user} = req;
    const {suffix} = user.branch;

    const ref = (paths[2] || '').toLowerCase();
    const o = await $p.doc.calc_order.get(ref).load();

    if(o.is_new()){
      end.end500({res, err: {status: 404, message: `Заказ с идентификатором '${ref}' не существует, suffix: '${suffix}'`}, log});
    }
    else{
      const prod = await o.load_production(true);
      serialize_prod({o, prod, res});
    }
    o.unload();
  }

  async function properties(req, res) {
    let {parsed: {paths}, headers} = req;
    const branch = cat.branches.get(headers.branch);
    const param = cch.properties.get(paths[2]);
    if(param.empty() || param.is_new()) {
      return end.end500({res, err: {status: 404, message: `Свойство с идентификатором '${paths[2]}' не существует.`}, log});
    }
    const ox = cat.characteristics.create({}, false, true);
    ox.params.add({param: job_prm.properties.branch, value: branch});
    const links = param.params_links({obj: {ox}});
    const result = {
      ref: param.ref,
      branch: branch.ref,
      name: param.name,
      type: {},
      links: links.map(({ref, name}) => ({ref, name})),
    };
    for(const fld in param.type) {
      if(!fld.startsWith('_')) {
        result.type[fld] = param.type[fld];
      }
    }
    const values = [];
    links.forEach((link) => link.append_values(values));
    if(values.length) {
      result.values = values.map(({value}) => value);
    }
    else {
      if(param.type.types.includes('cat.property_values')) {
        cat.property_values.find_rows({owner: param}, (value) => {
          values.push(value);
        });
      }
      result.values = values;
    }
    res.end(JSON.stringify(result));

  }

  // читает сохраненный объект
  async function store(req, res) {
    // данные авторизации получаем из контекста
    const {parsed: {paths}, user} = req;
    const ref = (paths[2] || '').toLowerCase();
    const suffix = user.branch.suffix || '0000';
    const _id = `_local/store.${suffix}.${ref || 'mapping'}`;
    const result = await pouch.remote.doc.get(_id)
      .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
    res.end(JSON.stringify(result));
  }

  // читает лог за указанную дату
  async function get_log(req, res) {
    const {parsed: {paths}, user} = req;
    const ref = (paths[2] || '').toLowerCase();
    const suffix = user.branch.suffix || '0000';
    const _id = `_local/log.${suffix}.${ref}`;
    const result = await pouch.remote.doc.get(_id)
      .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
    res.end(JSON.stringify(result));
  }

  // читает справочники
  async function catalogs(req, res) {

    const predefined_names = ['БезЦвета', 'Белый'];
    const {clrs, inserts, nom, partners} = cat;
    const prms = new Set();
    const result = {
      // цвета
      clrs: clrs.alatable
        .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
        .map((o) => ({
          ref: o.ref,
          id: o.id ? (o.id.pad ? o.id.pad(3) : o.id) : "000",
          name: o.name,
        })),
      // номенклатура и вставки
      nom: inserts.alatable
        .filter((o) => o.ref !== blank.guid)
        .map(({ref}) => {
          const o = inserts.get(ref);
          const mf = {};
          clrs.selection_exclude_service(mf, o);
          const {path} = mf.choice_params[1];
          const params = new Set();
          for (const ts of ['selection_params', 'product_params']) {
            o[ts].forEach(({param}) => {
              if(!param.empty()) {
                params.add(param);
              }
            });
          }
          for (const param of params) {
            prms.add(param);
          }
          return {
            ref: o.ref,
            id: o.id,
            name: o.name,
            article: o.article || '',
            available: o.available,
            lmin: o.lmin,
            lmax: o.lmax,
            hmin: o.hmin,
            hmax: o.hmax,
            smin: o.smin,
            smax: o.smax,
            mmin: o.mmin,
            mmax: o.mmax,
            clr_group: path.in ? path.in : [],
            params: Array.from(params).map(v => v.ref),
          };
        }),
      // контрагенты
      partners: [],
    };

    // подклеиваем параметры
    result.prms = Array.from(prms).map(({ref, name, mandatory}) => ({ref, name, mandatory}));
    result.prm_values = [];

    // подклеиваем контрагентов
    for(let o of req.user._obj.acl_objs.filter((o) => o.type == 'cat.partners')){
      const p = await partners.get(o.acl_obj, 'promise');
      result.partners.push({
        ref: p.ref,
        id: p.id,
        name: p.name,
        inn: p.inn,
      });
    }

    // подклеиваем номенклатуру
    const {outer} = job_prm.nom;
    nom.forEach((o) => {
      if(o.is_folder || o.empty() || !outer){
        return;
      }
      for(let inom of outer){
        if(o._hierarchy(inom)){
          result.nom.push({
            ref: o.ref,
            id: o.id,
            name: o.name,
            article: o.article,
          });
          break;
        }
      }
    });

    res.end(JSON.stringify(result));
  }

  // формирует json описания продукций массива заказов
  async function array(req, res) {
    res.end(JSON.stringify({ok: true, message: 'method "array" not implemented'}));
  }

  // router запроса
  async function router(req, res) {

    const {path, paths} = req.parsed;

    switch (paths[1]){
    case 'doc.calc_order':
      return await calc_order(req, res);
    case 'cch.properties':
      return await properties(req, res);
    case 'cat':
      return await catalogs(req, res);
    case 'store':
      return await store(req, res);
    case 'log':
      return await get_log(req, res);
    case 'array':
      return await array(req, res);
    default:
      end.end404(res, path);
    }
  }

  router.serialize_prod = serialize_prod;

  return router;

}

