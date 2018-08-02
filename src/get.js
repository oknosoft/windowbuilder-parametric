'use strict';

import $p from './metadata';

const debug = require('debug')('wb:get');
debug('required');

export function serialize_prod({o, prod, ctx}) {
  const flds = ['margin', 'price_internal', 'amount_internal', 'marginality', 'first_cost', 'discount', 'discount_percent',
    'discount_percent_internal', 'changed', 'ordn', 'characteristic', 'qty'];
  // человекочитаемая информация в табчасть продукции
  for(let row of o._obj.production){
    const ox = $p.cat.characteristics.get(row.characteristic);
    const nom = $p.cat.nom.get(row.nom);
    if(ox){
      row.clr = ox.clr ? ox.clr.ref : '';
      row.clr_name = ox.clr ? ox.clr.name : '';
      if(!ox.origin.empty()){
        row.nom = ox.origin.ref;
      }
    }
    else{
      row.clr = row.clr_name = '';
    }
    row.vat_rate = row.vat_rate.valueOf();
    row.nom_name = nom.toString();
    row.unit_name = $p.cat.nom_units.get(row.unit).toString();
    row.product_name = ox ? ox.toString() : '';
    for (let fld of flds) {
      delete row[fld];
    }
    if(ox && !ox.empty() && !ox.is_new() && !ox.calc_order.empty()) {
      ox.unload();
    }
  }
  // человекочитаемая информация в табчасть допреквизитов
  const {properties} = $p.job_prm;
  o.extra_fields.forEach(({property, _obj}) => {
    let finded;
    for(const prop in properties){
      if(properties[prop] === property) {
        _obj.property_name = prop;
        finded = true;
        break;
      }
    }
    if(!finded) {
      _obj.property_name = property.name;
    }
  });
  // тело ответа
  ctx.body = JSON.stringify(o);
  prod && prod.forEach((cx) => {
    if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
      cx.unload();
    }
  });
}

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  const ref = (ctx.params.ref || '').toLowerCase();
  const o = await $p.doc.calc_order.get(ref, 'promise');

  if(o.is_new()){
    ctx.status = 404;
    ctx.body = {
      ref,
      production: [],
      error: true,
      message: `Заказ с идентификатором '${ref}' не существует`,
    };
  }
  else{
    const prod = await o.load_production();
    serialize_prod({o, prod, ctx});
  }
  o.unload();
}

async function store(ctx, next) {
  // данные авторизации получаем из контекста
  const {_auth, params} = ctx;
  const ref = (params.ref || '').toLowerCase();
  const _id = `_local/store.${_auth.suffix}.${ref || 'mapping'}`;
  ctx.body = await $p.adapters.pouch.remote.doc.get(_id)
    .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
}

async function log(ctx, next) {
  // данные авторизации получаем из контекста
  const {_auth, params} = ctx;
  const ref = (params.ref || '').toLowerCase();
  const _id = `_local/log.${_auth.suffix}.${ref}`;
  ctx.body = await $p.adapters.pouch.remote.doc.get(_id)
    .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
}

async function cat(ctx, next) {

  // данные авторизации получаем из контекста
  const {_auth} = ctx;

  const predefined_names = ['БезЦвета', 'Белый'];
  const {clrs, inserts, nom, partners, users} = $p.cat;
  const res = {
    // цвета
    clrs: clrs.alatable
      .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
      .map((o) => ({
        ref: o.ref,
        id: o.id ? o.id.pad(3) : "000",
        name: o.name,
      })),
    // номенклатура и вставки
    nom: inserts.alatable.filter((o) => o.ref !== $p.utils.blank.guid).map((o) => ({
      ref: o.ref,
      id: o.id,
      name: o.name,
      article: o.article || '',
    })),
    // контрагенты
    partners: [],
  };

  // подклеиваем контрагентов
  for(let o of _auth.user._obj.acl_objs.filter((o) => o.type == 'cat.partners')){
    const p = await partners.get(o.acl_obj, 'promise');
    res.partners.push({
      ref: p.ref,
      id: p.id,
      name: p.name,
      inn: p.inn,
    });
  }

  // подклеиваем номенклатуру
  const {outer} = $p.job_prm.nom;
  nom.forEach((o) => {
    if(o.is_folder || o.empty()){
      return;
    }
    for(let inom of outer){
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

// формирует json описания продукций массива заказов
async function array(ctx, next) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

export default async (ctx, next) => {

  try{
    switch (ctx.params.class){
    case 'doc.calc_order':
      return await calc_order(ctx, next);
    case 'cat':
      return await cat(ctx, next);
    case 'store':
      return await store(ctx, next);
    case 'log':
      return await log(ctx, next);
    case 'array':
      return await array(ctx, next);
    default:
      ctx.status = 404;
      ctx.body = {
        error: true,
        message: `Неизвестный класс ${ctx.params.class}`,
      };
    }
  }
  catch(err){
    ctx.status = 500;
    ctx.body = {
      error: true,
      message: err.stack || err.message,
    };
    debug(err);
  }

};
