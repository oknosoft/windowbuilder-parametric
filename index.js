/*!
 windowbuilder-parametric v2.0.241, built:2018-08-25
 © 2014-2018 Evgeniy Malyarov and the Oknosoft team http://www.oknosoft.ru
 To obtain commercial license and technical support, contact info@oknosoft.ru
 */


'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var metaCore = _interopDefault(require('metadata-core'));
var metaPouchdb = _interopDefault(require('metadata-pouchdb'));
var request = _interopDefault(require('request'));
var paper = _interopDefault(require('paper/dist/paper-core'));
var Router = _interopDefault(require('koa-better-router'));
var Koa = _interopDefault(require('koa'));
var cors = _interopDefault(require('@koa/cors'));

const debug = require('debug')('wb:meta');
const MetaEngine = metaCore.plugin(metaPouchdb);
const settings = require('./config/report.settings');
const meta_init = require('./src/metadata/init.js');
debug('required');
const $p = global.$p = new MetaEngine();
debug('created');
$p.wsql.init(settings);
(async () => {
  const {user_node} = settings();
  meta_init($p);
  const {wsql, job_prm, adapters: {pouch}} = $p;
  pouch.init(wsql, job_prm);
  pouch.log_in(user_node.username, user_node.password)
    .then(() => pouch.load_data())
    .catch((err) => debug(err));
  pouch.on({
    user_log_in(name) {
      debug(`logged in ${$p.job_prm.couch_local}, user:${name}, zone:${$p.job_prm.zone}`);
    },
    user_log_fault(err) {
      debug(`login error ${err}`);
    },
    pouch_load_start(page) {
      debug('loadind to ram: start');
    },
    pouch_data_page(page) {
      debug(`loadind to ram: page №${page.page} (${page.page * page.limit} from ${page.total_rows})`);
    },
    pouch_complete_loaded(page) {
      debug(`ready to receive queries, listen on port: ${process.env.PORT || 3000}`);
    },
    pouch_doc_ram_loaded() {
      pouch.local.ram.changes({
        since: 'now',
        live: true,
        include_docs: true,
      }).on('change', (change) => {
        pouch.load_changes({docs: [change.doc]});
      }).on('error', (err) => {
        debug(`change error ${err}`);
      });
      debug(`loadind to ram: READY`);
    },
  });
})();

var auth = async (ctx, $p) => {
  const {restrict_ips} = ctx.app;
  const ip = ctx.req.headers['x-real-ip'] || ctx.ip;
  if(restrict_ips.length && restrict_ips.indexOf(ip) == -1){
    ctx.status = 403;
    ctx.body = 'ip restricted:' + ip;
    return;
  }
  let {authorization, suffix} = ctx.req.headers;
  if(!authorization || !suffix){
    ctx.status = 403;
    ctx.body = 'access denied';
    return;
  }
  const {couch_local, zone} = $p.job_prm;
  const _auth = {'username':''};
  const resp = await new Promise((resolve, reject) => {
    try{
      const auth = new Buffer(authorization.substr(6), 'base64').toString();
      const sep = auth.indexOf(':');
      _auth.pass = auth.substr(sep + 1);
      _auth.username = auth.substr(0, sep);
      while (suffix.length < 4){
        suffix = '0' + suffix;
      }
      _auth.suffix = suffix;
      request({
        url: couch_local + zone + '_doc_' + suffix,
        auth: {'user':_auth.username, 'pass':_auth.pass, sendImmediately: true}
      }, (e, r, body) => {
        if(r && r.statusCode < 201){
          $p.wsql.set_user_param('user_name', _auth.username);
          resolve(true);
        }
        else{
          ctx.status = (r && r.statusCode) || 500;
          ctx.body = body || (e && e.message);
          resolve(false);
        }
      });
    }
    catch(e){
      ctx.status = 500;
      ctx.body = e.message;
      resolve(false);
    }
  });
  return resp && Object.assign(_auth, {user: $p.cat.users.by_id(_auth.username)});
};

