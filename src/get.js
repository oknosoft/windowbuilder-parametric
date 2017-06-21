'use strict';

const debug = require('debug')('wb:get');
const $p = require('./metadata');
const auth = require('./auth');

debug('required');

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  const res = {ref: ctx.route.params.ref, production: []};
  const o = await $p.doc.calc_order.get(res.ref, 'promise');
  if(o.is_new()){
    Object.assign(res, {error: true, message: `Заказ с идентификатором '${ctx.route.params.ref}' не существует`});
    ctx.status = 404;
  }
  else{
    Object.assign(res, {ok: true, number_doc: o.number_doc, date: o.date});
    const prod = await o.load_production();
  }

  ctx.body = res;
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