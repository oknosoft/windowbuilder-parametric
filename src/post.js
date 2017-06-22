'use strict';

const debug = require('debug')('wb:get');
const $p = require('./metadata');
const auth = require('./auth');

debug('required');

function getBody(req){
  return new Promise((resolve,reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', (chunk) => resolve(JSON.parse(data)));
  })
}

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  const res = {ref: ctx.route.params.ref, production: []};
  const o = await $p.doc.calc_order.get(res.ref, 'promise');
  const dp = $p.dp.buyers_order.create();
  const query = await getBody(ctx.req);

  try{
    let prod;
    dp.calc_order = o;
    if(o.is_new()){
      o._manager.emit('after_create', o, {});
    }
    else{
      if(o.posted){
        ctx.status = 403;
        ctx.body = `Запрещено изменять проведенный заказ ${res.ref}`;
        return o.unload();
      }
      prod = await o.load_production();
      o.production.clear(true);
    }
    o.date = new Date(query.date);
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
    await o.process_add_product_list(dp);
    await o.save();
    for(let row of o._obj.production){
      const ox = $p.cat.characteristics.get(row.characteristic);
      row.clr = ox && ox.clr ? ox.clr.ref : '';
      for(let fld of ['margin','price_internal','amount_internal','marginality','first_cost','discount','discount_percent',
        'discount_percent_internal','changed','ordn','characteristic']){
        delete row[fld];
      }
    }
    ctx.body = JSON.stringify(o);
    o.production.forEach((row) => {
      const {characteristic} = row;
      if (!characteristic.empty() && !characteristic.is_new() && !characteristic.calc_order.empty()) {
        characteristic.unload();
      }
    });
    prod.forEach((cx) => {
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
