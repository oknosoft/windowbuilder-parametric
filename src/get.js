'use strict';

const debug = require('debug')('wb:get');
const $p = require('./metadata');
const auth = require('./auth');

debug('required');

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

async function clrs(ctx, next) {
  const predefined_names = ['БезЦвета', 'Белый'];
  ctx.body = $p.cat.clrs.alatable
    .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
    .map((o) => ({
      ref: o.ref,
      id: o.id.pad(3),
      name: o.name,
    }));
}

async function nom(ctx, next) {
  const predefined_names = ['БезЦвета', 'Белый'];
  ctx.body = $p.cat.clrs.alatable.filter((o) => !o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1);
}

async function inserts(ctx, next) {
  ctx.body = $p.cat.inserts.alatable.map((o) => ({
      ref: o.ref,
      name: o.name,
  }));
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
      case 'cat.clrs':
        return await clrs(ctx, next);
      case 'cat.inserts':
        return await inserts(ctx, next);
      case 'cat.nom':
        return await nom(ctx, next);
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
