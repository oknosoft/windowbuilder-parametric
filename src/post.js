'use strict';

const debug = require('debug')('wb:post');
const $p = require('./metadata');
const auth = require('./auth');

debug('required');

function getBody(req){
  return new Promise((resolve,reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', (chunk) => {
      try{
        resolve(JSON.parse(data.charCodeAt(0) == 65279 ? data.substr(1) : data))
      }
      catch(err){
        reject(err);
      }

    });
  })
}

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  try{

    const res = {ref: ctx.route.params.ref, production: []};
    const dp = $p.dp.buyers_order.create();

    const query = await getBody(ctx.req);

    const o = await $p.doc.calc_order.get(res.ref, 'promise');
    dp.calc_order = o;

    let prod;
    if(o.is_new()){
      o.after_create();
    }
    else{
      if(o.posted){
        ctx.status = 403;
        ctx.body = `Запрещено изменять проведенный заказ ${res.ref}`;
        return o.unload();
      }
      prod = await o.load_production();
      o.production.clear();
    }
    o._data._loading = true;
    o.date = $p.utils.moment(query.date).toDate();
    if(query.partner){
      o.partner = query.partner;
    }
    if(o.contract.empty()){
      o.contract = $p.cat.contracts.by_partner_and_org(o.partner, o.organization)
    }
    o.vat_consider = o.vat_included = true;
    for(let row of query.production){
      const prow = dp.production.add(row);
      prow.inset = row.nom;
    }

    const ax = await o.process_add_product_list(dp);
    await Promise.all(ax);
    await o.save();
    o._data._loading = true;
    for(let row of o._obj.production){
      const ox = $p.cat.characteristics.get(row.characteristic);
      row.clr = ox && ox.clr ? ox.clr.ref : '';
      for(let fld of ['margin','price_internal','amount_internal','marginality','first_cost','discount','discount_percent',
        'discount_percent_internal','changed','ordn','characteristic']){
        delete row[fld];
      }
      if (ox && !ox.empty() && !ox.is_new() && !ox.calc_order.empty()) {
        ox.unload();
      }
    }
    ctx.body = JSON.stringify(o);
    prod && prod.forEach((cx) => {
      if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
        cx.unload();
      }
    });
    o.unload();
  }
  catch(err){
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

module.exports = async (ctx, next) => {

  // проверяем ограничение по ip и авторизацию
  if(!await auth(ctx, $p)){
    return;
  }

  try{
    switch (ctx.params.class){
      case 'doc.calc_order':
        return await calc_order(ctx, next);
      case 'array':
        return await array(ctx, next);
    }
  }
  catch(err){
    ctx.status = 500;
    ctx.body = err.stack;
    debug(err);
  }

};
