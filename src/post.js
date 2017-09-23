'use strict';

const debug = require('debug')('wb:post');
const $p = require('./metadata');
const {serialize_prod} = require('./get');

debug('required');


// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  try {
    const {_query, route} = ctx;
    const res = {ref: route.params.ref, production: []};
    const dp = $p.dp.buyers_order.create();



    const o = await $p.doc.calc_order.get(res.ref, 'promise');
    dp.calc_order = o;

    let prod;
    if(o.is_new()) {
      await o.after_create();
    }
    else {
      if(o.posted) {
        ctx.status = 403;
        ctx.body = `Запрещено изменять проведенный заказ ${res.ref}`;
        return o.unload();
      }
      prod = await o.load_production();
      o.production.clear();
    }
    o._data._loading = true;
    o.date = $p.utils.moment(_query.date).toDate();
    o.number_internal = _query.number_doc;
    o.obj_delivery_state = _query.obj_delivery_state == 'Отозван' ? 'Отозван' : (_query.obj_delivery_state == 'Черновик' ? 'Черновик' : 'Отправлен');
    if(_query.partner) {
      o.partner = _query.partner;
    }
    if(o.contract.empty() || _query.partner) {
      o.contract = $p.cat.contracts.by_partner_and_org(o.partner, o.organization);
    }
    o.vat_consider = o.vat_included = true;
    for (let row of _query.production) {
      if(!$p.cat.nom.by_ref[row.nom]) {
        if(!$p.cat.inserts.by_ref[row.nom]) {
          ctx.status = 404;
          ctx.body = `Не найдена номенклатура или вставка ${row.nom}`;
          return o.unload();
        }
        row.inset = row.nom;
        delete row.nom;
      }
      if(row.clr && row.clr != $p.utils.blank.guid && !$p.cat.clrs.by_ref[row.clr]) {
        ctx.status = 404;
        ctx.body = `Не найден цвет ${row.clr}`;
        return o.unload();
      }
      const prow = dp.production.add(row);
    }

    const ax = await o.process_add_product_list(dp);
    await Promise.all(ax);
    await o.save();
    serialize_prod({o, prod, ctx});
    o.unload();
  }
  catch (err) {
    ctx.status = 500;
    ctx.body = err ? (err.stack || err.message) : `Ошибка при расчете параметрической спецификации заказа ${res.ref}`;
    debug(err);
  }

}

// формирует json описания продукций массива заказов
async function array(ctx, next) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

// сохраняет объект в локальном хранилище отдела абонента
async function store(ctx, next) {

  // данные авторизации получаем из контекста
  let {_auth, _query} = ctx;

  if(typeof _query == 'object'){
    const {doc} = $p.adapters.pouch.remote;
    if(Array.isArray(_query)){
      _query = {rows: _query};
    }
    _query._id = `_local/store.${_auth.suffix}.${ctx.params.ref || 'mapping'}`;
    ctx.body = await doc.get(_query._id)
      .catch((err) => null)
      .then((rev) => {
      if(rev){
        _query._rev = rev._rev
      }
    })
      .then(() => doc.put(_query));
  }
}

module.exports = async (ctx, next) => {

  try {
    switch (ctx.params.class) {
    case 'doc.calc_order':
      return await calc_order(ctx, next);
    case 'array':
      return await array(ctx, next);
    case 'store':
      return await store(ctx, next);
    default:
      ctx.status = 404;
      ctx.body = {
        error: true,
        message: `Неизвестный класс ${ctx.params.class}`,
      };
    }
  }
  catch (err) {
    ctx.status = 500;
    ctx.body = {
      error: true,
      message: err.stack || err.message,
    };
    debug(err);
  }

};
