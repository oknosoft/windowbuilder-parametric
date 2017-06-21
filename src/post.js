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
  const o = await $p.doc.calc_order.create({ref: res.ref}, true);
  const dp = $p.dp.buyers_order.create();
  const query = await getBody(ctx.req);

  dp.calc_order = o;
  if(query.partner){
    o.partner = query.partner;
  }
  o.date = new Date(query.date);
  for(let row of query.production){
    const prow = dp.production.add(row);
    prow.inset = row.nom;
  }

  await o.process_add_product_list(dp);

  ctx.body = {ok: true};
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
