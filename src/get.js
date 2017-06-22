'use strict';

const debug = require('debug')('wb:get');
const $p = require('./metadata');
const auth = require('./auth');

debug('required');

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  const {ref} = ctx.route.params;
  const o = await $p.doc.calc_order.get(ref, 'promise');

  if(o.is_new()){
    ctx.status = 404;
    ctx.body = {
      ref: ref,
      production: [],
      error: true,
      message: `Заказ с идентификатором '${ref}' не существует`,
    };
  }
  else{
    const prod = await o.load_production();
    for(let row of o._obj.production){
      const ox = $p.cat.characteristics.get(row.characteristic);
      row.clr = ox && ox.clr ? ox.clr.ref : '';
      for(let fld of ['margin','price_internal','amount_internal','marginality','first_cost','discount','discount_percent',
        'discount_percent_internal','changed','ordn','characteristic']){
        delete row[fld];
      }
    }
    ctx.body = JSON.stringify(o);
    prod.forEach((cx) => {
      if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
        cx.unload();
      }
    });
  }
  o.unload();
}

async function cat(ctx, next) {

  const predefined_names = ['БезЦвета', 'Белый'];
  const {clrs, inserts, nom, partners, users} = $p.cat;
  const res = {
    // цвета
    clrs: clrs.alatable
      .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
      .map((o) => ({
        ref: o.ref,
        id: o.id.pad(3),
        name: o.name,
      })),
    // вставки
    inserts: inserts.alatable.map((o) => ({
      ref: o.ref,
      name: o.name,
    })),
    // контрагенты
    partners: [],
    // номенклатура
    nom: [],
  };

  // подклеиваем контрагентов
  for(let o of $p.current_user._obj.acl_objs.filter((o) => o.type == 'cat.partners')){
    const p = await partners.get(o.acl_obj, 'promise');
    res.partners.push({
      ref: p.ref,
      id: p.id,
      name: p.name,
      inn: p.inn,
    });
  }

  // подклеиваем номенклатуру
  const {integration} = $p.job_prm.nom;
  nom.forEach((o) => {
    if(o.is_folder){
      return;
    }
    for(let inom of integration){
      if(o._hierarchy(inom)){
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