const sessions = {};
function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', (chunk) => {
      if(data.length > 0 && data.charCodeAt(0) == 65279) {
        data = data.substr(1);
      }
      resolve(data);
    });
  });
}
async function saveLog({_id, log, start, body}) {
  const {doc} = $p.adapters.pouch.remote;
  return doc.get(_id)
    .catch((err) => {
    if(err.status == 404) {
      return {_id, rows: []};
    }
  })
    .then((rev) => {
    if(rev){
      log.response = body || '';
      log.duration = Date.now() - parseInt(start.format('x'), 10);
      if(rev.events){
        rev.rows = rev.events;
        delete rev.events;
      }
      rev.rows.push(log);
      return doc.put(rev);
    }
  });
}
var log = async (ctx, next) => {
  const {moment} = $p.utils;
  const start = moment();
  ctx._auth = await auth(ctx, $p);
  const _id = `_local/log.${(ctx._auth && ctx._auth.suffix) || '0000'}.${start.format('YYYYMMDD')}`;
  const log = {
    start: start.format('HH:mm:ss'),
    url: ctx.originalUrl,
    method: ctx.method,
    ip: ctx.req.headers['x-real-ip'] || ctx.ip,
    headers: Object.keys(ctx.req.headers).map((key) => [key, ctx.req.headers[key]]),
  };
  if(ctx._auth) {
    try {
      const {suffix} = ctx._auth;
      if(sessions.hasOwnProperty(suffix) && Date.now() - sessions[suffix] < 10000) {
        ctx.status = 403;
        log.error = ctx.body = 'flood: concurrent requests';
        saveLog({_id, log, start, body: ctx.body});
      }
      else {
        sessions[suffix] = Date.now();
        log.post_data = await getBody(ctx.req);
        ctx._query = log.post_data.length > 0 ? JSON.parse(log.post_data) : {};
        await next();
        saveLog({_id, log, start, body: log.url.indexOf('prm/doc.calc_order') != -1 && ctx.body});
        sessions[suffix] = 0;
      }
    }
    catch (err) {
      log.error = err.message;
      saveLog({_id, log, start});
      throw err;
    }
  }
  else{
    log.error = 'unauthorized';
    saveLog({_id, log, start, body: ctx.body});
  }
};

global.paper = paper;
const EditorInvisible = require('./src/builder/drawer');
const debug$1 = require('debug')('wb:paper');
debug$1('required, inited & modified');
class Editor extends EditorInvisible {
  constructor(format = 'png') {
    super();
    this.create_scheme(format);
  }
  create_scheme(format = 'png') {
    const _canvas = paper.createCanvas(480, 480, format);
    _canvas.style.backgroundColor = '#f9fbfa';
    new EditorInvisible.Scheme(_canvas, this, true);
    const {view} = this.project;
    view._element = _canvas;
    if(!view._countItemEvent) {
      view._countItemEvent = function () {};
    }
  }
}
$p.Editor = Editor;

