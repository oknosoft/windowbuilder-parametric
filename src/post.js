'use strict';

const debug = require('debug')('wb:post');
const $p = require('./metadata');
const auth = require('./auth');
const {serialize_prod} = require('./get');

debug('required');

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', (chunk) => {
      try {
        resolve(JSON.parse(data.charCodeAt(0) == 65279 ? data.substr(1) : data));
      }
      catch (err) {
        reject(err);
      }
    });
  });
}

// формирует json описания продукции заказа
async function calc_order(ctx, next, authorization) {

  try {

    const res = {ref: ctx.route.params.ref, production: []};
    const dp = $p.dp.buyers_order.create();

    const query = await getBody(ctx.req);

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
    o.date = $p.utils.moment(query.date).toDate();
    o.number_internal = query.number_doc;
    o.obj_delivery_state = query.obj_delivery_state == 'Отозван' ? 'Отозван' : (query.obj_delivery_state == 'Черновик' ? 'Черновик' : 'Отправлен');
    if(query.partner) {
      o.partner = query.partner;
    }
    if(o.contract.empty() || query.partner) {
      o.contract = $p.cat.contracts.by_partner_and_org(o.partner, o.organization);
    }
    o.vat_consider = o.vat_included = true;
    for (let row of query.production) {
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
async function array(ctx, next, authorization) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

// сохраняет объект в локальном хранилище отдела абонента
async function store(ctx, next, authorization) {
  let query = await getBody(ctx.req);
  if(typeof query == 'object'){
    const {doc} = $p.adapters.pouch.remote;
    if(Array.isArray(query)){
      query = {rows: query};
    }
    query._id = `_local/store${authorization.suffix}/${ctx.params.ref || 'mapping'}`;
    ctx.body = await doc.get(query._id)
      .catch((err) => null)
      .then((rev) => {
      if(rev){
        query._rev = rev._rev
      }
    })
      .then(() => doc.put(query));
  }
}

module.exports = async (ctx, next) => {

  // проверяем ограничение по ip и авторизацию
  const authorization = await auth(ctx, $p);
  if(!authorization){
    return;
  }

  try {
    switch (ctx.params.class) {
    case 'doc.calc_order':
      return await calc_order(ctx, next, authorization);
    case 'array':
      return await array(ctx, next, authorization);
    case 'store':
      return await store(ctx, next, authorization);
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
