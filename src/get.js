
module.exports = function prm_get($p, log, rlog) {

  const {cat, utils, job_prm, adapters: {pouch}} = $p;

  function serialize_prod({o, prod, ctx}) {
    const flds = ['margin', 'price_internal', 'amount_internal', 'marginality', 'first_cost', 'discount', 'discount_percent',
      'discount_percent_internal', 'changed', 'ordn', 'characteristic', 'qty'];
    // человекочитаемая информация в табчасть продукции
    for(let row of o._obj.production){
      const ox = cat.characteristics.get(row.characteristic);
      const nom = cat.nom.get(row.nom);
      if(ox){
        row.clr = ox.clr ? ox.clr.ref : '';
        row.clr_name = ox.clr ? ox.clr.name : '';
        if(!ox.origin.empty()){
          row.nom = ox.origin.ref;
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
    ctx.body = JSON.stringify(o);
    prod && prod.forEach((cx) => {
      if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
        cx.unload();
      }
    });
  }

  module.exports.serialize_prod = serialize_prod;

  // формирует json описания продукции заказа
  async function calc_order(ctx, next) {

    const ref = (ctx.params.ref || '').toLowerCase();
    const o = await $p.doc.calc_order.get(ref, 'promise');

    if(o.is_new()){
      ctx.status = 404;
      ctx.body = {
        ref,
        production: [],
        error: true,
        message: `Заказ с идентификатором '${ref}' не существует`,
      };
    }
    else{
      const prod = await o.load_production();
      serialize_prod({o, prod, ctx});
    }
    o.unload();
  }

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


  async function get_log(req, res) {
    const {parsed: {paths}, user} = req;
    const ref = (paths[2] || '').toLowerCase();
    const suffix = user.branch.suffix || '0000';
    const _id = `_local/log.${suffix}.${ref}`;
    const result = await pouch.remote.doc.get(_id)
      .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
    res.end(JSON.stringify(result));
  }

  async function catalogs(req, res) {

    const predefined_names = ['БезЦвета', 'Белый'];
    const {clrs, inserts, nom, partners, users} = cat;
    const prms = new Set();
    const result = {
      // цвета
      clrs: clrs.alatable
        .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
        .map((o) => ({
          ref: o.ref,
          id: o.id ? o.id.pad(3) : "000",
          name: o.name,
        })),
      // номенклатура и вставки
      nom: inserts.alatable
        .filter((o) => o.ref !== $p.utils.blank.guid)
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
      if(o.is_folder || o.empty()){
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
  async function array(ctx, next) {

    ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
    //ctx.body = res;
  }

  return async ({req, res}) => {

    const {path, paths} = req.parsed;

    switch (paths[1]){
    case 'doc.calc_order':
      return await calc_order(req, res);
    case 'cat':
      return await catalogs(req, res);
    case 'store':
      return await store(req, res);
    case 'log':
      return await get_log(req, res);
    case 'array':
      return await array(req, res);
    default:
      utils.end.end404(res, path);
    }

  };

}

