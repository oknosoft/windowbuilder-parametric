'use strict';

const debug = require('debug')('wb:get');
const $p = require('./metadata');
const auth = require('./auth');

debug('required');

// формирует json описания продукции заказа
async function prod(ctx, next) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

// формирует json описания продукций массива заказов
async function array(ctx, next) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

module.exports = async (ctx, next) => {

  // проверяем ограничение по ip и авторизацию
  if(!await auth(ctx)){
    return;
  }

  try{
    switch (ctx.params.class){
      case 'doc.calc_order':
        return await prod(ctx, next);
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