const debug$2 = require('debug')('wb:get');
debug$2('required');
function serialize_prod({o, prod, ctx}) {
  const flds = ['margin', 'price_internal', 'amount_internal', 'marginality', 'first_cost', 'discount', 'discount_percent',
    'discount_percent_internal', 'changed', 'ordn', 'characteristic', 'qty'];
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
  ctx.body = JSON.stringify(o);
  prod && prod.forEach((cx) => {
    if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
      cx.unload();
    }
  });
}
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
  const {_auth, params} = ctx;
  const ref = (params.ref || '').toLowerCase();
  const _id = `_local/store.${_auth.suffix}.${ref || 'mapping'}`;
  ctx.body = await $p.adapters.pouch.remote.doc.get(_id)
    .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
}
async function log$1(ctx, next) {
  const {_auth, params} = ctx;
  const ref = (params.ref || '').toLowerCase();
  const _id = `_local/log.${_auth.suffix}.${ref}`;
  ctx.body = await $p.adapters.pouch.remote.doc.get(_id)
    .catch((err) => ({error: true, message: `Объект ${_id} не найден\n${err.message}`}));
}
async function cat(ctx, next) {
  const {_auth} = ctx;
  const predefined_names = ['БезЦвета', 'Белый'];
  const {clrs, inserts, nom, partners, users} = $p.cat;
  const res = {
    clrs: clrs.alatable
      .filter((o) => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1))
      .map((o) => ({
        ref: o.ref,
        id: o.id ? o.id.pad(3) : "000",
        name: o.name,
      })),
    nom: inserts.alatable.filter((o) => o.ref !== $p.utils.blank.guid).map((o) => ({
      ref: o.ref,
      id: o.id,
      name: o.name,
      article: o.article || '',
    })),
    partners: [],
  };
  for(let o of _auth.user._obj.acl_objs.filter((o) => o.type == 'cat.partners')){
    const p = await partners.get(o.acl_obj, 'promise');
    res.partners.push({
      ref: p.ref,
      id: p.id,
      name: p.name,
      inn: p.inn,
    });
  }
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
async function array(ctx, next) {
  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
}
var get = async (ctx, next) => {
  try{
    switch (ctx.params.class){
    case 'doc.calc_order':
      return await calc_order(ctx, next);
    case 'cat':
      return await cat(ctx, next);
    case 'store':
      return await store(ctx, next);
    case 'log':
      return await log$1(ctx, next);
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
    debug$2(err);
  }
};

const debug$3 = require('debug')('wb:post');
debug$3('required');
async function calc_order$1(ctx, next) {
  const {_query, params} = ctx;
  const ref = (params.ref || '').toLowerCase();
  const res = {ref, production: []};
  const {cat, doc, utils, job_prm} = $p;
  const {contracts, nom, inserts, clrs} = cat;
  try {
    if(!utils.is_guid(res.ref)){
      ctx.status = 404;
      ctx.body = `Параметр запроса ref=${res.ref} не соответствует маске уникального идентификатора`;
      return;
    }
    const o = await doc.calc_order.get(res.ref, 'promise');
    const dp = $p.dp.buyers_order.create();
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
      if(o.obj_delivery_state == 'Отправлен' && _query.obj_delivery_state != 'Отозван') {
        ctx.status = 403;
        ctx.body = `Запрещено изменять отправленный заказ ${res.ref} - его сначала нужно отозвать`;
        return o.unload();
      }
      prod = await o.load_production();
      o.production.clear();
    }
    o._data._loading = true;
    o.date = utils.moment(_query.date).toDate();
    o.number_internal = _query.number_doc;
    if(_query.note){
      o.note = _query.note;
    }
    o.obj_delivery_state = 'Черновик';
    if(_query.partner) {
      o.partner = _query.partner;
    }
    if(o.contract.empty() || _query.partner) {
      o.contract = contracts.by_partner_and_org(o.partner, o.organization);
    }
    o.vat_consider = o.vat_included = true;
    for(const fld in _query) {
      if(o._metadata(fld)){
        continue;
      }
      const property = job_prm.properties[fld];
      if(property && !property.empty()){
        const {type} = property;
        let finded;
        let value = _query[fld];
        if(type.date_part) {
          value = utils.fix_date(value, !type.hasOwnProperty('str_len'));
        }
        else if(type.digits) {
          value = utils.fix_number(value, !type.hasOwnProperty('str_len'));
        }
        else if(type.types[0] == 'boolean') {
          value = utils.fix_boolean(value);
        }
        o.extra_fields.find_rows({property}, (row) => {
          row.value = value;
          finded = true;
          return false;
        });
        if(!finded){
          o.extra_fields.add({property, value});
        }
      }
    }
    for (let row of _query.production) {
      if(!nom.by_ref[row.nom] || nom.by_ref[row.nom].is_new()) {
        if(!inserts.by_ref[row.nom] || inserts.by_ref[row.nom].is_new()) {
          ctx.status = 404;
          ctx.body = `Не найдена номенклатура или вставка ${row.nom}`;
          return o.unload();
        }
        row.inset = row.nom;
        delete row.nom;
      }
      if(row.clr && row.clr != utils.blank.guid && !clrs.by_ref[row.clr]) {
        ctx.status = 404;
        ctx.body = `Не найден цвет ${row.clr}`;
        return o.unload();
      }
      const prow = dp.production.add(row);
    }
    const ax = await o.process_add_product_list(dp);
    await Promise.all(ax);
    o.obj_delivery_state = _query.obj_delivery_state == 'Отозван' ? 'Отозван' : (_query.obj_delivery_state == 'Черновик' ? 'Черновик' : 'Отправлен');
    await o.save();
    serialize_prod({o, prod, ctx});
    o.unload();
  }
  catch (err) {
    ctx.status = 500;
    ctx.body = err ? (err.stack || err.message) : `Ошибка при расчете параметрической спецификации заказа ${res.ref}`;
    debug$3(err);
  }
}
async function array$1(ctx, next) {
  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
}
async function delivery(ctx, next) {
  const {_query, _auth} = ctx;
  if(!Array.isArray(_query)) {
    ctx.status = 403;
    ctx.body = {
      error: true,
      message: `Тело запроса должно содержать массив`,
    };
    return;
  }
  if(!_query.length) {
    ctx.status = 403;
    ctx.body = {
      error: true,
      message: `Пустой массив запроса`,
    };
    return;
  }
  if(_query.length > 50) {
    ctx.status = 403;
    ctx.body = {
      error: true,
      message: `За один запрос можно обработать не более 50 заказов`,
    };
    return;
  }
  try {
    const {adapters: {pouch}, utils, job_prm} = $p;
    const {delivery_order, delivery_date, delivery_time} = job_prm.properties;
    const props = {delivery_order, delivery_date, delivery_time};
    const orders = [];
    const keys = _query.map((obj) => `doc.calc_order|${obj.ref}`);
    const docs = await pouch.remote.doc.allDocs({keys, limit: keys.length, include_docs: true});
    for(const {doc} of docs.rows) {
      if(doc) {
        let modified;
        const ref = doc._id.substr(15);
        const set = _query.reduce((sum, val) => {
          if(sum) {
            return sum;
          }
          if(val.ref === ref) {
            return val;
          }
        }, null);
        if(!doc.extra_fields) {
          doc.extra_fields = [];
        }
        doc.extra_fields.forEach((row) => {
          if(row.Свойство) {
            row.property = row.Свойство;
            delete row.Свойство;
          }
          if(row.Значение) {
            row.value = row.Значение;
            delete row.Значение;
          }
        });
        for(const name in set) {
          const prop = props[`delivery_${name}`];
          if(!prop) {
            continue;
          }
          const {type} = prop;
          let value = set[name];
          if(type.date_part) {
            value = utils.fix_date(value, !type.hasOwnProperty('str_len'));
          }
          else if(type.digits) {
            value = utils.fix_number(value, !type.hasOwnProperty('str_len'));
          }
          else if(type.types[0] == 'boolean') {
            value = utils.fix_boolean(value);
          }
          if(!doc.extra_fields.some((row) => {
            if(row.property == prop) {
              if(row.value !== value) {
                modified = true;
                row.value = value;
              }
              return true;
            }
          })) {
            doc.extra_fields.push({property: prop.ref, value});
          }
        }
        set.number_doc = doc.number_doc;
        if(modified) {
          doc.timestamp = {
            user: _auth.username,
            moment: utils.moment().format('YYYY-MM-DDTHH:mm:ss ZZ'),
          };
          orders.push(doc);
        }
      }
    }
    if(orders.length) {
      await pouch.remote.doc.bulkDocs(orders);
    }
    ctx.body = _query;
  }
  catch (err) {
    ctx.status = 500;
    ctx.body = err ? (err.stack || err.message) : `Ошибка при групповой установке дат доставки`;
    debug$3(err);
  }
}
async function store$1(ctx, next) {
  let {_auth, _query} = ctx;
  if(typeof _query == 'object'){
    const {doc} = $p.adapters.pouch.remote;
    if(Array.isArray(_query)){
      _query = {rows: _query};
    }
    _query._id = `_local/store.${_auth.suffix}.${ctx.params.ref || 'mapping'}`;
    ctx.body = await doc.get(_query._id)
      .catch((err) => null)
      .then((rev) => {
      if(rev){
        _query._rev = rev._rev;
      }
    })
      .then(() => doc.put(_query));
  }
}
async function docs(ctx, next) {
  const {_auth, params, _query} = ctx;
  const {couch_local, zone} = $p.job_prm;
  const {selector} = _query;
  if (!selector.class_name) {
    ctx.status = 403;
    ctx.body = {
      error: true,
      message: `Не указан класс объектов в селекторе`,
    };
    return;
  }
  const point = selector.class_name.indexOf('.');
  const md_class = selector.class_name.substr(0, point);
  const data_mgr = $p.md.mgr_by_class_name(selector.class_name);
  const md = data_mgr.metadata();
  if(md.cachable == 'doc') {
    const pouch = new $p.classes.PouchDB(couch_local + zone + '_doc_' + _auth.suffix, {
      auth: {
        username: _auth.username,
        password: _auth.pass
      },
      skip_setup: true
    });
    const {class_name} = selector;
    if ('_id' in selector) {
      const keys = [];
      if (Array.isArray(selector._id)) {
        selector._id.forEach((key) => {
          keys.push(class_name + "|" + key);
        });
      }
      else {
        keys.push(class_name + "|" + selector._id);
      }
      const res = await pouch.allDocs({'include_docs': true, 'inclusive_end': true, 'keys': keys});
      ctx.body = res;
    }
    else {
      const _s = {'class_name': class_name};
      if (md_class == 'doc') {
        if (selector.date) {
          _s.date = selector.date;
        }
        else {
          _s.date = {'$ne': null};
        }
      }
      if (selector.search) {
        _s.search = selector.search;
      }
      else {
        _s.search = {$ne: null};
      }
      const predefined_keys = new Set();
      predefined_keys.add('class_name');
      predefined_keys.add('date');
      predefined_keys.add('search');
      for (const key in selector) {
        if (!predefined_keys.has(key)) {
          _s[key] = selector[key];
        }
      }
      _query.selector = _s;
      const res = await pouch.find(_query);
      res.docs.forEach((doc) => {
        representation(doc, md);
      });
      ctx.body = res;
    }
  }
  else {
    ctx.body = [];
  }
}
function representation(obj, md) {
  const fake_data_mgr = $p.doc.calc_order;
  function get_new_field(_obj, field, type) {
    const data_mgr = fake_data_mgr.value_mgr(_obj, field, type, false, _obj[field]);
    if (data_mgr && (data_mgr.metadata().cachable == 'ram' || data_mgr.metadata().cachable == 'doc_ram')) {
      const field_obj = data_mgr.get(_obj[field]);
      const point = data_mgr.class_name.indexOf('.');
      const md_class = data_mgr.class_name.substr(0, point);
      const new_field = {'ref': _obj[field]};
      new_field._mixin(field_obj, (md_class == 'doc') ? ['number_doc', 'date'] : ['id', 'name'], []);
      _obj[field] = new_field;
      return;
    }
    return;
  }
  for (const field in md.fields) {
    if (obj[field]) {
      get_new_field(obj, field, md.fields[field].type);
    }
  }
  for (const ts in md.tabular_sections) {
    if (obj[ts]) {
      const fields = md.tabular_sections[ts].fields;
      obj[ts].forEach((row) => {
        for (const field in fields) {
          if(row[field]){
            get_new_field(row, field, fields[field].type);
          }
        }
      });
    }
  }
}
async function doc(ctx, next) {
  const {_query, params, _auth} = ctx;
  const ref = (params.ref || '').toLowerCase();
  const {couch_local, zone} = $p.job_prm;
  const data_mgr = $p.md.mgr_by_class_name(params.class);
  const md = data_mgr.metadata();
  const res = {docs: []};
  if(md.cachable == 'doc'){
    const pouch = new $p.classes.PouchDB(couch_local + zone + '_doc_' + _auth.suffix, {
      auth: {
        username: _auth.username,
        password: _auth.pass
      },
      skip_setup: true
    });
    const obj = await pouch.get(params.class + '|' + ref);
    res.docs.push(obj);
  }
  else{
    const obj = data_mgr.get(ref);
    res.docs.push(obj);
  }
  representation(res.docs[0], md);
  ctx.body = res;
}
async function load_doc_ram(ctx, next) {
  $p.adapters.pouch.load_doc_ram();
  ctx.body = {'doc_ram_loading_started': true};
}
var post = async (ctx, next) => {
  try {
    switch (ctx.params.class) {
      case 'doc.calc_order':
        return await calc_order$1(ctx, next);
      case 'array':
        return await array$1(ctx, next);
    case 'delivery':
      return await delivery(ctx, next);
      case 'store':
        return await store$1(ctx, next);
      case 'docs':
        return await docs(ctx, next);
      case 'load_doc_ram':
        return load_doc_ram(ctx, next);
      default:
        if(/(doc|cat|cch)\./.test(ctx.params.class)){
          return await doc(ctx, next);
        }
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
    debug$3(err);
  }
};

const debug$4 = require('debug')('wb:router');
debug$4('start');
const router = Router({ prefix: '/prm' });
router.loadMethods()
  .get('/:class/:ref', get)
  .post('/:class/:ref', post);

const app = new Koa();
app.use(cors({credentials: true, maxAge: 600}));
app.use(log);
app.use(router.middleware());
app.listen(process.env.PORT || 3000);
app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

module.exports = app;
//# sourceMappingURL=index.js.map
