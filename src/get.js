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

async function cat(ctx, next) {

  const predefined_names = ['БезЦвета', 'Белый'];
  const {clrs, inserts, nom} = $p.cat;
  const res = {
    clrs: clrs.alatable
      .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
      .map((o) => ({
        ref: o.ref,
        id: o.id.pad(3),
        name: o.name,
      })),
    inserts: inserts.alatable.map((o) => ({
      ref: o.ref,
      name: o.name,
    })),
    nom: []
  };

  const {goods} = $p.job_prm.nom;
  nom.forEach((o) => {
    if(o.is_folder){
      return;
    }
    for(let good of goods){
      if(o._hierarchy(good)){
        res.nom.push({
          ref: o.ref,
          id: o.id,
          name: o.name,
          article: o.article,
        });
        break;
      }
    }
  });
  ctx.body = res;
}

async function nom(ctx, next) {

  ctx.body = $p.cat.nom.alatable.filter((o) => !o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1);
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
      case 'cat':
        return await cat(ctx, next);
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
