module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = require("debug");

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _chartscharacteristics = __webpack_require__(7);

var _chartscharacteristics2 = _interopRequireDefault(_chartscharacteristics);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// дополняем прототип Object методами observe
__webpack_require__(10);

const debug = __webpack_require__(0)('wb:meta');

// конструктор MetaEngine
const MetaEngine = __webpack_require__(11).plugin(__webpack_require__(12));
debug('required');

// создаём контекст MetaEngine
const $p = new MetaEngine();
debug('created');

// эмулируем излучатель событий dhtmlx
__webpack_require__(13)($p);

// модификаторы data-объектов в старом формате
const modifiers = __webpack_require__(14);

// модификаторы data-объектов в новом формате


// инициализируем параметры сеанса и метаданные
(async () => {

  // функция установки параметров сеанса
  const config_init = __webpack_require__(15);

  // функция инициализации структуры метаданных
  const meta_init = __webpack_require__(17);

  // реквизиты подключения к couchdb
  const { user_node } = config_init();

  // инициализируем метаданные
  $p.wsql.init(config_init, meta_init);

  // подключим модификаторы
  modifiers($p);
  (0, _chartscharacteristics2.default)($p);
  debug('inited & modified');

  // загружаем кешируемые справочники в ram и начинаем следить за изменениями ram
  const { pouch } = $p.adapters;
  pouch.log_in(user_node.username, user_node.password).then(() => pouch.load_data()).catch(err => debug(err));

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
        include_docs: true
      }).on('change', change => {
        // формируем новый
        pouch.load_changes({ docs: [change.doc] });
      }).on('error', err => {
        debug(`change error ${err}`);
      });
      debug(`loadind to ram: READY`);
    }
  });
})();

module.exports = $p;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const debug = __webpack_require__(0)('wb:get');
const $p = __webpack_require__(1);

debug('required');

function serialize_prod({ o, prod, ctx }) {
  const flds = ['margin', 'price_internal', 'amount_internal', 'marginality', 'first_cost', 'discount', 'discount_percent', 'discount_percent_internal', 'changed', 'ordn', 'characteristic', 'qty'];
  // человекочитаемая информация в табчасть продукции
  for (let row of o._obj.production) {
    const ox = $p.cat.characteristics.get(row.characteristic);
    const nom = $p.cat.nom.get(row.nom);
    if (ox) {
      row.clr = ox.clr ? ox.clr.ref : '';
      row.clr_name = ox.clr ? ox.clr.name : '';
      if (!ox.origin.empty()) {
        row.nom = ox.origin.ref;
      }
    } else {
      row.clr = row.clr_name = '';
    }
    row.vat_rate = row.vat_rate.valueOf();
    row.nom_name = nom.toString();
    row.unit_name = $p.cat.nom_units.get(row.unit).toString();
    row.product_name = ox ? ox.toString() : '';
    for (let fld of flds) {
      delete row[fld];
    }
    if (ox && !ox.empty() && !ox.is_new() && !ox.calc_order.empty()) {
      ox.unload();
    }
  }
  // человекочитаемая информация в табчасть допреквизитов
  const { properties } = $p.job_prm;
  o.extra_fields.forEach(({ property, _obj }) => {
    let finded;
    for (const prop in properties) {
      if (properties[prop] === property) {
        _obj.property_name = prop;
        finded = true;
        break;
      }
    }
    if (!finded) {
      _obj.property_name = property.name;
    }
  });
  // тело ответа
  ctx.body = JSON.stringify(o);
  prod && prod.forEach(cx => {
    if (!cx.empty() && !cx.is_new() && !cx.calc_order.empty()) {
      cx.unload();
    }
  });
}

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  const ref = (ctx.params.ref || '').toLowerCase();
  const o = await $p.doc.calc_order.get(ref, 'promise');

  if (o.is_new()) {
    ctx.status = 404;
    ctx.body = {
      ref,
      production: [],
      error: true,
      message: `Заказ с идентификатором '${ref}' не существует`
    };
  } else {
    const prod = await o.load_production();
    serialize_prod({ o, prod, ctx });
  }
  o.unload();
}

async function store(ctx, next) {
  // данные авторизации получаем из контекста
  const { _auth, params } = ctx;
  const ref = (params.ref || '').toLowerCase();
  const _id = `_local/store.${_auth.suffix}.${ref || 'mapping'}`;
  ctx.body = await $p.adapters.pouch.remote.doc.get(_id).catch(err => ({ error: true, message: `Объект ${_id} не найден\n${err.message}` }));
}

async function log(ctx, next) {
  // данные авторизации получаем из контекста
  const { _auth, params } = ctx;
  const ref = (params.ref || '').toLowerCase();
  const _id = `_local/log.${_auth.suffix}.${ref}`;
  ctx.body = await $p.adapters.pouch.remote.doc.get(_id).catch(err => ({ error: true, message: `Объект ${_id} не найден\n${err.message}` }));
}

async function cat(ctx, next) {

  // данные авторизации получаем из контекста
  const { _auth } = ctx;

  const predefined_names = ['БезЦвета', 'Белый'];
  const { clrs, inserts, nom, partners, users } = $p.cat;
  const res = {
    // цвета
    clrs: clrs.alatable.filter(o => !o.is_folder && (!o.predefined_name || predefined_names.indexOf(o.predefined_name) != -1)).map(o => ({
      ref: o.ref,
      id: o.id ? o.id.pad(3) : "000",
      name: o.name
    })),
    // номенклатура и вставки
    nom: inserts.alatable.filter(o => o.ref !== $p.utils.blank.guid).map(o => ({
      ref: o.ref,
      id: o.id,
      name: o.name,
      article: o.article || ''
    })),
    // контрагенты
    partners: []
  };

  // подклеиваем контрагентов
  for (let o of _auth.user._obj.acl_objs.filter(o => o.type == 'cat.partners')) {
    const p = await partners.get(o.acl_obj, 'promise');
    res.partners.push({
      ref: p.ref,
      id: p.id,
      name: p.name,
      inn: p.inn
    });
  }

  // подклеиваем номенклатуру
  const { outer } = $p.job_prm.nom;
  nom.forEach(o => {
    if (o.is_folder || o.empty()) {
      return;
    }
    for (let inom of outer) {
      if (o._hierarchy(inom)) {
        res.nom.push({
          ref: o.ref,
          id: o.id,
          name: o.name,
          article: o.article
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

module.exports = async (ctx, next) => {

  try {
    switch (ctx.params.class) {
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
          message: `Неизвестный класс ${ctx.params.class}`
        };
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      error: true,
      message: err.stack || err.message
    };
    debug(err);
  }
};

module.exports.serialize_prod = serialize_prod;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(4);


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const Koa = __webpack_require__(5);
const app = new Koa();

// Register the logger as Koa middleware
app.use(__webpack_require__(6));

// Register the router as Koa middleware
app.use(__webpack_require__(20).middleware());

app.listen(process.env.PORT || 3000);
app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

module.exports = app;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("koa");

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 *
 *
 * @module log
 *
 * Created by Evgeniy Malyarov on 23.09.2017.
 */

const $p = __webpack_require__(1);
const auth = __webpack_require__(18);

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', chunk => {
      if (data.length > 0 && data.charCodeAt(0) == 65279) {
        data = data.substr(1);
      }
      resolve(data);
    });
  });
}

async function saveLog({ _id, log, start, body }) {
  const { doc } = $p.adapters.pouch.remote;
  return doc.get(_id).catch(err => {
    if (err.status == 404) {
      return { _id, rows: [] };
    }
  }).then(rev => {
    if (rev) {
      log.response = body || '';
      log.duration = Date.now() - parseInt(start.format('x'), 10);
      if (rev.events) {
        rev.rows = rev.events;
        delete rev.events;
      }
      rev.rows.push(log);
      return doc.put(rev);
    }
  });
}

module.exports = async (ctx, next) => {

  // request
  const { moment } = $p.utils;
  const start = moment();

  // проверяем ограничение по ip и авторизацию
  ctx._auth = await auth(ctx, $p);
  const _id = `_local/log.${ctx._auth && ctx._auth.suffix || '0000'}.${start.format('YYYYMMDD')}`;

  // собираем объект лога
  const log = {
    start: start.format('HH:mm:ss'),
    url: ctx.originalUrl,
    method: ctx.method,
    ip: ctx.req.headers['x-real-ip'] || ctx.ip,
    headers: Object.keys(ctx.req.headers).map(key => [key, ctx.req.headers[key]])
  };

  if (ctx._auth) {
    try {
      // тело запроса анализируем только для авторизованных пользователей
      log.post_data = await getBody(ctx.req);
      ctx._query = log.post_data.length > 0 ? JSON.parse(log.post_data) : {};
      // передаём управление основной задаче
      await next();
      // по завершению, записываем лог
      saveLog({ _id, log, start, body: log.url.indexOf('prm/doc.calc_order') != -1 && ctx.body });
    } catch (err) {
      // в случае ошибки, так же, записываем лог
      log.error = err.message;
      saveLog({ _id, log, start });
      throw err;
    }
  } else {
    // для неавторизованных пользователей записываем лог
    log.error = 'unauthorized';
    saveLog({ _id, log, start, body: ctx.body });
  }
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function ($p) {
	(0, _cch_predefined_elmnts2.default)($p);
	(0, _cch_properties2.default)($p);
};

var _cch_predefined_elmnts = __webpack_require__(8);

var _cch_predefined_elmnts2 = _interopRequireDefault(_cch_predefined_elmnts);

var _cch_properties = __webpack_require__(9);

var _cch_properties2 = _interopRequireDefault(_cch_properties);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ($p) {

  const { job_prm, adapters, cch, doc } = $p;
  const _mgr = cch.predefined_elmnts;

  // Подписываемся на событие окончания загрузки локальных данных
  adapters.pouch.once('pouch_doc_ram_loaded', () => {

    // читаем элементы из pouchdb и создаём свойства
    _mgr.adapter.find_rows(_mgr, { _raw: true, _top: 500, _skip: 0 }).then(rows => {

      const parents = {};

      rows.forEach(row => {
        if (row.is_folder && row.synonym) {
          const ref = row._id.split('|')[1];
          parents[ref] = row.synonym;
          !job_prm[row.synonym] && job_prm.__define(row.synonym, { value: {} });
        }
      });

      rows.forEach(row => {

        if (!row.is_folder && row.synonym && parents[row.parent] && !job_prm[parents[row.parent]][row.synonym]) {

          let _mgr;

          if (row.type.is_ref) {
            const tnames = row.type.types[0].split('.');
            _mgr = $p[tnames[0]][tnames[1]];
          }

          if (row.list == -1) {

            job_prm[parents[row.parent]].__define(row.synonym, {
              value: (() => {
                const res = {};
                row.elmnts.forEach(row => {
                  res[row.elm] = _mgr ? _mgr.get(row.value, false, false) : row.value;
                });
                return res;
              })(),
              enumerable: true
            });
          } else if (row.list) {

            job_prm[parents[row.parent]].__define(row.synonym, {
              value: row.elmnts.map(row => {
                if (_mgr) {
                  const value = _mgr.get(row.value, false, false);
                  if (!$p.utils.is_empty_guid(row.elm)) {
                    value._formula = row.elm;
                  }
                  return value;
                } else {
                  return row.value;
                }
              }),
              enumerable: true
            });
          } else {

            if (job_prm[parents[row.parent]].hasOwnProperty(row.synonym)) {
              delete job_prm[parents[row.parent]][row.synonym];
            }

            job_prm[parents[row.parent]].__define(row.synonym, {
              value: _mgr ? _mgr.get(row.value, false, false) : row.value,
              configurable: true,
              enumerable: true
            });
          }
        }
      });
    }).then(() => {

      // дополним автовычисляемыми свойствами
      let prm = job_prm.properties.width;
      const { calculated } = job_prm.properties;
      if (prm && calculated.indexOf(prm) == -1) {
        calculated.push(prm);
        prm._calculated_value = { execute: obj => obj && obj.calc_order_row && obj.calc_order_row.width || 0 };
      }
      prm = job_prm.properties.length;
      if (prm && calculated.indexOf(prm) == -1) {
        calculated.push(prm);
        prm._calculated_value = { execute: obj => obj && obj.calc_order_row && obj.calc_order_row.len || 0 };
      }

      // рассчеты, помеченные, как шаблоны, загрузим в память заранее
      doc.calc_order.load_templates && setTimeout(doc.calc_order.load_templates.bind(doc.calc_order), 1000);

      // даём возможность завершиться другим обработчикам, подписанным на _pouch_load_data_loaded_
      setTimeout(() => $p.md.emit('predefined_elmnts_inited'), 100);
    });
  });

  /**
   * Переопределяем геттер значения
   *
   * @property value
   * @override
   * @type {*}
   */
  delete $p.CchPredefined_elmnts.prototype.value;
  $p.CchPredefined_elmnts.prototype.__define({

    value: {
      get: function () {

        const mf = this.type;
        const res = this._obj ? this._obj.value : '';

        if (this._obj.is_folder) {
          return '';
        }
        if (typeof res == 'object') {
          return res;
        } else if (mf.is_ref) {
          if (mf.digits && typeof res === 'number') {
            return res;
          }
          if (mf.hasOwnProperty('str_len') && !$p.utils.is_guid(res)) {
            return res;
          }
          const mgr = $p.md.value_mgr(this._obj, 'value', mf);
          if (mgr) {
            if ($p.utils.is_data_mgr(mgr)) {
              return mgr.get(res, false);
            } else {
              return $p.utils.fetch_type(res, mgr);
            }
          }
          if (res) {
            $p.record_log(['value', mf, this._obj]);
            return null;
          }
        } else if (mf.date_part) {
          return $p.utils.fix_date(this._obj.value, true);
        } else if (mf.digits) {
          return $p.utils.fix_number(this._obj.value, !mf.hasOwnProperty('str_len'));
        } else if (mf.types[0] == 'boolean') {
          return $p.utils.fix_boolean(this._obj.value);
        } else {
          return this._obj.value || '';
        }

        return this.characteristic.clr;
      },

      set: function (v) {

        if (this._obj.value === v) {
          return;
        }

        _mgr.emit_async('update', this, { value: this._obj.value });
        this._obj.value = v.valueOf();
        this._data._modified = true;
      }
    }
  });
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function ($p) {

  $p.cch.properties.__define({

    /**
     * ### Проверяет заполненность обязательных полей
     *
     * @method check_mandatory
     * @override
     * @param prms {Array}
     * @param title {String}
     * @return {Boolean}
     */
    check_mandatory: {
      value: function (prms, title) {

        var t, row;

        // проверяем заполненность полей
        for (t in prms) {
          row = prms[t];
          if (row.param.mandatory && (!row.value || row.value.empty())) {
            $p.msg.show_msg({
              type: 'alert-error',
              text: $p.msg.bld_empty_param + row.param.presentation,
              title: title || $p.msg.bld_title
            });
            return true;
          }
        }
      }
    },

    /**
     * ### Возвращает массив доступных для данного свойства значений
     *
     * @method slist
     * @override
     * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
     * @param ret_mgr {Object} - установить в этом объекте указатель на менеджера объекта
     * @return {Array}
     */
    slist: {
      value: function (prop, ret_mgr) {

        var res = [],
            rt,
            at,
            pmgr,
            op = this.get(prop);

        if (op && op.type.is_ref) {
          // параметры получаем из локального кеша
          for (rt in op.type.types) if (op.type.types[rt].indexOf('.') > -1) {
            at = op.type.types[rt].split('.');
            pmgr = $p[at[0]][at[1]];
            if (pmgr) {

              if (ret_mgr) {
                ret_mgr.mgr = pmgr;
              }

              if (pmgr.class_name == 'enm.open_directions') {
                pmgr.get_option_list().forEach(function (v) {
                  if (v.value && v.value != $p.enm.tso.folding) {
                    res.push(v);
                  }
                });
              } else if (pmgr.class_name.indexOf('enm.') != -1 || !pmgr.metadata().has_owners) {
                res = pmgr.get_option_list();
              } else {
                pmgr.find_rows({ owner: prop }, function (v) {
                  res.push({ value: v.ref, text: v.presentation });
                });
              }
            }
          }
        }
        return res;
      }
    }

  });

  $p.CchProperties.prototype.__define({

    /**
     * ### Является ли значение параметра вычисляемым
     *
     * @property is_calculated
     * @type Boolean
     */
    is_calculated: {
      get: function () {
        return ($p.job_prm.properties.calculated || []).indexOf(this) != -1;
      }
    },

    /**
     * ### Рассчитывает значение вычисляемого параметра
     * @param obj {Object}
     * @param [obj.row]
     * @param [obj.elm]
     * @param [obj.ox]
     */
    calculated_value: {
      value: function (obj) {
        if (!this._calculated_value) {
          if (this._formula) {
            this._calculated_value = $p.cat.formulas.get(this._formula);
          } else {
            return;
          }
        }
        return this._calculated_value.execute(obj);
      }
    },

    /**
     * ### Проверяет условие в строке отбора
     */
    check_condition: {
      value: function ({ row_spec, prm_row, elm, cnstr, origin, ox, calc_order }) {

        const { is_calculated } = this;
        const { utils, enm: { comparison_types } } = $p;

        // значение параметра
        const val = is_calculated ? this.calculated_value({
          row: row_spec,
          cnstr: cnstr || 0,
          elm,
          ox,
          calc_order
        }) : this.extract_value(prm_row);

        let ok = false;

        // если сравнение на равенство - решаем в лоб, если вычисляемый параметр типа массив - выясняем вхождение значения в параметр
        if (ox && !Array.isArray(val) && (prm_row.comparison_type.empty() || prm_row.comparison_type == comparison_types.eq)) {
          if (is_calculated) {
            ok = val == prm_row.value;
          } else {
            ox.params.find_rows({
              cnstr: cnstr || 0,
              inset: typeof origin !== 'number' && origin || utils.blank.guid,
              param: this,
              value: val
            }, () => {
              ok = true;
              return false;
            });
          }
        }
        // вычисляемый параметр - его значение уже рассчитано формулой (val) - сравниваем со значением в строке ограничений
        else if (is_calculated) {
            const value = this.extract_value(prm_row);
            ok = utils.check_compare(val, value, prm_row.comparison_type, comparison_types);
          }
          // параметр явно указан в табчасти параметров изделия
          else {
              ox.params.find_rows({
                cnstr: cnstr || 0,
                inset: typeof origin !== 'number' && origin || utils.blank.guid,
                param: this
              }, ({ value }) => {
                // value - значение из строки параметра текущей продукции, val - знаяение из параметров отбора
                ok = utils.check_compare(value, val, prm_row.comparison_type, comparison_types);
                return false;
              });
            }
        return ok;
      }
    },

    /**
     * Извлекает значение параметра с учетом вычисляемости
     */
    extract_value: {
      value: function ({ comparison_type, txt_row, value }) {

        switch (comparison_type) {

          case $p.enm.comparison_types.in:
          case $p.enm.comparison_types.nin:

            if (!txt_row) {
              return value;
            }
            try {
              const arr = JSON.parse(txt_row);
              const { types } = this.type;
              if (types.length == 1) {
                const mgr = $p.md.mgr_by_class_name(types[0]);
                return arr.map(ref => mgr.get(ref, false));
              }
              return arr;
            } catch (err) {
              return value;
            }

          default:
            return value;
        }
      }
    },

    /**
     * Возвращает массив связей текущего параметра
     */
    params_links: {
      value: function (attr) {

        // первым делом, выясняем, есть ли ограничитель на текущий параметр
        if (!this.hasOwnProperty('_params_links')) {
          this._params_links = $p.cat.params_links.find_rows({ slave: this });
        }

        return this._params_links.filter(link => {
          let ok = true;
          // для всех записей ключа параметров
          link.master.params.forEach(row => {
            // выполнение условия рассчитывает объект CchProperties
            ok = row.property.check_condition({
              cnstr: attr.grid.selection.cnstr,
              ox: attr.obj._owner._owner,
              prm_row: row,
              elm: attr.obj
            });
            if (!ok) {
              return false;
            }
          });
          return ok;
        });
      }
    },

    /**
     * Проверяет и при необходимости перезаполняет или устанваливает умолчание value в prow
     */
    linked_values: {
      value: function (links, prow) {
        const values = [];
        let changed;
        // собираем все доступные значения в одном массиве
        links.forEach(link => link.values.forEach(row => values.push(row)));
        // если значение доступно в списке - спокойно уходим
        if (values.some(row => row._obj.value == prow.value)) {
          return;
        }
        // если есть явный default - устанавливаем
        if (values.some(row => {
          if (row.forcibly) {
            prow.value = row._obj.value;
            return true;
          }
          if (row.by_default && (!prow.value || prow.value.empty && prow.value.empty())) {
            prow.value = row._obj.value;
            changed = true;
          }
        })) {
          return true;
        }
        // если не нашли лучшего, установим первый попавшийся
        if (changed) {
          return true;
        }
        if (values.length) {
          prow.value = values[0]._obj.value;
          return true;
        }
      }
    },

    /**
     * ### Дополняет отбор фильтром по параметрам выбора
     * Используется в полях ввода экранных форм
     * @param filter {Object} - дополняемый фильтр
     * @param attr {Object} - атрибуты OCombo
     */
    filter_params_links: {
      value: function (filter, attr) {
        // для всех отфильтрованных связей параметров
        this.params_links(attr).forEach(link => {
          // если ключ найден в параметрах, добавляем фильтр
          if (!filter.ref) {
            filter.ref = { in: [] };
          }
          if (filter.ref.in) {
            link.values._obj.forEach(row => {
              if (filter.ref.in.indexOf(row.value) == -1) {
                filter.ref.in.push(row.value);
              }
            });
          }
        });
      }
    }

  });
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperties(Object.prototype, {

  /**
   * Подключает наблюдателя
   * @method observe
   * @for Object
   */
  observe: {
    value: function (target, observer) {
      if (!target) {
        return;
      }
      if (!target._observers) {
        Object.defineProperties(target, {
          _observers: {
            value: []
          },
          _notis: {
            value: []
          }
        });
      }
      target._observers.push(observer);
    }
  },

  /**
   * Отключает наблюдателя
   * @method unobserve
   * @for Object
   */
  unobserve: {
    value: function (target, observer) {
      if (target && target._observers) {

        if (!observer) {
          target._observers.length = 0;
        }

        for (let i = 0; i < target._observers.length; i++) {
          if (target._observers[i] === observer) {
            target._observers.splice(i, 1);
            break;
          }
        }
      }
    }
  },

  /**
   * Возвращает объект нотификатора
   * @method getNotifier
   * @for Object
   */
  getNotifier: {
    value: function (target) {
      var timer;
      return {
        notify(noti) {

          if (!target._observers || !noti) return;

          if (!noti.object) noti.object = target;

          target._notis.push(noti);
          noti = null;

          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout(() => {
            //TODO: свернуть массив оповещений перед отправкой
            if (target._notis.length) {
              target._observers.forEach(observer => observer(target._notis));
              target._notis.length = 0;
            }
            timer = false;
          }, 4);
        }
      };
    }
  }

});

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = require("metadata-core");

/***/ }),
/* 12 */
/***/ (function(module, exports) {

module.exports = require("metadata-pouchdb");

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Эмулирует излучатель событий dhtmlx
 */

module.exports = function ($p) {

  $p.eve = {

    cache: {},

    callEvent(type, args) {
      $p.md.emit(type, args);
    },

    attachEvent(type, listener) {
      $p.md.on(type, listener);
      const id = $p.utils.generate_guid();
      this.cache[id] = [type, listener];
      return id;
    },

    detachEvent(id) {
      const ev = this.cache[id];
      if (ev) {
        $p.md.off(ev[0], ev[1]);
        delete this.cache[id];
      }
    }

  };
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function ($p) {
  /**
   * Дополнительные методы перечисления Типы соединений
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * Created 23.12.2015
   *
   * @module enm_cnn_types
   */

  (function (_mgr) {

    const acn = {
      ii: [_mgr.Наложение],
      i: [_mgr.НезамкнутыйКонтур],
      a: [_mgr.УгловоеДиагональное, _mgr.УгловоеКВертикальной, _mgr.УгловоеКГоризонтальной, _mgr.КрестВСтык],
      t: [_mgr.ТОбразное, _mgr.КрестВСтык]
    };

    /**
     * Короткие псевдонимы перечисления "Типы соединений"
     * @type Object
     */
    Object.defineProperties(_mgr, {
      ad: {
        get: function () {
          return this.УгловоеДиагональное;
        }
      },
      av: {
        get: function () {
          return this.УгловоеКВертикальной;
        }
      },
      ah: {
        get: function () {
          return this.УгловоеКГоризонтальной;
        }
      },
      t: {
        get: function () {
          return this.ТОбразное;
        }
      },
      ii: {
        get: function () {
          return this.Наложение;
        }
      },
      i: {
        get: function () {
          return this.НезамкнутыйКонтур;
        }
      },
      xt: {
        get: function () {
          return this.КрестПересечение;
        }
      },
      xx: {
        get: function () {
          return this.КрестВСтык;
        }
      },

      /**
       * Массивы Типов соединений
       * @type Object
       */
      acn: {
        value: acn
      }

    });
  })($p.enm.cnn_types);

  /**
   * Дополнительные методы перечисления Типы элементов
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module enm_elm_types
   */

  (function (_mgr) {

    const cache = {};

    /**
     * Массивы Типов элементов
     * @type Object
     */
    _mgr.__define({

      profiles: {
        get: function () {
          return cache.profiles || (cache.profiles = [_mgr.Рама, _mgr.Створка, _mgr.Импост, _mgr.Штульп]);
        }
      },

      profile_items: {
        get: function () {
          return cache.profile_items || (cache.profile_items = [_mgr.Рама, _mgr.Створка, _mgr.Импост, _mgr.Штульп, _mgr.Добор, _mgr.Соединитель, _mgr.Раскладка]);
        }
      },

      rama_impost: {
        get: function () {
          return cache.rama_impost || (cache.rama_impost = [_mgr.Рама, _mgr.Импост]);
        }
      },

      impost_lay: {
        get: function () {
          return cache.impost_lay || (cache.impost_lay = [_mgr.Импост, _mgr.Раскладка]);
        }
      },

      stvs: {
        get: function () {
          return cache.stvs || (cache.stvs = [_mgr.Створка]);
        }
      },

      glasses: {
        get: function () {
          return cache.glasses || (cache.glasses = [_mgr.Стекло, _mgr.Заполнение]);
        }
      }

    });
  })($p.enm.elm_types);

  /**
   * ### Модификаторы перечислений
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module enmums
   *
   * Created 22.04.2016
   */

  (function ($p) {

    /**
     * Дополнительные методы перечисления Типы открывания
     */
    $p.enm.open_types.__define({

      is_opening: {
        value: function (v) {

          if (!v || v.empty() || v == this.Глухое || v == this.Неподвижное) return false;

          return true;
        }

        /*
         ,
        	 rotary: {
         get: function () {
         return this.Поворотное;
         }
         },
        	 folding: {
         get: function () {
         return this.Откидное;
         }
         },
        	 rotary_folding: {
         get: function () {
         return this.ПоворотноОткидное;
         }
         },
        	 deaf: {
         get: function () {
         return this.Глухое;
         }
         },
        	 sliding: {
         get: function () {
         return this.Раздвижное;
         }
         },
        	 fixed: {
         get: function () {
         return this.Неподвижное;
         }
         }
         */

      } });

    /**
     * Дополнительные методы перечисления Ориентация
     */
    $p.enm.orientations.__define({

      hor: {
        get: function () {
          return this.Горизонтальная;
        }
      },

      vert: {
        get: function () {
          return this.Вертикальная;
        }
      },

      incline: {
        get: function () {
          return this.Наклонная;
        }
      }
    });

    /**
     * Дополнительные методы перечисления ПоложениеЭлемента
     */
    $p.enm.positions.__define({

      left: {
        get: function () {
          return this.Лев;
        }
      },

      right: {
        get: function () {
          return this.Прав;
        }
      },

      top: {
        get: function () {
          return this.Верх;
        }
      },

      bottom: {
        get: function () {
          return this.Низ;
        }
      },

      hor: {
        get: function () {
          return this.ЦентрГоризонталь;
        }
      },

      vert: {
        get: function () {
          return this.ЦентрВертикаль;
        }
      }
    });
  })($p);

  /**
   * ### Модуль объекта справочника ХарактеристикиНоменклатуры
   * Обрботчики событий after_create, after_load, before_save, after_save, value_change
   * Методы выполняются в контексте текущего объекта this = DocObj
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module cat_characteristics
   *
   * Created 16.03.2016
   */

  // при старте приложения, загружаем в ОЗУ обычные характеристики (без ссылок на заказы)
  $p.md.once('predefined_elmnts_inited', () => {
    const _mgr = $p.cat.characteristics;
    _mgr.adapter.load_view(_mgr, 'doc/nom_characteristics')
    // и корректируем метаданные формы спецификации с учетом ролей пользователя
    .then(() => {
      const { current_user } = $p;
      if (current_user && (current_user.role_available('СогласованиеРасчетовЗаказов') || current_user.role_available('ИзменениеТехнологическойНСИ') || current_user.role_available('РедактированиеЦен'))) {
        return;
      };
      _mgr.metadata().form.obj.tabular_sections.specification.widths = "50,*,70,*,50,70,70,80,70,70,70,0,0,0";
    });
  });

  // свойства объекта характеристики
  $p.CatCharacteristics = class CatCharacteristics extends $p.CatCharacteristics {

    // перед записью надо пересчитать наименование и рассчитать итоги
    before_save(attr) {

      // уточняем номенклатуру системы
      const { prod_nom, calc_order, _data } = this;

      // контроль прав на запись характеристики
      if (calc_order.is_read_only) {
        _data._err = {
          title: 'Права доступа',
          type: 'alert-error',
          text: `Запрещено изменять заказ в статусе ${calc_order.obj_delivery_state}`
        };
        return false;
      }

      // пересчитываем наименование
      const name = this.prod_name();
      if (name) {
        this.name = name;
      }

      // дублируем контрагента для целей RLS
      this.partner = calc_order.partner;
    }

    /**
     * Добавляет параметры вставки
     * @param inset
     * @param cnstr
     */
    add_inset_params(inset, cnstr, blank_inset) {
      const ts_params = this.params;
      const params = [];

      ts_params.find_rows({ cnstr: cnstr, inset: blank_inset || inset }, row => {
        params.indexOf(row.param) === -1 && params.push(row.param);
        return row.param;
      });

      inset.used_params.forEach(param => {
        if (params.indexOf(param) == -1) {
          ts_params.add({
            cnstr: cnstr,
            inset: blank_inset || inset,
            param: param
          });
          params.push(param);
        }
      });
    }

    /**
     * Рассчитывает наименование продукции
     */
    prod_name(short) {
      const { calc_order_row, calc_order, leading_product, sys, clr } = this;
      let name = '';

      if (calc_order_row) {

        if (calc_order.number_internal) {
          name = calc_order.number_internal.trim();
        } else {
          // убираем нули из середины номера
          let num0 = calc_order.number_doc,
              part = '';
          for (let i = 0; i < num0.length; i++) {
            if (isNaN(parseInt(num0[i]))) {
              name += num0[i];
            } else {
              break;
            }
          }
          for (let i = num0.length - 1; i > 0; i--) {
            if (isNaN(parseInt(num0[i]))) {
              break;
            }
            part = num0[i] + part;
          }
          name += parseInt(part || 0).toFixed(0);
        }

        name += '/' + calc_order_row.row.pad();

        // для подчиненных, номер строки родителя
        if (!leading_product.empty()) {
          name += ':' + leading_product.calc_order_row.row.pad();
        }

        // добавляем название системы
        if (!sys.empty()) {
          name += '/' + sys.name;
        }

        if (!short) {

          // добавляем название цвета
          if (!clr.empty()) {
            name += '/' + this.clr.name;
          }

          // добавляем размеры
          if (this.x && this.y) {
            name += '/' + this.x.toFixed(0) + 'x' + this.y.toFixed(0);
          } else if (this.x) {
            name += '/' + this.x.toFixed(0);
          } else if (this.y) {
            name += '/' + this.y.toFixed(0);
          }

          if (this.z) {
            if (this.x || this.y) {
              name += 'x' + this.z.toFixed(0);
            } else {
              name += '/' + this.z.toFixed(0);
            }
          }

          if (this.s) {
            name += '/S:' + this.s.toFixed(3);
          }

          // подмешиваем значения параметров
          let sprm = '';
          this.params.find_rows({ cnstr: 0 }, row => {
            if (row.param.include_to_name && sprm.indexOf(String(row.value)) == -1) {
              sprm && (sprm += ';');
              sprm += String(row.value);
            }
          });
          if (sprm) {
            name += '|' + sprm;
          }
        }
      }
      return name;
    }

    /**
     * Открывает форму происхождения строки спецификации
     */
    open_origin(row_id) {
      try {
        let { origin } = this.specification.get(row_id);
        if (typeof origin == 'number') {
          origin = this.cnn_elmnts.get(origin - 1).cnn;
        }
        if (origin.is_new()) {
          return $p.msg.show_msg({
            type: 'alert-warning',
            text: `Пустая ссылка на настройки в строке №${row_id + 1}`,
            title: o.presentation
          });
        }
        origin.form_obj();
      } catch (err) {
        $p.record_log(err);
      }
    }

    /**
     * Ищет характеристику в озу, в indexeddb не лезет, если нет в озу - создаёт
     * @param elm {Number} - номер элемента или контура
     * @param origin {CatInserts} - порождающая вставка
     * @return {CatCharacteristics}
     */
    find_create_cx(elm, origin) {
      const { _manager, calc_order, params, inserts } = this;
      let cx;
      _manager.find_rows({ leading_product: this, leading_elm: elm, origin }, obj => {
        if (!obj._deleted) {
          cx = obj;
          return false;
        }
      });
      if (!cx) {
        cx = $p.cat.characteristics.create({
          calc_order: calc_order,
          leading_product: this,
          leading_elm: elm,
          origin: origin
        }, false, true)._set_loaded();
      }

      // переносим в cx параметры
      const { length, width } = $p.job_prm.properties;
      cx.params.clear();
      params.find_rows({ cnstr: -elm, inset: origin }, row => {
        if (row.param != length && row.param != width) {
          cx.params.add({ param: row.param, value: row.value });
        }
      });
      // переносим в cx цвет
      inserts.find_rows({ cnstr: -elm, inset: origin }, row => {
        cx.clr = row.clr;
      });
      cx.name = cx.prod_name();
      return cx;
    }

    /**
     * Возврвщает строку заказа, которой принадлежит продукция
     */
    get calc_order_row() {
      let _calc_order_row;
      this.calc_order.production.find_rows({ characteristic: this }, _row => {
        _calc_order_row = _row;
        return false;
      });
      return _calc_order_row;
    }

    /**
     * Возвращает номенклатуру продукции по системе
     */
    get prod_nom() {
      if (!this.sys.empty()) {

        var setted,
            param = this.params;

        if (this.sys.production.count() == 1) {
          this.owner = this.sys.production.get(0).nom;
        } else if (this.sys.production.count() > 1) {
          this.sys.production.each(row => {

            if (setted) {
              return false;
            }

            if (row.param && !row.param.empty()) {
              param.find_rows({ cnstr: 0, param: row.param, value: row.value }, () => {
                setted = true;
                param._owner.owner = row.nom;
                return false;
              });
            }
          });
          if (!setted) {
            this.sys.production.find_rows({ param: $p.utils.blank.guid }, row => {
              setted = true;
              param._owner.owner = row.nom;
              return false;
            });
          }
          if (!setted) {
            this.owner = this.sys.production.get(0).nom;
          }
        }
      }

      return this.owner;
    }
  };

  // при изменении реквизита табчасти вставок
  $p.CatCharacteristicsInsertsRow.prototype.value_change = function (field, type, value) {
    // для вложенных вставок перезаполняем параметры
    if (field == 'inset') {
      if (value != this.inset) {
        const { _owner } = this._owner;
        // удаляем параметры старой вставки
        !this.inset.empty() && _owner.params.clear({ inset: this.inset, cnstr: this.cnstr });
        // устанавливаем значение новой вставки
        this._obj.inset = value;
        // заполняем параметры по умолчанию
        _owner.add_inset_params(this.inset, this.cnstr);
      }
    }
  };

  // индивидуальная форма объекта характеристики
  $p.cat.characteristics.form_obj = function (pwnd, attr) {

    const _meta = this.metadata();

    attr.draw_tabular_sections = function (o, wnd, tabular_init) {

      _meta.form.obj.tabular_sections_order.forEach(ts => {
        if (ts == 'specification') {
          // табчасть со специфическим набором кнопок
          tabular_init('specification', $p.injected_data['toolbar_characteristics_specification.xml']);
          wnd.elmnts.tabs.tab_specification.getAttachedToolbar().attachEvent('onclick', btn_id => {

            if (btn_id == 'btn_origin') {
              const selId = wnd.elmnts.grids.specification.getSelectedRowId();
              if (selId && !isNaN(Number(selId))) {
                return o.open_origin(Number(selId) - 1);
              }

              $p.msg.show_msg({
                type: 'alert-warning',
                text: $p.msg.no_selected_row.replace('%1', 'Спецификация'),
                title: o.presentation
              });
            }
          });
        } else {
          tabular_init(ts);
        }
      });
    };

    return this.constructor.prototype.form_obj.call(this, pwnd, attr).then(function (res) {
      if (res) {
        o = res.o;
        wnd = res.wnd;
        return res;
      }
    });
  };

  /**
   * ### Форма выбора типового блока
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module cat_characteristics_form_selection_block
   *
   * Created 23.12.2015
   */

  (function ($p) {

    const _mgr = $p.cat.characteristics;
    let selection_block, wnd;

    class SelectionBlock {

      constructor(_mgr) {

        this._obj = {
          calc_order: $p.wsql.get_user_param("template_block_calc_order")
        };

        this._meta = Object.assign(_mgr.metadata()._clone(), {
          form: {
            selection: {
              fields: ["presentation", "svg"],
              cols: [{ "id": "presentation", "width": "320", "type": "ro", "align": "left", "sort": "na", "caption": "Наименование" }, { "id": "svg", "width": "*", "type": "rsvg", "align": "left", "sort": "na", "caption": "Эскиз" }]
            }
          }
        });
      }

      // виртуальные метаданные для поля фильтра по заказу
      _metadata(f) {
        const { calc_order } = this._meta.fields;
        return f ? calc_order : { fields: { calc_order } };
      }

      get _manager() {
        return {
          value_mgr: $p.md.value_mgr,
          class_name: "dp.fake"
        };
      }

      get calc_order() {
        return $p.CatCharacteristics.prototype._getter.call(this, "calc_order");
      }
      set calc_order(v) {

        const { _obj, attr } = this;

        if (!v || v == _obj.calc_order) {
          return;
        }
        // если вместо заказа прибежала харакетристика - возвращаем её в качестве результата
        if (v._block) {
          wnd && wnd.close();
          return attr.on_select && attr.on_select(v._block);
        }
        _obj.calc_order = v.valueOf();

        if (wnd && wnd.elmnts && wnd.elmnts.filter && wnd.elmnts.grid && wnd.elmnts.grid.getColumnCount()) {
          wnd.elmnts.filter.call_event();
        }

        if (!$p.utils.is_empty_guid(_obj.calc_order) && $p.wsql.get_user_param("template_block_calc_order") != _obj.calc_order) {
          $p.wsql.set_user_param("template_block_calc_order", _obj.calc_order);
        }
      }

    }

    // попробуем подсунуть типовой форме выбора виртуальные метаданные - с деревом и ограниченным списком значений
    _mgr.form_selection_block = function (pwnd, attr = {}) {

      if (!selection_block) {
        selection_block = new SelectionBlock(_mgr);
      }
      selection_block.attr = attr;

      // объект отбора по ссылке на расчет в продукции
      if ($p.job_prm.builder.base_block && (selection_block.calc_order.empty() || selection_block.calc_order.is_new())) {
        $p.job_prm.builder.base_block.some(o => {
          selection_block.calc_order = o;
          return true;
        });
      }

      // начальное значение - выбранные в предыдущий раз типовой блок
      attr.initial_value = $p.wsql.get_user_param("template_block_initial_value");

      // подсовываем типовой форме списка изменённые метаданные
      attr.metadata = selection_block._meta;

      // и еще, подсовываем форме собственный обработчик получения данных
      attr.custom_selection = function (attr) {
        const ares = [],
              crefs = [];
        let calc_order;

        // получаем ссылку на расчет из отбора
        attr.selection.some(o => {
          if (Object.keys(o).indexOf("calc_order") != -1) {
            calc_order = o.calc_order;
            return true;
          }
        });

        // получаем документ расчет
        return $p.doc.calc_order.get(calc_order, true, true).then(o => {

          // получаем массив ссылок на характеристики в табчасти продукции
          o.production.each(row => {
            if (!row.characteristic.empty()) {
              if (row.characteristic.is_new()) {
                crefs.push(row.characteristic.ref);
              } else {
                // если это характеристика продукции - добавляем
                if (!row.characteristic.calc_order.empty() && row.characteristic.coordinates.count()) {
                  if (row.characteristic._attachments && row.characteristic._attachments.svg && !row.characteristic._attachments.svg.stub) {
                    ares.push(row.characteristic);
                  } else {
                    crefs.push(row.characteristic.ref);
                  }
                }
              }
            }
          });
          return crefs.length ? _mgr.adapter.load_array(_mgr, crefs, true) : crefs;
        }).then(() => {

          // если это характеристика продукции - добавляем
          crefs.forEach(o => {
            o = _mgr.get(o, false, true);
            if (o && !o.calc_order.empty() && o.coordinates.count()) {
              ares.push(o);
            }
          });

          // фильтруем по подстроке
          crefs.length = 0;
          ares.forEach(o => {
            const presentation = (o.calc_order_row && o.calc_order_row.note || o.note || o.name) + "<br />" + o.owner.name;
            if (!attr.filter || presentation.toLowerCase().match(attr.filter.toLowerCase())) crefs.push({
              ref: o.ref,
              presentation: '<div style="white-space:normal"> ' + presentation + ' </div>',
              svg: o._attachments ? o._attachments.svg : ""
            });
          });

          // догружаем изображения
          ares.length = 0;
          crefs.forEach(o => {
            if (o.svg && o.svg.data) {
              ares.push($p.utils.blob_as_text(o.svg.data).then(function (svg) {
                o.svg = svg;
              }));
            }
          });
          return Promise.all(ares);
        })
        // конвертируем в xml для вставки в грид
        .then(() => $p.iface.data_to_grid.call(_mgr, crefs, attr));
      };

      // создаём форму списка
      wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

      wnd.elmnts.toolbar.hideItem("btn_new");
      wnd.elmnts.toolbar.hideItem("btn_edit");
      wnd.elmnts.toolbar.hideItem("btn_delete");

      // добавляем элемент управления фильтра по расчету
      wnd.elmnts.filter.add_filter({
        text: "Расчет",
        name: "calc_order"
      });
      const fdiv = wnd.elmnts.filter.custom_selection.calc_order.parentNode;
      fdiv.removeChild(fdiv.firstChild);

      wnd.elmnts.filter.custom_selection.calc_order = new $p.iface.OCombo({
        parent: fdiv,
        obj: selection_block,
        field: "calc_order",
        width: 220,
        get_option_list: (selection, val) => new Promise((resolve, reject) => {

          setTimeout(() => {
            const l = [];
            const { base_block, branch_filter } = $p.job_prm.builder;

            base_block.forEach(({ note, presentation, ref, production }) => {
              if (branch_filter && branch_filter.sys && branch_filter.sys.length && production.count()) {
                const { characteristic } = production.get(0);
                if (!branch_filter.sys.some(filter => characteristic.sys._hierarchy(filter))) {
                  return;
                }
              }
              if (selection.presentation && selection.presentation.like) {
                if (note.toLowerCase().match(selection.presentation.like.toLowerCase()) || presentation.toLowerCase().match(selection.presentation.like.toLowerCase())) {
                  l.push({ text: note || presentation, value: ref });
                }
              } else {
                l.push({ text: note || presentation, value: ref });
              }
            });

            l.sort((a, b) => {
              if (a.text < b.text) {
                return -1;
              } else if (a.text > b.text) {
                return 1;
              } else {
                return 0;
              }
            });

            resolve(l);
          }, $p.job_prm.builder.base_block ? 0 : 1000);
        })
      });
      wnd.elmnts.filter.custom_selection.calc_order.getBase().style.border = "none";

      return wnd;
    };
  })($p);

  /**
   * ### Дополнительные методы справочника Цвета
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module cat_cnns
   *
   * Created 23.12.2015
   */

  $p.cat.clrs.__define({

    /**
     * ПолучитьЦветПоПредопределенномуЦвету
     * @param clr {CatClrs} - цвет исходной строки соединения, фурнитуры или вставки
     * @param clr_elm {CatClrs} - цвет элемента
     * @param clr_sch {CatClrs} - цвет изделия
     * @return {*}
     */
    by_predefined: {
      value: function (clr, clr_elm, clr_sch, elm, spec) {

        const { predefined_name } = clr;
        if (predefined_name) {
          switch (predefined_name) {
            case 'КакЭлемент':
              return clr_elm;
            case 'КакИзделие':
              return clr_sch;
            case 'КакЭлементСнаружи':
              return clr_elm.clr_out.empty() ? clr_elm : clr_elm.clr_out;
            case 'КакЭлементИзнутри':
              return clr_elm.clr_in.empty() ? clr_elm : clr_elm.clr_in;
            case 'КакИзделиеСнаружи':
              return clr_sch.clr_out.empty() ? clr_sch : clr_sch.clr_out;
            case 'КакИзделиеИзнутри':
              return clr_sch.clr_in.empty() ? clr_sch : clr_sch.clr_in;
            case 'КакЭлементИнверсный':
              return this.inverted(clr_elm);
            case 'КакИзделиеИнверсный':
              return this.inverted(clr_sch);
            case 'БезЦвета':
              return this.get();
            case 'КакВедущий':
            case 'КакВедущийИзнутри':
            case 'КакВедущийСнаружи':
            case 'КакВедущийИнверсный':
              const sub_clr = this.predefined(predefined_name.replace('КакВедущий', 'КакЭлемент'));
              const t_parent = elm && elm.t_parent();
              if (!elm || elm === t_parent) {
                return this.by_predefined(sub_clr, clr_elm);
              }
              let finded = false;
              spec && spec.find_rows({ elm: t_parent.elm, nom: t_parent.nom }, row => {
                finded = this.by_predefined(sub_clr, row.clr);
                return false;
              });
              return finded || clr_elm;

            default:
              return clr_elm;
          }
        }
        return clr.empty() ? clr_elm : clr;
      }
    },

    /**
     * ### Инверсный цвет
     * Возвращает элемент, цвета которого изнутри и снаружи перевёрнуты местами
     * @param clr {CatClrs} - исходный цвет
     */
    inverted: {
      value: function (clr) {
        if (clr.clr_in == clr.clr_out || clr.clr_in.empty() || clr.clr_out.empty()) {
          return clr;
        }
        // ищем в справочнике цветов
        const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)", [this.alatable, clr.clr_out.ref, clr.clr_in.ref, $p.utils.blank.guid]);
        return ares.length ? this.get(ares[0]) : clr;
      }
    },

    /**
     * Дополняет связи параметров выбора отбором, исключающим служебные цвета
     * @param mf {Object} - описание метаданных поля
     */
    selection_exclude_service: {
      value: function (mf, sys) {

        if (mf.choice_params) mf.choice_params.length = 0;else mf.choice_params = [];

        mf.choice_params.push({
          name: "parent",
          path: { not: $p.cat.clrs.predefined("СЛУЖЕБНЫЕ") }
        });

        if (sys) {
          mf.choice_params.push({
            name: "ref",
            get path() {
              const res = [];
              let clr_group, elm;

              function add_by_clr(clr) {
                if (clr instanceof $p.CatClrs) {
                  const { ref } = clr;
                  if (clr.is_folder) {
                    $p.cat.clrs.alatable.forEach(row => row.parent == ref && res.push(row.ref));
                  } else {
                    res.push(ref);
                  }
                } else if (clr instanceof $p.CatColor_price_groups) {
                  clr.clr_conformity.forEach(({ clr1 }) => add_by_clr(clr1));
                }
              }

              if (sys instanceof $p.Editor.BuilderElement) {
                clr_group = sys.inset.clr_group;
                if (clr_group.empty() && !(sys instanceof $p.Editor.Filling)) {
                  clr_group = sys.project._dp.sys.clr_group;
                }
              } else if (sys instanceof $p.classes.DataProcessorObj) {
                clr_group = sys.sys.clr_group;
              } else {
                clr_group = sys.clr_group;
              }

              if (clr_group.empty() || !clr_group.clr_conformity.count()) {
                return { not: '' };
              } else {
                add_by_clr(clr_group);
              }
              return { in: res };
            }
          });
        }
      }
    },

    /**
     * Форма выбора с фильтром по двум цветам, создающая при необходимости составной цвет
     */
    form_selection: {
      value: function (pwnd, attr) {

        const eclr = this.get();

        attr.hide_filter = true;

        attr.toolbar_click = function (btn_id, wnd) {

          // если указаны оба цвета
          if (btn_id == "btn_select" && !eclr.clr_in.empty() && !eclr.clr_out.empty()) {

            // ищем в справочнике цветов
            const ares = $p.wsql.alasql("select top 1 ref from ? where clr_in = ? and clr_out = ? and (not ref = ?)", [$p.cat.clrs.alatable, eclr.clr_in.ref, eclr.clr_out.ref, $p.utils.blank.guid]);

            // если не нашли - создаём
            if (ares.length) {
              pwnd.on_select.call(pwnd, $p.cat.clrs.get(ares[0]));
            } else {
              $p.cat.clrs.create({
                clr_in: eclr.clr_in,
                clr_out: eclr.clr_out,
                name: eclr.clr_in.name + " \\ " + eclr.clr_out.name,
                parent: $p.job_prm.builder.composite_clr_folder
              })
              // регистрируем цвет в couchdb
              .then(obj => obj.register_on_server()).then(obj => pwnd.on_select.call(pwnd, obj)).catch(err => $p.msg.show_msg({
                type: "alert-warning",
                text: "Недостаточно прав для добавления составного цвета",
                title: "Составной цвет"
              }));
            }

            wnd.close();
            return false;
          }
        };

        const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

        function get_option_list(selection, val) {

          selection.clr_in = $p.utils.blank.guid;
          selection.clr_out = $p.utils.blank.guid;

          if (attr.selection) {
            attr.selection.some(sel => {
              for (var key in sel) {
                if (key == "ref") {
                  selection.ref = sel.ref;
                  return true;
                }
              }
            });
          }

          return this.constructor.prototype.get_option_list.call(this, selection, val);
        }

        return (wnd instanceof Promise ? wnd : Promise.resolve(wnd)).then(wnd => {

          const tb_filter = wnd.elmnts.filter;

          tb_filter.__define({
            get_filter: {
              value: () => {
                const res = {
                  selection: []
                };
                if (clr_in.getSelectedValue()) res.selection.push({ clr_in: clr_in.getSelectedValue() });
                if (clr_out.getSelectedValue()) res.selection.push({ clr_out: clr_out.getSelectedValue() });
                if (res.selection.length) res.hide_tree = true;
                return res;
              }
            }
          });

          wnd.attachEvent("onClose", () => {

            clr_in.unload();
            clr_out.unload();

            eclr.clr_in = $p.utils.blank.guid;
            eclr.clr_out = $p.utils.blank.guid;

            return true;
          });

          eclr.clr_in = $p.utils.blank.guid;
          eclr.clr_out = $p.utils.blank.guid;

          // Создаём элементы управления
          const clr_in = new $p.iface.OCombo({
            parent: tb_filter.div.obj,
            obj: eclr,
            field: "clr_in",
            width: 150,
            hide_frm: true,
            get_option_list: get_option_list
          });
          const clr_out = new $p.iface.OCombo({
            parent: tb_filter.div.obj,
            obj: eclr,
            field: "clr_out",
            width: 150,
            hide_frm: true,
            get_option_list: get_option_list
          });

          clr_in.DOMelem.style.float = "left";
          clr_in.DOMelem_input.placeholder = "Цвет изнутри";
          clr_out.DOMelem_input.placeholder = "Цвет снаружи";

          clr_in.attachEvent("onChange", tb_filter.call_event);
          clr_out.attachEvent("onChange", tb_filter.call_event);
          clr_in.attachEvent("onClose", tb_filter.call_event);
          clr_out.attachEvent("onClose", tb_filter.call_event);

          // гасим кнопки управления
          wnd.elmnts.toolbar.hideItem("btn_new");
          wnd.elmnts.toolbar.hideItem("btn_edit");
          wnd.elmnts.toolbar.hideItem("btn_delete");

          wnd.elmnts.toolbar.setItemText("btn_select", "<b>Выбрать или создать</b>");

          return wnd;
        });
      }
    },

    /**
     * Изменяем алгоритм построения формы списка. Игнорируем иерархию, если указаны цвета изнутри или снаружи
     */
    sync_grid: {
      value: function (attr, grid) {

        if (attr.action == "get_selection" && attr.selection && attr.selection.some(function (v) {
          return v.hasOwnProperty("clr_in") || v.hasOwnProperty("clr_out");
        })) {
          delete attr.parent;
          delete attr.initial_value;
        }

        return $p.classes.DataManager.prototype.sync_grid.call(this, attr, grid);
      }
    }
  });

  $p.CatClrs = class CatClrs extends $p.CatClrs {

    // записывает элемент цвета на сервере
    register_on_server() {
      return $p.wsql.pouch.save_obj(this, {
        db: $p.wsql.pouch.remote.ram
      }).then(function (obj) {
        return obj.save();
      });
    }

    // возвращает стороны, на которых цвет
    get sides() {
      const res = { is_in: false, is_out: false };
      if (!this.empty() && !this.predefined_name) {
        if (this.clr_in.empty() && this.clr_out.empty()) {
          res.is_in = res.is_out = true;
        } else {
          if (!this.clr_in.empty() && !this.clr_in.predefined_name) {
            res.is_in = true;
          }
          if (!this.clr_out.empty() && !this.clr_out.predefined_name) {
            res.is_out = true;
          }
        }
      }
      return res;
    }
  };

  /**
   * ### Дополнительные методы справочника _Соединения_
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   * @module cat_cnns
   * Created 23.12.2015
   */

  $p.cat.cnns.__define({

    _nomcache: {
      value: {}
    },

    sql_selection_list_flds: {
      value: function (initial_value) {
        return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as cnn_type," + " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_cnns AS _t_" + " left outer join enm_cnn_types as _k_ on _k_.ref = _t_.cnn_type %3 %4 LIMIT 300";
      }
    },

    /**
     * Возвращает массив соединений, доступный для сочетания номенклатур.
     * Для соединений с заполнениями учитывается толщина. Контроль остальных геометрических особенностей выполняется на стороне рисовалки
     * @param nom1 {_cat.nom|BuilderElement}
     * @param [nom2] {_cat.nom|BuilderElement}
     * @param [cnn_types] {_enm.cnns|Array.<_enm.cnns>}
     * @param [ign_side] {Boolean}
     * @param [is_outer] {Boolean}
     * @return {Array}
     */
    nom_cnn: {
      value: function (nom1, nom2, cnn_types, ign_side, is_outer) {

        const { ProfileItem, BuilderElement, Filling } = $p.Editor;
        const { Вертикальная } = $p.enm.orientations;

        // если второй элемент вертикальный - меняем местами эл 1-2 при поиске
        if (nom1 instanceof ProfileItem && nom2 instanceof ProfileItem && cnn_types && cnn_types.indexOf($p.enm.cnn_types.УгловоеДиагональное) != -1 && nom1.orientation != Вертикальная && nom2.orientation == Вертикальная) {
          return this.nom_cnn(nom2, nom1, cnn_types);
        }

        // если оба элемента - профили, определяем сторону
        const side = is_outer ? $p.enm.cnn_sides.Снаружи : !ign_side && nom1 instanceof ProfileItem && nom2 instanceof ProfileItem && nom2.cnn_side(nom1);

        let onom2,
            a1,
            a2,
            thickness1,
            thickness2,
            is_i = false,
            art1glass = false,
            art2glass = false;

        if (!nom2 || $p.utils.is_data_obj(nom2) && nom2.empty()) {
          is_i = true;
          onom2 = nom2 = $p.cat.nom.get();
        } else {
          if (nom2 instanceof BuilderElement) {
            onom2 = nom2.nom;
          } else if ($p.utils.is_data_obj(nom2)) {
            onom2 = nom2;
          } else {
            onom2 = $p.cat.nom.get(nom2);
          }
        }

        const ref1 = nom1.ref;
        const ref2 = onom2.ref;

        if (!is_i) {
          if (nom1 instanceof Filling) {
            art1glass = true;
            thickness1 = nom1.thickness;
          } else if (nom2 instanceof Filling) {
            art2glass = true;
            thickness2 = nom2.thickness;
          }
        }

        if (!this._nomcache[ref1]) {
          this._nomcache[ref1] = {};
        }
        a1 = this._nomcache[ref1];
        if (!a1[ref2]) {
          a2 = a1[ref2] = [];
          // для всех элементов справочника соединения
          this.each(cnn => {
            // если в строках соединяемых элементов есть наша - добавляем
            let is_nom1 = art1glass ? cnn.art1glass && thickness1 >= cnn.tmin && thickness1 <= cnn.tmax && cnn.cnn_type == $p.enm.cnn_types.Наложение : false,
                is_nom2 = art2glass ? cnn.art2glass && thickness2 >= cnn.tmin && thickness2 <= cnn.tmax : false;

            cnn.cnn_elmnts.each(row => {
              if (is_nom1 && is_nom2) {
                return false;
              }
              is_nom1 = is_nom1 || row.nom1 == ref1 && (row.nom2.empty() || row.nom2 == onom2);
              is_nom2 = is_nom2 || row.nom2 == onom2 && (row.nom1.empty() || row.nom1 == ref1);
            });
            if (is_nom1 && is_nom2) {
              a2.push(cnn);
            }
          });
        }

        if (cnn_types) {
          const types = Array.isArray(cnn_types) ? cnn_types : $p.enm.cnn_types.acn.a.indexOf(cnn_types) != -1 ? $p.enm.cnn_types.acn.a : [cnn_types];
          return a1[ref2].filter(cnn => {
            if (types.indexOf(cnn.cnn_type) != -1) {
              if (!side) {
                return true;
              }
              if (cnn.sd1 == $p.enm.cnn_sides.Изнутри) {
                return side == $p.enm.cnn_sides.Изнутри;
              } else if (cnn.sd1 == $p.enm.cnn_sides.Снаружи) {
                return side == $p.enm.cnn_sides.Снаружи;
              } else {
                return true;
              }
            }
          });
        }

        return a1[ref2];
      }
    },

    /**
     * Возвращает соединение между элементами
     * @param elm1
     * @param elm2
     * @param [cnn_types] {Array}
     * @param [curr_cnn] {_cat.cnns}
     * @param [ign_side] {Boolean}
     * @param [is_outer] {Boolean}
     */
    elm_cnn: {
      value: function (elm1, elm2, cnn_types, curr_cnn, ign_side, is_outer) {

        // если установленное ранее соединение проходит по типу и стороне, нового не ищем
        if (curr_cnn && cnn_types && cnn_types.indexOf(curr_cnn.cnn_type) != -1 && cnn_types != $p.enm.cnn_types.acn.ii) {

          // TODO: проверить геометрию

          if (!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Изнутри) {
            if (typeof is_outer == 'boolean') {
              if (!is_outer) {
                return curr_cnn;
              }
            } else {
              if (elm2.cnn_side(elm1) == $p.enm.cnn_sides.Изнутри) {
                return curr_cnn;
              }
            }
          } else if (!ign_side && curr_cnn.sd1 == $p.enm.cnn_sides.Снаружи) {
            if (is_outer || elm2.cnn_side(elm1) == $p.enm.cnn_sides.Снаружи) return curr_cnn;
          } else {
            return curr_cnn;
          }
        }

        const cnns = this.nom_cnn(elm1, elm2, cnn_types, ign_side, is_outer);

        // сортируем по непустой стороне и приоритету
        if (cnns.length) {
          const sides = [$p.enm.cnn_sides.Изнутри, $p.enm.cnn_sides.Снаружи];
          if (cnns.length > 1) {
            cnns.sort((a, b) => {
              if (sides.indexOf(a.sd1) != -1 && sides.indexOf(b.sd1) == -1) {
                return 1;
              }
              if (sides.indexOf(b.sd1) != -1 && sides.indexOf(a.sd1) == -1) {
                return -1;
              }
              if (a.priority > b.priority) {
                return -1;
              }
              if (a.priority < b.priority) {
                return 1;
              }
              if (a.name > b.name) {
                return -1;
              }
              if (a.name < b.name) {
                return 1;
              }
              return 0;
            });
          }
          return cnns[0];
        }
        // TODO: возможно, надо вернуть соединение с пустотой
        else {}
      }
    }

  });

  // публичные методы объекта
  $p.CatCnns.prototype.__define({

    /**
     * Возвращает основную строку спецификации соединения между элементами
     */
    main_row: {
      value: function (elm) {

        var ares,
            nom = elm.nom;

        // если тип соединения угловой, то арт-1-2 определяем по ориентации элемента
        if ($p.enm.cnn_types.acn.a.indexOf(this.cnn_type) != -1) {

          var art12 = elm.orientation == $p.enm.orientations.Вертикальная ? $p.job_prm.nom.art1 : $p.job_prm.nom.art2;

          ares = this.specification.find_rows({ nom: art12 });
          if (ares.length) return ares[0]._row;
        }

        // в прочих случаях, принадлежность к арт-1-2 определяем по табчасти СоединяемыеЭлементы
        if (this.cnn_elmnts.find_rows({ nom1: nom }).length) {
          ares = this.specification.find_rows({ nom: $p.job_prm.nom.art1 });
          if (ares.length) return ares[0]._row;
        }
        if (this.cnn_elmnts.find_rows({ nom2: nom }).length) {
          ares = this.specification.find_rows({ nom: $p.job_prm.nom.art2 });
          if (ares.length) return ares[0]._row;
        }
        ares = this.specification.find_rows({ nom: nom });
        if (ares.length) return ares[0]._row;
      }
    },

    /**
     * Проверяет, есть ли nom в колонке nom2 соединяемых элементов
     */
    check_nom2: {
      value: function (nom) {
        var ref = $p.utils.is_data_obj(nom) ? nom.ref : nom;
        return this.cnn_elmnts._obj.some(function (row) {
          return row.nom == ref;
        });
      }
    }

  });

  /**
   * ### Дополнительные методы справочника _Договоры контрагентов_
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module cat_contracts
   *
   * Created 23.12.2015
   */

  $p.cat.contracts.__define({

    sql_selection_list_flds: {
      value: function (initial_value) {
        return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as contract_kind, _m_.synonym as mutual_settlements, _o_.name as organization, _p_.name as partner," + " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_contracts AS _t_" + " left outer join cat_organizations as _o_ on _o_.ref = _t_.organization" + " left outer join cat_partners as _p_ on _p_.ref = _t_.owner" + " left outer join enm_mutual_contract_settlements as _m_ on _m_.ref = _t_.mutual_settlements" + " left outer join enm_contract_kinds as _k_ on _k_.ref = _t_.contract_kind %3 %4 LIMIT 300";
      }
    },

    by_partner_and_org: {
      value: function (partner, organization, contract_kind = $p.enm.contract_kinds.СПокупателем) {

        const { main_contract } = $p.cat.partners.get(partner);

        //Если у контрагента есть основной договор, и он подходит по виду договора и организации,
        // возвращаем его, не бегая по массиву
        if (main_contract && main_contract.contract_kind == contract_kind && main_contract.organization == organization) {
          return main_contract;
        }

        const res = this.find_rows({ owner: partner, organization: organization, contract_kind: contract_kind });
        res.sort((a, b) => a.date > b.date);
        return res.length ? res[0] : this.get();
      }
    }

  });

  // перед записью, устанавливаем код, родителя и наименование
  // _mgr.on("before_save", function (attr) {
  //
  //
  //
  // });

  /**
   * @module cat_divisions
   *
   * Created by Evgeniy Malyarov on 27.05.2017.
   */

  Object.defineProperties($p.cat.divisions, {
    get_option_list: {
      value: function (selection, val) {
        const list = [];
        $p.current_user.acl_objs.find_rows({ type: "cat.divisions" }, ({ acl_obj }) => {
          if (list.indexOf(acl_obj) == -1) {
            list.push(acl_obj);
            acl_obj._children().forEach(o => list.indexOf(o) == -1 && list.push(o));
          }
        });
        if (!list.length) {
          return this.constructor.prototype.get_option_list.call(this, selection, val);
        }

        function check(v) {
          if ($p.utils.is_equal(v.value, val)) v.selected = true;
          return v;
        }

        const l = [];
        $p.utils._find_rows.call(this, list, selection, v => l.push(check({ text: v.presentation, value: v.ref })));

        l.sort(function (a, b) {
          if (a.text < b.text) {
            return -1;
          } else if (a.text > b.text) {
            return 1;
          }
          return 0;
        });
        return Promise.resolve(l);
      }
    }
  });

  /**
   * ### Дополнительные методы справочника Визуализация элементов
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * Created 08.04.2016
   *
   * @module cat_elm_visualization
   */

  // публичные методы объекта
  $p.CatElm_visualization.prototype.__define({

    draw: {
      value: function (elm, layer, offset) {

        const { CompoundPath, constructor } = elm.project._scope;

        let subpath;

        if (this.svg_path.indexOf('{"method":') == 0) {

          const attr = JSON.parse(this.svg_path);

          if (attr.method == "subpath_outer") {

            subpath = elm.rays.outer.get_subpath(elm.corns(1), elm.corns(2)).equidistant(attr.offset || 10);

            subpath.parent = layer._by_spec;
            subpath.strokeWidth = attr.strokeWidth || 4;
            subpath.strokeColor = attr.strokeColor || 'red';
            subpath.strokeCap = attr.strokeCap || 'round';
            if (attr.dashArray) subpath.dashArray = attr.dashArray;
          }
        } else if (this.svg_path) {

          subpath = new CompoundPath({
            pathData: this.svg_path,
            parent: layer._by_spec,
            strokeColor: 'black',
            fillColor: 'white',
            strokeScaling: false,
            pivot: [0, 0],
            opacity: elm.opacity
          });

          if (elm instanceof constructor.Filling) {
            subpath.position = elm.bounds.topLeft.add([20, 10]);
          } else {

            // угол касательной
            var angle_hor;
            if (elm.is_linear() || offset < 0) angle_hor = elm.generatrix.getTangentAt(0).angle;else if (offset > elm.generatrix.length) angle_hor = elm.generatrix.getTangentAt(elm.generatrix.length).angle;else angle_hor = elm.generatrix.getTangentAt(offset).angle;

            if ((this.rotate != -1 || elm.orientation == $p.enm.orientations.Горизонтальная) && angle_hor != this.angle_hor) {
              subpath.rotation = angle_hor - this.angle_hor;
            }

            offset += elm.generatrix.getOffsetOf(elm.generatrix.getNearestPoint(elm.corns(1)));

            const p0 = elm.generatrix.getPointAt(offset > elm.generatrix.length ? elm.generatrix.length : offset || 0);

            if (this.elm_side == -1) {
              // в середине элемента
              const p1 = elm.rays.inner.getNearestPoint(p0);
              const p2 = elm.rays.outer.getNearestPoint(p0);

              subpath.position = p1.add(p2).divide(2);
            } else if (!this.elm_side) {
              // изнутри
              subpath.position = elm.rays.inner.getNearestPoint(p0);
            } else {
              // снаружи
              subpath.position = elm.rays.outer.getNearestPoint(p0);
            }
          }
        }
      }
    }

  });

  /**
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * Created 17.04.2016
   *
   * @module cat_formulas
   *
   */

  // обработчик события после загрузки данных в озу
  $p.adapters.pouch.once('pouch_data_loaded', () => {
    // читаем элементы из pouchdb и создаём формулы
    const { formulas } = $p.cat;
    formulas.adapter.find_rows(formulas, { _top: 500, _skip: 0 }).then(rows => {
      const parents = [formulas.predefined('printing_plates'), formulas.predefined('modifiers')];
      const filtered = rows.filter(v => !v.disabled && parents.indexOf(v.parent) !== -1);
      filtered.sort((a, b) => a.sorting_field - b.sorting_field).forEach(formula => {
        // формируем списки печатных форм и внешних обработок
        if (formula.parent == parents[0]) {
          formula.params.find_rows({ param: 'destination' }, dest => {
            const dmgr = $p.md.mgr_by_class_name(dest.value);
            if (dmgr) {
              if (!dmgr._printing_plates) {
                dmgr._printing_plates = {};
              }
              dmgr._printing_plates[`prn_${formula.ref}`] = formula;
            }
          });
        } else {
          // выполняем модификаторы
          try {
            formula.execute();
          } catch (err) {}
        }
      });
    });
  });

  $p.CatFormulas.prototype.__define({

    execute: {
      value: function (obj, attr) {

        // создаём функцию из текста формулы
        if (!this._data._formula && this.formula) {
          try {
            if (this.async) {
              const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
              this._data._formula = new AsyncFunction("obj,$p,attr", this.formula).bind(this);
            } else {
              this._data._formula = new Function("obj,$p,attr", this.formula).bind(this);
            }
          } catch (err) {
            this._data._formula = () => false;
            $p.record_log(err);
          }
        }

        const { _formula } = this._data;

        if (this.parent == $p.cat.formulas.predefined("printing_plates")) {

          if (!_formula) {
            $p.msg.show_msg({
              title: $p.msg.bld_title,
              type: "alert-error",
              text: `Ошибка в формуле<br /><b>${this.name}</b>`
            });
            return Promise.resolve();
          }

          // получаем HTMLDivElement с отчетом
          return _formula(obj, $p, attr)

          // показываем отчет в отдельном окне
          .then(doc => doc instanceof $p.SpreadsheetDocument && doc.print());
        } else {
          return _formula && _formula(obj, $p, attr);
        }
      }
    },

    _template: {
      get: function () {
        if (!this._data._template) {
          this._data._template = new $p.SpreadsheetDocument(this.template);
        }
        return this._data._template;
      }
    }
  });

  /**
   * Дополнительные методы справочника Фурнитура
   *
   * Created 23.12.2015<br />
   * &copy; http://www.oknosoft.ru 2014-2018
   * @author Evgeniy Malyarov
   * @module cat_furns
   */

  /**
   * Методы менеджера фурнитуры
   */
  Object.defineProperties($p.cat.furns, {

    sql_selection_list_flds: {
      value: function (initial_value) {
        return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.parent, case when _t_.is_folder then '' else _t_.id end as id, _t_.name as presentation, _k_.synonym as open_type, \
					 case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_furns AS _t_ \
					 left outer join enm_open_types as _k_ on _k_.ref = _t_.open_type %3 %4 LIMIT 300";
      }
    },

    get_option_list: {
      value: function (selection, val) {

        const { characteristic, sys } = paper.project._dp;
        const { furn } = $p.job_prm.properties;

        if (furn && sys && !sys.empty()) {

          const links = furn.params_links({
            grid: { selection: { cnstr: 0 } },
            obj: { _owner: { _owner: characteristic } }
          });

          if (links.length) {
            // собираем все доступные значения в одном массиве
            const list = [];
            links.forEach(link => link.values.forEach(row => list.push(this.get(row._obj.value))));

            function check(v) {
              if ($p.utils.is_equal(v.value, val)) v.selected = true;
              return v;
            }

            const l = [];
            $p.utils._find_rows.call(this, list, selection, v => l.push(check({ text: v.presentation, value: v.ref })));

            l.sort((a, b) => {
              if (a.text < b.text) {
                return -1;
              } else if (a.text > b.text) {
                return 1;
              }
              return 0;
            });
            return Promise.resolve(l);
          }
        }
        return this.constructor.prototype.get_option_list.call(this, selection, val);
      },
      configurable: true
    }

  });

  /**
   * Методы объекта фурнитуры
   */
  $p.CatFurns = class CatFurns extends $p.CatFurns {

    /**
     * Перезаполняет табчасть параметров указанного контура
     */
    refill_prm({ project, furn, cnstr }) {

      const fprms = project.ox.params;
      const { direction } = $p.job_prm.properties;

      // формируем массив требуемых параметров по задействованным в contour.furn.furn_set
      const aprm = furn.furn_set.add_furn_prm();
      aprm.sort((a, b) => {
        if (a.presentation > b.presentation) {
          return 1;
        }
        if (a.presentation < b.presentation) {
          return -1;
        }
        return 0;
      });

      // дозаполняем и приклеиваем значения по умолчанию
      aprm.forEach(v => {

        // направления в табчасть не добавляем
        if (v == direction) {
          return;
        }

        let prm_row,
            forcibly = true;
        fprms.find_rows({ param: v, cnstr: cnstr }, row => {
          prm_row = row;
          return forcibly = false;
        });
        if (!prm_row) {
          prm_row = fprms.add({ param: v, cnstr: cnstr }, true);
        }

        // умолчания и скрытость по табчасти системы
        const { param } = prm_row;
        project._dp.sys.furn_params.each(row => {
          if (row.param == param) {
            if (row.forcibly || forcibly) {
              prm_row.value = row.value;
            }
            prm_row.hide = row.hide || param.is_calculated;
            return false;
          }
        });

        // умолчания по связям параметров
        param.linked_values(param.params_links({
          grid: { selection: { cnstr: cnstr } },
          obj: { _owner: { _owner: project.ox } }
        }), prm_row);
      });

      // удаляем лишние строки
      const adel = [];
      fprms.find_rows({ cnstr: cnstr }, row => {
        if (aprm.indexOf(row.param) == -1) adel.push(row);
      });
      adel.forEach(row => fprms.del(row, true));
    }

    /**
     * Вытягивает массив используемых фурнитурой и вложенными наборами параметров
     */
    add_furn_prm(aprm = [], afurn_set = []) {

      // если параметры этого набора уже обработаны - пропускаем
      if (afurn_set.indexOf(this.ref) != -1) {
        return;
      }

      afurn_set.push(this.ref);

      this.selection_params.each(row => {
        aprm.indexOf(row.param) == -1 && !row.param.is_calculated && aprm.push(row.param);
      });

      this.specification.each(row => {
        row.nom instanceof $p.CatFurns && row.nom.add_furn_prm(aprm, afurn_set);
      });

      return aprm;
    }

    /**
     * Аналог УПзП-шного _ПолучитьСпецификациюФурнитурыСФильтром_
     * @param contour {Contour}
     * @param cache {Object}
     * @param [exclude_dop] {Boolean}
     */
    get_spec(contour, cache, exclude_dop) {

      const res = $p.dp.buyers_order.create().specification;
      const { ox } = contour.project;
      const { НаПримыкающий } = $p.enm.transfer_operations_options;

      // бежим по всем строкам набора
      this.specification.find_rows({ dop: 0 }, row_furn => {

        // проверяем, проходит ли строка
        if (!row_furn.check_restrictions(contour, cache)) {
          return;
        }

        // ищем строки дополнительной спецификации
        if (!exclude_dop) {
          this.specification.find_rows({ is_main_specification_row: false, elm: row_furn.elm }, dop_row => {

            if (!dop_row.check_restrictions(contour, cache)) {
              return;
            }

            // расчет координаты и (или) визуализации
            if (dop_row.is_procedure_row) {

              // для правого открывания, инвертируем координату
              const invert = contour.direction == $p.enm.open_directions.Правое;
              // получаем элемент через сторону фурнитуры
              const elm = contour.profile_by_furn_side(dop_row.side, cache);
              // profile._len - то, что получится после обработки
              // row_spec.len - сколько взять (отрезать)
              // len - геометрическая длина без учета припусков на обработку
              const { len } = elm._row;
              // свойство номенклатуры размер до фурнпаза
              const { sizefurn } = elm.nom;
              // в зависимости от значения константы add_d, вычисляем dx1
              const dx1 = $p.job_prm.builder.add_d ? sizefurn : 0;
              // длина с поправкой на фурнпаз
              const faltz = len - 2 * sizefurn;

              let invert_nearest = false,
                  coordin = 0;

              if (dop_row.offset_option == $p.enm.offset_options.Формула) {
                if (!dop_row.formula.empty()) {
                  coordin = dop_row.formula.execute({ ox, elm, contour, len, sizefurn, dx1, faltz, invert, dop_row });
                }
              } else if (dop_row.offset_option == $p.enm.offset_options.РазмерПоФальцу) {
                coordin = faltz + dop_row.contraction;
              } else if (dop_row.offset_option == $p.enm.offset_options.ОтРучки) {
                // строим горизонтальную линию от нижней границы контура, находим пересечение и offset
                const { generatrix } = elm;
                const hor = contour.handle_line(elm);
                coordin = generatrix.getOffsetOf(generatrix.intersect_point(hor)) - generatrix.getOffsetOf(generatrix.getNearestPoint(elm.corns(1))) + (invert ? dop_row.contraction : -dop_row.contraction);
              } else if (dop_row.offset_option == $p.enm.offset_options.ОтСередины) {
                // не мудрствуя, присваиваем половину длины
                coordin = len / 2 + (invert ? dop_row.contraction : -dop_row.contraction);
              } else {
                if (invert) {
                  if (dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны) {
                    coordin = dop_row.contraction;
                  } else {
                    coordin = len - dop_row.contraction;
                  }
                } else {
                  if (dop_row.offset_option == $p.enm.offset_options.ОтКонцаСтороны) {
                    coordin = len - dop_row.contraction;
                  } else {
                    coordin = dop_row.contraction;
                  }
                }
              }

              const procedure_row = res.add(dop_row);
              procedure_row.origin = this;
              procedure_row.handle_height_max = contour.cnstr;
              if (dop_row.transfer_option == НаПримыкающий) {
                const nearest = elm.nearest();
                const { outer } = elm.rays;
                const nouter = nearest.rays.outer;
                const point = outer.getPointAt(outer.getOffsetOf(outer.getNearestPoint(elm.corns(1))) + coordin);
                procedure_row.handle_height_min = nearest.elm;
                procedure_row.coefficient = nouter.getOffsetOf(nouter.getNearestPoint(point)) - nouter.getOffsetOf(nouter.getNearestPoint(nearest.corns(1)));
                // если сказано учесть припуск - добавляем dx0
                if (dop_row.overmeasure) {
                  procedure_row.coefficient += nearest.dx0;
                }
              } else {
                procedure_row.handle_height_min = elm.elm;
                procedure_row.coefficient = coordin;
                // если сказано учесть припуск - добавляем dx0
                if (dop_row.overmeasure) {
                  procedure_row.coefficient += elm.dx0;
                }
              }

              return;
            } else if (!dop_row.quantity) {
              return;
            }

            // в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
            if (dop_row.is_set_row) {
              dop_row.nom.get_spec(contour, cache).each(sub_row => {
                if (sub_row.is_procedure_row) {
                  res.add(sub_row);
                } else if (sub_row.quantity) {
                  res.add(sub_row).quantity = (row_furn.quantity || 1) * (dop_row.quantity || 1) * sub_row.quantity;
                }
              });
            } else {
              res.add(dop_row).origin = this;
            }
          });
        }

        // в зависимости от типа строки, добавляем саму строку или её подчиненную спецификацию
        if (row_furn.is_set_row) {
          row_furn.nom.get_spec(contour, cache, exclude_dop).each(sub_row => {
            if (sub_row.is_procedure_row) {
              res.add(sub_row);
            } else if (!sub_row.quantity) {
              return;
            }
            res.add(sub_row).quantity = (row_furn.quantity || 1) * sub_row.quantity;
          });
        } else {
          if (row_furn.quantity) {
            const row_spec = res.add(row_furn);
            row_spec.origin = this;
            if (!row_furn.formula.empty() && !row_furn.formula.condition_formula) {
              row_furn.formula.execute({ ox, contour, row_furn, row_spec });
            }
          }
        }
      });

      return res;
    }

  };

  /**
   * Методы строки спецификации
   */
  $p.CatFurnsSpecificationRow = class CatFurnsSpecificationRow extends $p.CatFurnsSpecificationRow {

    /**
     * Проверяет ограничения строки фурнитуры
     * @param contour {Contour}
     * @param cache {Object}
     */
    check_restrictions(contour, cache) {
      const { elm, dop, handle_height_min, handle_height_max, formula } = this;
      const { direction, h_ruch, cnstr } = contour;

      // проверка по высоте ручки
      if (h_ruch < handle_height_min || handle_height_max && h_ruch > handle_height_max) {
        return false;
      }

      // проверка по формуле
      if (!cache.ignore_formulas && !formula.empty() && formula.condition_formula && !formula.execute({ ox: cache.ox, contour, row_furn: this })) {
        return false;
      }

      // получаем связанные табличные части
      const { selection_params, specification_restrictions } = this._owner._owner;
      const prop_direction = $p.job_prm.properties.direction;

      let res = true;

      // по таблице параметров
      selection_params.find_rows({ elm, dop }, prm_row => {
        // выполнение условия рассчитывает объект CchProperties
        const ok = prop_direction == prm_row.param ? direction == prm_row.value : prm_row.param.check_condition({ row_spec: this, prm_row, cnstr, ox: cache.ox });
        if (!ok) {
          return res = false;
        }
      });

      // по таблице ограничений
      if (res) {

        specification_restrictions.find_rows({ elm, dop }, row => {
          let len;
          if (contour.is_rectangular) {
            len = row.side == 1 || row.side == 3 ? cache.w : cache.h;
          } else {
            const elm = contour.profile_by_furn_side(row.side, cache);
            len = elm._row.len - 2 * elm.nom.sizefurn;
          }
          if (len < row.lmin || len > row.lmax) {
            return res = false;
          }
        });
      }

      return res;
    }

    get nom() {
      return this._getter('nom');
    }
    set nom(v) {
      if (v !== "") {
        this._setter('nom', v);
      }
    }

    get nom_set() {
      return this.nom;
    }
    set nom_set(v) {
      this.nom = v;
    }

  };

  // корректируем метаданные табчасти фурнитуры
  (({ md }) => {
    const { fields } = md.get("cat.furns").tabular_sections.specification;
    fields.nom_set = fields.nom;
  })($p);

  /**
   * Дополнительные методы справочника Вставки
   *
   * Created 23.12.2015<br />
   * &copy; http://www.oknosoft.ru 2014-2018
   * @author Evgeniy Malyarov
   * @module cat_inserts
   */

  // подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
  $p.md.once('predefined_elmnts_inited', () => {
    $p.cat.scheme_settings && $p.cat.scheme_settings.find_schemas('dp.buyers_order.production');
  });

  $p.cat.inserts.__define({

    _inserts_types_filling: {
      value: [$p.enm.inserts_types.Заполнение]
    },

    ItemData: {
      value: class ItemData {
        constructor(item, Renderer) {

          this.Renderer = Renderer;
          this.count = 0;

          // индивидуальные классы строк
          class ItemRow extends $p.DpBuyers_orderProductionRow {}

          this.ProductionRow = ItemRow;

          // получаем возможные параметры вставок данного типа
          const prms = new Set();
          $p.cat.inserts.find_rows({ available: true, insert_type: item }, inset => {
            inset.used_params.forEach(param => {
              !param.is_calculated && prms.add(param);
            });
            inset.specification.forEach(({ nom }) => {
              const { used_params } = nom;
              used_params && used_params.forEach(param => {
                !param.is_calculated && prms.add(param);
              });
            });
          });

          // индивидуальные метаданные строк
          const meta = $p.dp.buyers_order.metadata('production');
          this.meta = meta._clone();

          // отбор по типу вставки
          this.meta.fields.inset.choice_params[0].path = item;

          const changed = new Set();

          for (const param of prms) {

            // корректируем схему
            $p.cat.scheme_settings.find_rows({ obj: 'dp.buyers_order.production', name: item.name }, scheme => {
              if (!scheme.fields.find({ field: param.ref })) {
                // добавляем строку с новым полем
                const row = scheme.fields.add({
                  field: param.ref,
                  caption: param.caption,
                  use: true
                });
                const note = scheme.fields.find({ field: 'note' });
                note && scheme.fields.swap(row, note);

                changed.add(scheme);
              }
            });

            // корректируем метаданные
            const mf = this.meta.fields[param.ref] = {
              synonym: param.caption,
              type: param.type
            };
            if (param.type.types.some(type => type === 'cat.property_values')) {
              mf.choice_params = [{ name: 'owner', path: param }];
            }

            // корректируем класс строки
            Object.defineProperty(ItemRow.prototype, param.ref, {
              get: function () {
                const { product_params } = this._owner._owner;
                const row = product_params.find({ elm: this.row, param }) || product_params.add({ elm: this.row, param });
                return row.value;
              },
              set: function (v) {
                const { product_params } = this._owner._owner;
                const row = product_params.find({ elm: this.row, param }) || product_params.add({ elm: this.row, param });
                row.value = v;
              }
            });
          }

          for (const scheme of changed) {
            scheme.save();
          }
        }
      }
    },

    by_thickness: {
      value: function (min, max) {

        if (!this._by_thickness) {
          this._by_thickness = {};
          this.find_rows({ insert_type: { in: this._inserts_types_filling } }, ins => {
            if (ins.thickness > 0) {
              if (!this._by_thickness[ins.thickness]) this._by_thickness[ins.thickness] = [];
              this._by_thickness[ins.thickness].push(ins);
            }
          });
        }

        const res = [];
        for (let thickness in this._by_thickness) {
          if (parseFloat(thickness) >= min && parseFloat(thickness) <= max) Array.prototype.push.apply(res, this._by_thickness[thickness]);
        }
        return res;
      }
    },

    sql_selection_list_flds: {
      value: function (initial_value) {
        return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.name as presentation, _k_.synonym as insert_type," + " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_inserts AS _t_" + " left outer join enm_inserts_types as _k_ on _k_.ref = _t_.insert_type %3 %4 LIMIT 300";
      }
    }

  });

  // переопределяем прототип
  $p.CatInserts = class CatInserts extends $p.CatInserts {

    /**
     * Возвращает номенклатуру вставки в завсисмости от свойств элемента
     */
    nom(elm, strict) {

      const { _data } = this;

      if (!strict && !elm && _data.nom) {
        return _data.nom;
      }

      const main_rows = [];
      let _nom;

      const { check_params } = ProductsBuilding;

      this.specification.find_rows({ is_main_elm: true }, row => {
        // если есть элемент, фильтруем по параметрам
        if (elm && !check_params({
          params: this.selection_params,
          ox: elm.project.ox,
          elm: elm,
          row_spec: row,
          cnstr: 0,
          origin: elm.fake_origin || 0
        })) {
          return;
        }
        main_rows.push(row);
      });

      if (!main_rows.length && !strict && this.specification.count()) {
        main_rows.push(this.specification.get(0));
      }

      if (main_rows.length && main_rows[0].nom instanceof $p.CatInserts) {
        if (main_rows[0].nom == this) {
          _nom = $p.cat.nom.get();
        } else {
          _nom = main_rows[0].nom.nom(elm, strict);
        }
      } else if (main_rows.length) {
        if (elm && !main_rows[0].formula.empty()) {
          try {
            _nom = main_rows[0].formula.execute({ elm });
            if (!_nom) {
              _nom = main_rows[0].nom;
            }
          } catch (e) {
            _nom = main_rows[0].nom;
          }
        } else {
          _nom = main_rows[0].nom;
        }
      } else {
        _nom = $p.cat.nom.get();
      }

      if (main_rows.length < 2) {
        _data.nom = typeof _nom == 'string' ? $p.cat.nom.get(_nom) : _nom;
      } else {
        // TODO: реализовать фильтр
        _data.nom = _nom;
      }

      return _data.nom;
    }

    /**
     * Возвращает атрибуты характеристики виртуальной продукции по вставке в контур
     */
    contour_attrs(contour) {

      const main_rows = [];
      const res = { calc_order: contour.project.ox.calc_order };

      this.specification.find_rows({ is_main_elm: true }, row => {
        main_rows.push(row);
        return false;
      });

      if (main_rows.length) {
        const irow = main_rows[0],
              sizes = {},
              sz_keys = {},
              sz_prms = ['length', 'width', 'thickness'].map(name => {
          const prm = $p.job_prm.properties[name];
          sz_keys[prm.ref] = name;
          return prm;
        });

        // установим номенклатуру продукции
        res.owner = irow.nom instanceof $p.CatInserts ? irow.nom.nom() : irow.nom;

        // если в параметрах вставки задействованы свойства длина и или ширина - габариты получаем из свойств
        contour.project.ox.params.find_rows({
          cnstr: contour.cnstr,
          inset: this,
          param: { in: sz_prms }
        }, row => {
          sizes[sz_keys[row.param.ref]] = row.value;
        });

        if (Object.keys(sizes).length > 0) {
          res.x = sizes.length ? (sizes.length + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.y = sizes.width ? (sizes.width + irow.sz) * (irow.coefficient * 1000 || 1) : 0;
          res.s = (res.x * res.y / 1000000).round(3);
          res.z = sizes.thickness * (irow.coefficient * 1000 || 1);
        } else {
          if (irow.count_calc_method == $p.enm.count_calculating_ways.ПоФормуле && !irow.formula.empty()) {
            irow.formula.execute({
              ox: contour.project.ox,
              contour: contour,
              inset: this,
              row_ins: irow,
              res: res
            });
          }
          if (irow.count_calc_method == $p.enm.count_calculating_ways.ПоПлощади && this.insert_type == $p.enm.inserts_types.МоскитнаяСетка) {
            // получаем габариты смещенного периметра
            const bounds = contour.bounds_inner(irow.sz);
            res.x = bounds.width.round(1);
            res.y = bounds.height.round(1);
            res.s = (res.x * res.y / 1000000).round(3);
          } else {
            res.x = contour.w + irow.sz;
            res.y = contour.h + irow.sz;
            res.s = (res.x * res.y / 1000000).round(3);
          }
        }
      }

      return res;
    }

    /**
     * Проверяет ограничения вставки или строки вставки
     * @param row {CatInserts|CatInsertsSpecificationRow}
     * @param elm {BuilderElement}
     * @param by_perimetr {Boolean}
     * @param len_angl {Object}
     * @return {Boolean}
     */
    check_restrictions(row, elm, by_perimetr, len_angl) {

      const { _row } = elm;
      const len = len_angl ? len_angl.len : _row.len;
      const is_linear = elm.is_linear ? elm.is_linear() : true;
      let is_tabular = true;

      // проверяем площадь
      if (row.smin > _row.s || _row.s && row.smax && row.smax < _row.s) {
        return false;
      }

      // Главный элемент с нулевым количеством не включаем
      if (row.is_main_elm && !row.quantity) {
        return false;
      }

      // только для прямых или только для кривых профилей
      if (row.for_direct_profile_only > 0 && !is_linear || row.for_direct_profile_only < 0 && is_linear) {
        return false;
      }

      if ($p.utils.is_data_obj(row)) {

        if (row.impost_fixation == $p.enm.impost_mount_options.ДолжныБытьКрепленияИмпостов) {
          if (!elm.joined_imposts(true)) {
            return false;
          }
        } else if (row.impost_fixation == $p.enm.impost_mount_options.НетКрепленийИмпостовИРам) {
          if (elm.joined_imposts(true)) {
            return false;
          }
        }
        is_tabular = false;
      }

      if (!is_tabular || by_perimetr || row.count_calc_method != $p.enm.count_calculating_ways.ПоПериметру) {
        if (row.lmin > len || row.lmax < len && row.lmax > 0) {
          return false;
        }
        if (row.ahmin > _row.angle_hor || row.ahmax < _row.angle_hor) {
          return false;
        }
      }

      //// Включить проверку размеров и углов, поля "Устанавливать с..." и т.д.

      return true;
    }

    /**
     * Возвращает спецификацию вставки с фильтром
     * @method filtered_spec
     * @param elm {BuilderElement|Object} - элемент, к которому привязана вставка
     * @param ox {CatCharacteristics} - текущая продукция
     * @param [is_high_level_call] {Boolean} - вызов верхнего уровня - специфично для стеклопакетов
     * @param [len_angl] {Object} - контекст размеров элемента
     * @param [own_row] {CatInsertsSpecificationRow} - родительская строка для вложенных вставок
     * @return {Array}
     */
    filtered_spec({ elm, is_high_level_call, len_angl, own_row, ox }) {

      const res = [];

      if (this.empty()) {
        return res;
      }

      function fake_row(row) {
        if (row._metadata) {
          const res = {};
          for (let fld in row._metadata().fields) {
            res[fld] = row[fld];
          }
          return res;
        } else {
          return Object.assign({}, row);
        }
      }

      const { insert_type, check_restrictions } = this;
      const { Профиль, Заполнение } = $p.enm.inserts_types;
      const { check_params } = ProductsBuilding;

      // для заполнений, можно переопределить состав верхнего уровня
      if (is_high_level_call && insert_type == Заполнение) {

        const glass_rows = [];
        ox.glass_specification.find_rows({ elm: elm.elm }, row => {
          glass_rows.push(row);
        });

        // если спецификация верхнего уровня задана в изделии, используем её, параллельно формируем формулу
        if (glass_rows.length) {
          glass_rows.forEach(row => {
            row.inset.filtered_spec({ elm, len_angl, ox }).forEach(row => {
              res.push(row);
            });
          });
          return res;
        }
      }

      this.specification.forEach(row => {

        // Проверяем ограничения строки вставки
        if (!check_restrictions(row, elm, insert_type == Профиль, len_angl)) {
          return;
        }

        // Проверяем параметры изделия, контура или элемента
        if (own_row && row.clr.empty() && !own_row.clr.empty()) {
          row = fake_row(row);
          row.clr = own_row.clr;
        }
        if (!check_params({
          params: this.selection_params,
          ox: ox,
          elm: elm,
          row_spec: row,
          cnstr: len_angl && len_angl.cnstr,
          origin: len_angl && len_angl.origin
        })) {
          return;
        }

        // Добавляем или разузловываем дальше
        if (row.nom instanceof $p.CatInserts) {
          row.nom.filtered_spec({ elm, len_angl, ox, own_row: own_row || row }).forEach(subrow => {
            const fakerow = fake_row(subrow);
            fakerow.quantity = (subrow.quantity || 1) * (row.quantity || 1);
            fakerow.coefficient = (subrow.coefficient || 1) * (row.coefficient || 1);
            fakerow._origin = row.nom;
            if (fakerow.clr.empty()) {
              fakerow.clr = row.clr;
            }
            res.push(fakerow);
          });
        } else {
          res.push(row);
        }
      });

      return res;
    }

    /**
     * Дополняет спецификацию изделия спецификацией текущей вставки
     * @method calculate_spec
     * @param elm {BuilderElement}
     * @param len_angl {Object}
     * @param ox {CatCharacteristics}
     * @param spec {TabularSection}
     */
    calculate_spec({ elm, len_angl, ox, spec }) {

      const { _row } = elm;
      const { ПоПериметру, ПоШагам, ПоФормуле, ДляЭлемента, ПоПлощади } = $p.enm.count_calculating_ways;
      const { profile_items } = $p.enm.elm_types;
      const { new_spec_row, calc_qty_len, calc_count_area_mass } = ProductsBuilding;

      if (!spec) {
        spec = ox.specification;
      }

      this.filtered_spec({ elm, is_high_level_call: true, len_angl, ox }).forEach(row_ins_spec => {

        const origin = row_ins_spec._origin || this;

        let row_spec;

        // добавляем строку спецификации, если профиль или не про шагам
        if (row_ins_spec.count_calc_method != ПоПериметру && row_ins_spec.count_calc_method != ПоШагам || profile_items.indexOf(_row.elm_type) != -1) {
          row_spec = new_spec_row({ elm, row_base: row_ins_spec, origin, spec, ox });
        }

        if (row_ins_spec.count_calc_method == ПоФормуле && !row_ins_spec.formula.empty()) {
          // если строка спецификации не добавлена на предыдущем шаге, делаем это сейчас
          row_spec = new_spec_row({ row_spec, elm, row_base: row_ins_spec, origin, spec, ox });
        }
        // для вставок в профиль способ расчета количества не учитывается
        else if (profile_items.indexOf(_row.elm_type) != -1 || row_ins_spec.count_calc_method == ДляЭлемента) {
            calc_qty_len(row_spec, row_ins_spec, len_angl ? len_angl.len : _row.len);
          } else {

            if (row_ins_spec.count_calc_method == ПоПлощади) {
              row_spec.qty = row_ins_spec.quantity;
              if (this.insert_type == $p.enm.inserts_types.МоскитнаяСетка) {
                const bounds = elm.layer.bounds_inner(row_ins_spec.sz);
                row_spec.len = bounds.height * (row_ins_spec.coefficient || 0.001);
                row_spec.width = bounds.width * (row_ins_spec.coefficient || 0.001);
                row_spec.s = (row_spec.len * row_spec.width).round(3);
              } else {
                row_spec.len = (_row.y2 - _row.y1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
                row_spec.width = (_row.x2 - _row.x1 - row_ins_spec.sz) * (row_ins_spec.coefficient || 0.001);
                row_spec.s = _row.s;
              }
            } else if (row_ins_spec.count_calc_method == ПоПериметру) {
              const row_prm = { _row: { len: 0, angle_hor: 0, s: _row.s } };
              const perimeter = elm.perimeter ? elm.perimeter : this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ? elm.layer.perimeter_inner(row_ins_spec.sz) : elm.layer.perimeter;
              perimeter.forEach(rib => {
                row_prm._row._mixin(rib);
                row_prm.is_linear = () => rib.profile ? rib.profile.is_linear() : true;
                if (this.check_restrictions(row_ins_spec, row_prm, true)) {
                  row_spec = new_spec_row({ elm, row_base: row_ins_spec, origin, spec, ox });
                  // при расчете по периметру, выполняем формулу для каждого ребра периметра
                  if (!row_ins_spec.formula.empty()) {
                    const qty = row_ins_spec.formula.execute({
                      ox: ox,
                      elm: rib.profile || rib,
                      cnstr: len_angl && len_angl.cnstr || 0,
                      inset: len_angl && len_angl.hasOwnProperty('cnstr') ? len_angl.origin : $p.utils.blank.guid,
                      row_ins: row_ins_spec,
                      row_spec: row_spec,
                      len: rib.len
                    });
                  }
                  calc_qty_len(row_spec, row_ins_spec, rib.len);
                  calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
                }
                row_spec = null;
              });
            } else if (row_ins_spec.count_calc_method == ПоШагам) {

              const bounds = this.insert_type == $p.enm.inserts_types.МоскитнаяСетка ? elm.layer.bounds_inner(row_ins_spec.sz) : { height: _row.y2 - _row.y1, width: _row.x2 - _row.x1 };

              const h = !row_ins_spec.step_angle || row_ins_spec.step_angle == 180 ? bounds.height : bounds.width;
              const w = !row_ins_spec.step_angle || row_ins_spec.step_angle == 180 ? bounds.width : bounds.height;
              // (row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьШагиВторогоНаправления ||
              // row_ins_spec.attrs_option == $p.enm.inset_attrs_options.ОтключитьВтороеНаправление)
              if (row_ins_spec.step) {
                let qty = 0;
                let pos;
                if (row_ins_spec.do_center && h >= row_ins_spec.step) {
                  pos = h / 2;
                  if (pos >= row_ins_spec.offsets && pos <= h - row_ins_spec.offsets) {
                    qty++;
                  }
                  for (let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++) {
                    pos = h / 2 + i * row_ins_spec.step;
                    if (pos >= row_ins_spec.offsets && pos <= h - row_ins_spec.offsets) {
                      qty++;
                    }
                    pos = h / 2 - i * row_ins_spec.step;
                    if (pos >= row_ins_spec.offsets && pos <= h - row_ins_spec.offsets) {
                      qty++;
                    }
                  }
                } else {
                  for (let i = 1; i <= Math.ceil(h / row_ins_spec.step); i++) {
                    pos = i * row_ins_spec.step;
                    if (pos >= row_ins_spec.offsets && pos <= h - row_ins_spec.offsets) {
                      qty++;
                    }
                  }
                }

                if (qty) {
                  row_spec = new_spec_row({ elm, row_base: row_ins_spec, origin, spec, ox });
                  calc_qty_len(row_spec, row_ins_spec, w);
                  row_spec.qty *= qty;
                  calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
                }
                row_spec = null;
              }
            } else {
              throw new Error("count_calc_method: " + row_ins_spec.count_calc_method);
            }
          }

        if (row_spec) {
          // выполняем формулу
          if (!row_ins_spec.formula.empty()) {
            const qty = row_ins_spec.formula.execute({
              ox: ox,
              elm: elm,
              cnstr: len_angl && len_angl.cnstr || 0,
              inset: len_angl && len_angl.hasOwnProperty('cnstr') ? len_angl.origin : $p.utils.blank.guid,
              row_ins: row_ins_spec,
              row_spec: row_spec,
              len: len_angl ? len_angl.len : _row.len
            });
            if (row_ins_spec.count_calc_method == ПоФормуле) {
              row_spec.qty = qty;
            } else if (row_ins_spec.formula.condition_formula && !qty) {
              row_spec.qty = 0;
            }
          }
          calc_count_area_mass(row_spec, spec, _row, row_ins_spec.angle_calc_method);
        }
      });
    }

    /**
     * Возвращает толщину вставки
     *
     * @property thickness
     * @return {Number}
     */
    get thickness() {

      const { _data } = this;

      if (!_data.hasOwnProperty("thickness")) {
        _data.thickness = 0;
        const nom = this.nom(null, true);
        if (nom && !nom.empty()) {
          _data.thickness = nom.thickness;
        } else {
          this.specification.forEach(row => {
            _data.thickness += row.nom.thickness;
          });
        }
      }

      return _data.thickness;
    }

    /**
     * Возвращает массив задействованных во вставке параметров
     * @property used_params
     * @return {Array}
     */
    get used_params() {
      const res = [];
      this.selection_params.forEach(({ param }) => {
        if (!param.empty() && res.indexOf(param) == -1) {
          res.push(param);
        }
      });
      return res;
    }

  };

  /**
   * Дополнительные методы справочника Привязки вставок
   *
   * Created 21.04.2017
   */

  $p.cat.insert_bind.__define({

    /**
     * Возвращает массив допвставок с привязками к изделию или слою
     */
    insets: {
      value: function (ox) {
        const { sys, owner } = ox;
        const res = [];
        this.forEach(o => {
          o.production.forEach(row => {
            const { nom } = row;
            if (sys._hierarchy(nom) || owner._hierarchy(nom)) {
              o.inserts.forEach(({ inset, elm_type }) => {
                if (!res.some(irow => irow.inset == inset && irow.elm_type == elm_type)) {
                  res.push({ inset, elm_type });
                }
              });
            }
          });
        });
        return res;
      }
    }

  });

  /**
   * Дополнительные методы справочника Номенклатура
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   * @module cat_nom
   * Created 23.12.2015
   */

  // определяем модификаторы
  $p.cat.nom.__define({

    sql_selection_list_flds: {
      value: function (initial_value) {
        return "SELECT _t_.ref, _t_.`_deleted`, _t_.is_folder, _t_.id, _t_.article, _t_.name as presentation, _u_.name as nom_unit, _k_.name as nom_kind, _t_.thickness," + " case when _t_.ref = '" + initial_value + "' then 0 else 1 end as is_initial_value FROM cat_nom AS _t_" + " left outer join cat_units as _u_ on _u_.ref = _t_.base_unit" + " left outer join cat_nom_kinds as _k_ on _k_.ref = _t_.nom_kind %3 %4 LIMIT 300";
      }
    },

    sql_selection_where_flds: {
      value: function (filter) {
        return " OR _t_.article LIKE '" + filter + "' OR _t_.id LIKE '" + filter + "' OR _t_.name LIKE '" + filter + "'";
      }
    }
  });

  // методы ценообразования в прототип номенклатуры
  $p.CatNom.prototype.__define({

    /**
     * Возвращает цену номенклатуры указанного типа
     * - на дату
     * - с подбором характеристики по цвету
     * - с пересчетом из валюты в валюту
     */
    _price: {
      value: function (attr) {

        let price = 0,
            currency,
            start_date = $p.utils.blank.date;

        if (!attr) {
          attr = {};
        }

        if (!attr.price_type) {
          attr.price_type = $p.job_prm.pricing.price_type_sale;
        } else if ($p.utils.is_data_obj(attr.price_type)) {
          attr.price_type = attr.price_type.ref;
        }

        const { _price } = this._data;
        const { x, y, z, clr, ref, calc_order } = attr.characteristic || {};

        if (!attr.characteristic) {
          attr.characteristic = $p.utils.blank.guid;
        } else if ($p.utils.is_data_obj(attr.characteristic)) {
          // если передали уникальную характеристику продкции - ищем простую с тем же цветом и размерами
          // TODO: здесь было бы полезно учесть соответствие цветов??
          attr.characteristic = ref;
          if (!calc_order.empty()) {
            const tmp = [];
            const { by_ref } = $p.cat.characteristics;
            for (let clrx in _price) {
              const cx = by_ref[clrx];
              if (cx && cx.clr == clr) {
                // если на подходящую характеристику есть цена по нашему типу цен - запоминаем
                if (_price[clrx][attr.price_type]) {
                  if (cx.x && x && cx.x - x < -10) {
                    continue;
                  }
                  if (cx.y && y && cx.y - y < -10) {
                    continue;
                  }
                  tmp.push({
                    cx,
                    rate: (cx.x && x ? Math.abs(cx.x - x) : 0) + (cx.y && y ? Math.abs(cx.y - y) : 0) + (cx.z && z && cx.z == z ? 1 : 0)
                  });
                }
              }
            }
            if (tmp.length) {
              tmp.sort((a, b) => a.rate - b.rate);
              attr.characteristic = tmp[0].cx.ref;
            }
          }
        }
        if (!attr.date) {
          attr.date = new Date();
        }

        // если для номенклатуры существует структура цен, ищем подходящую
        if (_price) {
          if (_price[attr.characteristic]) {
            if (_price[attr.characteristic][attr.price_type]) {
              _price[attr.characteristic][attr.price_type].forEach(row => {
                if (row.date > start_date && row.date <= attr.date) {
                  price = row.price;
                  currency = row.currency;
                  start_date = row.date;
                }
              });
            }
          }
          // если нет цены на характеристику, ищем по цвету
          else if (attr.clr) {
              const { by_ref } = $p.cat.characteristics;
              for (let clrx in _price) {
                const cx = by_ref[clrx];
                if (cx && cx.clr == attr.clr) {
                  if (_price[clrx][attr.price_type]) {
                    _price[clrx][attr.price_type].forEach(row => {
                      if (row.date > start_date && row.date <= attr.date) {
                        price = row.price;
                        currency = row.currency;
                        start_date = row.date;
                      }
                    });
                    break;
                  }
                }
              }
            }
        }

        // если есть формула - выполняем вне зависимости от установленной цены
        if (attr.formula) {

          // если нет цены на характеристику, ищем цену без характеристики
          if (!price && _price && _price[$p.utils.blank.guid]) {
            if (_price[$p.utils.blank.guid][attr.price_type]) {
              _price[$p.utils.blank.guid][attr.price_type].forEach(row => {
                if (row.date > start_date && row.date <= attr.date) {
                  price = row.price;
                  currency = row.currency;
                  start_date = row.date;
                }
              });
            }
          }
          // формулу выполняем в любом случае - она может и не опираться на цены из регистра
          price = attr.formula.execute({
            nom: this,
            characteristic: $p.cat.characteristics.get(attr.characteristic, false),
            date: attr.date,
            price, currency, x, y, z, clr, calc_order
          });
        }

        // Пересчитать из валюты в валюту
        return $p.pricing.from_currency_to_currency(price, attr.date, currency, attr.currency);
      }
    },

    /**
     * Возвращает значение допреквизита группировка
     */
    grouping: {
      get: function () {
        if (!this.hasOwnProperty('_grouping')) {
          this.extra_fields.find_rows({ property: $p.job_prm.properties.grouping }, row => {
            this._grouping = row.value.name;
          });
        }
        return this._grouping || '';
      }
    },

    /**
     * Представление объекта
     * @property presentation
     * @for CatObj
     * @type String
     */
    presentation: {
      get: function () {
        return this.name + (this.article ? ' ' + this.article : '');
      },
      set: function (v) {}
    },

    /**
     * Возвращает номенклатуру по ключу цветового аналога
     */
    by_clr_key: {
      value: function (clr) {

        if (this.clr == clr) {
          return this;
        }
        if (!this._clr_keys) {
          this._clr_keys = new Map();
        }
        const { _clr_keys } = this;
        if (_clr_keys.has(clr)) {
          return _clr_keys.get(clr);
        }
        if (_clr_keys.size) {
          return this;
        }

        // получаем ссылку на ключ цветового аналога
        const clr_key = $p.job_prm.properties.clr_key && $p.job_prm.properties.clr_key.ref;
        let clr_value;
        this.extra_fields.find_rows({ property: $p.job_prm.properties.clr_key }, row => clr_value = row.value);
        if (!clr_value) {
          return this;
        }

        // находим все номенклатуры с подходящим ключем цветового аналога
        this._manager.alatable.forEach(nom => {
          nom.extra_fields && nom.extra_fields.some(row => {
            row.property === clr_key && row.value === clr_value && _clr_keys.set($p.cat.clrs.get(nom.clr), $p.cat.nom.get(nom.ref));
          });
        });

        // возарвщаем подходящую или себя
        if (_clr_keys.has(clr)) {
          return _clr_keys.get(clr);
        }
        if (!_clr_keys.size) {
          _clr_keys.set(0, 0);
        }
        return this;
      }
    }

  });

  /**
   * ### Дополнительные методы справочника Контрагенты
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module cat_partners
   */

  $p.cat.partners.__define({

    sql_selection_where_flds: {
      value: function (filter) {
        return " OR inn LIKE '" + filter + "' OR name_full LIKE '" + filter + "' OR name LIKE '" + filter + "'";
      }
    }
  });

  $p.CatPartners.prototype.__define({

    addr: {
      get: function () {

        return this.contact_information._obj.reduce(function (val, row) {

          if (row.kind == $p.cat.contact_information_kinds.predefined("ЮрАдресКонтрагента") && row.presentation) return row.presentation;else if (val) return val;else if (row.presentation && (row.kind == $p.cat.contact_information_kinds.predefined("ФактАдресКонтрагента") || row.kind == $p.cat.contact_information_kinds.predefined("ПочтовыйАдресКонтрагента"))) return row.presentation;
        }, "");
      }
    },

    phone: {
      get: function () {

        return this.contact_information._obj.reduce(function (val, row) {

          if (row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагента") && row.presentation) return row.presentation;else if (val) return val;else if (row.kind == $p.cat.contact_information_kinds.predefined("ТелефонКонтрагентаМобильный") && row.presentation) return row.presentation;
        }, "");
      }
    },

    // полное наименование с телефоном, адресом и банковским счетом
    long_presentation: {
      get: function () {
        var res = this.name_full || this.name,
            addr = this.addr,
            phone = this.phone;

        if (this.inn) res += ", ИНН" + this.inn;

        if (this.kpp) res += ", КПП" + this.kpp;

        if (addr) res += ", " + addr;

        if (phone) res += ", " + phone;

        return res;
      }
    }
  });

  /**
   * Дополнительные методы справочника Системы (Параметры продукции)
   *
   * Created 23.12.2015<br />
   * &copy; http://www.oknosoft.ru 2014-2018
   * @author Evgeniy Malyarov
   * @module cat_production_params
   */

  $p.cat.production_params.__define({

    /**
     * возвращает массив доступных для данного свойства значений
     * @param prop {CatObj} - планвидовхарактеристик ссылка или объект
     * @param is_furn {boolean} - интересуют свойства фурнитуры или объекта
     * @return {Array}
     */
    slist: function (prop, is_furn) {
      var res = [],
          rt,
          at,
          pmgr,
          op = this.get(prop);

      if (op && op.type.is_ref) {
        // параметры получаем из локального кеша
        for (rt in op.type.types) if (op.type.types[rt].indexOf(".") > -1) {
          at = op.type.types[rt].split(".");
          pmgr = $p[at[0]][at[1]];
          if (pmgr) {
            if (pmgr.class_name == "enm.open_directions") pmgr.each(function (v) {
              if (v.name != $p.enm.tso.folding) res.push({ value: v.ref, text: v.synonym });
            });else pmgr.find_rows({ owner: prop }, function (v) {
              res.push({ value: v.ref, text: v.presentation });
            });
          }
        }
      }
      return res;
    }
  });

  $p.CatProduction_params.prototype.__define({

    /**
     * возвращает доступные в данной системе элементы
     * @property noms
     * @for Production_params
     */
    noms: {
      get: function () {
        var __noms = [];
        this.elmnts._obj.forEach(function (row) {
          if (!$p.utils.is_empty_guid(row.nom) && __noms.indexOf(row.nom) == -1) __noms.push(row.nom);
        });
        return __noms;
      }
    },

    /**
     * возвращает доступные в данной системе элементы (вставки)
     * @property inserts
     * @for Production_params
     * @param elm_types - допустимые типы элементов
     * @param by_default {Boolean|String} - сортировать по признаку умолчания или по наименованию вставки
     * @return Array.<_cat.inserts>
     */
    inserts: {
      value: function (elm_types, by_default) {
        var __noms = [];
        if (!elm_types) elm_types = $p.enm.elm_types.rama_impost;else if (typeof elm_types == "string") elm_types = $p.enm.elm_types[elm_types];else if (!Array.isArray(elm_types)) elm_types = [elm_types];

        this.elmnts.each(row => {
          if (!row.nom.empty() && elm_types.indexOf(row.elm_type) != -1 && (by_default == "rows" || !__noms.some(e => row.nom == e.nom))) __noms.push(row);
        });

        if (by_default == "rows") return __noms;

        __noms.sort(function (a, b) {

          if (by_default) {

            if (a.by_default && !b.by_default) return -1;else if (!a.by_default && b.by_default) return 1;else return 0;
          } else {
            if (a.nom.name < b.nom.name) return -1;else if (a.nom.name > b.nom.name) return 1;else return 0;
          }
        });
        return __noms.map(e => e.nom);
      }
    },

    /**
     * @method refill_prm
     * @for cat.Production_params
     * @param ox {Characteristics} - объект характеристики, табчасть которого надо перезаполнить
     * @param cnstr {Nomber} - номер конструкции. Если 0 - перезаполняем параметры изделия, иначе - фурнитуры
     */
    refill_prm: {
      value: function (ox, cnstr = 0) {

        const prm_ts = !cnstr ? this.product_params : this.furn_params;
        const adel = [];
        const auto_align = ox.calc_order.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон && $p.job_prm.properties.auto_align;
        const { params } = ox;

        function add_prm(default_row) {
          let row;
          params.find_rows({ cnstr: cnstr, param: default_row.param }, _row => {
            row = _row;
            return false;
          });

          // если не найден параметр изделия - добавляем. если нет параметра фурнитуры - пропускаем
          if (!row) {
            if (cnstr) {
              return;
            }
            row = params.add({ cnstr: cnstr, param: default_row.param, value: default_row.value });
          }

          if (row.hide != default_row.hide) {
            row.hide = default_row.hide;
          }

          if (default_row.forcibly && row.value != default_row.value) {
            row.value = default_row.value;
          }
        }

        // если в характеристике есть лишние параметры - удаляем
        if (!cnstr) {
          params.find_rows({ cnstr: cnstr }, row => {
            const { param } = row;
            if (param !== auto_align && prm_ts.find_rows({ param }).length == 0) {
              adel.push(row);
            }
          });
          adel.forEach(row => params.del(row));
        }

        // бежим по параметрам. при необходимости, добавляем или перезаполняем и устанавливаем признак hide
        prm_ts.forEach(add_prm);

        // для шаблонов, добавляем параметр автоуравнивание
        !cnstr && auto_align && add_prm({ param: auto_align, value: '', hide: false });

        // устанавливаем систему и номенклатуру продукции
        if (!cnstr) {
          ox.sys = this;
          ox.owner = ox.prod_nom;

          // одновременно, перезаполним параметры фурнитуры
          ox.constructions.forEach(row => !row.furn.empty() && ox.sys.refill_prm(ox, row.cnstr));
        }
      }
    }

  });

  /**
   * ### Модуль менеджера и документа Расчет-заказ
   * Обрботчики событий after_create, after_load, before_save, after_save, value_change
   * Методы выполняются в контексте текущего объекта this = DocObj
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_calc_order
   */

  (function (_mgr) {

    // переопределяем формирование списка выбора
    _mgr.metadata().tabular_sections.production.fields.characteristic._option_list_local = true;

    // переопределяем объекты назначения дополнительных реквизитов
    _mgr._destinations_condition = { predefined_name: { in: ['Документ_Расчет', 'Документ_ЗаказПокупателя'] } };

    // индивидуальная строка поиска
    _mgr.build_search = function (tmp, obj) {

      const { number_internal, client_of_dealer, partner, note } = obj;

      tmp.search = (obj.number_doc + (number_internal ? ' ' + number_internal : '') + (client_of_dealer ? ' ' + client_of_dealer : '') + (partner.name ? ' ' + partner.name : '') + (note ? ' ' + note : '')).toLowerCase();
    };

    // метод загрузки шаблонов
    _mgr.load_templates = async function () {

      if (!$p.job_prm.builder) {
        $p.job_prm.builder = {};
      }
      if (!$p.job_prm.builder.base_block) {
        $p.job_prm.builder.base_block = [];
      }
      if (!$p.job_prm.pricing) {
        $p.job_prm.pricing = {};
      }

      // дополним base_block шаблонами из систем профилей
      const { base_block } = $p.job_prm.builder;
      $p.cat.production_params.forEach(o => {
        if (!o.is_folder) {
          o.base_blocks.forEach(row => {
            if (base_block.indexOf(row.calc_order) == -1) {
              base_block.push(row.calc_order);
            }
          });
        }
      });

      // загрузим шаблоны пачками по 10 документов
      const refs = [];
      for (let o of base_block) {
        refs.push(o.ref);
        if (refs.length > 9) {
          await _mgr.adapter.load_array(_mgr, refs);
          refs.length = 0;
        }
      }
      if (refs.length) {
        await _mgr.adapter.load_array(_mgr, refs);
      }

      // загружаем характеристики из первых строк шаблонов - нужны для фильтра по системам
      refs.length = 0;
      base_block.forEach(({ production }) => {
        if (production.count()) {
          refs.push(production.get(0).characteristic.ref);
        }
      });
      return $p.cat.characteristics.adapter.load_array($p.cat.characteristics, refs);
    };
  })($p.doc.calc_order);

  // свойства и методы объекта
  $p.DocCalc_order = class DocCalc_order extends $p.DocCalc_order {

    // подписки на события

    // после создания надо заполнить реквизиты по умолчанию: контрагент, организация, договор
    after_create() {

      const { enm, cat, current_user, DocCalc_order } = $p;
      const { acl_objs } = current_user;

      //Организация
      acl_objs.find_rows({ by_default: true, type: cat.organizations.class_name }, row => {
        this.organization = row.acl_obj;
        return false;
      });

      //Подразделение
      DocCalc_order.set_department.call(this);

      //Контрагент
      acl_objs.find_rows({ by_default: true, type: cat.partners.class_name }, row => {
        this.partner = row.acl_obj;
        return false;
      });

      //Договор
      this.contract = cat.contracts.by_partner_and_org(this.partner, this.organization);

      //Менеджер
      this.manager = current_user;

      //СостояниеТранспорта
      this.obj_delivery_state = enm.obj_delivery_states.Черновик;

      //Номер документа
      return this.new_number_doc();
    }

    // перед записью надо присвоить номер для нового и рассчитать итоги
    before_save() {

      const { Отклонен, Отозван, Шаблон, Подтвержден, Отправлен } = $p.enm.obj_delivery_states;

      let doc_amount = 0,
          amount_internal = 0;

      // если установлен признак проведения, проверим состояние транспорта
      if (this.posted) {
        if (this.obj_delivery_state == Отклонен || this.obj_delivery_state == Отозван || this.obj_delivery_state == Шаблон) {
          $p.msg.show_msg && $p.msg.show_msg({
            type: 'alert-warning',
            text: 'Нельзя провести заказ со статусом<br/>"Отклонён", "Отозван" или "Шаблон"',
            title: this.presentation
          });
          return false;
        } else if (this.obj_delivery_state != Подтвержден) {
          this.obj_delivery_state = Подтвержден;
        }
      } else if (this.obj_delivery_state == Подтвержден) {
        this.obj_delivery_state = Отправлен;
      }

      // проверим заполненность подразделения
      if (this.obj_delivery_state == Шаблон) {
        this.department = $p.utils.blank.guid;
      } else if (this.department.empty()) {
        $p.msg.show_msg && $p.msg.show_msg({
          type: 'alert-warning',
          text: 'Не заполнен реквизит "офис продаж" (подразделение)',
          title: this.presentation
        });
        return false;
      }

      this.production.forEach(row => {

        doc_amount += row.amount;
        amount_internal += row.amount_internal;

        // if(!row.characteristic.calc_order.empty()) {
        //   const name = row.nom.article || row.nom.nom_group.name || row.nom.id.substr(0, 3);
        //   if(sys_profile.indexOf(name) == -1) {
        //     if(sys_profile) {
        //       sys_profile += ' ';
        //     }
        //     sys_profile += name;
        //   }
        //
        //   row.characteristic.constructions.forEach((row) => {
        //   	if(row.parent && !row.furn.empty()){
        //   		const name = row.furn.name_short || row.furn.name;
        //   		if(sys_furn.indexOf(name) == -1){
        //   			if(sys_furn)
        //   				sys_furn += " ";
        //   			sys_furn += name;
        //   		}
        //   	}
        //   });
        // }
      });

      const { rounding } = this;

      this.doc_amount = doc_amount.round(rounding);
      this.amount_internal = amount_internal.round(rounding);
      //this.sys_profile = sys_profile;
      //this.sys_furn = sys_furn;
      this.amount_operation = $p.pricing.from_currency_to_currency(doc_amount, this.date, this.doc_currency).round(rounding);

      const { _obj, obj_delivery_state, category } = this;

      // фильтр по статусу
      if (obj_delivery_state == 'Шаблон') {
        _obj.state = 'template';
      } else if (category == 'service') {
        _obj.state = 'service';
      } else if (category == 'complaints') {
        _obj.state = 'complaints';
      } else if (obj_delivery_state == 'Отправлен') {
        _obj.state = 'sent';
      } else if (obj_delivery_state == 'Отклонен') {
        _obj.state = 'declined';
      } else if (obj_delivery_state == 'Подтвержден') {
        _obj.state = 'confirmed';
      } else if (obj_delivery_state == 'Архив') {
        _obj.state = 'zarchive';
      } else {
        _obj.state = 'draft';
      }

      // пометим на удаление неиспользуемые характеристики
      // этот кусок не влияет на возвращаемое before_save значение и выполняется асинхронно
      this._manager.pouch_db.query('svgs', { startkey: [this.ref, 0], endkey: [this.ref, 10e9] }).then(({ rows }) => {
        const deleted = [];
        for (const _ref of rows) {
          const { id } = _ref;

          const ref = id.substr(20);
          if (this.production.find_rows({ characteristic: ref }).length) {
            continue;
          }
          deleted.push($p.cat.characteristics.get(ref, 'promise').then(ox => !ox._deleted && ox.mark_deleted(true)));
        }
        return Promise.all(deleted);
      }).then(res => {
        res.length && this._manager.emit_async('svgs', this);
      }).catch(err => null);
    }

    // при изменении реквизита
    value_change(field, type, value) {
      if (field == 'organization') {
        this.new_number_doc();
        if (this.contract.organization != value) {
          this.contract = $p.cat.contracts.by_partner_and_org(this.partner, value);
        }
      } else if (field == 'partner' && this.contract.owner != value) {
        this.contract = $p.cat.contracts.by_partner_and_org(value, this.organization);
      }
      // если изменение инициировано человеком, дополним список изменённых полей
      this._manager.emit_add_fields(this, ['contract']);
    }

    /**
     * Возвращает валюту документа
     */
    get doc_currency() {
      const currency = this.contract.settlements_currency;
      return currency.empty() ? $p.job_prm.pricing.main_currency : currency;
    }

    set doc_currency(v) {}

    get rounding() {
      const { pricing } = $p.job_prm;
      if (!pricing.hasOwnProperty('rounding')) {
        const parts = this.doc_currency.parameters_russian_recipe.split(',');
        pricing.rounding = parseInt(parts[parts.length - 1]);
        if (isNaN(pricing.rounding)) {
          pricing.rounding = 2;
        }
      }
      return pricing.rounding;
    }

    /**
     * При установке договора, синхронно устанавливаем параметры НДС
     */
    get contract() {
      return this._getter('contract');
    }

    set contract(v) {
      this._setter('contract', v);
      this.vat_consider = this.contract.vat_consider;
      this.vat_included = this.contract.vat_included;
    }

    /**
     * рассчитывает итоги диспетчеризации
     * @return {Promise.<TResult>|*}
     */
    dispatching_totals() {
      var options = {
        reduce: true,
        limit: 10000,
        group: true,
        keys: []
      };
      this.production.forEach(function (row) {
        if (!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {
          options.keys.push([row.characteristic.ref, '305e374b-3aa9-11e6-bf30-82cf9717e145', 1, 0]);
        }
      });

      return $p.wsql.pouch.remote.doc.query('server/dispatching', options).then(function (result) {
        var res = {};
        result.rows.forEach(function (row) {
          if (row.value.plan) {
            row.value.plan = moment(row.value.plan).format('L');
          }
          if (row.value.fact) {
            row.value.fact = moment(row.value.fact).format('L');
          }
          res[row.key[0]] = row.value;
        });
        return res;
      });
    }

    /**
     * Возвращает данные для печати
     */
    print_data(attr = {}) {
      const { organization, bank_account, partner, contract, manager } = this;
      const { individual_person } = manager;
      const our_bank_account = bank_account && !bank_account.empty() ? bank_account : organization.main_bank_account;
      const get_imgs = [];
      const { cat: { contact_information_kinds, characteristics }, utils: { blank, blob_as_text } } = $p;

      // заполняем res теми данными, которые доступны синхронно
      const res = {
        АдресДоставки: this.shipping_address,
        ВалютаДокумента: this.doc_currency.presentation,
        ДатаЗаказаФорматD: moment(this.date).format('L'),
        ДатаЗаказаФорматDD: moment(this.date).format('LL'),
        ДатаТекущаяФорматD: moment().format('L'),
        ДатаТекущаяФорматDD: moment().format('LL'),
        ДоговорДатаФорматD: moment(contract.date.valueOf() == blank.date.valueOf() ? this.date : contract.date).format('L'),
        ДоговорДатаФорматDD: moment(contract.date.valueOf() == blank.date.valueOf() ? this.date : contract.date).format('LL'),
        ДоговорНомер: contract.number_doc ? contract.number_doc : this.number_doc,
        ДоговорСрокДействия: moment(contract.validity).format('L'),
        ЗаказНомер: this.number_doc,
        //Примечание (комментарий) к расчету  и внутренний номер расчет-заказа
        Примечание: this.note,
        НомерВнутренний: this.number_internal,
        Контрагент: partner.presentation,
        КонтрагентОписание: partner.long_presentation,
        КонтрагентДокумент: '',
        КонтрагентКЛДолжность: '',
        КонтрагентКЛДолжностьРП: '',
        КонтрагентКЛИмя: '',
        КонтрагентКЛИмяРП: '',
        КонтрагентКЛК: '',
        КонтрагентКЛОснованиеРП: '',
        КонтрагентКЛОтчество: '',
        КонтрагентКЛОтчествоРП: '',
        КонтрагентКЛФамилия: '',
        КонтрагентКЛФамилияРП: '',
        КонтрагентИНН: partner.inn,
        КонтрагентКПП: partner.kpp,
        КонтрагентЮрФизЛицо: '',
        КратностьВзаиморасчетов: this.settlements_multiplicity,
        КурсВзаиморасчетов: this.settlements_course,
        ЛистКомплектацииГруппы: '',
        ЛистКомплектацииСтроки: '',
        Организация: organization.presentation,
        ОрганизацияГород: organization.contact_information._obj.reduce((val, row) => val || row.city, '') || 'Москва',
        ОрганизацияАдрес: organization.contact_information._obj.reduce((val, row) => {
          if (row.kind == contact_information_kinds.predefined('ЮрАдресОрганизации') && row.presentation) {
            return row.presentation;
          } else if (val) {
            return val;
          } else if (row.presentation && (row.kind == contact_information_kinds.predefined('ФактАдресОрганизации') || row.kind == contact_information_kinds.predefined('ПочтовыйАдресОрганизации'))) {
            return row.presentation;
          }
        }, ''),
        ОрганизацияТелефон: organization.contact_information._obj.reduce((val, row) => {
          if (row.kind == contact_information_kinds.predefined('ТелефонОрганизации') && row.presentation) {
            return row.presentation;
          } else if (val) {
            return val;
          } else if (row.kind == contact_information_kinds.predefined('ФаксОрганизации') && row.presentation) {
            return row.presentation;
          }
        }, ''),
        ОрганизацияБанкБИК: our_bank_account.bank.id,
        ОрганизацияБанкГород: our_bank_account.bank.city,
        ОрганизацияБанкКоррСчет: our_bank_account.bank.correspondent_account,
        ОрганизацияБанкНаименование: our_bank_account.bank.name,
        ОрганизацияБанкНомерСчета: our_bank_account.account_number,
        ОрганизацияИндивидуальныйПредприниматель: organization.individual_entrepreneur.presentation,
        ОрганизацияИНН: organization.inn,
        ОрганизацияКПП: organization.kpp,
        ОрганизацияСвидетельствоДатаВыдачи: organization.certificate_date_issue,
        ОрганизацияСвидетельствоКодОргана: organization.certificate_authority_code,
        ОрганизацияСвидетельствоНаименованиеОргана: organization.certificate_authority_name,
        ОрганизацияСвидетельствоСерияНомер: organization.certificate_series_number,
        ОрганизацияЮрФизЛицо: organization.individual_legal.presentation,
        ПродукцияЭскизы: {},
        Проект: this.project.presentation,
        СистемыПрофилей: this.sys_profile,
        СистемыФурнитуры: this.sys_furn,
        Сотрудник: manager.presentation,
        СотрудникКомментарий: manager.note,
        СотрудникДолжность: individual_person.Должность || 'менеджер',
        СотрудникДолжностьРП: individual_person.ДолжностьРП,
        СотрудникИмя: individual_person.Имя,
        СотрудникИмяРП: individual_person.ИмяРП,
        СотрудникОснованиеРП: individual_person.ОснованиеРП,
        СотрудникОтчество: individual_person.Отчество,
        СотрудникОтчествоРП: individual_person.ОтчествоРП,
        СотрудникФамилия: individual_person.Фамилия,
        СотрудникФамилияРП: individual_person.ФамилияРП,
        СотрудникФИО: individual_person.Фамилия + (individual_person.Имя ? ' ' + individual_person.Имя[1].toUpperCase() + '.' : '') + (individual_person.Отчество ? ' ' + individual_person.Отчество[1].toUpperCase() + '.' : ''),
        СотрудникФИОРП: individual_person.ФамилияРП + ' ' + individual_person.ИмяРП + ' ' + individual_person.ОтчествоРП,
        СуммаДокумента: this.doc_amount.toFixed(2),
        СуммаДокументаПрописью: this.doc_amount.in_words(),
        СуммаДокументаБезСкидки: this.production._obj.reduce((val, row) => val + row.quantity * row.price, 0).toFixed(2),
        СуммаСкидки: this.production._obj.reduce((val, row) => val + row.discount, 0).toFixed(2),
        СуммаНДС: this.production._obj.reduce((val, row) => val + row.vat_amount, 0).toFixed(2),
        ТекстНДС: this.vat_consider ? this.vat_included ? 'В том числе НДС 18%' : 'НДС 18% (сверху)' : 'Без НДС',
        ТелефонПоАдресуДоставки: this.phone,
        СуммаВключаетНДС: contract.vat_included,
        УчитыватьНДС: contract.vat_consider,
        ВсегоНаименований: this.production.count(),
        ВсегоИзделий: 0,
        ВсегоПлощадьИзделий: 0,
        Продукция: [],
        Аксессуары: [],
        Услуги: [],
        НомерВнутр: this.number_internal,
        КлиентДилера: this.client_of_dealer,
        Комментарий: this.note
      };

      // дополняем значениями свойств
      this.extra_fields.forEach(row => {
        res['Свойство' + row.property.name.replace(/\s/g, '')] = row.value.presentation || row.value;
      });

      // TODO: дополнить датами доставки и монтажа
      res.МонтажДоставкаСамовывоз = !this.shipping_address ? 'Самовывоз' : 'Монтаж по адресу: ' + this.shipping_address;

      // получаем логотип организации
      for (let key in organization._attachments) {
        if (key.indexOf('logo') != -1) {
          get_imgs.push(organization.get_attachment(key).then(blob => {
            return blob_as_text(blob, blob.type.indexOf('svg') == -1 ? 'data_url' : '');
          }).then(data_url => {
            res.ОрганизацияЛоготип = data_url;
          }).catch($p.record_log));
          break;
        }
      }

      // получаем эскизы продукций, параллельно накапливаем количество и площадь изделий
      this.production.forEach(row => {
        if (!row.characteristic.empty() && !row.nom.is_procedure && !row.nom.is_service && !row.nom.is_accessory) {

          res.Продукция.push(this.row_description(row));

          res.ВсегоИзделий += row.quantity;
          res.ВсегоПлощадьИзделий += row.quantity * row.s;

          // если запросили эскиз без размерных линий или с иными параметрами...
          if (attr.sizes === false) {} else {
            get_imgs.push(characteristics.get_attachment(row.characteristic.ref, 'svg').then(blob_as_text).then(svg_text => res.ПродукцияЭскизы[row.characteristic.ref] = svg_text).catch(err => err && err.status != 404 && $p.record_log(err)));
          }
        } else if (!row.nom.is_procedure && !row.nom.is_service && row.nom.is_accessory) {
          res.Аксессуары.push(this.row_description(row));
        } else if (!row.nom.is_procedure && row.nom.is_service && !row.nom.is_accessory) {
          res.Услуги.push(this.row_description(row));
        }
      });
      res.ВсегоПлощадьИзделий = res.ВсегоПлощадьИзделий.round(3);

      return (get_imgs.length ? Promise.all(get_imgs) : Promise.resolve([])).then(() => $p.load_script('/dist/qrcodejs/qrcode.min.js', 'script')).then(() => {

        const svg = document.createElement('SVG');
        svg.innerHTML = '<g />';
        const qrcode = new QRCode(svg, {
          text: 'http://www.oknosoft.ru/zd/',
          width: 100,
          height: 100,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H,
          useSVG: true
        });
        res.qrcode = svg.innerHTML;

        return res;
      });
    }

    /**
     * Возвращает струклуру с описанием строки продукции для печати
     */
    row_description(row) {

      if (!(row instanceof $p.DocCalc_orderProductionRow) && row.characteristic) {
        this.production.find_rows({ characteristic: row.characteristic }, prow => {
          row = prow;
          return false;
        });
      }
      const { characteristic, nom } = row;
      const res = {
        ref: characteristic.ref,
        НомерСтроки: row.row,
        Количество: row.quantity,
        Ед: row.unit.name || 'шт',
        Цвет: characteristic.clr.name,
        Размеры: row.len + 'x' + row.width + ', ' + row.s + 'м²',
        Площадь: row.s,
        //Отдельно размеры, общая площадь позиции и комментарий к позиции
        Длинна: row.len,
        Ширина: row.width,
        ВсегоПлощадь: row.s * row.quantity,
        Примечание: row.note,
        Номенклатура: nom.name_full || nom.name,
        Характеристика: characteristic.name,
        Заполнения: '',
        Фурнитура: '',
        Параметры: [],
        Цена: row.price,
        ЦенаВнутр: row.price_internal,
        СкидкаПроцент: row.discount_percent,
        СкидкаПроцентВнутр: row.discount_percent_internal,
        Скидка: row.discount.round(2),
        Сумма: row.amount.round(2),
        СуммаВнутр: row.amount_internal.round(2)
      };

      // формируем описание заполнений
      characteristic.glasses.forEach(row => {
        const { name } = row.nom;
        if (res.Заполнения.indexOf(name) == -1) {
          if (res.Заполнения) {
            res.Заполнения += ', ';
          }
          res.Заполнения += name;
        }
      });

      // наименования фурнитур
      characteristic.constructions.forEach(row => {
        const { name } = row.furn;
        if (name && res.Фурнитура.indexOf(name) == -1) {
          if (res.Фурнитура) {
            res.Фурнитура += ', ';
          }
          res.Фурнитура += name;
        }
      });

      // параметры, помеченные к включению в описание
      const params = new Map();
      characteristic.params.forEach(row => {
        if (row.param.include_to_description) {
          params.set(row.param, row.value);
        }
      });
      for (let [param, value] of params) {
        res.Параметры.push({
          param: param.presentation,
          value: value.presentation || value
        });
      }

      return res;
    }

    /**
     * Заполняет табчасть планирования запросом к сервису windowbuilder-planning
     */
    fill_plan() {

      // чистим не стесняясь - при записи всё равно перезаполнять
      this.planning.clear();

      // получаем url сервиса
      const { wsql, aes, current_user: { suffix }, msg } = $p;
      const url = (wsql.get_user_param('windowbuilder_planning', 'string') || '/plan/') + `doc.calc_order/${this.ref}`;

      // сериализуем документ и характеристики
      const post_data = this._obj._clone();
      post_data.characteristics = {};

      // получаем объекты характеристик и подклеиваем их сериализацию к post_data
      this.load_production().then(prod => {
        for (const cx of prod) {
          post_data.characteristics[cx.ref] = cx._obj._clone();
        }
      })
      // выполняем запрос к сервису
      .then(() => {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Authorization', 'Basic ' + btoa(unescape(encodeURIComponent(wsql.get_user_param('user_name') + ':' + aes.Ctr.decrypt(wsql.get_user_param('user_pwd'))))));
        if (suffix) {
          headers.append('suffix', suffix);
        }
        fetch(url, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(post_data)
        }).then(response => response.json())
        // заполняем табчасть
        .then(json => {
          if (json.rows) {
            this.planning.load(json.rows);
          } else {
            console.log(json);
          }
        }).catch(err => {
          msg.show_msg({
            type: "alert-warning",
            text: err.message,
            title: "Сервис планирования"
          });
          $p.record_log(err);
        });
      });
    }

    /**
     * Выясняет, можно ли редактировать данный объект
     */
    get is_read_only() {
      const { obj_delivery_state, posted, _deleted } = this;
      const { Черновик, Шаблон, Отозван } = $p.enm.obj_delivery_states;
      let ro = false;
      // технолог может изменять шаблоны
      if (obj_delivery_state == Шаблон) {
        ro = !$p.current_user.role_available('ИзменениеТехнологическойНСИ');
      }
      // ведущий менеджер может изменять проведенные
      else if (posted || _deleted) {
          ro = !$p.current_user.role_available('СогласованиеРасчетовЗаказов');
        } else if (!obj_delivery_state.empty()) {
          ro = obj_delivery_state != Черновик && obj_delivery_state != Отозван;
        }
      return ro;
    }

    /**
     * Загружает в RAM данные характеристик продукций заказа
     * @return {Promise.<TResult>|*}
     */
    load_production(forse) {
      const prod = [];
      const { characteristics } = $p.cat;
      this.production.forEach(({ nom, characteristic }) => {
        if (!characteristic.empty() && (forse || characteristic.is_new()) && !nom.is_procedure && !nom.is_accessory) {
          prod.push(characteristic.ref);
        }
      });
      return characteristics.adapter.load_array(characteristics, prod).then(() => {
        prod.length = 0;
        this.production.forEach(({ nom, characteristic }) => {
          if (!characteristic.empty() && !nom.is_procedure && !nom.is_accessory) {
            prod.push(characteristic);
          }
        });
        return prod;
      });
    }

    /**
     * Обработчик события _ЗаписанаХарактеристикаПостроителя_
     * @param scheme
     * @param sattr
     */
    characteristic_saved(scheme, sattr) {
      const { ox, _dp } = scheme;
      const row = ox.calc_order_row;

      if (!row || ox.calc_order != this) {
        return;
      }

      //nom,characteristic,note,quantity,unit,qty,len,width,s,first_cost,marginality,price,discount_percent,discount_percent_internal,
      //discount,amount,margin,price_internal,amount_internal,vat_rate,vat_amount,ordn,changed

      row._data._loading = true;
      row.nom = ox.owner;
      row.note = _dp.note;
      row.quantity = _dp.quantity || 1;
      row.len = ox.x;
      row.width = ox.y;
      row.s = ox.s;
      row.discount_percent = _dp.discount_percent;
      row.discount_percent_internal = _dp.discount_percent_internal;
      if (row.unit.owner != row.nom) {
        row.unit = row.nom.storage_unit;
      }
      row._data._loading = false;
    }

    /**
     * Создаёт строку заказа с уникальной характеристикой
     * @param row_spec
     * @param elm
     * @param len_angl
     * @param params
     * @param create
     * @param grid
     * @return {Promise.<TResult>}
     */
    create_product_row({ row_spec, elm, len_angl, params, create, grid }) {

      const row = row_spec instanceof $p.DpBuyers_orderProductionRow && !row_spec.characteristic.empty() && row_spec.characteristic.calc_order === this ? row_spec.characteristic.calc_order_row : this.production.add({
        qty: 1,
        quantity: 1,
        discount_percent_internal: $p.wsql.get_user_param('discount_percent_internal', 'number')
      });

      if (grid) {
        this.production.sync_grid(grid);
        grid.selectRowById(row.row);
      }

      if (!create) {
        return row;
      }

      // ищем объект продукции в RAM или берём из строки заказа
      const mgr = $p.cat.characteristics;
      let cx;
      function fill_cx(ox) {
        if (ox._deleted) {
          return;
        }
        for (let ts in mgr.metadata().tabular_sections) {
          ox[ts].clear();
        }
        ox.leading_elm = 0;
        ox.leading_product = '';
        cx = Promise.resolve(ox);
        return false;
      }
      if (row.characteristic.empty()) {
        mgr.find_rows({ calc_order: this, product: row.row }, fill_cx);
      } else if (!row.characteristic._deleted) {
        fill_cx(row.characteristic);
      }

      // если не нашли в RAM, создаём объект продукции, но из базы не читаем и пока не записываем
      return (cx || mgr.create({
        ref: $p.utils.generate_guid(),
        calc_order: this,
        product: row.row
      }, true)).then(ox => {
        // если указана строка-генератор, заполняем реквизиты
        if (row_spec instanceof $p.DpBuyers_orderProductionRow) {

          if (params) {
            params.find_rows({ elm: row_spec.row }, prow => {
              ox.params.add(prow, true).inset = row_spec.inset;
            });
          }

          elm.project = { ox };
          elm.fake_origin = row_spec.inset;

          ox.owner = row_spec.inset.nom(elm);
          ox.origin = row_spec.inset;
          ox.x = row_spec.len;
          ox.y = row_spec.height;
          ox.z = row_spec.depth;
          ox.s = row_spec.s || row_spec.len * row_spec.height / 1000000;
          ox.clr = row_spec.clr;
          ox.note = row_spec.note;
        }

        // устанавливаем свойства в строке заказа
        Object.assign(row._obj, {
          characteristic: ox.ref,
          nom: ox.owner.ref,
          unit: ox.owner.storage_unit.ref,
          len: ox.x,
          width: ox.y,
          s: ox.s,
          qty: row_spec && row_spec.quantity || 1,
          quantity: row_spec && row_spec.quantity || 1,
          note: ox.note
        });

        ox.name = ox.prod_name();

        // записываем расчет, если не сделали этого ранее, чтобы не погибла ссылка на расчет в характеристике
        return this.is_new() && !$p.wsql.alasql.utils.isNode ? this.save().then(() => row) : row;
      });
    }

    /**
     * ### Создаёт продукции заказа по массиву строк и параметров
     * если в dp.production заполнены уникальные характеристики - перезаполняет их, а новые не создаёт
     * @method process_add_product_list
     * @param dp {DpBuyers_order} - экземпляр обработки с заполненными табличными частями
     */
    process_add_product_list(dp) {

      return new Promise(async (resolve, reject) => {

        const ax = [];

        for (let i = 0; i < dp.production.count(); i++) {
          const row_spec = dp.production.get(i);
          let row_prod;

          if (row_spec.inset.empty()) {
            row_prod = this.production.add(row_spec);
            row_prod.unit = row_prod.nom.storage_unit;
            if (!row_spec.clr.empty()) {
              // ищем цветовую характеристику
              $p.cat.characteristics.find_rows({ owner: row_spec.nom }, ox => {
                if (ox.clr == row_spec.clr) {
                  row_prod.characteristic = ox;
                  return false;
                }
              });
            }
          } else {
            // рассчитываем спецификацию по текущей вставке
            const len_angl = new $p.DocCalc_order.FakeLenAngl(row_spec);
            const elm = new $p.DocCalc_order.FakeElm(row_spec);
            // создаём или получаем строку заказа с уникальной харктеристикой
            row_prod = await this.create_product_row({ row_spec, elm, len_angl, params: dp.product_params, create: true });
            row_spec.inset.calculate_spec({ elm, len_angl, ox: row_prod.characteristic });

            // сворачиваем
            row_prod.characteristic.specification.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');
          }

          // производим дополнительную корректировку спецификации и рассчитываем цены
          [].push.apply(ax, $p.spec_building.specification_adjustment({
            //scheme: scheme,
            calc_order_row: row_prod,
            spec: row_prod.characteristic.specification,
            save: true
          }, true));
        }

        resolve(ax);
      });
    }

    /**
     * Устанавливает подразделение по умолчанию
     */
    static set_department() {
      const department = $p.wsql.get_user_param('current_department');
      if (department) {
        this.department = department;
      }
      const { current_user, cat } = $p;
      if (this.department.empty() || this.department.is_new()) {
        current_user.acl_objs && current_user.acl_objs.find_rows({ by_default: true, type: cat.divisions.class_name }, row => {
          if (this.department != row.acl_obj) {
            this.department = row.acl_obj;
          }
          return false;
        });
      }
    }

  };

  $p.DocCalc_order.FakeElm = class FakeElm {

    constructor(row_spec) {
      this.row_spec = row_spec;
    }

    get elm() {
      return 0;
    }

    get angle_hor() {
      return 0;
    }

    get _row() {
      return this;
    }

    get clr() {
      return this.row_spec.clr;
    }

    get len() {
      return this.row_spec.len;
    }

    get height() {
      const { height, width } = this.row_spec;
      return height === undefined ? width : height;
    }

    get depth() {
      return this.row_spec.depth || 0;
    }

    get s() {
      return this.row_spec.s;
    }

    get perimeter() {
      const { len, height, width } = this.row_spec;
      return [{ len, angle: 0 }, { len: height === undefined ? width : height, angle: 90 }];
    }

    get x1() {
      return 0;
    }

    get y1() {
      return 0;
    }

    get x2() {
      return this.height;
    }

    get y2() {
      return this.len;
    }

  };

  $p.DocCalc_order.FakeLenAngl = class FakeLenAngl {

    constructor({ len, inset }) {
      this.len = len;
      this.origin = inset;
    }

    get angle() {
      return 0;
    }

    get alp1() {
      return 0;
    }

    get alp2() {
      return 0;
    }

    get cnstr() {
      return 0;
    }

  };

  // свойства и методы табчасти продукции
  $p.DocCalc_orderProductionRow = class DocCalc_orderProductionRow extends $p.DocCalc_orderProductionRow {

    // при изменении реквизита
    value_change(field, type, value, no_extra_charge) {

      let { _obj, _owner, nom, characteristic, unit } = this;
      let recalc;
      const { rounding, _slave_recalc } = _owner._owner;
      const rfield = $p.DocCalc_orderProductionRow.rfields[field];

      if (rfield) {

        _obj[field] = rfield === 'n' ? parseFloat(value) : '' + value;

        nom = this.nom;
        characteristic = this.characteristic;

        // проверим владельца характеристики
        if (!characteristic.empty()) {
          if (!characteristic.calc_order.empty() && characteristic.owner != nom) {
            characteristic.owner = nom;
          } else if (characteristic.owner != nom) {
            _obj.characteristic = $p.utils.blank.guid;
            characteristic = this.characteristic;
          }
        }

        // проверим единицу измерения
        if (unit.owner != nom) {
          _obj.unit = nom.storage_unit.ref;
        }

        // если это следящая вставка, рассчитаем спецификацию
        if (!characteristic.origin.empty() && characteristic.origin.slave) {
          characteristic.specification.clear();
          characteristic.x = this.len;
          characteristic.y = this.width;
          characteristic.s = this.s || this.len * this.width / 1000000;
          const len_angl = new $p.DocCalc_order.FakeLenAngl({ len: this.len, inset: characteristic.origin });
          const elm = new $p.DocCalc_order.FakeElm(this);
          characteristic.origin.calculate_spec({ elm, len_angl, ox: characteristic });
          recalc = true;
        }

        // рассчитаем цены
        const fake_prm = {
          calc_order_row: this,
          spec: characteristic.specification
        };
        const { price } = _obj;
        $p.pricing.price_type(fake_prm);
        $p.pricing.calc_first_cost(fake_prm);
        $p.pricing.calc_amount(fake_prm);
        if (price && !_obj.price) {
          _obj.price = price;
          recalc = true;
        }
      }

      if ($p.DocCalc_orderProductionRow.pfields.indexOf(field) != -1 || recalc) {

        if (!recalc) {
          _obj[field] = parseFloat(value);
        }

        isNaN(_obj.price) && (_obj.price = 0);
        isNaN(_obj.price_internal) && (_obj.price_internal = 0);
        isNaN(_obj.discount_percent) && (_obj.discount_percent = 0);
        isNaN(_obj.discount_percent_internal) && (_obj.discount_percent_internal = 0);

        _obj.amount = (_obj.price * ((100 - _obj.discount_percent) / 100) * _obj.quantity).round(rounding);

        // если есть внешняя цена дилера, получим текущую дилерскую наценку
        if (!no_extra_charge) {
          const prm = { calc_order_row: this };
          let extra_charge = $p.wsql.get_user_param('surcharge_internal', 'number');

          // если пересчет выполняется менеджером, используем наценку по умолчанию
          if (!$p.current_user.partners_uids.length || !extra_charge) {
            $p.pricing.price_type(prm);
            extra_charge = prm.price_type.extra_charge_external;
          }

          if (field != 'price_internal' && extra_charge && _obj.price) {
            _obj.price_internal = (_obj.price * (100 - _obj.discount_percent) / 100 * (100 + extra_charge) / 100).round(rounding);
          }
        }

        _obj.amount_internal = (_obj.price_internal * ((100 - _obj.discount_percent_internal) / 100) * _obj.quantity).round(rounding);

        // ставка и сумма НДС
        const doc = _owner._owner;
        if (doc.vat_consider) {
          const { НДС18, НДС18_118, НДС10, НДС10_110, НДС20, НДС20_120, НДС0, БезНДС } = $p.enm.vat_rates;
          _obj.vat_rate = (nom.vat_rate.empty() ? НДС18 : nom.vat_rate).ref;
          switch (this.vat_rate) {
            case НДС18:
            case НДС18_118:
              _obj.vat_amount = (_obj.amount * 18 / 118).round(2);
              break;
            case НДС10:
            case НДС10_110:
              _obj.vat_amount = (_obj.amount * 10 / 110).round(2);
              break;
            case НДС20:
            case НДС20_120:
              _obj.vat_amount = (_obj.amount * 20 / 120).round(2);
              break;
            case НДС0:
            case БезНДС:
            case '_':
            case '':
              _obj.vat_amount = 0;
              break;
          }
          if (!doc.vat_included) {
            _obj.amount = (_obj.amount + _obj.vat_amount).round(2);
          }
        } else {
          _obj.vat_rate = '';
          _obj.vat_amount = 0;
        }

        const amount = _owner.aggregate([], ['amount', 'amount_internal']);
        amount.doc_amount = amount.amount.round(rounding);
        amount.amount_internal = amount.amount_internal.round(rounding);
        delete amount.amount;
        Object.assign(doc, amount);
        doc._manager.emit_async('update', doc, amount);

        // пересчитываем спецификации и цены в следящих вставках
        if (!_slave_recalc) {
          _owner._owner._slave_recalc = true;
          _owner.forEach(row => {
            if (row !== this && !row.characteristic.origin.empty() && row.characteristic.origin.slave) {
              row.value_change('quantity', 'update', row.quantity, no_extra_charge);
            }
          });
          _owner._owner._slave_recalc = false;
        }

        // TODO: учесть валюту документа, которая может отличаться от валюты упр. учета и решить вопрос с amount_operation

        return false;
      }
    }

  };

  $p.DocCalc_orderProductionRow.rfields = {
    nom: 's',
    characteristic: 's',
    quantity: 'n',
    len: 'n',
    width: 'n',
    s: 'n'
  };

  $p.DocCalc_orderProductionRow.pfields = 'price_internal,quantity,discount_percent_internal';

  /**
   * форма списка документов Расчет-заказ. публикуемый метод: doc.calc_order.form_list(o, pwnd, attr)
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_calc_order_form_list
   */

  $p.doc.calc_order.form_list = function (pwnd, attr, handlers) {

    if (!attr) {
      attr = {
        hide_header: true,
        date_from: moment().subtract(2, 'month').toDate(),
        date_till: moment().add(1, 'month').toDate(),
        on_new: o => {
          handlers.handleNavigate(`/${this.class_name}/${o.ref}`);
        },
        on_edit: (_mgr, rId) => {
          handlers.handleNavigate(`/${_mgr.class_name}/${rId}`);
        }
      };
    }

    return this.pouch_db.getIndexes().then(({ indexes }) => {
      attr._index = {
        ddoc: "mango_calc_order",
        fields: ["department", "state", "date", "search"],
        name: 'list',
        type: 'json'
      };
      if (!indexes.some(({ ddoc }) => ddoc && ddoc.indexOf(attr._index.ddoc) != -1)) {
        return this.pouch_db.createIndex(attr._index);
      }
    }).then(() => {
      return new Promise((resolve, reject) => {

        attr.on_create = wnd => {

          const { elmnts } = wnd;

          wnd.dep_listener = (obj, fields) => {
            if (obj == dp && fields.department) {
              elmnts.filter.call_event();
              $p.wsql.set_user_param("current_department", dp.department.ref);
            }
          };

          // добавляем слушателя внешних событий
          if (handlers) {
            const { custom_selection } = elmnts.filter;
            custom_selection._state = handlers.props.state_filter;
            handlers.onProps = props => {
              if (custom_selection._state != props.state_filter) {
                custom_selection._state = props.state_filter;
                elmnts.filter.call_event();
              }
            };

            wnd.handleNavigate = handlers.handleNavigate;
            wnd.handleIfaceState = handlers.handleIfaceState;
          }

          // добавляем отбор по подразделению
          const dp = $p.dp.builder_price.create();
          const pos = elmnts.toolbar.getPosition("input_filter");
          const txt_id = `txt_${dhx4.newId()}`;
          elmnts.toolbar.addText(txt_id, pos, "");
          const txt_div = elmnts.toolbar.objPull[elmnts.toolbar.idPrefix + txt_id].obj;
          const dep = new $p.iface.OCombo({
            parent: txt_div,
            obj: dp,
            field: "department",
            width: 180,
            hide_frm: true
          });
          txt_div.style.border = "1px solid #ccc";
          txt_div.style.borderRadius = "3px";
          txt_div.style.padding = "3px 2px 1px 2px";
          txt_div.style.margin = "1px 5px 1px 1px";
          dep.DOMelem_input.placeholder = "Подразделение";

          dp._manager.on('update', wnd.dep_listener);

          const set_department = $p.DocCalc_order.set_department.bind(dp);
          set_department();
          if (!$p.wsql.get_user_param('couch_direct')) {
            $p.md.once('user_log_in', set_department);
          }

          // настраиваем фильтр для списка заказов
          elmnts.filter.custom_selection.__define({
            department: {
              get: function () {
                const { department } = dp;
                return this._state == 'template' ? { $eq: $p.utils.blank.guid } : { $eq: department.ref };
                // const depts = [];
                // $p.cat.divisions.forEach((o) =>{
                //   if(o._hierarchy(department)){
                //     depts.push(o.ref)
                //   }
                // });
                // return depts.length == 1 ?  {$eq: depts[0]} : {$in: depts};
              },
              enumerable: true
            },
            state: {
              get: function () {
                return this._state == 'all' ? { $in: 'draft,sent,confirmed,declined,service,complaints,template,zarchive'.split(',') } : { $eq: this._state };
              },
              enumerable: true
            }
          });
          elmnts.filter.custom_selection._index = attr._index;

          // картинка заказа в статусбаре
          elmnts.status_bar = wnd.attachStatusBar();
          elmnts.svgs = new $p.iface.OSvgs(wnd, elmnts.status_bar, (ref, dbl) => {
            //dbl && $p.iface.set_hash("cat.characteristics", ref, "builder")
            dbl && handlers.handleNavigate(`/builder/${ref}`);
          });
          elmnts.grid.attachEvent("onRowSelect", rid => elmnts.svgs.reload(rid));

          wnd.attachEvent("onClose", win => {
            dep && dep.unload();
            return true;
          });

          attr.on_close = () => {
            elmnts.svgs && elmnts.svgs.unload();
            dep && dep.unload();
          };

          // wnd.close = (on_create) => {
          //
          //   if (wnd) {
          //     wnd.getAttachedToolbar().clearAll();
          //     wnd.detachToolbar();
          //     wnd.detachStatusBar();
          //     if (wnd.conf) {
          //       wnd.conf.unloading = true;
          //     }
          //     wnd.detachObject(true);
          //   }
          //   this.frm_unload(on_create);
          // }

          resolve(wnd);
        };

        return this.mango_selection(pwnd, attr);
      });
    });
  };

  /**
   * форма документа Расчет-заказ. публикуемый метод: doc.calc_order.form_obj(o, pwnd, attr)
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_calc_order_form_obj
   */

  (function ($p) {

    const _mgr = $p.doc.calc_order;
    let _meta_patched;

    _mgr.form_obj = function (pwnd, attr, handlers) {

      let o, wnd;

      /**
       * структура заголовков табчасти продукции
       * @param source
       */
      if (!_meta_patched) {
        (function (source, user) {
          // TODO: штуки сейчас спрятаны в ro и имеют нулевую ширину
          if ($p.wsql.get_user_param('hide_price_dealer')) {
            source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка,Цена,Сумма,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
            source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,0,0,0';
            source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,0,0,0';
          } else if ($p.wsql.get_user_param('hide_price_manufacturer')) {
            source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка,Цена,Сумма';
            source.widths = '40,200,*,220,0,70,70,70,70,40,0,0,0,70,70,70';
            source.min_widths = '30,200,220,150,0,70,40,70,70,70,0,0,0,70,70,70';
          } else {
            source.headers = '№,Номенклатура,Характеристика,Комментарий,Штук,Длина,Высота,Площадь,Колич.,Ед,Скидка&nbsp;пост,Цена&nbsp;пост,Сумма&nbsp;пост,Скидка&nbsp;дил,Цена&nbsp;дил,Сумма&nbsp;дил';
            source.widths = '40,200,*,220,0,70,70,70,70,40,70,70,70,70,70,70';
            source.min_widths = '30,200,220,150,0,70,40,70,70,70,70,70,70,70,70,70';
          }

          if (user.role_available('СогласованиеРасчетовЗаказов') || user.role_available('РедактированиеЦен') || user.role_available('РедактированиеСкидок')) {
            source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,calck,calck,ro,calck,calck,ro';
          } else {
            source.types = 'cntr,ref,ref,txt,ro,calck,calck,calck,calck,ref,ro,calck,ro,calck,calck,ro';
          }

          _meta_patched = true;
        })($p.doc.calc_order.metadata().form.obj.tabular_sections.production, $p.current_user);
      }

      attr.draw_tabular_sections = (o, wnd, tabular_init) => {

        /**
         * получим задействованные в заказе объекты характеристик
         */
        const refs = [];
        o.production.each(row => {
          if (!$p.utils.is_empty_guid(row._obj.characteristic) && row.characteristic.is_new()) {
            refs.push(row._obj.characteristic);
          }
        });
        $p.cat.characteristics.adapter.load_array($p.cat.characteristics, refs).then(() => {

          const footer = {
            columns: ",,,,#stat_total,,,#stat_s,,,,,#stat_total,,,#stat_total",
            _in_header_stat_s: function (tag, index, data) {
              const calck = function () {
                let sum = 0;
                o.production.each(row => {
                  sum += row.s * row.quantity;
                });
                return sum.toFixed(2);
              };
              this._stat_in_header(tag, calck, index, data);
            }

            // табчасть продукции со специфическим набором кнопок
          };tabular_init('production', $p.injected_data['toolbar_calc_order_production.xml'], footer);
          const { production } = wnd.elmnts.grids;
          production.disable_sorting = true;
          production.attachEvent('onRowSelect', production_select);
          production.attachEvent('onEditCell', (stage, rId, cInd, nValue, oValue, fake) => {
            if (stage == 2 && fake !== true) {
              if (production._edit_timer) {
                clearTimeout(production._edit_timer);
              }
              production._edit_timer = setTimeout(() => {
                if (wnd && wnd.elmnts) {
                  production.callEvent('onEditCell', [2, 0, 7, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 12, null, null, true]);
                  production.callEvent('onEditCell', [2, 0, 15, null, null, true]);
                }
              }, 300);
            }
          });

          let toolbar = wnd.elmnts.tabs.tab_production.getAttachedToolbar();
          toolbar.addSpacer('btn_delete');
          toolbar.attachEvent('onclick', toolbar_click);

          // табчасть планирования
          tabular_init('planning');
          toolbar = wnd.elmnts.tabs.tab_planning.getAttachedToolbar();
          toolbar.addButton('btn_fill_plan', 3, 'Заполнить');
          toolbar.attachEvent('onclick', toolbar_click);

          // в зависимости от статуса
          set_editable(o, wnd);
        });

        /**
         *  статусбар с картинками
         */
        wnd.elmnts.statusbar = wnd.attachStatusBar();
        wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.statusbar, rsvg_click);
      };

      attr.draw_pg_header = (o, wnd) => {

        function layout_resize_finish() {
          setTimeout(() => {
            if (wnd.elmnts && wnd.elmnts.layout_header && wnd.elmnts.layout_header.setSizes) {
              wnd.elmnts.layout_header.setSizes();
              wnd.elmnts.pg_left.objBox.style.width = '100%';
              wnd.elmnts.pg_right.objBox.style.width = '100%';
            }
          }, 200);
        }

        /**
         *  закладка шапка
         */
        wnd.elmnts.layout_header = wnd.elmnts.tabs.tab_header.attachLayout('3U');

        wnd.elmnts.layout_header.attachEvent('onResizeFinish', layout_resize_finish);

        wnd.elmnts.layout_header.attachEvent('onPanelResizeFinish', layout_resize_finish);

        /**
         *  левая колонка шапки документа
         */
        wnd.elmnts.cell_left = wnd.elmnts.layout_header.cells('a');
        wnd.elmnts.cell_left.hideHeader();
        wnd.elmnts.pg_left = wnd.elmnts.cell_left.attachHeadFields({
          obj: o,
          pwnd: wnd,
          read_only: wnd.elmnts.ro,
          oxml: {
            ' ': [{ id: 'number_doc', path: 'o.number_doc', synonym: 'Номер', type: 'ro', txt: o.number_doc }, { id: 'date', path: 'o.date', synonym: 'Дата', type: 'ro', txt: moment(o.date).format(moment._masks.date_time) }, 'number_internal'],
            'Контактная информация': ['partner', 'client_of_dealer', 'phone', { id: 'shipping_address', path: 'o.shipping_address', synonym: 'Адрес доставки', type: 'addr', txt: o['shipping_address'] }],
            'Дополнительные реквизиты': ['obj_delivery_state', 'category']
          }
        });

        /**
         *  правая колонка шапки документа
         * TODO: задействовать либо удалить choice_links
         * var choice_links = {contract: [
        * {name: ["selection", "owner"], path: ["partner"]},
        * {name: ["selection", "organization"], path: ["organization"]}
        * ]};
         */

        wnd.elmnts.cell_right = wnd.elmnts.layout_header.cells('b');
        wnd.elmnts.cell_right.hideHeader();
        wnd.elmnts.pg_right = wnd.elmnts.cell_right.attachHeadFields({
          obj: o,
          pwnd: wnd,
          read_only: wnd.elmnts.ro,
          oxml: {
            'Налоги': ['vat_consider', 'vat_included'],
            'Аналитика': ['project', { id: 'organization', path: 'o.organization', synonym: 'Организация', type: 'refc' }, { id: 'contract', path: 'o.contract', synonym: 'Договор', type: 'refc' }, { id: 'bank_account', path: 'o.bank_account', synonym: 'Счет организации', type: 'refc' }, { id: 'department', path: 'o.department', synonym: 'Офис продаж', type: 'refc' }, { id: 'warehouse', path: 'o.warehouse', synonym: 'Склад отгрузки', type: 'refc' }],
            'Итоги': [{ id: 'doc_currency', path: 'o.doc_currency', synonym: 'Валюта документа', type: 'ro', txt: o['doc_currency'].presentation }, { id: 'doc_amount', path: 'o.doc_amount', synonym: 'Сумма', type: 'ron', txt: o['doc_amount'] }, { id: 'amount_internal', path: 'o.amount_internal', synonym: 'Сумма внутр', type: 'ron', txt: o['amount_internal'] }]
          }
        });

        /**
         *  редактор комментариев
         */
        wnd.elmnts.cell_note = wnd.elmnts.layout_header.cells('c');
        wnd.elmnts.cell_note.hideHeader();
        wnd.elmnts.cell_note.setHeight(100);
        wnd.elmnts.cell_note.attachHTMLString('<textarea placeholder=\'Комментарий к заказу\' class=\'textarea_editor\'>' + o.note + '</textarea>');
      };

      attr.toolbar_struct = $p.injected_data['toolbar_calc_order_obj.xml'];

      attr.toolbar_click = toolbar_click;

      attr.on_close = frm_close;

      return this.constructor.prototype.form_obj.call(this, pwnd, attr).then(res => {
        if (res) {
          o = res.o;
          wnd = res.wnd;
          wnd.prompt = prompt;
          wnd.close_confirmed = true;
          if (handlers) {
            wnd.handleNavigate = handlers.handleNavigate;
            wnd.handleIfaceState = handlers.handleIfaceState;
          }

          rsvg_reload();
          o._manager.on('svgs', rsvg_reload);

          const search = $p.job_prm.parse_url_str(location.search);
          if (search.ref) {
            setTimeout(() => {
              wnd.elmnts.tabs.tab_production && wnd.elmnts.tabs.tab_production.setActive();
              rsvg_click(search.ref, 0);
            }, 200);
          };

          return res;
        }
      });

      /**
       * проверка, можно ли покидать страницу
       * @param loc
       * @return {*}
       */
      function prompt(loc) {
        if (loc.pathname.match(/builder/)) {
          return true;
        }
        return o && o._modified ? `${o.presentation} изменён.\n\nЗакрыть без сохранения?` : true;
      }

      function close() {
        if (o && o._obj) {
          const { ref, state } = o._obj;
          handlers.handleNavigate(`/?ref=${ref}&state_filter=${state || 'draft'}`);
        } else {
          handlers.handleNavigate(`/`);
        }
        $p.doc.calc_order.off('svgs', rsvg_reload);
      }

      /**
       * При активизации строки продукции
       * @param id
       * @param ind
       */
      function production_select(id, ind) {
        const row = o.production.get(id - 1);
        const { svgs, grids: { production } } = wnd.elmnts;
        wnd.elmnts.svgs.select(row.characteristic.ref);

        // если пользователь неполноправный, проверяем разрешение изменять цены номенклатуры
        if (production.columnIds[ind] === 'price') {
          const { current_user, CatParameters_keys, utils, enm: { comparison_types, parameters_keys_applying } } = $p;
          if (current_user.role_available('СогласованиеРасчетовЗаказов') || current_user.role_available('РедактированиеЦен')) {
            production.cells(id, ind).setDisabled(false);
          } else {
            const { nom } = row;
            let disabled = true;
            current_user.acl_objs.forEach(({ acl_obj }) => {
              if (acl_obj instanceof CatParameters_keys && acl_obj.applying == parameters_keys_applying.Ценообразование) {
                acl_obj.params.forEach(({ value, comparison_type }) => {
                  if (utils.check_compare(nom, value, comparison_type, comparison_types)) {
                    return disabled = false;
                  }
                });
                if (!disabled) {
                  return disabled;
                }
              }
            });
            production.cells(id, ind).setDisabled(disabled);
          }
        }
      }

      /**
       * обработчик нажатия кнопок командных панелей
       */
      function toolbar_click(btn_id) {

        switch (btn_id) {

          case 'btn_sent':
            save('sent');
            break;

          case 'btn_save':
            save('save');
            break;

          case 'btn_save_close':
            save('close');
            break;

          case 'btn_retrieve':
            save('retrieve');
            break;

          case 'btn_post':
            save('post');
            break;

          case 'btn_unpost':
            save('unpost');
            break;

          case 'btn_fill_plan':
            o.fill_plan();
            break;

          case 'btn_close':
            close();
            break;

          case 'btn_add_builder':
            open_builder(true);
            break;

          case 'btn_clone':
            open_builder('clone');
            break;

          case 'btn_add_product':
            $p.dp.buyers_order.open_product_list(wnd, o);
            break;

          case 'btn_additions':
            $p.dp.buyers_order.open_additions(wnd, o, handlers);
            break;

          case 'btn_add_material':
            add_material();
            break;

          case 'btn_edit':
            open_builder();
            break;

          case 'btn_spec':
            open_spec();
            break;

          case 'btn_discount':
            show_discount();
            break;

          case 'btn_calendar':
            calendar_new_event();
            break;

          case 'btn_go_connection':
            go_connection();
            break;
        }

        if (btn_id.substr(0, 4) == 'prn_') {
          _mgr.print(o, btn_id, wnd);
        }
      }

      /**
       * создаёт событие календаря
       */
      function calendar_new_event() {
        $p.msg.show_not_implemented();
      }

      /**
       * показывает список связанных документов
       */
      function go_connection() {
        $p.msg.show_not_implemented();
      }

      /**
       * создаёт и показывает диалог групповых скидок
       */
      function show_discount() {

        if (!wnd.elmnts.discount) {
          wnd.elmnts.discount = $p.dp.buyers_order.create();
        }
        // перезаполняем
        refill_discount(wnd.elmnts.discount);

        const discount = $p.iface.dat_blank(null, {
          width: 300,
          height: 220,
          allow_close: true,
          allow_minmax: false,
          caption: 'Скидки по группам'
        });
        discount.setModal(true);

        discount.attachTabular({
          obj: wnd.elmnts.discount,
          ts: 'charges_discounts',
          reorder: false,
          disable_add_del: true,
          toolbar_struct: $p.injected_data['toolbar_discounts.xml'],
          ts_captions: {
            'fields': ['nom_kind', 'discount_percent'],
            'headers': 'Группа,Скидка',
            'widths': '*,80',
            'min_widths': '120,70',
            'aligns': '',
            'sortings': 'na,na',
            'types': 'ro,calck'
          }
        });
        const toolbar = discount.getAttachedToolbar();
        toolbar.attachEvent('onclick', btn => {
          wnd.elmnts.discount._mode = btn;
          refill_discount(wnd.elmnts.discount);
          toolbar.setItemText('bs', toolbar.getListOptionText('bs', btn));
        });
        if (wnd.elmnts.discount._disable_internal) {
          toolbar.disableListOption('bs', 'discount_percent');
        }
        toolbar.setItemText('bs', toolbar.getListOptionText('bs', wnd.elmnts.discount._mode));
      }

      function refill_discount(dp) {

        if (!dp._mode) {
          dp._disable_internal = !$p.current_user.role_available('РедактированиеСкидок');
          dp._mode = dp._disable_internal ? 'discount_percent_internal' : 'discount_percent';
          dp._calc_order = o;
        }

        const { charges_discounts } = dp;
        const groups = new Set();
        dp._data._loading = true;
        charges_discounts.clear();
        o.production.forEach(row => {
          const group = { nom_kind: row.nom.nom_kind };
          if (!groups.has(group.nom_kind)) {
            groups.add(group.nom_kind);
            charges_discounts.add(group);
          }
          charges_discounts.find_rows(group, sub => {
            const percent = row[dp._mode];
            if (percent > sub.discount_percent) {
              sub.discount_percent = percent;
            }
          });
        });
        dp._data._loading = false;
        dp._manager.emit_async('rows', dp, { 'charges_discounts': true });
      }

      /**
       * вспомогательные функции
       */

      function production_get_sel_index() {
        var selId = wnd.elmnts.grids.production.getSelectedRowId();
        if (selId && !isNaN(Number(selId))) {
          return Number(selId) - 1;
        }

        $p.msg.show_msg({
          type: 'alert-warning',
          text: $p.msg.no_selected_row.replace('%1', 'Продукция'),
          title: o.presentation
        });
      }

      function save(action) {

        function do_save(post) {

          if (!wnd.elmnts.ro) {
            o.note = wnd.elmnts.cell_note.cell.querySelector('textarea').value.replace(/&nbsp;/g, ' ').replace(/<.*?>/g, '').replace(/&.{2,6};/g, '');
            wnd.elmnts.pg_left.selectRow(0);
          }

          o.save(post).then(function () {
            if (action == 'sent' || action == 'close') {
              close();
            } else {
              wnd.set_text();
              set_editable(o, wnd);
            }
          }).catch($p.record_log);
        }

        switch (action) {
          case 'sent':
            // показать диалог и обработать возврат
            dhtmlx.confirm({
              title: $p.msg.order_sent_title,
              text: $p.msg.order_sent_message,
              cancel: $p.msg.cancel,
              callback: function (btn) {
                if (btn) {
                  // установить транспорт в "отправлено" и записать
                  o.obj_delivery_state = $p.enm.obj_delivery_states.Отправлен;
                  do_save();
                }
              }
            });
            break;

          case 'retrieve':
            // установить транспорт в "отозвано" и записать
            o.obj_delivery_state = $p.enm.obj_delivery_states.Отозван;
            do_save();
            break;

          case 'post':
            do_save(true);
            break;

          case 'unpost':
            do_save(false);
            break;

          default:
            do_save();
        }
      }

      function frm_close() {

        if (o && o._modified) {
          if (o.is_new()) {
            o.unload();
          } else if (!location.pathname.match(/builder/)) {
            setTimeout(o.load.bind(o), 100);
          }
        }

        // выгружаем из памяти всплывающие окна скидки и связанных файлов
        ['vault', 'vault_pop', 'discount', 'svgs', 'layout_header'].forEach(elm => {
          wnd && wnd.elmnts && wnd.elmnts[elm] && wnd.elmnts[elm].unload && wnd.elmnts[elm].unload();
        });

        return true;
      }

      // устанавливает видимость и доступность
      function set_editable(o, wnd) {

        const { pg_left, pg_right, frm_toolbar, grids, tabs } = wnd.elmnts;

        pg_right.cells('vat_consider', 1).setDisabled(true);
        pg_right.cells('vat_included', 1).setDisabled(true);

        const ro = wnd.elmnts.ro = o.is_read_only;

        const retrieve_enabed = !o._deleted && (o.obj_delivery_state == $p.enm.obj_delivery_states.Отправлен || o.obj_delivery_state == $p.enm.obj_delivery_states.Отклонен);

        grids.production.setEditable(!ro);
        grids.planning.setEditable(!ro);
        pg_left.setEditable(!ro);
        pg_right.setEditable(!ro);

        // гасим кнопки проведения, если недоступна роль
        if (!$p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
          frm_toolbar.hideItem('btn_post');
          frm_toolbar.hideItem('btn_unpost');
        }

        // если не технологи и не менеджер - запрещаем менять статусы
        if (!$p.current_user.role_available('ИзменениеТехнологическойНСИ') && !$p.current_user.role_available('СогласованиеРасчетовЗаказов')) {
          pg_left.cells('obj_delivery_state', 1).setDisabled(true);
        }

        // кнопки записи и отправки гасим в зависимости от статуса
        if (ro) {
          frm_toolbar.disableItem('btn_sent');
          frm_toolbar.disableItem('btn_save');
          let toolbar;
          const disable = itemId => toolbar.disableItem(itemId);
          toolbar = tabs.tab_production.getAttachedToolbar();
          toolbar.forEachItem(disable);
          toolbar = tabs.tab_planning.getAttachedToolbar();
          toolbar.forEachItem(disable);
        } else {
          // шаблоны никогда не надо отправлять
          if (o.obj_delivery_state == $p.enm.obj_delivery_states.Шаблон) {
            frm_toolbar.disableItem('btn_sent');
          } else {
            frm_toolbar.enableItem('btn_sent');
          }
          frm_toolbar.enableItem('btn_save');
          let toolbar;
          const enable = itemId => toolbar.enableItem(itemId);
          toolbar = tabs.tab_production.getAttachedToolbar();
          toolbar.forEachItem(enable);
          toolbar = tabs.tab_planning.getAttachedToolbar();
          toolbar.forEachItem(enable);
        }
        if (retrieve_enabed) {
          frm_toolbar.enableListOption('bs_more', 'btn_retrieve');
        } else {
          frm_toolbar.disableListOption('bs_more', 'btn_retrieve');
        }
      }

      /**
       * показывает диалог с сообщением "это не продукция"
       */
      function not_production() {
        $p.msg.show_msg({
          title: $p.msg.bld_title,
          type: 'alert-error',
          text: $p.msg.bld_not_product
        });
      }

      /**
       * ОткрытьПостроитель()
       * @param [create_new] {Boolean} - создавать новое изделие или открывать в текущей строке
       */
      function open_builder(create_new) {
        var selId;

        if (create_new == 'clone') {
          const selId = production_get_sel_index();
          if (selId == undefined) {
            not_production();
          } else {
            const row = o.production.get(selId);
            if (row) {
              const { owner, calc_order } = row.characteristic;
              if (row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
                not_production();
              } else if (row.characteristic.coordinates.count()) {
                // добавляем строку
                o.create_product_row({ grid: wnd.elmnts.grids.production, create: true }).then(({ characteristic }) => {
                  // заполняем продукцию копией данных текущей строки
                  characteristic._mixin(row.characteristic._obj, null, ['ref', 'name', 'calc_order', 'product', 'leading_product', 'leading_elm', 'origin', 'note', 'partner'], true);
                  handlers.handleNavigate(`/builder/${characteristic.ref}`);
                });
              } else {
                not_production();
              }
            }
          }
        } else if (create_new) {
          o.create_product_row({ grid: wnd.elmnts.grids.production, create: true }).then(row => {
            handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
          });
        } else {
          const selId = production_get_sel_index();
          if (selId != undefined) {
            const row = o.production.get(selId);
            if (row) {
              const { owner, calc_order } = row.characteristic;
              if (row.characteristic.empty() || calc_order.empty() || owner.is_procedure || owner.is_accessory) {
                not_production();
              } else if (row.characteristic.coordinates.count() == 0) {
                // возможно, это заготовка - проверим номенклатуру системы
                if (row.characteristic.leading_product.calc_order == calc_order) {
                  //$p.iface.set_hash("cat.characteristics", row.characteristic.leading_product.ref, "builder");
                  handlers.handleNavigate(`/builder/${row.characteristic.leading_product.ref}`);
                }
              } else {
                //$p.iface.set_hash("cat.characteristics", row.characteristic.ref, "builder");
                handlers.handleNavigate(`/builder/${row.characteristic.ref}`);
              }
            }
          }
        }
      }

      /**
       * Открывает форму спецификации текущей строки
       */
      function open_spec() {
        const selId = production_get_sel_index();
        if (selId != undefined) {
          const row = o.production.get(selId);
          row && !row.characteristic.empty() && row.characteristic.form_obj().then(w => w.wnd.maximize());
        }
      }

      function rsvg_reload() {
        o && wnd && wnd.elmnts && wnd.elmnts.svgs && wnd.elmnts.svgs.reload(o);
      }

      function rsvg_click(ref, dbl) {
        const { production } = wnd.elmnts.grids;
        production && o.production.find_rows({ characteristic: ref }, row => {
          production.selectRow(row.row - 1, dbl === 0);
          dbl && open_builder();
          return false;
        });
      }

      /**
       * добавляет строку материала
       */
      function add_material() {
        const { production } = wnd.elmnts.grids;
        const row = o.create_product_row({ grid: production }).row - 1;
        setTimeout(() => {
          production.selectRow(row);
          production.selectCell(row, production.getColIndexById('nom'), false, true, true);
          production.cells().open_selection();
        });
      }
    };
  })($p);

  /**
   * форма выбора документов Расчет-заказ. публикуемый метод: doc.calc_order.form_selection(pwnd, attr)
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_calc_order_form_selection
   */

  $p.doc.calc_order.form_selection = function (pwnd, attr) {

    const wnd = this.constructor.prototype.form_selection.call(this, pwnd, attr);

    // настраиваем фильтр для списка заказов
    wnd.elmnts.filter.custom_selection._view = { get value() {
        return '';
      } };
    wnd.elmnts.filter.custom_selection._key = { get value() {
        return '';
      } };

    // картинка заказа в статусбаре
    wnd.do_not_maximize = true;
    wnd.elmnts.svgs = new $p.iface.OSvgs(wnd, wnd.elmnts.status_bar, (ref, dbl) => {
      if (dbl) {
        wnd && wnd.close();
        return pwnd.on_select && pwnd.on_select({ _block: ref });
      }
    });
    wnd.elmnts.grid.attachEvent("onRowSelect", rid => wnd.elmnts.svgs.reload(rid));

    setTimeout(() => {
      wnd.setDimension(900, 580);
      wnd.centerOnScreen();
    });

    return wnd;
  };

  /**
   * ### Отчеты по документу Расчет
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * Created 23.06.2016
   *
   * @module doc_calc_order_reports
   *
   */

  $p.doc.calc_order.__define({

    rep_invoice_execution: {
      value: function (rep) {

        var query_options = {
          reduce: true,
          limit: 10000,
          group: true,
          group_level: 3
        },
            res = {
          data: [],
          readOnly: true,
          colWidths: [180, 180, 200, 100, 100, 100, 100, 100],
          colHeaders: ['Контрагент', 'Организация', 'Заказ', 'Сумма', 'Оплачено', 'Долг', 'Отгружено', 'Отгрузить'],
          columns: [{ type: 'text' }, { type: 'text' }, { type: 'text' }, { type: 'numeric', format: '0 0.00' }, { type: 'numeric', format: '0 0.00' }, { type: 'numeric', format: '0 0.00' }, { type: 'numeric', format: '0 0.00' }, { type: 'numeric', format: '0 0.00' }],
          wordWrap: false
          //minSpareRows: 1
        };

        if (!$p.current_user.role_available("СогласованиеРасчетовЗаказов")) {
          //query_options.group_level = 3;
          query_options.startkey = [$p.current_user.partners_uids[0], ""];
          query_options.endkey = [$p.current_user.partners_uids[0], "\ufff0"];
        }

        return $p.wsql.pouch.remote.doc.query("server/invoice_execution", query_options).then(function (data) {

          var total = {
            invoice: 0,
            pay: 0,
            total_pay: 0,
            shipment: 0,
            total_shipment: 0
          };

          if (data.rows) {

            data.rows.forEach(function (row) {

              if (!row.value.total_pay && !row.value.total_shipment) return;

              res.data.push([$p.cat.partners.get(row.key[0]).presentation, $p.cat.organizations.get(row.key[1]).presentation, row.key[2], row.value.invoice, row.value.pay, row.value.total_pay, row.value.shipment, row.value.total_shipment]);

              total.invoice += row.value.invoice;
              total.pay += row.value.pay;
              total.total_pay += row.value.total_pay;
              total.shipment += row.value.shipment;
              total.total_shipment += row.value.total_shipment;
            });

            res.data.push(["Итого:", "", "", total.invoice, total.pay, total.total_pay, total.shipment, total.total_shipment]);

            res.mergeCells = [{ row: res.data.length - 1, col: 0, rowspan: 1, colspan: 3 }];
          }

          rep.requery(res);

          return res;
        });
      }
    },

    rep_planing: {
      value: function (rep, attr) {

        var date_from = $p.utils.date_add_day(new Date(), -1, true),
            date_till = $p.utils.date_add_day(date_from, 7, true),
            query_options = {
          reduce: true,
          limit: 10000,
          group: true,
          group_level: 5,
          startkey: [date_from.getFullYear(), date_from.getMonth() + 1, date_from.getDate(), ""],
          endkey: [date_till.getFullYear(), date_till.getMonth() + 1, date_till.getDate(), "\ufff0"]
        },
            res = {
          data: [],
          readOnly: true,
          wordWrap: false
          //minSpareRows: 1
        };

        return $p.wsql.pouch.remote.doc.query("server/planning", query_options).then(function (data) {

          if (data.rows) {

            var include_detales = $p.current_user.role_available("СогласованиеРасчетовЗаказов");

            data.rows.forEach(function (row) {

              if (!include_detales) {}

              res.data.push([new Date(row.key[0], row.key[1] - 1, row.key[2]), $p.cat.parameters_keys.get(row.key[3]), row.value.debit, row.value.credit, row.value.total]);
            });
          }

          rep.requery(res);

          return res;
        });
      }
    }

  });

  /**
   * ### Модуль менеджера и документа _Оплата платежной картой_
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_credit_card_order
   *
   * Created 10.10.2016
   */

  // перед записью рассчитываем итоги
  $p.DocCredit_card_order.prototype.before_save = function () {
    this.doc_amount = this.payment_details.aggregate([], 'amount');
  };

  /**
   * ### Модуль менеджера и документа _Платежное поручение входящее_
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_debit_bank_order
   *
   * Created 10.10.2016
   */

  // перед записью рассчитываем итоги
  $p.DocDebit_bank_order.prototype.before_save = function () {
    this.doc_amount = this.payment_details.aggregate([], 'amount');
  };

  /**
   * ### Модуль менеджера и документа _Приходный кассовый ордер_
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_debit_cash_order
   *
   * Created 10.10.2016
   */

  // перед записью рассчитываем итоги
  $p.DocDebit_cash_order.prototype.before_save = function () {
    this.doc_amount = this.payment_details.aggregate([], 'amount');
  };

  /**
   * ### Модуль менеджера и документа Установка цен номенклатуры
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_nom_prices_setup
   * Created 28.07.2016
   */

  // Переопределяем формирование списка выбора характеристики в табчасти документа установки цен
  $p.doc.nom_prices_setup.metadata().tabular_sections.goods.fields.nom_characteristic._option_list_local = true;

  /**
   * Обработчик при создании документа
   */
  $p.DocNom_prices_setup.prototype.after_create = function () {
    //Номер документа
    return this.new_number_doc();
  };

  // установим валюту и тип цен по умолчению при добавлении строки
  $p.DocNom_prices_setup.prototype.add_row = function (row) {
    if (row._owner.name === 'goods') {
      const { price_type } = row._owner._owner;
      row.price_type = price_type;
      row.currency = price_type.price_currency;
    }
  };

  // перед записью проверяем уникальность ключа
  $p.DocNom_prices_setup.prototype.before_save = function () {
    let aggr = this.goods.aggregate(['nom', 'nom_characteristic', 'price_type'], ['price'], 'COUNT', true),
        err;
    if (aggr.some(row => {
      if (row.price > 1) {
        err = row;
        return row.price > 1;
      }
    })) {
      $p.msg.show_msg({
        type: 'alert-warning',
        text: '<table style=\'text-align: left; width: 100%;\'><tr><td>Номенклатура</td><td>' + $p.cat.nom.get(err.nom).presentation + '</td></tr>' + '<tr><td>Характеристика</td><td>' + $p.cat.characteristics.get(err.nom_characteristic).presentation + '</td></tr>' + '<tr><td>Тип цен</td><td>' + $p.cat.nom_prices_types.get(err.price_type).presentation + '</td></tr></table>',
        title: 'Дубли строк'
      });

      return false;
    }
  };

  // Подписываемся на глобальное событие tabular_paste
  $p.on('tabular_paste', clip => {

    if (clip.grid && clip.obj && clip.obj._manager == $p.doc.nom_prices_setup) {

      var rows = [];

      clip.data.split('\n').map(function (row) {
        return row.split('\t');
      }).forEach(function (row) {

        if (row.length != 3) return;

        var nom = $p.cat.nom.by_name(row[0]);
        if (nom.empty()) nom = $p.cat.nom.by_id(row[0]);
        if (nom.empty()) nom = $p.cat.nom.find({ article: row[0] });
        if (!nom || nom.empty()) return;

        var characteristic = '';
        if (row[1]) {
          characteristic = $p.cat.characteristics.find({ owner: nom, name: row[1] });
          if (!characteristic || characteristic.empty()) characteristic = $p.cat.characteristics.find({ owner: nom, name: { like: row[1] } });
        }

        rows.push({
          nom: nom,
          nom_characteristic: characteristic,
          price: parseFloat(row[2].replace(',', '.')),
          price_type: clip.obj.price_type
        });
      });

      if (rows.length) {

        clip.grid.editStop();

        var first = clip.obj.goods.get(parseInt(clip.grid.getSelectedRowId()) - 1);

        rows.forEach(function (row) {
          if (first) {
            first._mixin(row);
            first = null;
          } else clip.obj.goods.add(row);
        });

        clip.obj.goods.sync_grid(clip.grid);

        clip.e.preventDefault();
        return $p.iface.cancel_bubble(e);
      }
    }
  });

  /**
   * ### Модуль менеджера и документа _Реализация товаров и услуг_
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module doc_selling
   *
   * Created 10.10.2016
   */

  // перед записью рассчитываем итоги
  $p.DocSelling.prototype.before_save = function () {
    this.doc_amount = this.goods.aggregate([], 'amount') + this.services.aggregate([], 'amount');
  };

  /**
   * ### Модуль Ценообразование
   * Аналог УПзП-шного __ЦенообразованиеСервер__
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   * @module  glob_pricing
   */

  /**
   * ### Ценообразование
   *
   * @class Pricing
   * @param $p {MetaEngine} - контекст
   * @static
   */
  class Pricing {

    constructor($p) {

      // подписываемся на событие после загрузки из pouchdb-ram и готовности предопределенных
      $p.md.once("predefined_elmnts_inited", () => {

        // грузим в ram цены номенклатуры
        this.by_range().then(() => {
          // излучаем событие "можно открывать формы"
          $p.adapters.pouch.emit('pouch_complete_loaded');
          // следим за изменениями документа установки цен, чтобы при необходимости обновить кеш
          $p.doc.nom_prices_setup.pouch_db.changes({
            since: 'now',
            live: true,
            include_docs: true,
            selector: { class_name: { $in: ['doc.nom_prices_setup', 'cat.formulas'] } }
          }).on('change', change => {
            // формируем новый
            if (change.doc.class_name == 'doc.nom_prices_setup') {
              setTimeout(() => {
                this.by_doc(change.doc);
              }, 1000);
            }
          });
        });
      });
    }

    build_cache(rows) {
      const { nom, currencies } = $p.cat;
      const note = 'Индекс цен номенклатуры';
      for (const _ref2 of rows) {
        const { key, value } = _ref2;

        if (!Array.isArray(value)) {
          return setTimeout(() => $p.iface.do_reload('', note), 1000);
        }
        const onom = nom.get(key[0], false, true);
        if (!onom || !onom._data) {
          $p.record_log({
            class: 'error',
            nom: key[0],
            note,
            value
          });
          continue;
        }
        if (!onom._data._price) {
          onom._data._price = {};
        }
        const { _price } = onom._data;

        if (!_price[key[1]]) {
          _price[key[1]] = {};
        }
        _price[key[1]][key[2]] = value.map(v => ({
          date: new Date(v.date),
          currency: currencies.get(v.currency),
          price: v.price
        }));
      }
    }

    /**
     * Перестраивает кеш цен номенклатуры по длинному ключу
     * @param startkey
     * @return {Promise.<TResult>|*}
     */
    by_range(startkey, step = 0) {

      return $p.doc.nom_prices_setup.pouch_db.query('doc/doc_nom_prices_setup_slice_last', {
        limit: 600,
        include_docs: false,
        startkey: startkey || [''],
        endkey: ['\ufff0'],
        reduce: true,
        group: true
      }).then(res => {
        this.build_cache(res.rows);
        step++;
        $p.adapters.pouch.emit('nom_prices', step);
        if (res.rows.length === 600) {
          return this.by_range(res.rows[res.rows.length - 1].key, step);
        }
      });
    }

    /**
     * Перестраивает кеш цен номенклатуры по массиву ключей
     * @param startkey
     * @return {Promise.<TResult>|*}
     */
    by_doc(doc) {
      const keys = doc.goods.map(({ nom, nom_characteristic, price_type }) => [nom, nom_characteristic, price_type]);
      return $p.doc.nom_prices_setup.pouch_db.query("doc/doc_nom_prices_setup_slice_last", {
        include_docs: false,
        keys: keys,
        reduce: true,
        group: true
      }).then(res => {
        this.build_cache(res.rows);
      });
    }

    /**
     * Возвращает цену номенклатуры по типу цен из регистра пзМаржинальныеКоэффициентыИСкидки
     * Если в маржинальных коэффициентах или номенклатуре указана формула - выполняет
     *
     * Аналог УПзП-шного __ПолучитьЦенуНоменклатуры__
     * @method nom_price
     * @param nom
     * @param characteristic
     * @param price_type
     * @param prm
     * @param row
     */
    nom_price(nom, characteristic, price_type, prm, row) {

      if (row && prm) {
        // _owner = calc_order
        const { _owner } = prm.calc_order_row._owner,
              price_prm = {
          price_type: price_type,
          characteristic: characteristic,
          date: _owner.date,
          currency: _owner.doc_currency
        };

        if (price_type == prm.price_type.price_type_first_cost && !prm.price_type.formula.empty()) {
          price_prm.formula = prm.price_type.formula;
        } else if (price_type == prm.price_type.price_type_sale && !prm.price_type.sale_formula.empty()) {
          price_prm.formula = prm.price_type.sale_formula;
        }
        if (!characteristic.clr.empty()) {
          price_prm.clr = characteristic.clr;
        }
        row.price = nom._price(price_prm);

        return row.price;
      }
    }

    /**
     * Возвращает структуру типов цен и КМарж
     * Аналог УПзП-шного __ПолучитьТипЦенНоменклатуры__
     * @method price_type
     * @param prm {Object}
     * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
     */
    price_type(prm) {

      // Рез = Новый Структура("КМарж, КМаржМин, КМаржВнутр, Скидка, СкидкаВнешн, НаценкаВнешн, ТипЦенСебестоимость, ТипЦенПрайс, ТипЦенВнутр,
      // 				|Формула, ФормулаПродажа, ФормулаВнутр, ФормулаВнешн",
      // 				1.9, 1.2, 1.5, 0, 10, 0, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, ТипЦенПоУмолчанию, "", "", "",);
      const { utils, job_prm, enm, ireg, cat } = $p;
      const empty_formula = cat.formulas.get();

      prm.price_type = {
        marginality: 1.9,
        marginality_min: 1.2,
        marginality_internal: 1.5,
        discount: 0,
        discount_external: 10,
        extra_charge_external: 0,
        price_type_first_cost: job_prm.pricing.price_type_first_cost,
        price_type_sale: job_prm.pricing.price_type_sale,
        price_type_internal: job_prm.pricing.price_type_first_cost,
        formula: empty_formula,
        sale_formula: empty_formula,
        internal_formula: empty_formula,
        external_formula: empty_formula
      };

      const { calc_order_row } = prm;
      const { nom, characteristic } = calc_order_row;
      const { partner } = calc_order_row._owner._owner;
      const filter = nom.price_group.empty() ? { price_group: nom.price_group } : { price_group: { in: [nom.price_group, cat.price_groups.get()] } };
      const ares = [];

      ireg.margin_coefficients.find_rows(filter, row => {

        // фильтруем по параметрам
        let ok = true;
        if (!row.key.empty()) {
          row.key.params.forEach(row_prm => {

            const { property } = row_prm;
            // для вычисляемых параметров выполняем формулу
            if (property.is_calculated) {
              ok = utils.check_compare(property.calculated_value({ calc_order_row }), property.extract_value(row_prm), row_prm.comparison_type, enm.comparison_types);
            }
            // заглушка для совместимости с УПзП
            else if (property.empty()) {
                const vpartner = cat.partners.get(row_prm._obj.value, false, true);
                if (vpartner && !vpartner.empty()) {
                  ok = vpartner == partner;
                }
              }
              // обычные параметры ищем в параметрах изделия
              else {
                  let finded;
                  characteristic.params.find_rows({
                    cnstr: 0,
                    param: property
                  }, row_x => {
                    finded = row_x;
                    return false;
                  });
                  if (finded) {
                    ok = utils.check_compare(finded.value, property.extract_value(row_prm), row_prm.comparison_type, enm.comparison_types);
                  } else {
                    ok = false;
                  }
                }
            if (!ok) {
              return false;
            }
          });
        }
        if (ok) {
          ares.push(row);
        }
      });

      // сортируем по приоритету и ценовой группе
      if (ares.length) {
        ares.sort((a, b) => {

          if (!a.key.empty() && b.key.empty() || a.key.priority > b.key.priority) {
            return -1;
          }
          if (a.key.empty() && !b.key.empty() || a.key.priority < b.key.priority) {
            return 1;
          }

          if (a.price_group.ref > b.price_group.ref) {
            return -1;
          }
          if (a.price_group.ref < b.price_group.ref) {
            return 1;
          }

          return 0;
        });
        Object.keys(prm.price_type).forEach(key => {
          prm.price_type[key] = ares[0][key];
        });
      }

      // если для контрагента установлена индивидуальная наценка, подмешиваем её в prm
      partner.extra_fields.find_rows({
        property: job_prm.pricing.dealer_surcharge
      }, row => {
        const val = parseFloat(row.value);
        if (val) {
          prm.price_type.extra_charge_external = val;
        }
        return false;
      });

      return prm.price_type;
    }

    /**
     * Рассчитывает плановую себестоимость строки документа Расчет
     * Если есть спецификация, расчет ведется по ней. Иначе - по номенклатуре строки расчета
     *
     * Аналог УПзП-шного __РассчитатьПлановуюСебестоимость__
     * @param prm {Object}
     * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
     */
    calc_first_cost(prm) {

      const { marginality_in_spec } = $p.job_prm.pricing;
      const fake_row = {};

      if (!prm.spec) return;

      // пытаемся рассчитать по спецификации
      if (prm.spec.count()) {
        prm.spec.forEach(row => {

          const { _obj, nom, characteristic } = row;

          this.nom_price(nom, characteristic, prm.price_type.price_type_first_cost, prm, _obj);
          _obj.amount = _obj.price * _obj.totqty1;

          if (marginality_in_spec) {
            fake_row.nom = nom;
            const tmp_price = this.nom_price(nom, characteristic, prm.price_type.price_type_sale, prm, fake_row);
            _obj.amount_marged = (tmp_price ? tmp_price : _obj.price) * _obj.totqty1;
          }
        });
        prm.calc_order_row.first_cost = prm.spec.aggregate([], ["amount"]).round(2);
      } else {
        // расчет себестомиости по номенклатуре строки расчета
        fake_row.nom = prm.calc_order_row.nom;
        fake_row.characteristic = prm.calc_order_row.characteristic;
        prm.calc_order_row.first_cost = this.nom_price(fake_row.nom, fake_row.characteristic, prm.price_type.price_type_first_cost, prm, fake_row);
      }

      // себестоимость вытянутых строк спецификации в заказ
      prm.order_rows && prm.order_rows.forEach(value => {
        const fake_prm = {
          spec: value.characteristic.specification,
          calc_order_row: value
        };
        this.price_type(fake_prm);
        this.calc_first_cost(fake_prm);
      });
    }

    /**
     * Рассчитывает стоимость продажи в строке документа Расчет
     *
     * Аналог УПзП-шного __РассчитатьСтоимостьПродажи__
     * @param prm {Object}
     * @param prm.calc_order_row {TabularSectionRow.doc.calc_order.production}
     */
    calc_amount(prm) {

      const { calc_order_row, price_type } = prm;
      const price_cost = $p.job_prm.pricing.marginality_in_spec && prm.spec.count() ? prm.spec.aggregate([], ["amount_marged"]) : this.nom_price(calc_order_row.nom, calc_order_row.characteristic, price_type.price_type_sale, prm, {});

      // цена продажи
      if (price_cost) {
        calc_order_row.price = price_cost.round(2);
      } else {
        calc_order_row.price = (calc_order_row.first_cost * price_type.marginality).round(2);
      }

      // КМарж в строке расчета
      calc_order_row.marginality = calc_order_row.first_cost ? calc_order_row.price * ((100 - calc_order_row.discount_percent) / 100) / calc_order_row.first_cost : 0;

      // Рассчитаем цену и сумму ВНУТР или ДИЛЕРСКУЮ цену и скидку
      let extra_charge = $p.wsql.get_user_param("surcharge_internal", "number");
      // если пересчет выполняется менеджером, используем наценку по умолчанию
      if (!$p.current_user.partners_uids.length || !extra_charge) {
        extra_charge = price_type.extra_charge_external || 0;
      }

      // TODO: учесть формулу
      calc_order_row.price_internal = (calc_order_row.price * (100 - calc_order_row.discount_percent) / 100 * (100 + extra_charge) / 100).round(2);

      // Эмулируем событие окончания редактирования, чтобы единообразно пересчитать строку табчасти
      !prm.hand_start && calc_order_row.value_change("price", {}, calc_order_row.price, true);

      // Цены и суммы вытянутых строк спецификации в заказ
      prm.order_rows && prm.order_rows.forEach(value => {
        const fake_prm = {
          spec: value.characteristic.specification,
          calc_order_row: value
        };
        this.price_type(fake_prm);
        this.calc_amount(fake_prm);
      });
    }

    /**
     * Пересчитывает сумму из валюты в валюту
     * @param amount {Number} - сумма к пересчету
     * @param date {Date} - дата курса
     * @param from - исходная валюта
     * @param [to] - конечная валюта
     * @return {Number}
     */
    from_currency_to_currency(amount, date, from, to) {

      const { main_currency } = $p.job_prm.pricing;

      if (!to || to.empty()) {
        to = main_currency;
      }
      if (!from || from.empty()) {
        from = main_currency;
      }
      if (from == to) {
        return amount;
      }
      if (!date) {
        date = new Date();
      }
      if (!this.cource_sql) {
        this.cource_sql = $p.wsql.alasql.compile("select top 1 * from `ireg_currency_courses` where `currency` = ? and `period` <= ? order by `period` desc");
      }

      let cfrom = { course: 1, multiplicity: 1 },
          cto = { course: 1, multiplicity: 1 };
      if (from != main_currency) {
        const tmp = this.cource_sql([from.ref, date]);
        if (tmp.length) cfrom = tmp[0];
      }
      if (to != main_currency) {
        const tmp = this.cource_sql([to.ref, date]);
        if (tmp.length) cto = tmp[0];
      }

      return amount * cfrom.course / cfrom.multiplicity * cto.multiplicity / cto.course;
    }

    /**
     * Выгружает в CouchDB изменённые в RAM справочники
     */
    cut_upload() {

      if (!$p.current_user.role_available("СогласованиеРасчетовЗаказов") && !$p.current_user.role_available("ИзменениеТехнологическойНСИ")) {
        $p.msg.show_msg({
          type: "alert-error",
          text: $p.msg.error_low_acl,
          title: $p.msg.error_rights
        });
        return true;
      }

      function upload_acc() {
        const mgrs = ["cat.users", "cat.individuals", "cat.organizations", "cat.partners", "cat.contracts", "cat.currencies", "cat.nom_prices_types", "cat.price_groups", "cat.cashboxes", "cat.partner_bank_accounts", "cat.organization_bank_accounts", "cat.projects", "cat.stores", "cat.cash_flow_articles", "cat.cost_items", "cat.price_groups", "cat.delivery_areas", "ireg.currency_courses", "ireg.margin_coefficients"];

        $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
          filter: doc => mgrs.indexOf(doc._id.split("|")[0]) != -1
        }).on('change', info => {
          //handle change

        }).on('paused', err => {
          // replication paused (e.g. replication up to date, user went offline)

        }).on('active', () => {
          // replicate resumed (e.g. new changes replicating, user went back online)

        }).on('denied', err => {
          // a document failed to replicate (e.g. due to permissions)
          $p.msg.show_msg(err.reason);
          $p.record_log(err);
        }).on('complete', info => {

          if ($p.current_user.role_available("ИзменениеТехнологическойНСИ")) upload_tech();else $p.msg.show_msg({
            type: "alert-info",
            text: $p.msg.sync_complite,
            title: $p.msg.sync_title
          });
        }).on('error', err => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);
        });
      }

      function upload_tech() {
        const mgrs = ["cat.units", "cat.nom", "cat.nom_groups", "cat.nom_units", "cat.nom_kinds", "cat.elm_visualization", "cat.destinations", "cat.property_values", "cat.property_values_hierarchy", "cat.inserts", "cat.insert_bind", "cat.color_price_groups", "cat.clrs", "cat.furns", "cat.cnns", "cat.production_params", "cat.parameters_keys", "cat.formulas", "cch.properties", "cch.predefined_elmnts"];

        $p.wsql.pouch.local.ram.replicate.to($p.wsql.pouch.remote.ram, {
          filter: doc => mgrs.indexOf(doc._id.split("|")[0]) != -1
        }).on('change', info => {
          //handle change

        }).on('paused', err => {
          // replication paused (e.g. replication up to date, user went offline)

        }).on('active', () => {
          // replicate resumed (e.g. new changes replicating, user went back online)

        }).on('denied', err => {
          // a document failed to replicate (e.g. due to permissions)
          $p.msg.show_msg(err.reason);
          $p.record_log(err);
        }).on('complete', info => {
          $p.msg.show_msg({
            type: "alert-info",
            text: $p.msg.sync_complite,
            title: $p.msg.sync_title
          });
        }).on('error', err => {
          $p.msg.show_msg(err.reason);
          $p.record_log(err);
        });
      }

      if ($p.current_user.role_available("СогласованиеРасчетовЗаказов")) upload_acc();else upload_tech();
    }

  }

  /**
   * ### Модуль Ценообразование
   * Аналог УПзП-шного __ЦенообразованиеСервер__ в контексте MetaEngine
   *
   * @property pricing
   * @type Pricing
   */
  $p.pricing = new Pricing($p);

  /**
   * Аналог УПзП-шного __ПостроительИзделийСервер__
   *
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module  glob_products_building
   * Created 26.05.2015
   */

  class ProductsBuilding {

    constructor(listen) {

      let added_cnn_spec, ox, spec, constructions, coordinates, cnn_elmnts, glass_specification, params;

      /**
       * СтрокаСоединений
       * @param elm1
       * @param elm2
       * @return {Number|DataObj}
       */
      function cnn_row(elm1, elm2) {
        let res = cnn_elmnts.find_rows({ elm1: elm1, elm2: elm2 });
        if (res.length) {
          return res[0].row;
        }
        res = cnn_elmnts.find_rows({ elm1: elm2, elm2: elm1 });
        if (res.length) {
          return res[0].row;
        }
        return 0;
      }

      /**
       * НадоДобавитьСпецификациюСоединения
       * @param cnn
       * @param elm1
       * @param elm2
       */
      function cnn_need_add_spec(cnn, elm1, elm2, point) {
        // соединения крест в стык обрабатываем по координатам, остальные - по паре элементов
        if (cnn && cnn.cnn_type == $p.enm.cnn_types.xx) {
          if (!added_cnn_spec.points) {
            added_cnn_spec.points = [];
          }
          for (let p of added_cnn_spec.points) {
            if (p.is_nearest(point, true)) {
              return false;
            }
          }
          added_cnn_spec.points.push(point);
          return true;
        } else if (!cnn || !elm1 || !elm2 || added_cnn_spec[elm1] == elm2 || added_cnn_spec[elm2] == elm1) {
          return false;
        }
        added_cnn_spec[elm1] = elm2;
        return true;
      }

      /**
       * ДополнитьСпецификациюСпецификациейСоединения
       * @method cnn_add_spec
       * @param cnn {_cat.Cnns}
       * @param elm {BuilderElement}
       * @param len_angl {Object}
       */
      function cnn_add_spec(cnn, elm, len_angl, cnn_other) {
        if (!cnn) {
          return;
        }
        const sign = cnn.cnn_type == $p.enm.cnn_types.Наложение ? -1 : 1;
        const { new_spec_row, calc_count_area_mass } = ProductsBuilding;

        cnn_filter_spec(cnn, elm, len_angl).forEach(row_cnn_spec => {

          const { nom } = row_cnn_spec;

          // TODO: nom может быть вставкой - в этом случае надо разузловать
          if (nom instanceof $p.CatInserts) {
            if (len_angl && (row_cnn_spec.sz || row_cnn_spec.coefficient)) {
              const tmp_len_angl = len_angl._clone();
              tmp_len_angl.len = (len_angl.len - sign * 2 * row_cnn_spec.sz) * (row_cnn_spec.coefficient || 0.001);
              nom.calculate_spec({ elm, len_angl: tmp_len_angl, ox });
            } else {
              nom.calculate_spec({ elm, len_angl, ox });
            }
          } else {

            const row_spec = new_spec_row({ row_base: row_cnn_spec, origin: len_angl.origin || cnn, elm, nom, spec, ox });

            // рассчитаем количество
            if (nom.is_pieces) {
              if (!row_cnn_spec.coefficient) {
                row_spec.qty = row_cnn_spec.quantity;
              } else {
                row_spec.qty = ((len_angl.len - sign * 2 * row_cnn_spec.sz) * row_cnn_spec.coefficient * row_cnn_spec.quantity - 0.5).round(nom.rounding_quantity);
              }
            } else {
              row_spec.qty = row_cnn_spec.quantity;

              // если указано cnn_other, берём не размер соединения, а размеры предыдущего и последующего
              if (row_cnn_spec.sz || row_cnn_spec.coefficient) {
                let sz = row_cnn_spec.sz,
                    finded,
                    qty;
                if (cnn_other) {
                  cnn_other.specification.find_rows({ nom }, row => {
                    sz += row.sz;
                    qty = row.quantity;
                    return !(finded = true);
                  });
                }
                if (!finded) {
                  sz *= 2;
                }
                if (!row_spec.qty && finded && len_angl.art1) {
                  row_spec.qty = qty;
                }
                row_spec.len = (len_angl.len - sign * sz) * (row_cnn_spec.coefficient || 0.001);
              }
            }

            // если указана формула - выполняем
            if (!row_cnn_spec.formula.empty()) {
              const qty = row_cnn_spec.formula.execute({
                ox,
                elm,
                len_angl,
                cnstr: 0,
                inset: $p.utils.blank.guid,
                row_cnn: row_cnn_spec,
                row_spec: row_spec
              });
              // если формула является формулой условия, используем результат, как фильтр
              if (row_cnn_spec.formula.condition_formula && !qty) {
                row_spec.qty = 0;
              }
            }
            calc_count_area_mass(row_spec, spec, len_angl, row_cnn_spec.angle_calc_method);
          }
        });
      }

      /**
       * ПолучитьСпецификациюСоединенияСФильтром
       * @param cnn
       * @param elm
       * @param len_angl
       */
      function cnn_filter_spec(cnn, elm, len_angl) {

        const res = [];
        const { angle_hor } = elm;
        const { art1, art2 } = $p.job_prm.nom;
        const { САртикулом1, САртикулом2 } = $p.enm.specification_installation_methods;
        const { check_params } = ProductsBuilding;

        const { cnn_type, specification, selection_params } = cnn;
        const { ii, xx, acn } = $p.enm.cnn_types;

        specification.each(row => {
          const { nom } = row;
          if (!nom || nom.empty() || nom == art1 || nom == art2) {
            return;
          }

          // только для прямых или только для кривых профилей
          if (row.for_direct_profile_only > 0 && !elm.is_linear() || row.for_direct_profile_only < 0 && elm.is_linear()) {
            return;
          }

          //TODO: реализовать фильтрацию
          if (cnn_type == ii) {
            if (row.amin > angle_hor || row.amax < angle_hor || row.sz_min > len_angl.len || row.sz_max < len_angl.len) {
              return;
            }
          } else {
            if (row.amin > len_angl.angle || row.amax < len_angl.angle) {
              return;
            }
          }

          // "устанавливать с" проверяем только для соединений профиля
          if (row.set_specification == САртикулом1 && len_angl.art2 || row.set_specification == САртикулом2 && len_angl.art1) {
            return;
          }
          // для угловых, разрешаем art2 только явно для art2
          if (len_angl.art2 && acn.a.indexOf(cnn_type) != -1 && row.set_specification != САртикулом2 && cnn_type != xx) {
            return;
          }

          // проверяем параметры изделия и добавляем, если проходит по ограничениям
          if (check_params({ params: selection_params, row_spec: row, elm, ox })) {
            res.push(row);
          }
        });

        return res;
      }

      /**
       * Спецификации фурнитуры
       * @param contour {Contour}
       */
      function furn_spec(contour) {

        // у рамных контуров фурнитуры не бывает
        if (!contour.parent) {
          return false;
        }

        // кеш сторон фурнитуры
        const { furn_cache, furn } = contour;
        const { new_spec_row, calc_count_area_mass } = ProductsBuilding;

        // проверяем, подходит ли фурнитура под геометрию контура
        if (!furn_check_opening_restrictions(contour, furn_cache)) {
          return;
        }

        // уточняем высоту ручки, т.к. от неё зависят координаты в спецификации
        contour.update_handle_height(furn_cache);

        // получаем спецификацию фурнитуры и переносим её в спецификацию изделия
        const blank_clr = $p.cat.clrs.get();
        furn.furn_set.get_spec(contour, furn_cache).each(row => {
          const elm = { elm: -contour.cnstr, clr: blank_clr };
          const row_spec = new_spec_row({ elm, row_base: row, origin: row.origin, spec, ox });

          if (row.is_procedure_row) {
            row_spec.elm = row.handle_height_min;
            row_spec.len = row.coefficient / 1000;
            row_spec.qty = 0;
            row_spec.totqty = 1;
            row_spec.totqty1 = 1;
          } else {
            row_spec.qty = row.quantity * (!row.coefficient ? 1 : row.coefficient);
            calc_count_area_mass(row_spec, spec);
          }
        });
      }

      /**
       * Проверяет ограничения открывания, добавляет визуализацию ошибок
       * @param contour {Contour}
       * @param cache {Object}
       * @return {boolean}
       */
      function furn_check_opening_restrictions(contour, cache) {

        let ok = true;
        const { new_spec_row } = ProductsBuilding;

        // TODO: реализовать проверку по количеству сторон

        // проверка геометрии
        contour.furn.open_tunes.each(row => {
          const elm = contour.profile_by_furn_side(row.side, cache);
          const len = elm._row.len - 2 * elm.nom.sizefurn;

          // angle_hor = elm.angle_hor; TODO: реализовать проверку углов

          if (len < row.lmin || len > row.lmax || !elm.is_linear() && !row.arc_available) {
            new_spec_row({ elm, row_base: { clr: $p.cat.clrs.get(), nom: $p.job_prm.nom.furn_error }, origin: contour.furn, spec, ox });
            ok = false;
          }
        });

        return ok;
      }

      /**
       * Спецификации соединений примыкающих профилей
       * @param elm {Profile}
       */
      function cnn_spec_nearest(elm) {
        const nearest = elm.nearest();
        if (nearest && nearest._row.clr != $p.cat.clrs.predefined('НеВключатьВСпецификацию') && elm._attr._nearest_cnn) {
          cnn_add_spec(elm._attr._nearest_cnn, elm, {
            angle: 0,
            alp1: 0,
            alp2: 0,
            len: elm._attr._len,
            origin: cnn_row(elm.elm, nearest.elm)
          });
        }
      }

      /**
       * Спецификация профиля
       * @param elm {Profile}
       */
      function base_spec_profile(elm) {

        const { _row, rays } = elm;

        if (_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
          return;
        }

        const { b, e } = rays;

        if (!b.cnn || !e.cnn) {
          return;
        }
        b.check_err();
        e.check_err();

        const prev = b.profile;
        const next = e.profile;
        const row_cnn_prev = b.cnn.main_row(elm);
        const row_cnn_next = e.cnn.main_row(elm);
        const { new_spec_row, calc_count_area_mass } = ProductsBuilding;

        let row_spec;

        // добавляем строку спецификации
        const row_cnn = row_cnn_prev || row_cnn_next;
        if (row_cnn) {

          row_spec = new_spec_row({ elm, row_base: row_cnn, nom: _row.nom, origin: cnn_row(_row.elm, prev ? prev.elm : 0), spec, ox });
          row_spec.qty = row_cnn.quantity;

          // уточняем размер
          const seam = $p.enm.angle_calculating_ways.СварнойШов;
          const d45 = Math.sin(Math.PI / 4);
          const dprev = row_cnn_prev ? row_cnn_prev.angle_calc_method == seam && _row.alp1 > 0 ? row_cnn_prev.sz * d45 / Math.sin(_row.alp1 / 180 * Math.PI) : row_cnn_prev.sz : 0;
          const dnext = row_cnn_next ? row_cnn_next.angle_calc_method == seam && _row.alp2 > 0 ? row_cnn_next.sz * d45 / Math.sin(_row.alp2 / 180 * Math.PI) : row_cnn_next.sz : 0;

          row_spec.len = (_row.len - dprev - dnext) * ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

          // profile._len - то, что получится после обработки
          // row_spec.len - сколько взять (отрезать)
          elm._attr._len = _row.len;
          _row.len = (_row.len - (!row_cnn_prev || row_cnn_prev.angle_calc_method == seam ? 0 : row_cnn_prev.sz) - (!row_cnn_next || row_cnn_next.angle_calc_method == seam ? 0 : row_cnn_next.sz)) * 1000 * ((row_cnn_prev ? row_cnn_prev.coefficient : 0.001) + (row_cnn_next ? row_cnn_next.coefficient : 0.001)) / 2;

          // припуск для гнутых элементов
          if (!elm.is_linear()) {
            row_spec.len = row_spec.len + _row.nom.arc_elongation / 1000;
          }

          // дополнительная корректировка формулой - здесь можно изменить размер, номенклатуру и вообще, что угодно в спецификации
          if (row_cnn_prev && !row_cnn_prev.formula.empty()) {
            row_cnn_prev.formula.execute({
              ox: ox,
              elm: elm,
              cnstr: 0,
              inset: $p.utils.blank.guid,
              row_cnn: row_cnn_prev,
              row_spec: row_spec
            });
          } else if (row_cnn_next && !row_cnn_next.formula.empty()) {
            row_cnn_next.formula.execute({
              ox: ox,
              elm: elm,
              cnstr: 0,
              inset: $p.utils.blank.guid,
              row_cnn: row_cnn_next,
              row_spec: row_spec
            });
          }

          // РассчитатьКоличествоПлощадьМассу
          const angle_calc_method_prev = row_cnn_prev ? row_cnn_prev.angle_calc_method : null;
          const angle_calc_method_next = row_cnn_next ? row_cnn_next.angle_calc_method : null;
          const { СоединениеПополам, Соединение } = $p.enm.angle_calculating_ways;
          calc_count_area_mass(row_spec, spec, _row, angle_calc_method_prev, angle_calc_method_next, angle_calc_method_prev == СоединениеПополам || angle_calc_method_prev == Соединение ? prev.generatrix.angle_to(elm.generatrix, b.point) : 0, angle_calc_method_next == СоединениеПополам || angle_calc_method_next == Соединение ? elm.generatrix.angle_to(next.generatrix, e.point) : 0);
        }

        // добавляем спецификации соединений
        const len_angl = {
          angle: 0,
          alp1: prev ? prev.generatrix.angle_to(elm.generatrix, elm.b, true) : 90,
          alp2: next ? elm.generatrix.angle_to(next.generatrix, elm.e, true) : 90,
          len: row_spec ? row_spec.len * 1000 : _row.len,
          art1: false,
          art2: true
        };
        if (cnn_need_add_spec(b.cnn, _row.elm, prev ? prev.elm : 0, b.point)) {

          len_angl.angle = len_angl.alp2;

          // для ТОбразного и Незамкнутого контура надо рассчитать еще и с другой стороны
          if (b.cnn.cnn_type == $p.enm.cnn_types.t || b.cnn.cnn_type == $p.enm.cnn_types.i || b.cnn.cnn_type == $p.enm.cnn_types.xx) {
            if (cnn_need_add_spec(e.cnn, next ? next.elm : 0, _row.elm, e.point)) {
              cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
            }
          }
          // для угловых, добавляем из e.cnn строки с {art2: true}
          else {
              cnn_add_spec(e.cnn, elm, len_angl, b.cnn);
            }

          // спецификацию с предыдущей стороны рассчитваем всегда
          len_angl.angle = len_angl.alp1;
          len_angl.art2 = false;
          len_angl.art1 = true;
          cnn_add_spec(b.cnn, elm, len_angl, e.cnn);
        }

        // спецификация вставки
        elm.inset.calculate_spec({ elm, ox });

        // если у профиля есть примыкающий родительский элемент, добавим спецификацию II соединения
        cnn_spec_nearest(elm);

        // если у профиля есть доборы, добавляем их спецификации
        elm.addls.forEach(base_spec_profile);

        // спецификация вложенных в элемент вставок
        ox.inserts.find_rows({ cnstr: -elm.elm }, ({ inset, clr }) => {

          // если во вставке указано создавать продукцию, создаём
          if (inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
            $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
          }

          len_angl.origin = inset;
          len_angl.angle = elm.angle_hor;
          len_angl.cnstr = elm.layer.cnstr;
          delete len_angl.art1;
          delete len_angl.art2;
          inset.calculate_spec({ elm, len_angl, ox });
        });
      }

      /**
       * Спецификация сечения (водоотлива)
       * @param elm {Sectional}
       */
      function base_spec_sectional(elm) {

        const { _row, _attr, inset, layer } = elm;

        if (_row.nom.empty() || _row.nom.is_service || _row.nom.is_procedure || _row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
          return;
        }

        // во время расчетов возможна подмена объекта спецификации
        const spec_tmp = spec;

        // спецификация вставки
        inset.calculate_spec({ elm, ox });

        // спецификация вложенных в элемент вставок
        ox.inserts.find_rows({ cnstr: -elm.elm }, ({ inset, clr }) => {

          // если во вставке указано создавать продукцию, создаём
          if (inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
            // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
            const cx = Object.assign(ox.find_create_cx(elm.elm, inset.ref), inset.contour_attrs(layer));
            ox._order_rows.push(cx);
            spec = cx.specification.clear();
          }

          // рассчитаем спецификацию вставки
          const len_angl = {
            angle: 0,
            alp1: 0,
            alp2: 0,
            len: 0,
            origin: inset,
            cnstr: layer.cnstr
          };
          inset.calculate_spec({ elm, len_angl, ox, spec });
        });

        // восстанавливаем исходную ссылку объекта спецификации
        spec = spec_tmp;
      }

      /**
       * Спецификация заполнения
       * @param elm {Filling}
       */
      function base_spec_glass(elm) {

        const { profiles, imposts, _row } = elm;

        if (_row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
          return;
        }

        const glength = profiles.length;

        // для всех рёбер заполнения
        for (let i = 0; i < glength; i++) {
          const curr = profiles[i];

          if (curr.profile && curr.profile._row.clr == $p.cat.clrs.predefined('НеВключатьВСпецификацию')) {
            return;
          }

          const prev = (i == 0 ? profiles[glength - 1] : profiles[i - 1]).profile;
          const next = (i == glength - 1 ? profiles[0] : profiles[i + 1]).profile;
          const row_cnn = cnn_elmnts.find_rows({ elm1: _row.elm, elm2: curr.profile.elm });

          const len_angl = {
            angle: 0,
            alp1: prev.generatrix.angle_to(curr.profile.generatrix, curr.b, true),
            alp2: curr.profile.generatrix.angle_to(next.generatrix, curr.e, true),
            len: row_cnn.length ? row_cnn[0].aperture_len : 0,
            origin: cnn_row(_row.elm, curr.profile.elm)

          };

          // добавляем спецификацию соединения рёбер заполнения с профилем
          cnn_add_spec(curr.cnn, curr.profile, len_angl);
        }

        // добавляем спецификацию вставки в заполнение
        elm.inset.calculate_spec({ elm, ox });

        // для всех раскладок заполнения
        imposts.forEach(base_spec_profile);

        // спецификация вложенных в элемент вставок
        ox.inserts.find_rows({ cnstr: -elm.elm }, ({ inset, clr }) => {
          // если во вставке указано создавать продукцию, создаём
          if (inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
            $p.record_log('inset_elm_spec: specification_order_row_types.Продукция');
          }
          inset.calculate_spec({ elm, ox });
        });
      }

      /**
       * Спецификация вставок в контур
       * @param contour
       */
      function inset_contour_spec(contour) {

        // во время расчетов возможна подмена объекта спецификации
        const spec_tmp = spec;

        ox.inserts.find_rows({ cnstr: contour.cnstr }, ({ inset, clr }) => {

          // если во вставке указано создавать продукцию, создаём
          if (inset.is_order_row == $p.enm.specification_order_row_types.Продукция) {
            // характеристику ищем в озу, в indexeddb не лезем, если нет в озу - создаём и дозаполняем реквизиты характеристики
            const cx = Object.assign(ox.find_create_cx(-contour.cnstr, inset.ref), inset.contour_attrs(contour));
            ox._order_rows.push(cx);
            spec = cx.specification.clear();
          }

          // рассчитаем спецификацию вставки
          const elm = {
            _row: {},
            elm: 0,
            clr: clr,
            layer: contour
          };
          const len_angl = {
            angle: 0,
            alp1: 0,
            alp2: 0,
            len: 0,
            origin: inset,
            cnstr: contour.cnstr
          };
          inset.calculate_spec({ elm, len_angl, ox, spec });
        });

        // восстанавливаем исходную ссылку объекта спецификации
        spec = spec_tmp;
      }

      /**
       * Основная cпецификация по соединениям и вставкам таблицы координат
       * @param scheme {Scheme}
       */
      function base_spec(scheme) {

        const { Contour, Filling, Sectional, Profile, ProfileConnective } = $p.Editor;

        // сбрасываем структуру обработанных соединений
        added_cnn_spec = {};

        // для всех контуров изделия
        for (const contour of scheme.getItems({ class: Contour })) {

          // для всех профилей контура
          for (const elm of contour.children) {
            elm instanceof Profile && base_spec_profile(elm);
          }

          for (const elm of contour.children) {
            if (elm instanceof Filling) {
              // для всех заполнений контура
              base_spec_glass(elm);
            } else if (elm instanceof Sectional) {
              // для всех разрезов (водоотливов)
              base_spec_sectional(elm);
            }
          }

          // фурнитура контура
          furn_spec(contour);

          // спецификация вставок в контур
          inset_contour_spec(contour);
        }

        // для всех соединительных профилей
        for (const elm of scheme.l_connective.children) {
          if (elm instanceof ProfileConnective) {
            base_spec_profile(elm);
          }
        }

        // спецификация вставок в изделие
        inset_contour_spec({
          cnstr: 0,
          project: scheme,
          get perimeter() {
            return this.project.perimeter;
          }
        });
      }

      /**
       * Пересчет спецификации при записи изделия
       */
      this.recalc = function (scheme, attr) {

        //console.time("base_spec");
        //console.profile();


        // ссылки для быстрого доступа к свойствам объекта продукции
        ox = scheme.ox;
        spec = ox.specification;
        constructions = ox.constructions;
        coordinates = ox.coordinates;
        cnn_elmnts = ox.cnn_elmnts;
        glass_specification = ox.glass_specification;
        params = ox.params;

        // чистим спецификацию
        spec.clear();

        // массив продукций к добавлению в заказ
        ox._order_rows = [];

        // рассчитываем базовую сецификацию
        base_spec(scheme);

        // сворачиваем
        spec.group_by('nom,clr,characteristic,len,width,s,elm,alp1,alp2,origin,dop', 'qty,totqty,totqty1');

        //console.timeEnd("base_spec");
        //console.profileEnd();

        // информируем мир об окончании расчета координат
        scheme.draw_visualization();
        scheme.notify(scheme, 'coordinates_calculated', attr);

        // производим корректировку спецификации с возможным вытягиванием строк в заказ и удалением строк из заказа
        // внутри корректировки будут рассчитаны цены продажи и плановой себестоимости
        if (ox.calc_order_row) {
          $p.spec_building.specification_adjustment({
            scheme: scheme,
            calc_order_row: ox.calc_order_row,
            spec: spec,
            save: attr.save
          }, true);
        }

        // информируем мир о завершении пересчета
        if (attr.snapshot) {
          scheme.notify(scheme, 'scheme_snapshot', attr);
        }

        // информируем мир о записи продукции
        if (attr.save) {

          // console.time("save");
          // console.profile();

          // сохраняем картинку вместе с изделием
          ox.save(undefined, undefined, {
            svg: {
              content_type: 'image/svg+xml',
              data: new Blob([scheme.get_svg()], { type: 'image/svg+xml' })
            }
          }).then(() => {
            $p.msg.show_msg([ox.name, 'Спецификация рассчитана']);
            delete scheme._attr._saving;
            ox.calc_order.characteristic_saved(scheme, attr);
            scheme._scope.eve.emit('characteristic_saved', scheme, attr);

            // console.timeEnd("save");
            // console.profileEnd();
          }).then(() => setTimeout(() => {
            ox.calc_order._modified && ox.calc_order.save();
          }, 1000)).catch(ox => {

            // console.timeEnd("save");
            // console.profileEnd();

            $p.record_log(ox);
            delete scheme._attr._saving;
            if (ox._data && ox._data._err) {
              $p.msg.show_msg(ox._data._err);
              delete ox._data._err;
            }
          });
        } else {
          delete scheme._attr._saving;
        }

        ox._data._loading = false;
      };
    }

    /**
     * Проверяет соответствие параметров отбора параметрам изделия
     * @param params {TabularSection} - табчасть параметров вставки или соединения
     * @param row_spec {TabularSectionRow}
     * @param elm {BuilderElement}
     * @param [cnstr] {Number} - номер конструкции или элемента
     * @return {boolean}
     */
    static check_params({ params, row_spec, elm, cnstr, origin, ox }) {

      let ok = true;

      // режем параметры по элементу
      params.find_rows({ elm: row_spec.elm }, prm_row => {
        // выполнение условия рассчитывает объект CchProperties
        ok = prm_row.param.check_condition({ row_spec, prm_row, elm, cnstr, origin, ox });
        if (!ok) {
          return false;
        }
      });

      return ok;
    }

    /**
     * Добавляет или заполняет строку спецификации
     * @param row_spec
     * @param elm
     * @param row_base
     * @param spec
     * @param [nom]
     * @param [origin]
     * @return {TabularSectionRow.cat.characteristics.specification}
     */
    static new_spec_row({ row_spec, elm, row_base, nom, origin, spec, ox }) {
      if (!row_spec) {
        // row_spec = this.ox.specification.add();
        row_spec = spec.add();
      }
      row_spec.nom = nom || row_base.nom;
      if (!row_spec.nom.visualization.empty()) {
        row_spec.dop = -1;
      } else if (row_spec.nom.is_procedure) {
        row_spec.dop = -2;
      }
      row_spec.characteristic = row_base.nom_characteristic;
      if (!row_spec.characteristic.empty() && row_spec.characteristic.owner != row_spec.nom) {
        row_spec.characteristic = $p.utils.blank.guid;
      }
      row_spec.clr = $p.cat.clrs.by_predefined(row_base ? row_base.clr : elm.clr, elm.clr, ox.clr, elm, spec);
      row_spec.elm = elm.elm;
      if (origin) {
        row_spec.origin = origin;
      }
      return row_spec;
    }

    /**
     * РассчитатьQtyLen
     * @param row_spec
     * @param row_base
     * @param len
     */
    static calc_qty_len(row_spec, row_base, len) {

      const { nom } = row_spec;

      if (nom.cutting_optimization_type == $p.enm.cutting_optimization_types.Нет || nom.cutting_optimization_type.empty() || nom.is_pieces) {
        if (!row_base.coefficient || !len) {
          row_spec.qty = row_base.quantity;
        } else {
          if (!nom.is_pieces) {
            row_spec.qty = row_base.quantity;
            row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
            if (nom.rounding_quantity) {
              row_spec.qty = (row_spec.qty * row_spec.len).round(nom.rounding_quantity);
              row_spec.len = 0;
            }
            ;
          } else if (!nom.rounding_quantity) {
            row_spec.qty = Math.round((len - row_base.sz) * row_base.coefficient * row_base.quantity - 0.5);
          } else {
            row_spec.qty = ((len - row_base.sz) * row_base.coefficient * row_base.quantity).round(nom.rounding_quantity);
          }
        }
      } else {
        row_spec.qty = row_base.quantity;
        row_spec.len = (len - row_base.sz) * (row_base.coefficient || 0.001);
      }
    }

    /**
     * РассчитатьКоличествоПлощадьМассу
     * @param row_spec
     * @param row_coord
     */
    static calc_count_area_mass(row_spec, spec, row_coord, angle_calc_method_prev, angle_calc_method_next, alp1, alp2) {

      if (!row_spec.qty) {
        // dop=-1 - визуализация, dop=-2 - техоперация,
        if (row_spec.dop >= 0) {
          spec.del(row_spec.row - 1, true);
        }
        return;
      }

      // если свойства уже рассчитаны в формуле, пересчет не выполняем
      if (row_spec.totqty1 && row_spec.totqty) {
        return;
      }

      //TODO: учесть angle_calc_method
      if (!angle_calc_method_next) {
        angle_calc_method_next = angle_calc_method_prev;
      }

      if (angle_calc_method_prev && !row_spec.nom.is_pieces) {

        const { Основной, СварнойШов, СоединениеПополам, Соединение, _90 } = $p.enm.angle_calculating_ways;

        if (angle_calc_method_prev == Основной || angle_calc_method_prev == СварнойШов) {
          row_spec.alp1 = row_coord.alp1;
        } else if (angle_calc_method_prev == _90) {
          row_spec.alp1 = 90;
        } else if (angle_calc_method_prev == СоединениеПополам) {
          row_spec.alp1 = (alp1 || row_coord.alp1) / 2;
        } else if (angle_calc_method_prev == Соединение) {
          row_spec.alp1 = alp1 || row_coord.alp1;
        }

        if (angle_calc_method_next == Основной || angle_calc_method_next == СварнойШов) {
          row_spec.alp2 = row_coord.alp2;
        } else if (angle_calc_method_next == _90) {
          row_spec.alp2 = 90;
        } else if (angle_calc_method_next == СоединениеПополам) {
          row_spec.alp2 = (alp2 || row_coord.alp2) / 2;
        } else if (angle_calc_method_next == Соединение) {
          row_spec.alp2 = alp2 || row_coord.alp2;
        }
      }

      if (row_spec.len) {
        if (row_spec.width && !row_spec.s) {
          row_spec.s = row_spec.len * row_spec.width;
        }
      } else {
        row_spec.s = 0;
      }

      if (row_spec.s) {
        row_spec.totqty = row_spec.qty * row_spec.s;
      } else if (row_spec.len) {
        row_spec.totqty = row_spec.qty * row_spec.len;
      } else {
        row_spec.totqty = row_spec.qty;
      }

      row_spec.totqty1 = row_spec.totqty * row_spec.nom.loss_factor;

      ['len', 'width', 's', 'qty', 'alp1', 'alp2'].forEach(fld => row_spec[fld] = row_spec[fld].round(4));
      ['totqty', 'totqty1'].forEach(fld => row_spec[fld] = row_spec[fld].round(6));
    }

  }

  $p.ProductsBuilding = ProductsBuilding;
  $p.products_building = new ProductsBuilding(true);

  /* eslint-disable no-multiple-empty-lines,space-infix-ops */
  /**
   * Аналог УПзП-шного __ФормированиеСпецификацийСервер__
   * Содержит методы расчета спецификации без привязки к построителю. Например, по регистру корректировки спецификации
   *
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module  glob_spec_building
   * Created 26.05.2015
   */

  class SpecBuilding {

    constructor($p) {}

    /**
     * Рассчитывает спецификацию в строке документа Расчет
     * Аналог УПзП-шного __РассчитатьСпецификациюСтроки__
     * @param prm
     * @param cancel
     */
    calc_row_spec(prm, cancel) {}

    /**
     * Аналог УПзП-шного РассчитатьСпецификацию_ПривязкиВставок
     * @param attr {Object}
     * @param with_price {Boolean}
     */
    specification_adjustment(attr, with_price) {

      const { scheme, calc_order_row, spec, save } = attr;
      const calc_order = calc_order_row._owner._owner;
      const order_rows = new Map();
      const adel = [];
      const ox = calc_order_row.characteristic;
      const nom = ox.empty() ? calc_order_row.nom : calc_order_row.nom = ox.owner;

      // типы цен получаем заранее, т.к. они могут пригодиться при расчете корректировки спецификации
      $p.pricing.price_type(attr);

      // удаляем из спецификации строки, добавленные предыдущими корректировками
      spec.find_rows({ ch: { in: [-1, -2] } }, row => adel.push(row));
      adel.forEach(row => spec.del(row, true));

      // находим привязанные к продукции вставки и выполняем
      // здесь может быть как расчет допспецификации, так и доппроверки корректности параметров и геометрии
      $p.cat.insert_bind.insets(ox).forEach(({ inset, elm_type }) => {

        const elm = {
          _row: {},
          elm: 0,
          get perimeter() {
            return scheme ? scheme.perimeter : [];
          },
          clr: ox.clr,
          project: scheme
        };
        const len_angl = {
          angle: 0,
          alp1: 0,
          alp2: 0,
          len: 0,
          cnstr: 0,
          origin: inset
        };
        // рассчитаем спецификацию вставки
        inset.calculate_spec({ elm, len_angl, ox, spec });
      });

      // синхронизируем состав строк - сначала удаляем лишние
      if (!ox.empty()) {
        adel.length = 0;
        calc_order.production.forEach(row => {
          if (row.ordn === ox) {
            if (ox._order_rows.indexOf(row.characteristic) === -1) {
              adel.push(row);
            } else {
              order_rows.set(row.characteristic, row);
            }
          }
        });
        adel.forEach(row => calc_order.production.del(row.row - 1));
      }

      const ax = [];

      // затем, добавляем в заказ строки, назначенные к вытягиванию
      ox._order_rows && ox._order_rows.forEach(cx => {
        const row = order_rows.get(cx) || calc_order.production.add({ characteristic: cx });
        row.nom = cx.owner;
        row.unit = row.nom.storage_unit;
        row.ordn = ox;
        row.len = cx.x;
        row.width = cx.y;
        row.s = cx.s;
        row.qty = calc_order_row.qty;
        row.quantity = calc_order_row.quantity;

        save && ax.push(cx.save().catch($p.record_log));
        order_rows.set(cx, row);
      });
      if (order_rows.size) {
        attr.order_rows = order_rows;
      }

      if (with_price) {
        // рассчитываем плановую себестоимость
        $p.pricing.calc_first_cost(attr);

        // рассчитываем стоимость продажи
        $p.pricing.calc_amount(attr);
      }

      if (save && !attr.scheme && (ox.is_new() || ox._modified)) {
        ax.push(ox.save().catch($p.record_log));
      }

      return ax;
    }

  }

  // Экспортируем экземпляр модуля
  $p.spec_building = new SpecBuilding($p);

  /**
   * Составной тип в поле trans документов оплаты и отгрузки
   * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2018
   *
   * @module glob_value_mgr
   *
   * Created 10.10.2016
   */

  (function ({ prototype }) {
    const { value_mgr } = prototype;
    prototype.value_mgr = function (row, f, mf, array_enabled, v) {
      const tmp = value_mgr.call(this, row, f, mf, array_enabled, v);
      if (tmp) {
        return tmp;
      }
      if (f == 'trans') {
        return $p.doc.calc_order;
      } else if (f == 'partner') {
        return $p.cat.partners;
      }
    };
  })($p.classes.DataManager);

  return $p;
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// конфигурация подключения к CouchDB
const config = __webpack_require__(16);

/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы по умолчанию из package.json
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */
module.exports = prm => {

  const base = config(prm);
  return Object.assign(base, {

    // авторизация couchdb
    user_node: {
      username: process.env.DBUSER || 'admin',
      password: process.env.DBPWD || 'admin'
    },

    couch_direct: true,

    couch_path: base.couch_local,

    // по умолчанию, обращаемся к зоне 25
    zone: process.env.ZONE || 25

  });
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * ### При установке параметров сеанса
 * Процедура устанавливает параметры работы программы при старте веб-приложения
 *
 * @param prm {Object} - в свойствах этого объекта определяем параметры работы программы
 */
module.exports = function settings(prm) {

  return Object.assign(prm || {}, {

    // разделитель для localStorage
    local_storage_prefix: "wb_",

    // гостевые пользователи для демо-режима
    guests: [],

    // если понадобится обратиться к 1С, будем использовать irest
    irest_enabled: true,

    // расположение rest-сервиса 1c по умолчанию
    rest_path: "",

    // расположение couchdb
    couch_path: process.env.COUCHPATH || "/couchdb/wb_",
    //couch_path: "https://light.oknosoft.ru/couchdb/wb_" || "http://cou200:5984/wb_",

    // расположение couchdb для nodejs
    couch_local: process.env.COUCHLOCAL || "https://crystallit.oknosoft.ru/couchdb/wb_",

    pouch_filter: {
      meta: "auth/meta"
    },

    // по умолчанию, обращаемся к зоне 1
    zone: 1,

    // объявляем номер демо-зоны
    zone_demo: 1,

    // размер вложений
    attachment_max_size: 10000000,

    // разрешаем сохранение пароля
    enable_save_pwd: true

  });
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* eslint-disable */module.exports=function meta($p){$p.wsql.alasql('USE md; CREATE TABLE IF NOT EXISTS `ireg_margin_coefficients` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `price_group` CHAR, `key` CHAR, `condition_formula` CHAR, `marginality` FLOAT, `marginality_min` FLOAT, `marginality_internal` FLOAT, `price_type_first_cost` CHAR, `price_type_sale` CHAR, `price_type_internal` CHAR, `formula` CHAR, `sale_formula` CHAR, `internal_formula` CHAR, `external_formula` CHAR, `extra_charge_external` FLOAT, `discount_external` FLOAT, `discount` FLOAT, `note` CHAR); CREATE TABLE IF NOT EXISTS `ireg_currency_courses` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `currency` CHAR, `period` Date, `course` FLOAT, `multiplicity` INT); CREATE TABLE IF NOT EXISTS `ireg_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `invoice` CHAR, `state` CHAR, `event_date` Date, `СуммаОплаты` FLOAT, `ПроцентОплаты` INT, `СуммаОтгрузки` FLOAT, `ПроцентОтгрузки` INT, `СуммаДолга` FLOAT, `ПроцентДолга` INT, `ЕстьРасхожденияОрдерНакладная` BOOLEAN); CREATE TABLE IF NOT EXISTS `ireg_log_view` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `key` CHAR, `user` CHAR); CREATE TABLE IF NOT EXISTS `ireg_log` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, `date` INT, `sequence` INT, `class` CHAR, `note` CHAR, `obj` CHAR, `user` CHAR); CREATE TABLE IF NOT EXISTS `doc_planning_event` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `phase` CHAR, `key` CHAR, `recipient` CHAR, `trans` CHAR, `partner` CHAR, `project` CHAR, `Основание` CHAR, `note` CHAR, `ts_executors` JSON, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_nom_prices_setup` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `price_type` CHAR, `currency` CHAR, `responsible` CHAR, `note` CHAR, `ts_goods` JSON); CREATE TABLE IF NOT EXISTS `doc_selling` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_debit_cash_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `cashbox` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_debit_bank_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_work_centers_performance` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `start_date` Date, `expiration_date` Date, `responsible` CHAR, `note` CHAR, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_credit_card_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_payment_details` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_calc_order` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `number_internal` CHAR, `project` CHAR, `organization` CHAR, `partner` CHAR, `client_of_dealer` CHAR, `contract` CHAR, `bank_account` CHAR, `note` CHAR, `manager` CHAR, `leading_manager` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `amount_operation` FLOAT, `amount_internal` FLOAT, `accessory_characteristic` CHAR, `sys_profile` CHAR, `sys_furn` CHAR, `phone` CHAR, `delivery_area` CHAR, `shipping_address` CHAR, `coordinates` CHAR, `address_fields` CHAR, `difficult` BOOLEAN, `vat_consider` BOOLEAN, `vat_included` BOOLEAN, `settlements_course` FLOAT, `settlements_multiplicity` INT, `extra_charge_external` FLOAT, `obj_delivery_state` CHAR, `category` CHAR, `ts_production` JSON, `ts_extra_fields` JSON, `ts_contact_information` JSON, `ts_planning` JSON); CREATE TABLE IF NOT EXISTS `doc_work_centers_task` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `key` CHAR, `recipient` CHAR, `biz_cuts` INT, `responsible` CHAR, `note` CHAR, `ts_planning` JSON, `ts_demand` JSON, `ts_Обрезь` JSON, `ts_Раскрой` JSON); CREATE TABLE IF NOT EXISTS `doc_purchase` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `organization` CHAR, `partner` CHAR, `department` CHAR, `warehouse` CHAR, `doc_amount` FLOAT, `responsible` CHAR, `note` CHAR, `ts_goods` JSON, `ts_services` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `doc_registers_correction` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, posted boolean, date Date, number_doc CHAR, `original_doc_type` CHAR, `responsible` CHAR, `note` CHAR, `partner` CHAR, `ts_registers_table` JSON); CREATE TABLE IF NOT EXISTS `cat_delivery_directions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `predefined_name` CHAR, `ts_composition` JSON); CREATE TABLE IF NOT EXISTS `cat_nonstandard_attributes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `crooked` BOOLEAN, `colored` BOOLEAN, `lay` BOOLEAN, `made_to_order` BOOLEAN, `packing` BOOLEAN, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_insert_bind` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `key` CHAR, `zone` INT, `predefined_name` CHAR, `ts_production` JSON, `ts_inserts` JSON); CREATE TABLE IF NOT EXISTS `cat_nom_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `vat_rate` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_characteristics` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `x` FLOAT, `y` FLOAT, `z` FLOAT, `s` FLOAT, `clr` CHAR, `weight` FLOAT, `calc_order` CHAR, `product` INT, `leading_product` CHAR, `leading_elm` INT, `origin` CHAR, `base_block` CHAR, `sys` CHAR, `note` CHAR, `partner` CHAR, `predefined_name` CHAR, `owner` CHAR, `ts_constructions` JSON, `ts_coordinates` JSON, `ts_inserts` JSON, `ts_params` JSON, `ts_cnn_elmnts` JSON, `ts_glass_specification` JSON, `ts_extra_fields` JSON, `ts_glasses` JSON, `ts_specification` JSON); CREATE TABLE IF NOT EXISTS `cat_individuals` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `birth_date` Date, `inn` CHAR, `imns_code` CHAR, `note` CHAR, `pfr_number` CHAR, `sex` CHAR, `birth_place` CHAR, `ОсновноеИзображение` CHAR, `Фамилия` CHAR, `Имя` CHAR, `Отчество` CHAR, `ФамилияРП` CHAR, `ИмяРП` CHAR, `ОтчествоРП` CHAR, `ОснованиеРП` CHAR, `ДолжностьРП` CHAR, `Должность` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON); CREATE TABLE IF NOT EXISTS `cat_nom_prices_types` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `price_currency` CHAR, `discount_percent` FLOAT, `vat_price_included` BOOLEAN, `rounding_order` CHAR, `rounding_in_a_big_way` BOOLEAN, `note` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_cash_flow_articles` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `definition` CHAR, `sorting_field` INT, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_work_shifts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `predefined_name` CHAR, `ts_work_shift_periodes` JSON); CREATE TABLE IF NOT EXISTS `cat_stores` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `note` CHAR, `department` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_projects` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `start` Date, `finish` Date, `launch` Date, `readiness` Date, `finished` BOOLEAN, `responsible` CHAR, `note` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_users` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `invalid` BOOLEAN, `department` CHAR, `individual_person` CHAR, `note` CHAR, `ancillary` BOOLEAN, `user_ib_uid` CHAR, `user_fresh_uid` CHAR, `id` CHAR, `prefix` CHAR, `branch` CHAR, `push_only` BOOLEAN, `suffix` CHAR, `direct` BOOLEAN, `ts_extra_fields` JSON, `ts_contact_information` JSON, `ts_acl_objs` JSON); CREATE TABLE IF NOT EXISTS `cat_divisions` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `main_project` CHAR, `sorting_field` INT, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_color_price_groups` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `color_price_group_destination` CHAR, `predefined_name` CHAR, `ts_price_groups` JSON, `ts_clr_conformity` JSON); CREATE TABLE IF NOT EXISTS `cat_clrs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `ral` CHAR, `machine_tools_clr` CHAR, `clr_str` CHAR, `clr_out` CHAR, `clr_in` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_furns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `flap_weight_max` INT, `left_right` BOOLEAN, `is_set` BOOLEAN, `is_sliding` BOOLEAN, `furn_set` CHAR, `side_count` INT, `handle_side` INT, `open_type` CHAR, `name_short` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_open_tunes` JSON, `ts_specification` JSON, `ts_selection_params` JSON, `ts_specification_restrictions` JSON, `ts_colors` JSON); CREATE TABLE IF NOT EXISTS `cat_cnns` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `amin` INT, `amax` INT, `sd1` CHAR, `sz` FLOAT, `cnn_type` CHAR, `ahmin` INT, `ahmax` INT, `lmin` INT, `lmax` INT, `tmin` INT, `tmax` INT, `var_layers` BOOLEAN, `for_direct_profile_only` INT, `art1vert` BOOLEAN, `art1glass` BOOLEAN, `art2glass` BOOLEAN, `note` CHAR, `predefined_name` CHAR, `ts_specification` JSON, `ts_cnn_elmnts` JSON, `ts_selection_params` JSON); CREATE TABLE IF NOT EXISTS `cat_delivery_areas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `country` CHAR, `region` CHAR, `city` CHAR, `latitude` FLOAT, `longitude` FLOAT, `ind` CHAR, `delivery_area` CHAR, `specify_area_by_geocoder` BOOLEAN, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_production_params` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `default_clr` CHAR, `clr_group` CHAR, `tmin` INT, `tmax` INT, `allow_open_cnn` BOOLEAN, `flap_pos_by_impost` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_elmnts` JSON, `ts_production` JSON, `ts_product_params` JSON, `ts_furn_params` JSON, `ts_base_blocks` JSON); CREATE TABLE IF NOT EXISTS `cat_parameters_keys` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `priority` INT, `note` CHAR, `sorting_field` INT, `applying` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_params` JSON); CREATE TABLE IF NOT EXISTS `cat_inserts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `insert_type` CHAR, `clr` CHAR, `lmin` INT, `lmax` INT, `hmin` INT, `hmax` INT, `smin` FLOAT, `smax` FLOAT, `for_direct_profile_only` INT, `ahmin` INT, `ahmax` INT, `priority` INT, `mmin` INT, `mmax` INT, `impost_fixation` CHAR, `shtulp_fixation` BOOLEAN, `can_rotate` BOOLEAN, `sizeb` FLOAT, `clr_group` CHAR, `is_order_row` CHAR, `note` CHAR, `insert_glass_type` CHAR, `available` BOOLEAN, `slave` BOOLEAN, `predefined_name` CHAR, `ts_specification` JSON, `ts_selection_params` JSON); CREATE TABLE IF NOT EXISTS `cat_organizations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `prefix` CHAR, `individual_legal` CHAR, `individual_entrepreneur` CHAR, `inn` CHAR, `kpp` CHAR, `main_bank_account` CHAR, `main_cashbox` CHAR, `certificate_series_number` CHAR, `certificate_date_issue` Date, `certificate_authority_name` CHAR, `certificate_authority_code` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_nom` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `article` CHAR, `name_full` CHAR, `base_unit` CHAR, `storage_unit` CHAR, `nom_kind` CHAR, `nom_group` CHAR, `vat_rate` CHAR, `note` CHAR, `price_group` CHAR, `elm_type` CHAR, `len` FLOAT, `width` FLOAT, `thickness` FLOAT, `sizefurn` FLOAT, `sizefaltz` FLOAT, `density` FLOAT, `volume` FLOAT, `arc_elongation` FLOAT, `loss_factor` FLOAT, `rounding_quantity` INT, `clr` CHAR, `cutting_optimization_type` CHAR, `crooked` BOOLEAN, `colored` BOOLEAN, `lay` BOOLEAN, `made_to_order` BOOLEAN, `packing` BOOLEAN, `days_to_execution` INT, `days_from_execution` INT, `pricing` CHAR, `visualization` CHAR, `complete_list_sorting` INT, `is_accessory` BOOLEAN, `is_procedure` BOOLEAN, `is_service` BOOLEAN, `is_pieces` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_partners` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `main_bank_account` CHAR, `note` CHAR, `kpp` CHAR, `okpo` CHAR, `inn` CHAR, `individual_legal` CHAR, `main_contract` CHAR, `identification_document` CHAR, `buyer_main_manager` CHAR, `is_buyer` BOOLEAN, `is_supplier` BOOLEAN, `primary_contact` CHAR, `predefined_name` CHAR, `parent` CHAR, `ts_contact_information` JSON, `ts_extra_fields` JSON); CREATE TABLE IF NOT EXISTS `cat_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `international_short` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_cashboxes` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `funds_currency` CHAR, `department` CHAR, `current_account` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_meta_ids` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `full_moniker` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_property_values` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_nom_units` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `qualifier_unit` CHAR, `heft` FLOAT, `volume` FLOAT, `coefficient` FLOAT, `rounding_threshold` INT, `ПредупреждатьОНецелыхМестах` BOOLEAN, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_contracts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `settlements_currency` CHAR, `mutual_settlements` CHAR, `contract_kind` CHAR, `date` Date, `check_days_without_pay` BOOLEAN, `allowable_debts_amount` FLOAT, `allowable_debts_days` INT, `note` CHAR, `check_debts_amount` BOOLEAN, `check_debts_days` BOOLEAN, `number_doc` CHAR, `organization` CHAR, `main_cash_flow_article` CHAR, `main_project` CHAR, `accounting_reflect` BOOLEAN, `tax_accounting_reflect` BOOLEAN, `prepayment_percent` FLOAT, `validity` Date, `vat_included` BOOLEAN, `price_type` CHAR, `vat_consider` BOOLEAN, `days_without_pay` INT, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_nom_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `nom_type` CHAR, `НаборСвойствНоменклатура` CHAR, `НаборСвойствХарактеристика` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_contact_information_kinds` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `mandatory_fields` BOOLEAN, `type` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_currencies` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `extra_charge` FLOAT, `main_currency` CHAR, `parameters_russian_recipe` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_branches` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `suffix` CHAR, `direct` BOOLEAN, `use` BOOLEAN, `parent` CHAR, `ts_organizations` JSON, `ts_partners` JSON, `ts_divisions` JSON, `ts_price_types` JSON, `ts_keys` JSON); CREATE TABLE IF NOT EXISTS `cat_elm_visualization` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `svg_path` CHAR, `note` CHAR, `attributes` CHAR, `rotate` INT, `offset` INT, `side` CHAR, `elm_side` INT, `cx` INT, `cy` INT, `angle_hor` INT, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_formulas` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `formula` CHAR, `leading_formula` CHAR, `condition_formula` BOOLEAN, `definition` CHAR, `template` CHAR, `sorting_field` INT, `async` BOOLEAN, `disabled` BOOLEAN, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `ts_params` JSON); CREATE TABLE IF NOT EXISTS `cat_countries` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `name_full` CHAR, `alpha2` CHAR, `alpha3` CHAR, `predefined_name` CHAR); CREATE TABLE IF NOT EXISTS `cat_destinations` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `КоличествоРеквизитов` CHAR, `КоличествоСведений` CHAR, `Используется` BOOLEAN, `predefined_name` CHAR, `parent` CHAR, `ts_extra_fields` JSON, `ts_extra_properties` JSON); CREATE TABLE IF NOT EXISTS `cat_banks_qualifier` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `correspondent_account` CHAR, `city` CHAR, `address` CHAR, `phone_numbers` CHAR, `activity_ceased` BOOLEAN, `swift` CHAR, `inn` CHAR, `predefined_name` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_property_values_hierarchy` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `heft` FLOAT, `ПолноеНаименование` CHAR, `predefined_name` CHAR, `owner` CHAR, `parent` CHAR); CREATE TABLE IF NOT EXISTS `cat_organization_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `bank` CHAR, `bank_bic` CHAR, `funds_currency` CHAR, `account_number` CHAR, `settlements_bank` CHAR, `settlements_bank_bic` CHAR, `department` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_partner_bank_accounts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `account_number` CHAR, `bank` CHAR, `settlements_bank` CHAR, `correspondent_text` CHAR, `appointments_text` CHAR, `funds_currency` CHAR, `bank_bic` CHAR, `bank_name` CHAR, `bank_correspondent_account` CHAR, `bank_city` CHAR, `bank_address` CHAR, `bank_phone_numbers` CHAR, `settlements_bank_bic` CHAR, `settlements_bank_correspondent_account` CHAR, `settlements_bank_city` CHAR, `predefined_name` CHAR, `owner` CHAR); CREATE TABLE IF NOT EXISTS `cat_params_links` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `master` CHAR, `slave` CHAR, `hide` BOOLEAN, `note` CHAR, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `ts_values` JSON); CREATE TABLE IF NOT EXISTS `cat_scheme_settings` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `obj` CHAR, `user` CHAR, `order` INT, `query` CHAR, `date_from` Date, `date_till` Date, `standard_period` CHAR, `formula` CHAR, `output` CHAR, `tag` CHAR, `ts_fields` JSON, `ts_sorting` JSON, `ts_dimensions` JSON, `ts_resources` JSON, `ts_selection` JSON, `ts_params` JSON, `ts_composition` JSON, `ts_conditional_appearance` JSON); CREATE TABLE IF NOT EXISTS `cat_meta_fields` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `cat_meta_objs` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN); CREATE TABLE IF NOT EXISTS `cch_properties` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `shown` BOOLEAN, `sorting_field` INT, `extra_values_owner` CHAR, `available` BOOLEAN, `mandatory` BOOLEAN, `include_to_name` BOOLEAN, `list` INT, `caption` CHAR, `note` CHAR, `destination` CHAR, `tooltip` CHAR, `is_extra_property` BOOLEAN, `include_to_description` BOOLEAN, `predefined_name` CHAR, `type` JSON, `ts_extra_fields_dependencies` JSON); CREATE TABLE IF NOT EXISTS `cch_predefined_elmnts` (ref CHAR PRIMARY KEY NOT NULL, `_deleted` BOOLEAN, id CHAR, name CHAR, is_folder BOOLEAN, `value` CHAR, `definition` CHAR, `synonym` CHAR, `list` INT, `zone` INT, `predefined_name` CHAR, `parent` CHAR, `type` CHAR, `ts_elmnts` JSON); CREATE TABLE IF NOT EXISTS `enm_individual_legal` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_planning_phases` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_elm_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_specification_order_row_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_cnn_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_sz_line_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_open_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_cutting_optimization_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_nom_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_contact_information_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_lay_split_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_inserts_glass_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_inserts_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_cnn_sides` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_vat_rates` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_specification_installation_methods` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_angle_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_count_calculating_ways` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_buyers_order_states` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_parameters_keys_applying` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_gender` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_positions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_orientations` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_open_directions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_color_price_group_destinations` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_order_categories` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_obj_delivery_states` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_planning_detailing` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_text_aligns` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_contract_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_mutual_contract_settlements` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_align_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_contraction_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_offset_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_transfer_operations_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_impost_mount_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_inset_attrs_options` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_report_output` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_quick_access` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_standard_period` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_data_field_kinds` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_label_positions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_comparison_types` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_sort_directions` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); CREATE TABLE IF NOT EXISTS `enm_accumulation_record_type` (ref CHAR PRIMARY KEY NOT NULL, sequence INT, synonym CHAR); ',[]);$p.md.init({"enm":{"accumulation_record_type":[{"order":0,"name":"debit","synonym":"Приход"},{"order":1,"name":"credit","synonym":"Расход"}],"sort_directions":[{"order":0,"name":"asc","synonym":"По возрастанию","default":true},{"order":1,"name":"desc","synonym":"По убыванию"}],"comparison_types":[{"order":0,"name":"gt","synonym":"Больше"},{"order":1,"name":"gte","synonym":"Больше или равно"},{"order":2,"name":"lt","synonym":"Меньше"},{"order":3,"name":"lte","synonym":"Меньше или равно "},{"order":4,"name":"eq","synonym":"Равно","default":true},{"order":5,"name":"ne","synonym":"Не равно"},{"order":6,"name":"in","synonym":"В списке"},{"order":7,"name":"nin","synonym":"Не в списке"},{"order":8,"name":"lke","synonym":"Содержит "},{"order":9,"name":"nlk","synonym":"Не содержит"}],"label_positions":[{"order":0,"name":"inherit","synonym":"Наследовать","default":true},{"order":1,"name":"hide","synonym":"Скрыть"},{"order":2,"name":"left","synonym":"Лево"},{"order":3,"name":"right","synonym":"Право"},{"order":4,"name":"top","synonym":"Верх"},{"order":5,"name":"bottom","synonym":"Низ"}],"data_field_kinds":[{"order":0,"name":"field","synonym":"Поле ввода","default":true},{"order":1,"name":"input","synonym":"Простой текст"},{"order":2,"name":"text","synonym":"Многострочный текст"},{"order":3,"name":"label","synonym":"Поле надписи"},{"order":4,"name":"link","synonym":"Гиперссылка"},{"order":5,"name":"cascader","synonym":"Каскадер"},{"order":6,"name":"toggle","synonym":"Переключатель"},{"order":7,"name":"image","synonym":"Картинка"},{"order":8,"name":"type","synonym":"Тип значения"},{"order":9,"name":"path","synonym":"Путь к данным"},{"order":10,"name":"typed_field","synonym":"Поле связи по типу"}],"standard_period":[{"order":0,"name":"custom","synonym":"Произвольный","default":true},{"order":1,"name":"yesterday","synonym":"Вчера"},{"order":2,"name":"today","synonym":"Сегодня"},{"order":3,"name":"tomorrow","synonym":"Завтра"},{"order":4,"name":"last7days","synonym":"Последние 7 дней"},{"order":5,"name":"last30days","synonym":"Последние 30 дней"},{"order":6,"name":"last3Month","synonym":"Последние 3 месяца"},{"order":7,"name":"lastWeek","synonym":"Прошлая неделя"},{"order":8,"name":"lastTendays","synonym":"Прошлая декада"},{"order":9,"name":"lastMonth","synonym":"Прошлый месяц"},{"order":10,"name":"lastQuarter","synonym":"Прошлый квартал"},{"order":11,"name":"lastHalfYear","synonym":"Прошлое полугодие"},{"order":12,"name":"lastYear","synonym":"Прошлый год"},{"order":13,"name":"next7Days","synonym":"Следующие 7 дней"},{"order":14,"name":"nextTendays","synonym":"Следующая декада"},{"order":15,"name":"nextWeek","synonym":"Следующая неделя"},{"order":16,"name":"nextMonth","synonym":"Следующий месяц"},{"order":17,"name":"nextQuarter","synonym":"Следующий квартал"},{"order":18,"name":"nextHalfYear","synonym":"Следующее полугодие"},{"order":19,"name":"nextYear","synonym":"Следующий год"},{"order":20,"name":"tillEndOfThisYear","synonym":"До конца этого года"},{"order":21,"name":"tillEndOfThisQuarter","synonym":"До конца этого квартала"},{"order":22,"name":"tillEndOfThisMonth","synonym":"До конца этого месяца"},{"order":23,"name":"tillEndOfThisHalfYear","synonym":"До конца этого полугодия"},{"order":24,"name":"tillEndOfThistendays","synonym":"До конца этой декады"},{"order":25,"name":"tillEndOfThisweek","synonym":"До конца этой недели"},{"order":26,"name":"fromBeginningOfThisYear","synonym":"С начала этого года"},{"order":27,"name":"fromBeginningOfThisQuarter","synonym":"С начала этого квартала"},{"order":28,"name":"fromBeginningOfThisMonth","synonym":"С начала этого месяца"},{"order":29,"name":"fromBeginningOfThisHalfYear","synonym":"С начала этого полугодия"},{"order":30,"name":"fromBeginningOfThisTendays","synonym":"С начала этой декады"},{"order":31,"name":"fromBeginningOfThisWeek","synonym":"С начала этой недели"},{"order":32,"name":"thisTenDays","synonym":"Эта декада"},{"order":33,"name":"thisWeek","synonym":"Эта неделя"},{"order":34,"name":"thisHalfYear","synonym":"Это полугодие"},{"order":35,"name":"thisYear","synonym":"Этот год"},{"order":36,"name":"thisQuarter","synonym":"Этот квартал"},{"order":37,"name":"thisMonth","synonym":"Этот месяц"}],"quick_access":[{"order":0,"name":"none","synonym":"Нет","default":true},{"order":1,"name":"toolbar","synonym":"Панель инструментов"},{"order":2,"name":"drawer","synonym":"Панель формы"}],"report_output":[{"order":0,"name":"grid","synonym":"Таблица","default":true},{"order":1,"name":"chart","synonym":"Диаграмма"},{"order":2,"name":"pivot","synonym":"Cводная таблица"},{"order":3,"name":"html","synonym":"Документ HTML"}],"inset_attrs_options":[{"order":0,"name":"НеПоперечина","synonym":"Не поперечина"},{"order":1,"name":"ОбаНаправления","synonym":"Оба направления"},{"order":2,"name":"ОтключитьВтороеНаправление","synonym":"Отключить второе направление"},{"order":3,"name":"ОтключитьШагиВторогоНаправления","synonym":"Отключить шаги второго направления"},{"order":4,"name":"ОтключитьПервоеНаправление","synonym":"Отключить первое направление"},{"order":5,"name":"ОтключитьШагиПервогоНаправления","synonym":"Отключить шаги первого направления"}],"impost_mount_options":[{"order":0,"name":"НетКрепленийИмпостовИРам","synonym":"Нет креплений импостов и рам"},{"order":1,"name":"МогутКрепитьсяИмпосты","synonym":"Могут крепиться импосты"},{"order":2,"name":"ДолжныБытьКрепленияИмпостов","synonym":"Должны быть крепления импостов"}],"transfer_operations_options":[{"order":0,"name":"НетПереноса","synonym":"Нет переноса"},{"order":1,"name":"НаПримыкающий","synonym":"На примыкающий"}],"offset_options":[{"order":0,"name":"ОтНачалаСтороны","synonym":"От начала стороны"},{"order":1,"name":"ОтКонцаСтороны","synonym":"От конца стороны"},{"order":2,"name":"ОтСередины","synonym":"От середины"},{"order":3,"name":"ОтРучки","synonym":"От ручки"},{"order":4,"name":"РазмерПоФальцу","synonym":"Размер по фальцу"},{"order":5,"name":"Формула","synonym":"Формула"}],"contraction_options":[{"order":0,"name":"ОтДлиныСтороны","synonym":"От длины стороны"},{"order":1,"name":"ОтВысотыРучки","synonym":"От высоты ручки"},{"order":2,"name":"ОтДлиныСтороныМинусВысотыРучки","synonym":"От длины стороны минус высота ручки"},{"order":3,"name":"ФиксированнаяДлина","synonym":"Фиксированная длина"}],"align_types":[{"order":0,"name":"Геометрически","synonym":"Геометрически"},{"order":1,"name":"ПоЗаполнениям","synonym":"По заполнениям"}],"mutual_contract_settlements":[{"order":0,"name":"ПоДоговоруВЦелом","synonym":"По договору в целом"},{"order":1,"name":"ПоЗаказам","synonym":"По заказам"},{"order":2,"name":"ПоСчетам","synonym":"По счетам"}],"contract_kinds":[{"order":0,"name":"СПоставщиком","synonym":"С поставщиком"},{"order":1,"name":"СПокупателем","synonym":"С покупателем"},{"order":2,"name":"СКомитентом","synonym":"С комитентом"},{"order":3,"name":"СКомиссионером","synonym":"С комиссионером"},{"order":4,"name":"Прочее","synonym":"Прочее"}],"text_aligns":[{"order":0,"name":"left","synonym":"Лево"},{"order":1,"name":"right","synonym":"Право"},{"order":2,"name":"center","synonym":"Центр"}],"planning_detailing":[{"order":0,"name":"Изделие","synonym":"Изделие"},{"order":1,"name":"Контур","synonym":"Контур"},{"order":2,"name":"РамныйКонтур","synonym":"Рамный контур"},{"order":3,"name":"Элемент","synonym":"Элемент"},{"order":4,"name":"ТипЭлемента","synonym":"Тип элемента"},{"order":5,"name":"РодительскийЭлемент","synonym":"Родительский элемент"}],"obj_delivery_states":[{"order":0,"name":"Черновик","synonym":"Черновик"},{"order":1,"name":"Отправлен","synonym":"Отправлен"},{"order":2,"name":"Подтвержден","synonym":"Подтвержден"},{"order":3,"name":"Отклонен","synonym":"Отклонен"},{"order":4,"name":"Отозван","synonym":"Отозван"},{"order":5,"name":"Архив","synonym":"Перенесён в архив"},{"order":6,"name":"Шаблон","synonym":"Шаблон"}],"order_categories":[{"order":0,"name":"order","synonym":"Расчет заказ"},{"order":1,"name":"service","synonym":"Сервис"},{"order":2,"name":"complaints","synonym":"Рекламация"}],"color_price_group_destinations":[{"order":0,"name":"ДляЦенообразования","synonym":"Для ценообразования"},{"order":1,"name":"ДляХарактеристик","synonym":"Для характеристик"},{"order":2,"name":"ДляГруппировкиВПараметрах","synonym":"Для группировки в параметрах"},{"order":3,"name":"ДляОграниченияДоступности","synonym":"Для ограничения доступности"}],"open_directions":[{"order":0,"name":"Левое","synonym":"Левое"},{"order":1,"name":"Правое","synonym":"Правое"},{"order":2,"name":"Откидное","synonym":"Откидное"}],"orientations":[{"order":0,"name":"Горизонтальная","synonym":"Горизонтальная"},{"order":1,"name":"Вертикальная","synonym":"Вертикальная"},{"order":2,"name":"Наклонная","synonym":"Наклонная"}],"positions":[{"order":0,"name":"Любое","synonym":"Любое"},{"order":1,"name":"Верх","synonym":"Верх"},{"order":2,"name":"Низ","synonym":"Низ"},{"order":3,"name":"Лев","synonym":"Лев"},{"order":4,"name":"Прав","synonym":"Прав"},{"order":5,"name":"ЦентрВертикаль","synonym":"Центр вертикаль"},{"order":6,"name":"ЦентрГоризонталь","synonym":"Центр горизонталь"},{"order":7,"name":"Центр","synonym":"Центр"},{"order":8,"name":"ЛевВерх","synonym":"Лев верх"},{"order":9,"name":"ЛевНиз","synonym":"Лев низ"},{"order":10,"name":"ПравВерх","synonym":"Прав верх"},{"order":11,"name":"ПравНиз","synonym":"Прав низ"}],"gender":[{"order":0,"name":"Мужской","synonym":"Мужской"},{"order":1,"name":"Женский","synonym":"Женский"}],"parameters_keys_applying":[{"order":0,"name":"НаправлениеДоставки","synonym":"Направление доставки"},{"order":1,"name":"РабочийЦентр","synonym":"Рабочий центр"},{"order":2,"name":"Технология","synonym":"Технология"},{"order":3,"name":"Ценообразование","synonym":"Ценообразование"},{"order":4,"name":"ПараметрВыбора","synonym":"Параметр выбора"}],"buyers_order_states":[{"order":0,"name":"ОжидаетсяСогласование","synonym":"Ожидается согласование"},{"order":1,"name":"ОжидаетсяАвансДоОбеспечения","synonym":"Ожидается аванс (до обеспечения)"},{"order":2,"name":"ГотовКОбеспечению","synonym":"Готов к обеспечению"},{"order":3,"name":"ОжидаетсяПредоплатаДоОтгрузки","synonym":"Ожидается предоплата (до отгрузки)"},{"order":4,"name":"ОжидаетсяОбеспечение","synonym":"Ожидается обеспечение"},{"order":5,"name":"ГотовКОтгрузке","synonym":"Готов к отгрузке"},{"order":6,"name":"ВПроцессеОтгрузки","synonym":"В процессе отгрузки"},{"order":7,"name":"ОжидаетсяОплатаПослеОтгрузки","synonym":"Ожидается оплата (после отгрузки)"},{"order":8,"name":"ГотовКЗакрытию","synonym":"Готов к закрытию"},{"order":9,"name":"Закрыт","synonym":"Закрыт"}],"count_calculating_ways":[{"order":0,"name":"ПоПериметру","synonym":"По периметру"},{"order":1,"name":"ПоПлощади","synonym":"По площади"},{"order":2,"name":"ДляЭлемента","synonym":"Для элемента"},{"order":3,"name":"ПоШагам","synonym":"По шагам"},{"order":4,"name":"ПоФормуле","synonym":"По формуле"}],"angle_calculating_ways":[{"order":0,"name":"Основной","synonym":"Основной"},{"order":1,"name":"СварнойШов","synonym":"Сварной шов"},{"order":2,"name":"СоединениеПополам","synonym":"Соед./2"},{"order":3,"name":"Соединение","synonym":"Соединение"},{"order":4,"name":"_90","synonym":"90"},{"order":5,"name":"НеСчитать","synonym":"Не считать"}],"specification_installation_methods":[{"order":0,"name":"Всегда","synonym":"Всегда"},{"order":1,"name":"САртикулом1","synonym":"с Арт1"},{"order":2,"name":"САртикулом2","synonym":"с Арт2"}],"vat_rates":[{"order":0,"name":"НДС18","synonym":"18%"},{"order":1,"name":"НДС18_118","synonym":"18% / 118%"},{"order":2,"name":"НДС10","synonym":"10%"},{"order":3,"name":"НДС10_110","synonym":"10% / 110%"},{"order":4,"name":"НДС0","synonym":"0%"},{"order":5,"name":"БезНДС","synonym":"Без НДС"},{"order":6,"name":"НДС20","synonym":"20%"},{"order":7,"name":"НДС20_120","synonym":"20% / 120%"}],"cnn_sides":[{"order":0,"name":"Изнутри","synonym":"Изнутри"},{"order":1,"name":"Снаружи","synonym":"Снаружи"},{"order":2,"name":"Любая","synonym":"Любая"}],"inserts_types":[{"order":0,"name":"Профиль","synonym":"Профиль"},{"order":1,"name":"Заполнение","synonym":"Заполнение"},{"order":2,"name":"Элемент","synonym":"Элемент"},{"order":3,"name":"Изделие","synonym":"Изделие"},{"order":4,"name":"Контур","synonym":"Контур"},{"order":5,"name":"МоскитнаяСетка","synonym":"Москитная сетка"},{"order":6,"name":"Подоконник","synonym":"Подоконник"},{"order":7,"name":"Откос","synonym":"Откос"},{"order":8,"name":"Водоотлив","synonym":"Водоотлив"},{"order":9,"name":"Монтаж","synonym":"Монтаж"},{"order":10,"name":"Доставка","synonym":"Доставка"},{"order":11,"name":"Набор","synonym":"Набор"},{"order":12,"name":"Стеклопакет","synonym":"Стеклопакет"},{"order":13,"name":"ТиповойСтеклопакет","synonym":"Типовой стеклопакет"},{"order":14,"name":"Раскладка","synonym":"Раскладка"}],"inserts_glass_types":[{"order":0,"name":"Заполнение","synonym":"Заполнение"},{"order":1,"name":"Рамка","synonym":"Рамка"},{"order":2,"name":"Газ","synonym":"Газ"}],"lay_split_types":[{"order":0,"name":"ДелениеГоризонтальных","synonym":"Деление горизонтальных"},{"order":1,"name":"ДелениеВертикальных","synonym":"Деление вертикальных"},{"order":2,"name":"КрестВСтык","synonym":"Крест в стык"},{"order":3,"name":"КрестПересечение","synonym":"Крест пересечение"}],"contact_information_types":[{"order":0,"name":"Адрес","synonym":"Адрес"},{"order":1,"name":"Телефон","synonym":"Телефон"},{"order":2,"name":"АдресЭлектроннойПочты","synonym":"Адрес электронной почты"},{"order":3,"name":"ВебСтраница","synonym":"Веб страница"},{"order":4,"name":"Факс","synonym":"Факс"},{"order":5,"name":"Другое","synonym":"Другое"},{"order":6,"name":"Skype","synonym":"Skype"}],"nom_types":[{"order":0,"name":"Товар","synonym":"Товар, материал"},{"order":1,"name":"Услуга","synonym":"Услуга"},{"order":2,"name":"Работа","synonym":"Работа, техоперация"}],"cutting_optimization_types":[{"order":0,"name":"Нет","synonym":"Нет"},{"order":1,"name":"РасчетНарезки","synonym":"Расчет нарезки"},{"order":2,"name":"НельзяВращатьПереворачивать","synonym":"Нельзя вращать переворачивать"},{"order":3,"name":"ТолькоНомераЯчеек","synonym":"Только номера ячеек"}],"open_types":[{"order":0,"name":"Глухое","synonym":"Глухое"},{"order":1,"name":"Поворотное","synonym":"Поворотное"},{"order":2,"name":"Откидное","synonym":"Откидное"},{"order":3,"name":"ПоворотноОткидное","synonym":"Поворотно-откидное"},{"order":4,"name":"Раздвижное","synonym":"Раздвижное"},{"order":5,"name":"Неподвижное","synonym":"Неподвижное"}],"sz_line_types":[{"order":0,"name":"Обычные","synonym":"Обычные"},{"order":1,"name":"Габаритные","synonym":"Только габаритные"},{"order":2,"name":"ПоСтворкам","synonym":"По створкам"},{"order":3,"name":"ОтКрая","synonym":"От края"},{"order":4,"name":"БезРазмеров","synonym":"Без размеров"}],"cnn_types":[{"order":0,"name":"УгловоеДиагональное","synonym":"Угловое диагональное"},{"order":1,"name":"УгловоеКВертикальной","synonym":"Угловое к вертикальной"},{"order":2,"name":"УгловоеКГоризонтальной","synonym":"Угловое к горизонтальной"},{"order":3,"name":"ТОбразное","synonym":"Т-образное"},{"order":4,"name":"Наложение","synonym":"Наложение"},{"order":5,"name":"НезамкнутыйКонтур","synonym":"Незамкнутый контур"},{"order":6,"name":"КрестВСтык","synonym":"Крест в стык"},{"order":7,"name":"КрестПересечение","synonym":"Крест пересечение"}],"specification_order_row_types":[{"order":0,"name":"Нет","synonym":"Нет"},{"order":1,"name":"Материал","synonym":"Материал"},{"order":2,"name":"Продукция","synonym":"Продукция"}],"elm_types":[{"order":0,"name":"Рама","synonym":"Рама"},{"order":1,"name":"Створка","synonym":"Створка"},{"order":2,"name":"Импост","synonym":"Импост"},{"order":3,"name":"Штульп","synonym":"Штульп"},{"order":4,"name":"Стекло","synonym":"Стекло - стеклопакет"},{"order":5,"name":"Заполнение","synonym":"Заполнение - сэндвич"},{"order":6,"name":"Раскладка","synonym":"Раскладка - фальшпереплет"},{"order":7,"name":"Текст","synonym":"Текст"},{"order":8,"name":"Линия","synonym":"Линия"},{"order":9,"name":"Размер","synonym":"Размер"},{"order":10,"name":"Добор","synonym":"Доборный проф."},{"order":11,"name":"Соединитель","synonym":"Соединит. профиль"},{"order":12,"name":"Водоотлив","synonym":"Водоотлив"},{"order":13,"name":"Москитка","synonym":"Москитн. сетка"},{"order":14,"name":"Фурнитура","synonym":"Фурнитура"},{"order":15,"name":"Макрос","synonym":"Макрос обр центра"},{"order":16,"name":"Подоконник","synonym":"Подоконник"},{"order":17,"name":"ОшибкаКритическая","synonym":"Ошибка критическая"},{"order":18,"name":"ОшибкаИнфо","synonym":"Ошибка инфо"},{"order":19,"name":"Визуализация","synonym":"Визуализация"},{"order":20,"name":"Прочее","synonym":"Прочее"},{"order":21,"name":"Продукция","synonym":"Продукция"},{"order":22,"name":"Доставка","synonym":"Доставка"},{"order":23,"name":"РаботыЦеха","synonym":"Работы цеха"},{"order":24,"name":"РаботыМонтажа","synonym":"Работы монтажа"},{"order":25,"name":"Монтаж","synonym":"Монтаж"},{"order":26,"name":"Уплотнение","synonym":"Уплотнение"},{"order":27,"name":"Арматура","synonym":"Армирование"},{"order":28,"name":"Штапик","synonym":"Штапик"},{"order":29,"name":"Порог","synonym":"Порог"},{"order":30,"name":"Подставочник","synonym":"Подставочн. профиль"}],"planning_phases":[{"order":0,"name":"plan","synonym":"План"},{"order":1,"name":"run","synonym":"Запуск"},{"order":2,"name":"ready","synonym":"Готовность"}],"individual_legal":[{"order":0,"name":"ЮрЛицо","synonym":"Юрлицо"},{"order":1,"name":"ФизЛицо","synonym":"Физлицо"}]},"ireg":{"log":{"name":"log","note":"","synonym":"Журнал событий","dimensions":{"date":{"synonym":"Дата","tooltip":"Время события","type":{"types":["number"],"digits":15,"fraction_figits":0}},"sequence":{"synonym":"Порядок","tooltip":"Порядок следования","type":{"types":["number"],"digits":6,"fraction_figits":0}}},"resources":{"class":{"synonym":"Класс","tooltip":"Класс события","type":{"types":["string"],"str_len":100}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"Текст события","type":{"types":["string"],"str_len":0}},"obj":{"synonym":"Объект","multiline_mode":true,"tooltip":"Объект, к которому относится событие","type":{"types":["string"],"str_len":0}},"user":{"synonym":"Пользователь","tooltip":"Пользователь, в сеансе которого произошло событие","type":{"types":["string"],"str_len":100}}}},"log_view":{"name":"log_view","note":"","synonym":"Просмотр журнала событий","dimensions":{"key":{"synonym":"Ключ","tooltip":"Ключ события","type":{"types":["string"],"str_len":100}},"user":{"synonym":"Пользователь","tooltip":"Пользователь, отметивыший событие, как просмотренное","type":{"types":["string"],"str_len":100}}}},"buyers_order_states":{"name":"СостоянияЗаказовКлиентов","splitted":true,"note":"","synonym":"Состояния заказов клиентов","dimensions":{"invoice":{"synonym":"Заказ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["doc.calc_order"],"is_ref":true}}},"resources":{"state":{"synonym":"Состояние","multiline_mode":false,"tooltip":"Текущее состояние заказа","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.buyers_order_states"],"is_ref":true}},"event_date":{"synonym":"Дата события","multiline_mode":false,"tooltip":"Дата, на которую заказ считается просроченным","type":{"types":["date"],"date_part":"date"}}},"attributes":{"СуммаОплаты":{"synonym":"Сумма оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ПроцентОплаты":{"synonym":"Процент оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"СуммаОтгрузки":{"synonym":"Сумма отгрузки заказа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ПроцентОтгрузки":{"synonym":"Процент отгрузки заказа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"СуммаДолга":{"synonym":"Сумма долга","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ПроцентДолга":{"synonym":"Процент долга","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ЕстьРасхожденияОрдерНакладная":{"synonym":"Есть расхождения ордер накладная","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}},"cachable":"doc"},"currency_courses":{"name":"КурсыВалют","splitted":true,"note":"","synonym":"Курсы валют","dimensions":{"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"Ссылка на валюты","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}},"period":{"synonym":"Дата курса","multiline_mode":false,"tooltip":"Дата курса валюты","mandatory":true,"type":{"types":["date"],"date_part":"date"}}},"resources":{"course":{"synonym":"Курс","multiline_mode":false,"tooltip":"Курс валюты","mandatory":true,"type":{"types":["number"],"digits":10,"fraction_figits":4}},"multiplicity":{"synonym":"Кратность","multiline_mode":false,"tooltip":"Кратность валюты","mandatory":true,"type":{"types":["number"],"digits":10,"fraction_figits":0}}},"attributes":{},"cachable":"ram","form":{"selection":{"fields":["cat_currencies.name as currency","period","course"],"cols":[{"id":"currency","width":"*","type":"ro","align":"left","sort":"server","caption":"Валюта"},{"id":"period","width":"*","type":"ro","align":"left","sort":"server","caption":"Дата курса"},{"id":"course","width":"*","type":"ron","align":"right","sort":"server","caption":"Курс"}]}}},"margin_coefficients":{"name":"пзМаржинальныеКоэффициентыИСкидки","splitted":true,"note":"","synonym":"Маржинальные коэффициенты","dimensions":{"price_group":{"synonym":"Ценовая группа","multiline_mode":false,"tooltip":"Если указано, правило распространяется только на продукцию данной ценовой группы","choice_groups_elm":"elm","type":{"types":["cat.price_groups"],"is_ref":true}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Если указано, правило распространяется только на продукцию, параметры окружения которой, совпадают с параметрами ключа параметров","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"condition_formula":{"synonym":"Формула условия","multiline_mode":false,"tooltip":"В этом поле можно указать дополнительное условие на языке 1С. Например, применять строку только к аркам или непрямоугольным изделиям","choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}}},"resources":{"marginality":{"synonym":"К марж","multiline_mode":false,"tooltip":"На этот коэффициент будет умножена плановая себестоимость для получения отпускной цены. Имеет смысл, если \"тип цен прайс\" не указан и константа КМАРЖ_В_СПЕЦИФИКАЦИИ сброшена","type":{"types":["number"],"digits":10,"fraction_figits":4}},"marginality_min":{"synonym":"К марж мин.","multiline_mode":false,"tooltip":"Не позволяет установить в документе расчет скидку, при которой маржинальность строки опустится ниже указанного значения","type":{"types":["number"],"digits":10,"fraction_figits":4}},"marginality_internal":{"synonym":"К марж внутр.","multiline_mode":false,"tooltip":"Маржинальный коэффициент внутренней продажи","type":{"types":["number"],"digits":10,"fraction_figits":4}},"price_type_first_cost":{"synonym":"Тип цен плановой себестоимости","multiline_mode":false,"tooltip":"Этот тип цен будет использован для расчета плановой себестоимости продукции","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price_type_sale":{"synonym":"Тип прайсовых цен","multiline_mode":false,"tooltip":"Этот тип цен будет использован для расчета отпускной цены продукции. Если указано, значения КМарж и КМарж.мин игнорируются","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price_type_internal":{"synonym":"Тип цен внутренней продажи","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета (корректировки) себестоимости","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"sale_formula":{"synonym":"Формула продажа","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета (корректировки) цены продажи","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"internal_formula":{"synonym":"Формула внутр","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета цены внутренней продажи или заказа поставщику","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"external_formula":{"synonym":"Формула внешн.","multiline_mode":false,"tooltip":"В этом поле можно указать произвольный код на языке 1С для расчета внешней (дилерской) цены","choice_params":[{"name":"parent","path":["3220e251-ffcd-11e5-8303-e67fda7f6b46","3220e25b-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"extra_charge_external":{"synonym":"Наценка внешн.","multiline_mode":false,"tooltip":"Наценка внешней (дилерской) продажи по отношению к цене производителя, %. Перекрывается, если указан в лёгклм клиенте","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_external":{"synonym":"Скидка внешн.","multiline_mode":false,"tooltip":"Скидка по умолчанию для внешней (дилерской) продажи по отношению к дилерской цене, %. Перекрывается, если указан в лёгклм клиенте","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"Скидка по умолчанию, %","type":{"types":["number"],"digits":5,"fraction_figits":2}}},"attributes":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":200}}},"cachable":"doc_ram","form":{"selection":{"fields":["cat_price_groups.name as price_group","cat_parameters_keys.name as key","cat_formulas.name as condition_formula"],"cols":[{"id":"price_group","width":"*","type":"ro","align":"left","sort":"server","caption":"Ценовая группа"},{"id":"key","width":"*","type":"ro","align":"left","sort":"server","caption":"Ключ параметров"},{"id":"condition_formula","width":"*","type":"ro","align":"left","sort":"server","caption":"Формула условия"}]}}}},"cat":{"meta_objs":{"fields":{}},"meta_fields":{"fields":{}},"scheme_settings":{"name":"scheme_settings","synonym":"Настройки отчетов и списков","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"obj":{"synonym":"Объект","tooltip":"Имя класса метаданных","type":{"types":["string"],"str_len":250}},"user":{"synonym":"Пользователь","tooltip":"Если пусто - публичная настройка","type":{"types":["string"],"str_len":50}},"order":{"synonym":"Порядок","tooltip":"Порядок варианта","type":{"types":["number"],"digits":6,"fraction_figits":0}},"query":{"synonym":"Запрос","tooltip":"Индекс CouchDB или текст SQL","type":{"types":["string"],"str_len":0}},"date_from":{"synonym":"Начало периода","tooltip":"","type":{"types":["date"],"date_part":"date"}},"date_till":{"synonym":"Конец периода","tooltip":"","type":{"types":["date"],"date_part":"date"}},"standard_period":{"synonym":"Стандартный период","tooltip":"Использование стандартного периода","type":{"types":["enm.standard_period"],"is_ref":true}},"formula":{"synonym":"Формула","tooltip":"Формула инициализации","type":{"types":["cat.formulas"],"is_ref":true}},"output":{"synonym":"Вывод","tooltip":"Вывод результата","type":{"types":["enm.report_output"],"is_ref":true}},"tag":{"synonym":"Дополнительные свойства","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"fields":{"name":"fields","synonym":"Доступные поля","tooltip":"Состав, порядок и ширина колонок","fields":{"parent":{"synonym":"Родитель","tooltip":"Для плоского списка, родитель пустой","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}},"width":{"synonym":"Ширина","tooltip":"","type":{"types":["string"],"str_len":6}},"caption":{"synonym":"Заголовок","tooltip":"","type":{"types":["string"],"str_len":100}},"tooltip":{"synonym":"Подсказка","tooltip":"","type":{"types":["string"],"str_len":100}},"ctrl_type":{"synonym":"Тип","tooltip":"Тип элемента управления","type":{"types":["enm.data_field_kinds"],"is_ref":true}},"formatter":{"synonym":"Формат","tooltip":"Функция форматирования","type":{"types":["cat.formulas"],"is_ref":true}},"editor":{"synonym":"Редактор","tooltip":"Компонент редактирования","type":{"types":["cat.formulas"],"is_ref":true}}}},"sorting":{"name":"sorting","synonym":"Поля сортировки","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}},"direction":{"synonym":"Направление","tooltip":"","type":{"types":["enm.sort_directions"],"is_ref":true}}}},"dimensions":{"name":"dimensions","synonym":"Поля группировки","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}}}},"resources":{"name":"resources","synonym":"Ресурсы","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Поле","tooltip":"","type":{"types":["string"],"str_len":100}},"formula":{"synonym":"Формула","tooltip":"По умолчанию - сумма","type":{"types":["cat.formulas"],"is_ref":true}}}},"selection":{"name":"selection","synonym":"Отбор","tooltip":"","fields":{"parent":{"synonym":"Родитель","tooltip":"","type":{"types":["string"],"str_len":100}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"left_value":{"synonym":"Левое значение","tooltip":"Путь к данным","type":{"types":["string"],"str_len":255}},"left_value_type":{"synonym":"Тип слева","tooltip":"Тип значения слева","default":"path","type":{"types":["string"],"str_len":100}},"comparison_type":{"synonym":"Вид сравнения","tooltip":"","type":{"types":["enm.comparison_types"],"is_ref":true}},"right_value":{"synonym":"Правое значение","tooltip":"","type":{"types":["string"],"str_len":100}},"right_value_type":{"synonym":"Тип справа","tooltip":"Тип значения справа","default":"path","type":{"types":["string"],"str_len":100}}}},"params":{"name":"params","synonym":"Параметры","tooltip":"","fields":{"param":{"synonym":"Параметр","tooltip":"","type":{"types":["string"],"str_len":100}},"value_type":{"synonym":"Тип","tooltip":"Тип значения","type":{"types":["string"],"str_len":100}},"value":{"synonym":"Значение","tooltip":"Может иметь примитивный или ссылочный тип или массив","type":{"types":["string","number"],"str_len":0,"digits":15,"fraction_figits":3,"date_part":"date"}},"quick_access":{"synonym":"Быстрый доступ","tooltip":"Размещать на нанели инструментов","type":{"types":["boolean"]}}}},"composition":{"name":"composition","synonym":"Структура","tooltip":"","fields":{"parent":{"synonym":"Родитель","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"use":{"synonym":"Использование","tooltip":"","type":{"types":["boolean"]}},"field":{"synonym":"Элемент","tooltip":"Элемент структуры отчета","type":{"types":["string"],"str_len":50}},"kind":{"synonym":"Вид раздела отчета","tooltip":"список, таблица, группировка строк, группировка колонок","type":{"types":["string"],"str_len":50}},"definition":{"synonym":"Описание","tooltip":"Описание раздела структуры","type":{"types":["string"],"str_len":50}}}},"conditional_appearance":{"name":"conditional_appearance","synonym":"Условное оформление","tooltip":"","fields":{}}},"cachable":"doc"},"params_links":{"name":"СвязиПараметров","splitted":true,"synonym":"Связи параметров","illustration":"Подчиненные параметры","obj_presentation":"Связь параметров","list_presentation":"Связи параметров","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"master":{"synonym":"Ведущий","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"slave":{"synonym":"Ведомый","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"hide":{"synonym":"Скрыть ведомый","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.params_links"],"is_ref":true}}},"tabular_sections":{"values":{"name":"Значения","synonym":"Значения","tooltip":"","fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["slave"]}],"choice_groups_elm":"elm","choice_type":{"path":["slave"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе ведущего параметра","type":{"types":["boolean"]}}}}},"cachable":"ram"},"partner_bank_accounts":{"name":"БанковскиеСчетаКонтрагентов","splitted":true,"synonym":"Банковские счета","illustration":"Банковские счета сторонних контрагентов и физических лиц.","obj_presentation":"Банковский счет","list_presentation":"Банковские счета","input_by_string":["name","account_number"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"account_number":{"synonym":"Номер счета","multiline_mode":false,"tooltip":"Номер расчетного счета организации","mandatory":true,"type":{"types":["string"],"str_len":20}},"bank":{"synonym":"Банк","multiline_mode":false,"tooltip":"Банк, в котором открыт расчетный счет организации","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"settlements_bank":{"synonym":"Банк для расчетов","multiline_mode":false,"tooltip":"Банк, в случае непрямых расчетов","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"correspondent_text":{"synonym":"Текст корреспондента","multiline_mode":false,"tooltip":"Текст \"Плательщик\\Получатель\" в платежных документах","type":{"types":["string"],"str_len":250}},"appointments_text":{"synonym":"Текст назначения","multiline_mode":false,"tooltip":"Текст назначения платежа","type":{"types":["string"],"str_len":250}},"funds_currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"bank_bic":{"synonym":"БИКБанка","multiline_mode":false,"tooltip":"БИК банка, в котором открыт счет","type":{"types":["string"],"str_len":9}},"bank_name":{"synonym":"Наименование банка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"bank_correspondent_account":{"synonym":"Корр. счет банк","multiline_mode":false,"tooltip":"Корр.счет банка","type":{"types":["string"],"str_len":20}},"bank_city":{"synonym":"Город банка","multiline_mode":false,"tooltip":"Город банка","type":{"types":["string"],"str_len":50}},"bank_address":{"synonym":"Адрес банка","multiline_mode":false,"tooltip":"Адрес банка","type":{"types":["string"],"str_len":0}},"bank_phone_numbers":{"synonym":"Телефоны банка","multiline_mode":false,"tooltip":"Телефоны банка","type":{"types":["string"],"str_len":0}},"settlements_bank_bic":{"synonym":"БИК банка для расчетов","multiline_mode":false,"tooltip":"БИК банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":9}},"settlements_bank_correspondent_account":{"synonym":"Корр. счет банка для расчетов","multiline_mode":false,"tooltip":"Корр.счет банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":20}},"settlements_bank_city":{"synonym":"Город банка для расчетов","multiline_mode":false,"tooltip":"Город банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Контрагент или физическое лицо, являющиеся владельцем банковского счета","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.individuals","cat.partners"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc_ram","form":{"obj":{"head":{" ":["name","owner","account_number","funds_currency","bank_bic","bank","settlements_bank_bic","settlements_bank"]}}}},"organization_bank_accounts":{"name":"БанковскиеСчетаОрганизаций","splitted":true,"synonym":"Банковские счета организаций","illustration":"Банковские счета собственных организаций. ","obj_presentation":"Банковский счет организации","list_presentation":"Банковские счета","input_by_string":["name","account_number"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"bank":{"synonym":"Банк","multiline_mode":false,"tooltip":"Банк, в котором открыт расчетный счет организации","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"bank_bic":{"synonym":"БИКБанка","multiline_mode":false,"tooltip":"БИК банка, в котором открыт счет","type":{"types":["string"],"str_len":9}},"funds_currency":{"synonym":"Валюта денежных средств","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"account_number":{"synonym":"Номер счета","multiline_mode":false,"tooltip":"Номер расчетного счета организации","mandatory":true,"type":{"types":["string"],"str_len":20}},"settlements_bank":{"synonym":"Банк для расчетов","multiline_mode":false,"tooltip":"Банк, в случае непрямых расчетов","choice_groups_elm":"elm","type":{"types":["cat.banks_qualifier"],"is_ref":true}},"settlements_bank_bic":{"synonym":"БИК банка для расчетов","multiline_mode":false,"tooltip":"БИК банка, в случае непрямых расчетов","type":{"types":["string"],"str_len":9}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, отвечающее за банковский счет","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Организация","multiline_mode":false,"tooltip":"Организация, являющиеся владельцем банковского счета","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram","form":{"obj":{"head":{" ":["name","owner","account_number","funds_currency","bank_bic","bank","settlements_bank_bic","settlements_bank"]}}}},"property_values_hierarchy":{"name":"ЗначенияСвойствОбъектовИерархия","splitted":true,"synonym":"Дополнительные значения (иерархия)","illustration":"","obj_presentation":"Дополнительное значение (иерархия)","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"heft":{"synonym":"Весовой коэффициент","multiline_mode":false,"tooltip":"Относительный вес дополнительного значения (значимость).","type":{"types":["number"],"digits":10,"fraction_figits":2}},"ПолноеНаименование":{"synonym":"Полное наименование","multiline_mode":true,"tooltip":"Подробное описание значения дополнительного реквизита","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит или сведение.","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Вышестоящее дополнительное значение свойства.","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.property_values_hierarchy"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"banks_qualifier":{"name":"КлассификаторБанковРФ","splitted":false,"synonym":"Классификатор банков РФ","illustration":"","obj_presentation":"Банк","list_presentation":"Банки","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"correspondent_account":{"synonym":"Корр. счет","multiline_mode":false,"tooltip":"Корреспондентский счет банка","type":{"types":["string"],"str_len":20}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город банка","type":{"types":["string"],"str_len":50}},"address":{"synonym":"Адрес","multiline_mode":false,"tooltip":"Адрес банка","type":{"types":["string"],"str_len":500}},"phone_numbers":{"synonym":"Телефоны","multiline_mode":false,"tooltip":"Телефоны банка","type":{"types":["string"],"str_len":250}},"activity_ceased":{"synonym":"Деятельность прекращена","multiline_mode":false,"tooltip":"Банк по каким-либо причинам прекратил свою деятельность","type":{"types":["boolean"]}},"swift":{"synonym":"СВИФТ БИК","multiline_mode":false,"tooltip":"Международный банковский идентификационный код (SWIFT BIC)","type":{"types":["string"],"str_len":11}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"Идентификационный номер налогоплательщика","type":{"types":["string"],"str_len":12}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа банков","multiline_mode":false,"tooltip":"Группа банков, в которую входит данный банк","type":{"types":["cat.banks_qualifier"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"destinations":{"name":"НаборыДополнительныхРеквизитовИСведений","splitted":true,"synonym":"Наборы дополнительных реквизитов и сведений","illustration":"","obj_presentation":"Набор дополнительных реквизитов и сведений","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"КоличествоРеквизитов":{"synonym":"Количество реквизитов","multiline_mode":false,"tooltip":"Количество реквизитов в наборе не помеченных на удаление.","type":{"types":["string"],"str_len":5}},"КоличествоСведений":{"synonym":"Количество сведений","multiline_mode":false,"tooltip":"Количество сведений в наборе не помеченных на удаление.","type":{"types":["string"],"str_len":5}},"Используется":{"synonym":"Используется","multiline_mode":false,"tooltip":"Набор свойств отображается в форме списка","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа, к которой относится набор.","type":{"types":["cat.destinations"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Дополнительный реквизит","multiline_mode":false,"tooltip":"Дополнительный реквизит этого набора","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"_deleted":{"synonym":"Пометка удаления","multiline_mode":false,"tooltip":"Устанавливается при исключении дополнительного реквизита из набора,\nчтобы можно было вернуть связь с уникальным дополнительным реквизитом.","type":{"types":["boolean"]}}}},"extra_properties":{"name":"ДополнительныеСведения","synonym":"Дополнительные сведения","tooltip":"","fields":{"property":{"synonym":"Дополнительное сведение","multiline_mode":false,"tooltip":"Дополнительное сведение этого набора","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"_deleted":{"synonym":"Пометка удаления","multiline_mode":false,"tooltip":"Устанавливается при исключении дополнительного сведения из набора,\nчтобы можно было вернуть связь с уникальным дополнительным сведением.","type":{"types":["boolean"]}}}}},"cachable":"ram"},"countries":{"name":"СтраныМира","splitted":true,"synonym":"Страны мира","illustration":"","obj_presentation":"Страна мира","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Наименование полное","multiline_mode":false,"tooltip":"Полное наименование страны мира","type":{"types":["string"],"str_len":100}},"alpha2":{"synonym":"Код альфа-2","multiline_mode":false,"tooltip":"Двузначный буквенный код альфа-2 страны по ОКСМ","type":{"types":["string"],"str_len":2}},"alpha3":{"synonym":"Код альфа-3","multiline_mode":false,"tooltip":"Трехзначный буквенный код альфа-3 страны по ОКСМ","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"formulas":{"name":"Формулы","splitted":true,"synonym":"Формулы","illustration":"Формулы пользователя, для выполнения при расчете спецификаций в справочниках Вставки, Соединения, Фурнитура и регистре Корректировки спецификации","obj_presentation":"Формула","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"Текст функции на языке javascript","type":{"types":["string"],"str_len":0}},"leading_formula":{"synonym":"Ведущая формула","multiline_mode":false,"tooltip":"Если указано, выполняется код ведущей формулы с параметрами, заданными для текущей формулы","choice_params":[{"name":"leading_formula","path":"00000000-0000-0000-0000-000000000000"}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"condition_formula":{"synonym":"Это формула условия","multiline_mode":false,"tooltip":"Формула используется, как фильтр, а не как алгоритм расчета количества.\nЕсли возвращает не Истина, строка в спецификацию не добавляется","type":{"types":["boolean"]}},"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"Описание в формате html","type":{"types":["string"],"str_len":0}},"template":{"synonym":"Шаблон","multiline_mode":true,"tooltip":"html шаблон отчета","type":{"types":["string"],"str_len":0}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания (служебный)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"async":{"synonym":"Асинхронный режим","multiline_mode":false,"tooltip":"Создавать асинхронную функцию","type":{"types":["boolean"]}},"disabled":{"synonym":"Отключена","multiline_mode":false,"tooltip":"Имеет смысл только для печатных форм и модификаторов","type":{"types":["boolean"]}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа формул","type":{"types":["cat.formulas"],"is_ref":true}}},"tabular_sections":{"params":{"name":"Параметры","synonym":"Параметры","tooltip":"","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["param"],"path":["params","param"]}],"choice_type":{"path":["params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}}},"cachable":"doc"},"elm_visualization":{"name":"пзВизуализацияЭлементов","splitted":true,"synonym":"Визуализация элементов","illustration":"Строки svg для рисования петель, ручек и графических примитивов","obj_presentation":"Визуализация элемента","list_presentation":"Визуализация элементов","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"svg_path":{"synonym":"Путь SVG","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"attributes":{"synonym":"Атрибуты","multiline_mode":false,"tooltip":"Дополнительные атрибуты svg path","type":{"types":["string"],"str_len":0}},"rotate":{"synonym":"Поворачивать","multiline_mode":false,"tooltip":"правила поворота эскиза параллельно касательной профиля в точке визуализации\n0 - поворачивать\n1 - ручка","type":{"types":["number"],"digits":1,"fraction_figits":0}},"offset":{"synonym":"Смещение","multiline_mode":false,"tooltip":"Смещение в мм относительно внещнего ребра элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона соедин.","multiline_mode":false,"tooltip":"имеет смысл только для импостов","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"elm_side":{"synonym":"Сторона элем.","multiline_mode":false,"tooltip":"(0) - изнутри, (1) - снаружи, (-1) - в середине элемента","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cx":{"synonym":"cx","multiline_mode":false,"tooltip":"Координата точки привязки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"cy":{"synonym":"cy","multiline_mode":false,"tooltip":"Координата точки привязки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"angle_hor":{"synonym":"Угол к горизонту","multiline_mode":false,"tooltip":"Угол к к горизонту элемента по умолчанию","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"branches":{"name":"ИнтеграцияОтделыАбонентов","splitted":true,"synonym":"Отделы абонентов","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"suffix":{"synonym":"Суффикс CouchDB","multiline_mode":false,"tooltip":"Для разделения данных в CouchDB","mandatory":true,"type":{"types":["string"],"str_len":4}},"direct":{"synonym":"Direct","multiline_mode":false,"tooltip":"Использовать прямое подключение к CouchDB без кеширования в браузере","type":{"types":["boolean"]}},"use":{"synonym":"Используется","multiline_mode":false,"tooltip":"Использовать данный отдел при создании баз и пользователей","type":{"types":["boolean"]}},"parent":{"synonym":"Ведущий отдел","multiline_mode":false,"tooltip":"Заполняется в случае иерархической репликации","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.branches"],"is_ref":true}}},"tabular_sections":{"organizations":{"name":"Организации","synonym":"Организации","tooltip":"Организации, у которых дилер может заказывать продукцию и услуги","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.organizations"],"is_ref":true}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"partners":{"name":"Контрагенты","synonym":"Контрагенты","tooltip":"Юридические лица дилера, от имени которых он оформляет заказы","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.partners"],"is_ref":true}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"divisions":{"name":"Подразделения","synonym":"Подразделения","tooltip":"Подразделения, к данным которых, дилеру предоставлен доступ","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.divisions"],"is_ref":true}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"price_types":{"name":"ТипыЦен","synonym":"Типы цен","tooltip":"Типы цен, привязанные к дилеру","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_prices_types"],"is_ref":true}}}},"keys":{"name":"Ключи","synonym":"Ключи","tooltip":"Ключи параметров, привязанные к дилеру","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.parameters_keys"],"is_ref":true}}}}},"cachable":"doc"},"currencies":{"name":"Валюты","splitted":true,"synonym":"Валюты","illustration":"Валюты, используемые при расчетах","obj_presentation":"Валюта","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Наименование валюты","multiline_mode":false,"tooltip":"Полное наименование валюты","mandatory":true,"type":{"types":["string"],"str_len":50}},"extra_charge":{"synonym":"Наценка","multiline_mode":false,"tooltip":"Коэффициент, который применяется к курсу основной валюты для вычисления курса текущей валюты.","type":{"types":["number"],"digits":10,"fraction_figits":2}},"main_currency":{"synonym":"Основная валюта","multiline_mode":false,"tooltip":"Валюта, на основании курса которой рассчитывается курс текущей валюты","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"parameters_russian_recipe":{"synonym":"Параметры прописи на русском","multiline_mode":false,"tooltip":"Параметры прописи валюты на русском языке","type":{"types":["string"],"str_len":200}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram","form":{"selection":{"fields":["ref","_deleted","id","name as presentation","name_full"],"cols":[{"id":"id","width":"120","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Обозначение"},{"id":"name_full","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","name_full","parameters_russian_recipe"],"Дополнительно":["main_currency","extra_charge"]},"tabular_sections":{},"tabular_sections_order":[]}}},"contact_information_kinds":{"name":"ВидыКонтактнойИнформации","splitted":true,"synonym":"Виды контактной информации","illustration":"","obj_presentation":"Вид контактной информации","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"mandatory_fields":{"synonym":"Обязательное заполнение","multiline_mode":false,"tooltip":"Вид контактной информации обязателен к заполнению","type":{"types":["boolean"]}},"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (адрес, телефон и т.д.)","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.contact_information_types"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа вида контактной информации","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"nom_kinds":{"name":"ВидыНоменклатуры","splitted":true,"synonym":"Виды номенклатуры","illustration":"","obj_presentation":"Вид номенклатуры","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"nom_type":{"synonym":"Тип номенклатуры","multiline_mode":false,"tooltip":"Указывается тип, к которому относится номенклатура данного вида.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.nom_types"],"is_ref":true}},"НаборСвойствНоменклатура":{"synonym":"Набор свойств номенклатура","multiline_mode":false,"tooltip":"Набор свойств, которым будет обладать номенклатура с этим видом","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"НаборСвойствХарактеристика":{"synonym":"Набор свойств характеристика","multiline_mode":false,"tooltip":"Набор свойств, которым будет обладать характеристика с этим видом","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_kinds"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"contracts":{"name":"ДоговорыКонтрагентов","splitted":true,"synonym":"Договоры контрагентов","illustration":"Перечень договоров, заключенных с контрагентами","obj_presentation":"Договор контрагента","list_presentation":"Договоры контрагентов","input_by_string":["name","id"],"hierarchical":true,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"settlements_currency":{"synonym":"Валюта взаиморасчетов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"mutual_settlements":{"synonym":"Ведение взаиморасчетов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.mutual_contract_settlements"],"is_ref":true}},"contract_kind":{"synonym":"Вид договора","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.contract_kinds"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"check_days_without_pay":{"synonym":"Держать резерв без оплаты ограниченное время","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"allowable_debts_amount":{"synonym":"Допустимая сумма дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"allowable_debts_days":{"synonym":"Допустимое число дней дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"check_debts_amount":{"synonym":"Контролировать сумму дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"check_debts_days":{"synonym":"Контролировать число дней дебиторской задолженности","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"number_doc":{"synonym":"Номер","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"main_cash_flow_article":{"synonym":"Основная статья движения денежных средств","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"main_project":{"synonym":"Основной проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"accounting_reflect":{"synonym":"Отражать в бухгалтерском учете","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"tax_accounting_reflect":{"synonym":"Отражать в налоговом учете","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"prepayment_percent":{"synonym":"Процент предоплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"validity":{"synonym":"Срок действия договора","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"vat_included":{"synonym":"Сумма включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"price_type":{"synonym":"Тип цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"vat_consider":{"synonym":"Учитывать НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"days_without_pay":{"synonym":"Число дней резерва без оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"parent":{"synonym":"Группа договоров","multiline_mode":false,"tooltip":"","type":{"types":["cat.contracts"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc_ram","form":{"selection":{"fields":["is_folder","id","_t_.name as presentation","enm_contract_kinds.synonym as contract_kind","enm_mutual_settlements.synonym as mutual_settlements","cat_organizations.name as organization","cat_partners.name as partner"],"cols":[{"id":"partner","width":"180","type":"ro","align":"left","sort":"server","caption":"Контрагент"},{"id":"organization","width":"180","type":"ro","align":"left","sort":"server","caption":"Организация"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"},{"id":"contract_kind","width":"150","type":"ro","align":"left","sort":"server","caption":"Вид договора"},{"id":"mutual_settlements","width":"150","type":"ro","align":"left","sort":"server","caption":"Ведение расчетов"}]},"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"parent","name","number_doc","date","validity","owner","organization","contract_kind","mutual_settlements","settlements_currency"],"Дополнительно":["accounting_reflect","tax_accounting_reflect","vat_consider","vat_included","price_type","main_project","main_cash_flow_article","check_debts_amount","check_debts_days","check_days_without_pay","prepayment_percent","allowable_debts_amount","allowable_debts_days","note"]}}}},"nom_units":{"name":"ЕдиницыИзмерения","splitted":true,"synonym":"Единицы измерения","illustration":"Перечень единиц измерения номенклатуры и номенклатурных групп","obj_presentation":"Единица измерения","list_presentation":"Единицы измерения","input_by_string":["name","id"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"qualifier_unit":{"synonym":"Единица по классификатору","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.units"],"is_ref":true}},"heft":{"synonym":"Вес","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"volume":{"synonym":"Объем","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":3}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"rounding_threshold":{"synonym":"Порог округления","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"ПредупреждатьОНецелыхМестах":{"synonym":"При округлении предупреждать о нецелых местах","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom_groups","cat.nom"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"property_values":{"name":"ЗначенияСвойствОбъектов","splitted":true,"synonym":"Дополнительные значения","illustration":"","obj_presentation":"Дополнительное значение","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"heft":{"synonym":"Весовой коэффициент","multiline_mode":false,"tooltip":"Относительный вес дополнительного значения (значимость).","type":{"types":["number"],"digits":10,"fraction_figits":2}},"ПолноеНаименование":{"synonym":"Полное наименование","multiline_mode":true,"tooltip":"Подробное описание значения дополнительного реквизита","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит или сведение.","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"parent":{"synonym":"Входит в группу","multiline_mode":false,"tooltip":"Группа дополнительных значений свойства.","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"type":{"types":["cat.property_values"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"meta_ids":{"name":"ИдентификаторыОбъектовМетаданных","splitted":false,"synonym":"Идентификаторы объектов метаданных","illustration":"Идентификаторы объектов метаданных для использования в базе данных.","obj_presentation":"Идентификатор объекта метаданных","list_presentation":"","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"full_moniker":{"synonym":"Полное имя","multiline_mode":false,"tooltip":"Полное имя объекта метаданных","type":{"types":["string"],"str_len":430}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа объектов","multiline_mode":false,"tooltip":"Группа объектов метаданных.","type":{"types":["cat.meta_ids"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"cashboxes":{"name":"Кассы","splitted":true,"synonym":"Кассы","illustration":"Список мест фактического хранения и движения наличных денежных средств предприятия. Кассы разделены по организациям и валютам денежных средств. ","obj_presentation":"Касса","list_presentation":"Кассы предприятия","input_by_string":["name","id"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"funds_currency":{"synonym":"Валюта денежных средств","multiline_mode":false,"tooltip":"Валюта учета денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, отвечающее за кассу.","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"current_account":{"synonym":"Расчетный счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["owner"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc_ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"name","owner","funds_currency"]}}}},"units":{"name":"КлассификаторЕдиницИзмерения","splitted":true,"synonym":"Классификатор единиц измерения","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":3,"fields":{"name_full":{"synonym":"Полное наименование","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"international_short":{"synonym":"Международное сокращение","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"partners":{"name":"Контрагенты","splitted":true,"synonym":"Контрагенты","illustration":"Список юридических или физических лиц клиентов (поставщиков, покупателей).","obj_presentation":"Контрагент","list_presentation":"Контрагенты","input_by_string":["name","id","inn"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"name_full":{"synonym":"Полное наименование","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"main_bank_account":{"synonym":"Основной банковский счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.partner_bank_accounts"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"kpp":{"synonym":"КПП","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":9}},"okpo":{"synonym":"Код по ОКПО","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"individual_legal":{"synonym":"Юр. / физ. лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.individual_legal"],"is_ref":true}},"main_contract":{"synonym":"Основной договор контрагента","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.contracts"],"is_ref":true}},"identification_document":{"synonym":"Документ, удостоверяющий личность","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"buyer_main_manager":{"synonym":"Основной менеджер покупателя","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"is_buyer":{"synonym":"Покупатель","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_supplier":{"synonym":"Поставщик","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"primary_contact":{"synonym":"Основное контактное лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа контрагентов","multiline_mode":false,"tooltip":"","type":{"types":["cat.partners"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"139d49b9-5301-45f3-b851-4488420d7d15"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0},"hide":true},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100},"hide":true},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100},"hide":true},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100},"hide":true},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20},"hide":true},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20},"hide":true}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"doc_ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"parent","name","name_full","is_buyer","is_supplier","individual_legal","inn","kpp","okpo","main_bank_account","main_contract","primary_contact","buyer_main_manager"],"Дополнительные реквизиты":[]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"nom":{"name":"Номенклатура","splitted":true,"synonym":"Номенклатура","illustration":"Перечень товаров, продукции, материалов, полуфабрикатов, тары, услуг","obj_presentation":"Позиция номенклатуры","list_presentation":"","input_by_string":["name","id","article"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":11,"fields":{"article":{"synonym":"Артикул ","multiline_mode":false,"tooltip":"Артикул номенклатуры.","type":{"types":["string"],"str_len":25}},"name_full":{"synonym":"Наименование для печати","multiline_mode":true,"tooltip":"Наименование номенклатуры, которое будет печататься во всех документах.","type":{"types":["string"],"str_len":1024}},"base_unit":{"synonym":"Базовая единица измерения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.units"],"is_ref":true}},"storage_unit":{"synonym":"Единица хранения остатков","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_units"],"is_ref":true}},"nom_kind":{"synonym":"Вид номенклатуры","multiline_mode":false,"tooltip":"Указывается вид, к которому следует отнести данную позицию номенклатуры.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"nom_group":{"synonym":"Номенклатурная группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups"],"is_ref":true}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"Определяется ставка НДС товара или услуги","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.vat_rates"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"price_group":{"synonym":"Ценовая группа","multiline_mode":false,"tooltip":"Определяет ценовую группу, к которой относится номенклатурная позиция.","choice_groups_elm":"elm","type":{"types":["cat.price_groups"],"is_ref":true}},"elm_type":{"synonym":"Тип элемента: рама, створка и т.п.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"Длина стандартной загатовки, мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина - A","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"thickness":{"synonym":"Толщина - T","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sizefurn":{"synonym":"Размер фурн. паза - D","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sizefaltz":{"synonym":"Размер фальца - F","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"density":{"synonym":"Плотность, кг / ед. хранения","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"volume":{"synonym":"Объем, м³ / ед. хранения","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"arc_elongation":{"synonym":"Удлинение арки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"loss_factor":{"synonym":"Коэффициент потерь","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":4}},"rounding_quantity":{"synonym":"Округлять количество","multiline_mode":false,"tooltip":"При расчете спецификации построителя, как в функции Окр(). 1: до десятых долей,  0: до целых, -1: до десятков","type":{"types":["number"],"digits":1,"fraction_figits":0}},"clr":{"synonym":"Цвет по умолчанию","multiline_mode":false,"tooltip":"Цвет материала по умолчанию. Актуально для заполнений, которые берём НЕ из системы","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"cutting_optimization_type":{"synonym":"Тип оптимизации","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.cutting_optimization_types"],"is_ref":true}},"crooked":{"synonym":"Кривой","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие кривое","type":{"types":["boolean"]}},"colored":{"synonym":"Цветной","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие цветное","type":{"types":["boolean"]}},"lay":{"synonym":"Раскладка","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие имеет раскладку","type":{"types":["boolean"]}},"made_to_order":{"synonym":"Заказной","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделие имеет заказные материалы, на которые должен обратить внимание ОМТС","type":{"types":["boolean"]}},"packing":{"synonym":"Упаковка","multiline_mode":false,"tooltip":"Если эта номенклатура есть в спецификации - изделию требуется упаковка","type":{"types":["boolean"]}},"days_to_execution":{"synonym":"Дней до готовности","multiline_mode":false,"tooltip":"Если номенклатура есть в спецификации, плановая готовность отодвигается на N дней","type":{"types":["number"],"digits":6,"fraction_figits":0}},"days_from_execution":{"synonym":"Дней от готовности","multiline_mode":false,"tooltip":"Обратный отсчет. Когда надо запустить в работу в цехе. Должно иметь значение <= ДнейДоГотовности","type":{"types":["number"],"digits":6,"fraction_figits":0}},"pricing":{"synonym":"","multiline_mode":false,"tooltip":"Дополнительная формула расчета цены на случай, когда не хватает возможностей стандартной подисистемы","choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"visualization":{"synonym":"Визуализация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.elm_visualization"],"is_ref":true}},"complete_list_sorting":{"synonym":"Сортировка в листе комплектации","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"is_accessory":{"synonym":"Это аксессуар","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_procedure":{"synonym":"Это техоперация","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_service":{"synonym":"Это услуга","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_pieces":{"synonym":"Штуки","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"Группа, в которую входит данная позиция номенклатуры.","type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"article","width":"150","type":"ro","align":"left","sort":"server","caption":"Артикул"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"},{"id":"nom_unit","width":"70","type":"ro","align":"left","sort":"server","caption":"Ед"},{"id":"thickness","width":"70","type":"ro","align":"left","sort":"server","caption":"Толщина"}]}}},"organizations":{"name":"Организации","splitted":true,"synonym":"Организации","illustration":"","obj_presentation":"Организация","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"prefix":{"synonym":"Префикс","multiline_mode":false,"tooltip":"Используется при нумерации документов. В начало каждого номера документов данной организации добавляется символы префикса.","type":{"types":["string"],"str_len":3}},"individual_legal":{"synonym":"Юр. / физ. лицо","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.individual_legal"],"is_ref":true}},"individual_entrepreneur":{"synonym":"Индивидуальный предприниматель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"kpp":{"synonym":"КПП","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":9}},"main_bank_account":{"synonym":"Основной банковский счет","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"main_cashbox":{"synonym":"Основноая касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"certificate_series_number":{"synonym":"Серия и номер свидетельства о постановке на учет","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":25}},"certificate_date_issue":{"synonym":"Дата выдачи свидетельства о постановке на учет","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"certificate_authority_name":{"synonym":"Наименование налогового органа, выдавшего свидетельство","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":254}},"certificate_authority_code":{"synonym":"Код налогового органа, выдавшего свидетельство","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":4}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.organizations"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"c34c4e9d-c7c5-42bb-8def-93ecfe7b1977"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0},"hide":true},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100},"hide":true},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50},"hide":true},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100},"hide":true},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100},"hide":true},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20},"hide":true},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20},"hide":true},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"ДействуетС":{"synonym":"Действует С","multiline_mode":false,"tooltip":"Дата актуальности контактная информация","type":{"types":["date"],"date_part":"date"}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0},"hide":true}}}},"cachable":"ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},{"id":"prefix","path":"o.prefix","synonym":"Префикс","type":"ro"},"name","individual_legal","individual_entrepreneur","main_bank_account","main_cashbox"],"Коды":["inn","kpp","certificate_series_number","certificate_date_issue","certificate_authority_name","certificate_authority_code"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"inserts":{"name":"Вставки","splitted":true,"synonym":"Вставки","illustration":"Армирование, пленки, вставки - дополнение спецификации, которое зависит от одного элемента","obj_presentation":"Вставка","list_presentation":"Вставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"article":{"synonym":"Артикул ","multiline_mode":false,"tooltip":"Для формулы","type":{"types":["string"],"str_len":100}},"insert_type":{"synonym":"Тип вставки","multiline_mode":false,"tooltip":"Используется, как фильтр в интерфейсе, плюс, от типа вставки могут зависеть алгоритмы расчета количеств и углов","choice_params":[{"name":"ref","path":["Профиль","Заполнение","МоскитнаяСетка","Элемент","Контур","Изделие","Подоконник","Откос","Водоотлив","Монтаж","Доставка","Набор"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.inserts_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"Вставку можно использовать для элементов с этим цветом","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.clrs"],"is_ref":true}},"lmin":{"synonym":"X min","multiline_mode":false,"tooltip":"X min (длина или ширина)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max","multiline_mode":false,"tooltip":"X max (длина или ширина)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"hmin":{"synonym":"Y min","multiline_mode":false,"tooltip":"Y min (высота)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"hmax":{"synonym":"Y max","multiline_mode":false,"tooltip":"Y max (высота)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"smin":{"synonym":"S min","multiline_mode":false,"tooltip":"Площадь min","type":{"types":["number"],"digits":8,"fraction_figits":3}},"smax":{"synonym":"S max","multiline_mode":false,"tooltip":"Площадь max","type":{"types":["number"],"digits":8,"fraction_figits":3}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"ahmin":{"synonym":"α min","multiline_mode":false,"tooltip":"AH min (угол к горизонтали)","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"α max","multiline_mode":false,"tooltip":"AH max (угол к горизонтали)","type":{"types":["number"],"digits":3,"fraction_figits":0}},"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"Не используется","type":{"types":["number"],"digits":6,"fraction_figits":0}},"mmin":{"synonym":"Масса min","multiline_mode":false,"tooltip":"M min (масса)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"mmax":{"synonym":"Масса max","multiline_mode":false,"tooltip":"M max (масса)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"impost_fixation":{"synonym":"Крепление импостов","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.impost_mount_options"],"is_ref":true}},"shtulp_fixation":{"synonym":"Крепление штульпа","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"can_rotate":{"synonym":"Можно поворачивать","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"sizeb":{"synonym":"Размер \"B\"","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"clr_group":{"synonym":"Доступность цветов","multiline_mode":false,"tooltip":"Если указано, выбор цветов будет ограничен этой группой","choice_params":[{"name":"color_price_group_destination","path":"ДляОграниченияДоступности"}],"choice_groups_elm":"elm","type":{"types":["cat.color_price_groups"],"is_ref":true}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если заполнено, строка будет добавлена в заказ, а не в спецификацию текущей продукции","choice_groups_elm":"elm","type":{"types":["enm.specification_order_row_types"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"insert_glass_type":{"synonym":"Тип вставки стп","multiline_mode":false,"tooltip":"Тип вставки стеклопакета","choice_groups_elm":"elm","type":{"types":["enm.inserts_glass_types"],"is_ref":true}},"available":{"synonym":"Доступна в интерфейсе","multiline_mode":false,"tooltip":"Показывать эту вставку в списках допвставок в элемент, изделие и контур","type":{"types":["boolean"]}},"slave":{"synonym":"Ведомая","multiline_mode":false,"tooltip":"Выполнять пересчет спецификации этой вставки при изменении других строк заказа (например, спецификация монтажа)","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"coefficient":{"synonym":"Коэфф.","multiline_mode":false,"tooltip":"коэффициент (кол-во комплектующего на 1мм профиля или 1м² заполнения)","type":{"types":["number"],"digits":14,"fraction_figits":8}},"angle_calc_method":{"synonym":"Расчет угла","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.angle_calculating_ways"],"is_ref":true}},"count_calc_method":{"synonym":"Расчет колич.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.count_calculating_ways"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e24b-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"lmin":{"synonym":"Длина min","multiline_mode":false,"tooltip":"Минимальная длина или ширина","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"Длина max","multiline_mode":false,"tooltip":"Максимальная длина или ширина","type":{"types":["number"],"digits":6,"fraction_figits":0}},"ahmin":{"synonym":"Угол min","multiline_mode":false,"tooltip":"Минимальный угол к горизонтали","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"Угол max","multiline_mode":false,"tooltip":"Максимальный угол к горизонтали","type":{"types":["number"],"digits":3,"fraction_figits":0}},"smin":{"synonym":"S min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"smax":{"synonym":"S max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"step":{"synonym":"Шаг","multiline_mode":false,"tooltip":"Шаг (расчет по точкам)","type":{"types":["number"],"digits":10,"fraction_figits":3}},"step_angle":{"synonym":"Угол шага","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"offsets":{"synonym":"Отступы шага","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"do_center":{"synonym":"↔","multiline_mode":false,"tooltip":"Положение от края или от центра","type":{"types":["boolean"]}},"attrs_option":{"synonym":"Направления","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.inset_attrs_options"],"is_ref":true}},"end_mount":{"synonym":"Концевые крепления","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если заполнено, строка будет добавлена в заказ, а не в спецификацию текущей продукции","choice_groups_elm":"elm","type":{"types":["enm.specification_order_row_types"],"is_ref":true}},"is_main_elm":{"synonym":"Это основной элемент","multiline_mode":false,"tooltip":"Для профильных вставок определяет номенклатуру, размеры которой будут использованы при построении эскиза","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["selection_params","comparison_type"]},{"name":["selection","owner"],"path":["selection_params","param"]},{"name":["txt_row"],"path":["selection_params","txt_row"]}],"choice_type":{"path":["selection_params","param"],"elm":0},"mandatory":true,"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"insert_type","width":"200","type":"ro","align":"left","sort":"server","caption":"Тип вставки"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","insert_type","sizeb","clr","clr_group","is_order_row","priority"],"Дополнительно":["lmin","lmax","hmin","hmax","smin","smax","ahmin","ahmax","mmin","mmax","for_direct_profile_only","impost_fixation","shtulp_fixation","can_rotate"]},"tabular_sections":{"specification":{"fields":["nom","clr","quantity","sz","coefficient","angle_calc_method","count_calc_method","formula","is_order_row","is_main_elm","lmin","lmax","ahmin","ahmax","smin","smax"],"headers":"Номенклатура,Цвет,Колич.,Размер,Коэфф.,Расч.угла,Расч.колич.,Формула,↑ В заказ,Осн. мат.,Длина min,Длина max,Угол min,Угол max,S min, S max","widths":"*,160,100,100,100,140,140,160,80,80,100,100,100,100,100,100","min_widths":"200,160,100,100,100,140,140,160,140,80,100,100,100,100,100,100","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ref,ref,calck,calck,calck,ref,ref,ref,ref,ch,calck,calck,calck,calck,calck,calck"}},"tabular_sections_order":["specification"]}}},"parameters_keys":{"name":"КлючиПараметров","splitted":true,"synonym":"Ключи параметров","illustration":"Списки пар {Параметр:Значение} для фильтрации в подсистемах формирования спецификаций, планировании и ценообразовании\n","obj_presentation":"Ключ параметров","list_presentation":"Ключи параметров","input_by_string":["name"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания","type":{"types":["number"],"digits":5,"fraction_figits":0}},"applying":{"synonym":"Применение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.parameters_keys_applying"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.parameters_keys"],"is_ref":true}}},"tabular_sections":{"params":{"name":"Параметры","synonym":"Параметры","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["params","comparison_type"]},{"name":["selection","owner"],"path":["params","property"]},{"name":["txt_row"],"path":["params","txt_row"]}],"choice_type":{"path":["params","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc_ram"},"production_params":{"name":"пзПараметрыПродукции","splitted":true,"synonym":"Параметры продукции","illustration":"Настройки системы профилей и фурнитуры","obj_presentation":"Система","list_presentation":"Параметры продукции","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"default_clr":{"synonym":"Осн цвет","multiline_mode":false,"tooltip":"Основной цвет изделия","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"clr_group":{"synonym":"Доступность цветов","multiline_mode":false,"tooltip":"","choice_params":[{"name":"color_price_group_destination","path":"ДляОграниченияДоступности"}],"choice_groups_elm":"elm","type":{"types":["cat.color_price_groups"],"is_ref":true}},"tmin":{"synonym":"Толщина заполнения min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmax":{"synonym":"Толщина заполнения max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"allow_open_cnn":{"synonym":"Незамкн. контуры","multiline_mode":false,"tooltip":"Допускаются незамкнутые контуры","type":{"types":["boolean"]}},"flap_pos_by_impost":{"synonym":"Положение ств. по имп.","multiline_mode":false,"tooltip":"Использовать положения Центр, Центр вертикаль и Центр горизонталь для створок","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params"],"is_ref":true}}},"tabular_sections":{"elmnts":{"name":"Элементы","synonym":"Элементы","tooltip":"Типовые рама, створка, импост и заполнение для данной системы","fields":{"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Рама","Створка","Импост","Штульп","Заполнение","Раскладка","Добор","Соединитель","Москитка","Водоотлив","Стекло"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.elm_types"],"is_ref":true}},"nom":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"pos":{"synonym":"Положение","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Лев","Прав","Верх","Низ","ЦентрВертикаль","ЦентрГоризонталь","Центр","Любое"]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}}}},"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["production","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}}},"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры изделия","tooltip":"Значения параметров изделия по умолчанию","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"Не показывать строку параметра в диалоге свойств изделия","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}},"furn_params":{"name":"ПараметрыФурнитуры","synonym":"Параметры фурнитуры","tooltip":"Значения параметров фурнитуры по умолчанию","fields":{"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["furn_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["furn_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"forcibly":{"synonym":"Принудительно","multiline_mode":false,"tooltip":"Замещать установленное ранее значение при перевыборе системы","type":{"types":["boolean"]}}}},"base_blocks":{"name":"ТиповыеБлоки","synonym":"Шаблоны","tooltip":"","fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_params":[{"name":"obj_delivery_state","path":"Шаблон"}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["doc.calc_order"],"is_ref":true}}}}},"cachable":"ram","form":{"obj":{"head":{" ":["id","name","parent","clr_group","tmin","tmax","allow_open_cnn"]},"tabular_sections":{"elmnts":{"fields":["by_default","elm_type","nom","clr","pos"],"headers":"√,Тип,Номенклатура,Цвет,Положение","widths":"70,160,*,160,160","min_widths":"70,160,200,160,160","aligns":"","sortings":"na,na,na,na,na","types":"ch,ref,ref,ref,ref"},"production":{"fields":["nom","param","value"],"headers":"Номенклатура,Параметр,Значение","widths":"*,160,160","min_widths":"200,160,160","aligns":"","sortings":"na,na,na","types":"ref,ro,ro"},"product_params":{"fields":["param","value","hide","forcibly"],"headers":"Параметр,Значение,Скрыть,Принудительно","widths":"*,*,80,80","min_widths":"200,200,80,80","aligns":"","sortings":"na,na,na,na","types":"ro,ro,ch,ch"},"furn_params":{"fields":["param","value","hide","forcibly"],"headers":"Параметр,Значение,Скрыть,Принудительно","widths":"*,*,80,80","min_widths":"200,200,80,80","aligns":"","sortings":"na,na,na,na","types":"ro,ro,ch,ch"},"base_blocks":{"fields":["calc_order"],"headers":"Расчет","widths":"*","min_widths":"200","aligns":"","sortings":"na","types":"ref"}},"tabular_sections_order":["elmnts","production","product_params","furn_params","base_blocks"]}}},"delivery_areas":{"name":"РайоныДоставки","splitted":true,"synonym":"Районы доставки","illustration":"","obj_presentation":"Район доставки","list_presentation":"Районы доставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.countries"],"is_ref":true}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион, край, область","mandatory":true,"type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город (населенный пункт)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"latitude":{"synonym":"Гео. коорд. Широта","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":12}},"longitude":{"synonym":"Гео. коорд. Долгота","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":12}},"ind":{"synonym":"Индекс","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":6}},"delivery_area":{"synonym":"Район (внутри города)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"specify_area_by_geocoder":{"synonym":"Уточнять район геокодером","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"cnns":{"name":"пзСоединения","splitted":true,"synonym":"Соединения элементов","illustration":"Спецификации соединений элементов","obj_presentation":"Соединение","list_presentation":"Соединения","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"priority":{"synonym":"Приоритет","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол минимальный","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"Угол максимальный","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"sd1":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_sides"],"is_ref":true}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"cnn_type":{"synonym":"Тип соединения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.cnn_types"],"is_ref":true}},"ahmin":{"synonym":"AH min (угол к горизонтали)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"ahmax":{"synonym":"AH max (угол к горизонтали)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"lmin":{"synonym":"Длина шва min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"Длина шва max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmin":{"synonym":"Толщина min ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"tmax":{"synonym":"Толщина max ","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"var_layers":{"synonym":"Створки в разн. плоск.","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"art1vert":{"synonym":"Арт1 верт.","multiline_mode":false,"tooltip":"Соединение используется только в том случае, если Артикул1 - вертикальный","type":{"types":["boolean"]}},"art1glass":{"synonym":"Арт1 - стеклопакет","multiline_mode":false,"tooltip":"Артикул1 может быть составным стеклопакетом","type":{"types":["boolean"]}},"art2glass":{"synonym":"Арт2 - стеклопакет","multiline_mode":false,"tooltip":"Артикул2 может быть составным стеклопакетом","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts","cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"коэффициент (кол-во комплектующего на 1мм профиля)","type":{"types":["number"],"digits":14,"fraction_figits":8}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"размер (в мм, на которое компл. заходит на Артикул 2)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e259-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"sz_min":{"synonym":"Размер min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"sz_max":{"synonym":"Размер max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"Угол min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amax":{"synonym":"Угол max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"set_specification":{"synonym":"Устанавливать","multiline_mode":false,"tooltip":"Устанавливать спецификацию","choice_groups_elm":"elm","type":{"types":["enm.specification_installation_methods"],"is_ref":true}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"by_contour":{"synonym":"По контуру","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"contraction_by_contour":{"synonym":"Укорочение по контуру","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"on_aperture":{"synonym":"На проем","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"angle_calc_method":{"synonym":"Расчет угла","multiline_mode":false,"tooltip":"Способ расчета угла","choice_groups_elm":"elm","type":{"types":["enm.angle_calculating_ways"],"is_ref":true}},"contour_number":{"synonym":"Контур №","multiline_mode":false,"tooltip":"Номер контура (доп)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}}}},"cnn_elmnts":{"name":"СоединяемыеЭлементы","synonym":"Соединяемые элементы","tooltip":"","fields":{"nom1":{"synonym":"Номенклатура1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr1":{"synonym":"Цвет1","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom2":{"synonym":"Номенклатура2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr2":{"synonym":"Цвет2","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"varclr":{"synonym":"Разные цвета","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_nom_combinations_row":{"synonym":"Это строка сочетания номенклатур","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["selection_params","comparison_type"]},{"name":["selection","owner"],"path":["selection_params","param"]},{"name":["txt_row"],"path":["selection_params","txt_row"]}],"choice_type":{"path":["selection_params","param"],"elm":0},"mandatory":true,"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"cnn_type","width":"200","type":"ro","align":"left","sort":"server","caption":"Тип"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","cnn_type","sz","priority"],"Дополнительно":["sd1","amin","amax","ahmin","ahmax","lmin","lmax","tmin","tmax","var_layers","for_direct_profile_only","art1vert","art1glass","art2glass"]},"tabular_sections":{"specification":{"fields":["nom","clr","quantity","sz","coefficient","angle_calc_method","formula","is_order_row","sz_min","sz_max","amin","amax","set_specification","for_direct_profile_only"],"headers":"Номенклатура,Цвет,Колич.,Размер,Коэфф.,Расч.угла,Формула,↑ В заказ,Размер min,Размер max,Угол min,Угол max,Устанавливать,Для прямых","widths":"*,160,100,100,100,140,160,140,100,100,100,100,140,140","min_widths":"200,160,100,100,100,140,160,140,100,100,100,100,140,140","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ref,ref,calck,calck,calck,ref,ref,ref,calck,calck,calck,calck,ref,calck"},"cnn_elmnts":{"fields":["nom1","clr1","nom2","clr2","varclr","is_nom_combinations_row"],"headers":"Номенклатура1,Цвет1,Номенклатура2,Цвет2,Разные цвета","widths":"*,*,*,*,100","min_widths":"160,160,160,160,100","aligns":"","sortings":"na,na,na,na,na","types":"ref,ref,ref,ref,ch"}},"tabular_sections_order":["specification","cnn_elmnts"]}}},"furns":{"name":"пзФурнитура","splitted":true,"synonym":"Фурнитура","illustration":"Описывает ограничения и правила формирования спецификаций фурнитуры","obj_presentation":"Фурнитура","list_presentation":"Фурнитура","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"flap_weight_max":{"synonym":"Масса створки макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"left_right":{"synonym":"Левая правая","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"is_set":{"synonym":"Это набор","multiline_mode":false,"tooltip":"Определяет, является элемент набором для построения спецификации или комплектом фурнитуры для выбора в построителе","type":{"types":["boolean"]}},"is_sliding":{"synonym":"Это раздвижка","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"furn_set":{"synonym":"Набор фурнитуры","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.furns"],"is_ref":true}},"side_count":{"synonym":"Количество сторон","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"handle_side":{"synonym":"Ручка на стороне","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"open_type":{"synonym":"Тип открывания","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.open_types"],"is_ref":true}},"name_short":{"synonym":"Наименование сокращенное","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":3}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.furns"],"is_ref":true}}},"tabular_sections":{"open_tunes":{"name":"НастройкиОткрывания","synonym":"Настройки открывания","tooltip":"","fields":{"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"lmin":{"synonym":"X min (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"α мин","multiline_mode":false,"tooltip":"Минимальный угол к соседнему элементу","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"α макс","multiline_mode":false,"tooltip":"Максимальный угол к соседнему элементу","type":{"types":["number"],"digits":3,"fraction_figits":0}},"arc_available":{"synonym":"Дуга","multiline_mode":false,"tooltip":"Разрешено искривление элемента","type":{"types":["boolean"]}},"shtulp_available":{"synonym":"Штульп безимп соед","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"shtulp_fix_here":{"synonym":"Крепится штульп","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"rotation_axis":{"synonym":"Ось поворота","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"partial_opening":{"synonym":"Неполн. откр.","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"outline":{"synonym":"Эскиз","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"№ доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура/Набор","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom","cat.furns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["nom"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"handle_height_base":{"synonym":"Выс. ручк.","multiline_mode":false,"tooltip":"Высота ручки по умолчению.\n>0: фиксированная высота\n=0: Высоту задаёт оператор\n<0: Ручка по центру","type":{"types":["number"],"digits":6,"fraction_figits":0}},"fix_ruch":{"synonym":"Высота ручки фиксирована","multiline_mode":false,"tooltip":"Запрещено изменять высоту ручки","type":{"types":["boolean"]}},"handle_height_min":{"synonym":"Выс. ручк. min","multiline_mode":false,"tooltip":"Строка будет добавлена только в том случае, если ручка выше этого значеия","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_max":{"synonym":"Выс. ручк. max","multiline_mode":false,"tooltip":"Строка будет добавлена только в том случае, если ручка ниже этого значеия","type":{"types":["number"],"digits":6,"fraction_figits":0}},"contraction":{"synonym":"Укорочение","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"contraction_option":{"synonym":"Укороч. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.contraction_options"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":8}},"flap_weight_min":{"synonym":"Масса створки min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"flap_weight_max":{"synonym":"Масса створки max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"Сторона фурнитуры, на которую устанавливается элемент или выполняется операция","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cnn_side":{"synonym":"Сторона соед.","multiline_mode":false,"tooltip":"Фильтр: выполнять операцию, если примыкающий элемент примыкает с заданной стороны","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"offset_option":{"synonym":"Смещ. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.offset_options"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e25a-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"transfer_option":{"synonym":"Перенос опер.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.transfer_operations_options"],"is_ref":true}},"overmeasure":{"synonym":"Припуск","multiline_mode":false,"tooltip":"Учитывать припуск длины элемента (например, на сварку)","type":{"types":["boolean"]}},"is_main_specification_row":{"synonym":"Это строка основной спецификации","multiline_mode":false,"tooltip":"Интерфейсное поле (доп=0) для редактирования без кода","type":{"types":["boolean"]}},"is_set_row":{"synonym":"Это строка набора","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Фурнитура) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_procedure_row":{"synonym":"Это строка операции","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Номенклатура И ТипНоменклатуры = Техоперация) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}}}},"selection_params":{"name":"ПараметрыОтбора","synonym":"Параметры отбора","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"comparison_type":{"synonym":"Вид сравнения","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["gt","gte","lt","lte","eq","ne","in","nin","inh","ninh"]}],"choice_groups_elm":"elm","type":{"types":["enm.comparison_types"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["comparison_type"],"path":["selection_params","comparison_type"]},{"name":["selection","owner"],"path":["selection_params","param"]},{"name":["txt_row"],"path":["selection_params","txt_row"]}],"choice_type":{"path":["selection_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового реквизита либо сериализация списочного значения","type":{"types":["string"],"str_len":0}}}},"specification_restrictions":{"name":"ОграниченияСпецификации","synonym":"Ограничения спецификации","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"lmin":{"synonym":"X min (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"lmax":{"synonym":"X max (длина или ширина)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"amin":{"synonym":"α мин","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"amax":{"synonym":"α макс","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":3,"fraction_figits":0}},"for_direct_profile_only":{"synonym":"Для прямых","multiline_mode":false,"tooltip":"Использовать только для прямых профилей (1), только для кривых (-1) или всегда(0)","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"colors":{"name":"Цвета","synonym":"Цвета","tooltip":"Цаета, доступные для данной фурнитуры","fields":{"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}}}},"cachable":"ram","form":{"selection":{"fields":[],"cols":[{"id":"id","width":"140","type":"ro","align":"left","sort":"server","caption":"Код"},{"id":"open_type","width":"150","type":"ro","align":"left","sort":"server","caption":"Тип открывания"},{"id":"presentation","width":"*","type":"ro","align":"left","sort":"server","caption":"Наименование"}]},"obj":{"head":{" ":["id","name","name_short","parent","open_type","is_set","furn_set"],"Дополнительно":["side_count","left_right","handle_side","is_sliding"]},"tabular_sections":{"open_tunes":{"fields":["side","lmin","lmax","amin","amax","rotation_axis","partial_opening","arc_available","shtulp_available","shtulp_fix_here"],"headers":"Сторона,L min,L max,Угол min,Угол max,Ось поворота,Неполн. откр.,Дуга,Разрешен штульп,Крепится штульп","widths":"*,*,*,*,*,100,100,100,100,100","min_widths":"100,100,100,100,100,100,100,100,100,100","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na","types":"calck,calck,calck,calck,calck,ch,ch,ch,ch,ch"},"specification":{"fields":["elm","dop","nom","clr","quantity","coefficient","side","cnn_side","offset_option","formula","transfer_option"],"headers":"Элемент,Доп,Материал,Цвет,Колич.,Коэфф.,Сторона,Строна соед.,Смещ. от,Формула,Перенос опер.","widths":"80,80,*,140,100,100,100,140,140,140,140","min_widths":"80,80,200,140,100,100,100,140,140,140,140","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ref,ref,calck,calck,calck,ref,ref,ref,ref"}},"tabular_sections_order":["open_tunes","specification"]}}},"clrs":{"name":"пзЦвета","splitted":true,"synonym":"Цвета","illustration":"","obj_presentation":"Цвет","list_presentation":"Цвета","input_by_string":["name","id","ral"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"ral":{"synonym":"Цвет RAL","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"machine_tools_clr":{"synonym":"Код для станка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"clr_str":{"synonym":"Цвет в построителе","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":36}},"clr_out":{"synonym":"Цвет снаружи","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"clr_in":{"synonym":"Цвет изнутри","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.clrs"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"color_price_groups":{"name":"ЦветоЦеновыеГруппы","splitted":true,"synonym":"Цвето-ценовые группы","illustration":"","obj_presentation":"Цвето-ценовая группа","list_presentation":"Цвето-ценовые группы","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"color_price_group_destination":{"synonym":"Назначение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.color_price_group_destinations"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"price_groups":{"name":"ЦеновыеГруппы","synonym":"Ценовые группы","tooltip":"","fields":{"price_group":{"synonym":"Ценовая гр. или номенклатура","multiline_mode":false,"tooltip":"Ссылка на ценовую группу или номенклатуру или папку (родитель - первый уровень иерархии) номенклатуры, для которой действует соответствие цветов","type":{"types":["cat.price_groups","cat.nom"],"is_ref":true}}}},"clr_conformity":{"name":"СоответствиеЦветов","synonym":"Соответствие цветов","tooltip":"","fields":{"clr1":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","type":{"types":["cat.color_price_groups","cat.clrs"],"is_ref":true}},"clr2":{"synonym":"Соответствие","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}}},"cachable":"ram"},"divisions":{"name":"Подразделения","splitted":true,"synonym":"Подразделения","illustration":"Перечень подразделений предприятия","obj_presentation":"Подразделение","list_presentation":"Подразделения","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":9,"fields":{"main_project":{"synonym":"Основной проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания (служебный)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Входит в подразделение","multiline_mode":false,"tooltip":"","type":{"types":["cat.divisions"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc_ram"},"users":{"name":"Пользователи","splitted":true,"synonym":"Пользователи","illustration":"","obj_presentation":"Пользователь","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"invalid":{"synonym":"Недействителен","multiline_mode":false,"tooltip":"Пользователь больше не работает в программе, но сведения о нем сохранены.\nНедействительные пользователи скрываются из всех списков\nпри выборе или подборе в документах и других местах программы.","type":{"types":["boolean"]}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"Подразделение, в котором работает пользователь","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"individual_person":{"synonym":"Физическое лицо","multiline_mode":false,"tooltip":"Физическое лицо, с которым связан пользователь","choice_groups_elm":"elm","type":{"types":["cat.individuals"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":true,"tooltip":"Произвольная строка","type":{"types":["string"],"str_len":0}},"ancillary":{"synonym":"Служебный","multiline_mode":false,"tooltip":"Неразделенный или разделенный служебный пользователь, права к которому устанавливаются непосредственно и программно.","type":{"types":["boolean"]}},"user_ib_uid":{"synonym":"Идентификатор пользователя ИБ","multiline_mode":false,"tooltip":"Уникальный идентификатор пользователя информационной базы, с которым сопоставлен этот элемент справочника.","choice_groups_elm":"elm","type":{"types":["string"],"str_len":36,"str_fix":true}},"user_fresh_uid":{"synonym":"Идентификатор пользователя сервиса","multiline_mode":false,"tooltip":"Уникальный идентификатор пользователя сервиса, с которым сопоставлен этот элемент справочника.","choice_groups_elm":"elm","type":{"types":["string"],"str_len":36,"str_fix":true}},"id":{"synonym":"Логин","multiline_mode":true,"tooltip":"Произвольная строка","type":{"types":["string"],"str_len":50}},"prefix":{"synonym":"Префикс нумерации документов","multiline_mode":false,"tooltip":"Префикс номеров документов текущего пользователя","mandatory":true,"type":{"types":["string"],"str_len":2}},"branch":{"synonym":"Отдел","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.branches"],"is_ref":true}},"push_only":{"synonym":"Только push репликация","multiline_mode":false,"tooltip":"Синхронизировать браузерную базу doc только в одну сторону - от пользователя","type":{"types":["boolean"]}},"suffix":{"synonym":"Суффикс CouchDB","multiline_mode":false,"tooltip":"Для разделения данных в CouchDB","mandatory":true,"type":{"types":["string"],"str_len":4}},"direct":{"synonym":"Direct","multiline_mode":false,"tooltip":"Использовать прямое подключение к CouchDB без кеширования в браузере","type":{"types":["boolean"]}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Дополнительные реквизиты объекта","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"8cbaa30d-faab-45ad-880e-84f8b421f448"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}}},"acl_objs":{"name":"ОбъектыДоступа","synonym":"Объекты доступа","tooltip":"","fields":{"acl_obj":{"synonym":"Объект доступа","multiline_mode":false,"tooltip":"","type":{"types":["cat.individuals","cat.users","cat.nom_prices_types","cat.divisions","cat.parameters_keys","cat.partners","cat.organizations","cat.cashboxes","cat.meta_ids","cat.stores"],"is_ref":true}},"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"by_default":{"synonym":"По умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}}},"cachable":"ram","form":{"obj":{"head":{" ":["id","name","individual_person"],"Дополнительно":["ancillary","invalid",{"id":"user_ib_uid","path":"o.user_ib_uid","synonym":"Идентификатор пользователя ИБ","type":"ro"},{"id":"user_fresh_uid","path":"o.user_fresh_uid","synonym":"Идентификатор пользователя сервиса","type":"ro"},"note"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"projects":{"name":"Проекты","splitted":true,"synonym":"Проекты","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":11,"fields":{"start":{"synonym":"Старт","multiline_mode":false,"tooltip":"Плановая дата начала работ по проекту.","type":{"types":["date"],"date_part":"date"}},"finish":{"synonym":"Финиш","multiline_mode":false,"tooltip":"Плановая дата окончания работ по проекту.","type":{"types":["date"],"date_part":"date"}},"launch":{"synonym":"Запуск","multiline_mode":false,"tooltip":"Фактическая дата начала работ по проекту.","type":{"types":["date"],"date_part":"date_time"}},"readiness":{"synonym":"Готовность","multiline_mode":false,"tooltip":"Фактическая дата окончания  работ по проекту.","type":{"types":["date"],"date_part":"date_time"}},"finished":{"synonym":"Завершен","multiline_mode":false,"tooltip":"Признак, указывающий на то, что работы по проекту завершены.","type":{"types":["boolean"]}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Ответственный за реализацию проекта.","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Любые комментарии по проекту","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.projects"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"stores":{"name":"Склады","splitted":true,"synonym":"Склады (места хранения)","illustration":"Сведения о местах хранения товаров (складах), их структуре и физических лицах, назначенных материально ответственными (МОЛ) за тот или иной склад","obj_presentation":"Склад","list_presentation":"Склады","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Группа","multiline_mode":false,"tooltip":"","type":{"types":["cat.stores"],"is_ref":true}}},"tabular_sections":{"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"Набор реквизитов, состав которого определяется компанией.","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc_ram"},"work_shifts":{"name":"Смены","splitted":true,"synonym":"Смены","illustration":"Перечень рабочих смен предприятия","obj_presentation":"Смена","list_presentation":"Смены","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"work_shift_periodes":{"name":"ПериодыСмены","synonym":"Периоды смены","tooltip":"","fields":{"begin_time":{"synonym":"Время начала","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"time"}},"end_time":{"synonym":"Время окончания","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"time"}}}}},"cachable":"doc"},"cash_flow_articles":{"name":"СтатьиДвиженияДенежныхСредств","splitted":true,"synonym":"Статьи движения денежных средств","illustration":"Перечень статей движения денежных средств (ДДС), используемых в предприятии для проведения анализа поступлений и расходов в разрезе статей движения денежных средств. ","obj_presentation":"Статья движения денежных средств","list_presentation":"Статьи движения денежных средств","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"Рекомендации по выбору статьи движения денежных средств в документах","type":{"types":["string"],"str_len":1024}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Определяет порядок вывода вариантов анализа в мониторе целевых показателей при группировке по категориям целей.","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"В группе статей","multiline_mode":false,"tooltip":"Группа статей движения денежных средств","type":{"types":["cat.cash_flow_articles"],"is_ref":true}}},"tabular_sections":{},"cachable":"doc"},"nom_prices_types":{"name":"ТипыЦенНоменклатуры","splitted":true,"synonym":"Типы цен номенклатуры","illustration":"Перечень типов отпускных цен предприятия","obj_presentation":"Тип цен номенклатуры","list_presentation":"Типы цен номенклатуры","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"price_currency":{"synonym":"Валюта цены по умолчанию","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}},"discount_percent":{"synonym":"Процент скидки или наценки по умолчанию","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"vat_price_included":{"synonym":"Цена включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"rounding_order":{"synonym":"Порядок округления","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"rounding_in_a_big_way":{"synonym":"Округлять в большую сторону","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"doc_ram"},"individuals":{"name":"ФизическиеЛица","splitted":true,"synonym":"Физические лица","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":10,"fields":{"birth_date":{"synonym":"Дата рождения","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"inn":{"synonym":"ИНН","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":12}},"imns_code":{"synonym":"Код ИФНС","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":4}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"pfr_number":{"synonym":"Страховой номер ПФР","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":14}},"sex":{"synonym":"Пол","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.gender"],"is_ref":true}},"birth_place":{"synonym":"Место рождения","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":240}},"ОсновноеИзображение":{"synonym":"Основное изображение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.Файлы"],"is_ref":true}},"Фамилия":{"synonym":"Фамилия","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Имя":{"synonym":"Имя","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Отчество":{"synonym":"Отчество","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ФамилияРП":{"synonym":"Фамилия (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ИмяРП":{"synonym":"Имя (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ОтчествоРП":{"synonym":"Отчество (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ОснованиеРП":{"synonym":"Основание (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"ДолжностьРП":{"synonym":"Должность (родительный падеж)","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"Должность":{"synonym":"Должность","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.individuals"],"is_ref":true}}},"tabular_sections":{"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_params":[{"name":"parent","path":"822f19bc-09ab-4913-b283-b5461382a75d"}],"choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}},"ВидДляСписка":{"synonym":"Вид для списка","multiline_mode":false,"tooltip":"Вид контактной информации для списка","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}}}}},"cachable":"ram","form":{"obj":{"head":{" ":[{"id":"id","path":"o.id","synonym":"Код","type":"ro"},"name","sex","birth_date",{"id":"parent","path":"o.parent","synonym":"Группа","type":"ref"}],"Коды":["inn","imns_code","pfr_number"],"Для печатных форм":["Фамилия","Имя","Отчество","ФамилияРП","ИмяРП","ОтчествоРП","Должность","ДолжностьРП","ОснованиеРП"]},"tabular_sections":{"contact_information":{"fields":["kind","presentation"],"headers":"Вид,Представление","widths":"200,*","min_widths":"100,200","aligns":"","sortings":"na,na","types":"ref,txt"}},"tabular_sections_order":["contact_information"]}}},"characteristics":{"name":"ХарактеристикиНоменклатуры","splitted":true,"synonym":"Характеристики номенклатуры","illustration":"Дополнительные характеристики элементов номенклатуры: цвет, размер и т.п.","obj_presentation":"Характеристика номенклатуры","list_presentation":"Характеристики номенклатуры","input_by_string":["name"],"hierarchical":false,"has_owners":true,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"x":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"y":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"z":{"synonym":"Толщина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"weight":{"synonym":"Масса, кг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"product":{"synonym":"Изделие","multiline_mode":false,"tooltip":"Для продукции - номер строки заказа, для характеристики стеклопакета - номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"leading_product":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"leading_elm":{"synonym":"Ведущий элемент","multiline_mode":false,"tooltip":"Для москиток и стеклопакетов - номер элемента ведущей продукции","type":{"types":["number"],"digits":6,"fraction_figits":0}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Используется в связке с ведущей продукцией и ведущим элементом","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"base_block":{"synonym":"Типовой блок","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys":{"synonym":"Система","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.production_params"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Для целей RLS","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"owner":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}}},"tabular_sections":{"constructions":{"name":"Конструкции","synonym":"Конструкции","tooltip":"Конструкции изделия. Они же - слои или контуры","fields":{"cnstr":{"synonym":"№ Конструкции","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"parent":{"synonym":"Внешн. констр.","multiline_mode":false,"tooltip":"№ внешней конструкции","type":{"types":["number"],"digits":6,"fraction_figits":0}},"x":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"Габаритная ширина контура","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Высота, м","multiline_mode":false,"tooltip":"Габаритная высота контура","type":{"types":["number"],"digits":8,"fraction_figits":1}},"z":{"synonym":"Глубина","multiline_mode":false,"tooltip":"Z-координата плоскости (z-index) длч многослойных конструкций","type":{"types":["number"],"digits":8,"fraction_figits":1}},"w":{"synonym":"Ширина фурн","multiline_mode":false,"tooltip":"Ширина фурнитуры (по фальцу)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"h":{"synonym":"Высота фурн","multiline_mode":false,"tooltip":"Высота фурнитуры (по фальцу)","type":{"types":["number"],"digits":8,"fraction_figits":1}},"furn":{"synonym":"Фурнитура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false},{"name":"is_set","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.furns"],"is_ref":true}},"clr_furn":{"synonym":"Цвет фурнитуры","multiline_mode":false,"tooltip":"Цвет москитной сетки","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"direction":{"synonym":"Направл. откр.","multiline_mode":false,"tooltip":"Направление открывания","choice_params":[{"name":"ref","path":["Левое","Правое"]}],"choice_groups_elm":"elm","type":{"types":["enm.open_directions"],"is_ref":true}},"h_ruch":{"synonym":"Высота ручки","multiline_mode":false,"tooltip":"Высота ручки в координатах контура (от габарита створки)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"fix_ruch":{"synonym":"Высота ручки фиксирована","multiline_mode":false,"tooltip":"Вычисляется по свойствам фурнитуры","type":{"types":["number"],"digits":6,"fraction_figits":0}},"is_rectangular":{"synonym":"Есть кривые","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"coordinates":{"name":"Координаты","synonym":"Координаты","tooltip":"Координаты элементов","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Номер конструкции (слоя)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"parent":{"synonym":"Родитель","multiline_mode":false,"tooltip":"Дополнительная иерархия. Например, номер стеклопакета для раскладки или внешняя примыкающая палка для створки или доборного профиля","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"path_data":{"synonym":"Путь SVG","multiline_mode":false,"tooltip":"Данные пути образующей в терминах svg или json элемента","type":{"types":["string"],"str_len":1000}},"x1":{"synonym":"X1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y1":{"synonym":"Y1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"x2":{"synonym":"X2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y2":{"synonym":"Y2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"r":{"synonym":"Радиус","multiline_mode":false,"tooltip":"Вспомогательное поле - частный случай криволинейного элемента","type":{"types":["number"],"digits":8,"fraction_figits":1}},"arc_ccw":{"synonym":"Против часов.","multiline_mode":false,"tooltip":"Вспомогательное поле - частный случай криволинейного элемента - дуга против часовой стрелки","type":{"types":["boolean"]}},"s":{"synonym":"Площадь","multiline_mode":false,"tooltip":"Вычисляемое","type":{"types":["number"],"digits":14,"fraction_figits":6}},"angle_hor":{"synonym":"Угол к горизонту","multiline_mode":false,"tooltip":"Вычисляется для прямой, проходящей через узлы","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"Вычисляемое - угол реза в первом узле","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"Вычисляемое - угол реза во втором узле","type":{"types":["number"],"digits":8,"fraction_figits":1}},"len":{"synonym":"Длина, м","multiline_mode":false,"tooltip":"Вычисляется по координатам и соединениям","type":{"types":["number"],"digits":8,"fraction_figits":1}},"pos":{"synonym":"Положение","multiline_mode":false,"tooltip":"Вычисляется во соседним элементам","choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"orientation":{"synonym":"Ориентация","multiline_mode":false,"tooltip":"Вычисляется по углу к горизонту","choice_groups_elm":"elm","type":{"types":["enm.orientations"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Вычисляется по вставке, геометрии и параметрам","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}}}},"inserts":{"name":"Вставки","synonym":"Вставки","tooltip":"Дополнительные вставки в изделие и контуры","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Номер конструкции (слоя)\nЕсли 0, вставка относится к изделию.\nЕсли >0 - к контуру\nЕсли <0 - к элементу","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["МоскитнаяСетка","Контур","Изделие"]}],"choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"params":{"name":"Параметры","synonym":"Параметры","tooltip":"Параметры изделий и фурнитуры","fields":{"cnstr":{"synonym":"Конструкция","multiline_mode":false,"tooltip":"Если 0, параметр относится к изделию.\nЕсли >0 - к фурнитуре створки или контуру\nЕсли <0 - к элементу","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"Фильтр для дополнительных вставок","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"cnn_elmnts":{"name":"СоединяемыеЭлементы","synonym":"Соединяемые элементы","tooltip":"Соединения элементов","fields":{"elm1":{"synonym":"Элем 1","multiline_mode":false,"tooltip":"Номер первого элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"node1":{"synonym":"Узел 1","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1}},"elm2":{"synonym":"Элем 2","multiline_mode":false,"tooltip":"Номер второго элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"node2":{"synonym":"Узел 2","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1}},"cnn":{"synonym":"Соединение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.cnns"],"is_ref":true}},"aperture_len":{"synonym":"Длина шва/проема","multiline_mode":false,"tooltip":"Для соединений с заполнениями: длина светового проема примыкающего элемента","type":{"types":["number"],"digits":8,"fraction_figits":1}}}},"glass_specification":{"name":"СпецификацияЗаполнений","synonym":"Спецификация заполнений (ORDGLP)","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"gno":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["Заполнение","Элемент"]}],"choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"glasses":{"name":"Заполнения","synonym":"Заполнения","tooltip":"Стеклопакеты и сэндвичи - вычисляемая табличная часть (кеш) для упрощения отчетов","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"№ элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["string","cat.nom"],"str_len":50,"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics","string"],"is_ref":true,"str_len":50}},"width":{"synonym":"Ширина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"s":{"synonym":"Площадь, м ²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}},"is_rectangular":{"synonym":"Прямоуг.","multiline_mode":false,"tooltip":"Прямоугольное заполнение","type":{"types":["boolean"]}},"is_sandwich":{"synonym":"Листовые","multiline_mode":false,"tooltip":"Непрозрачное заполнение - сэндвич","type":{"types":["boolean"]}},"thickness":{"synonym":"Толщина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"coffer":{"synonym":"Камеры","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента, если значение > 0, либо номер конструкции, если значение < 0","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"qty":{"synonym":"Количество (шт)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина/высота, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"totqty":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"totqty1":{"synonym":"Количество (+%)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"price":{"synonym":"Себест.план","multiline_mode":false,"tooltip":"Цена плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":4}},"amount":{"synonym":"Сумма себест.","multiline_mode":false,"tooltip":"Сумма плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":4}},"amount_marged":{"synonym":"Сумма с наценкой","multiline_mode":false,"tooltip":"Вклад строки спецификации в стоимость изделия для сценария КМАРЖ_В_СПЕЦИФИКАЦИИ","type":{"types":["number"],"digits":15,"fraction_figits":4}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Ссылка на настройки построителя, из которых возникла строка спецификации","choice_groups_elm":"elm","type":{"types":["cat.inserts","number","cat.cnns","cat.furns"],"is_ref":true,"digits":6,"fraction_figits":0}},"changed":{"synonym":"Запись изменена","multiline_mode":false,"tooltip":"Запись изменена оператором (1) или добавлена корректировкой спецификации (-1)","type":{"types":["number"],"digits":1,"fraction_figits":0}},"dop":{"synonym":"Это акс. или визуализ.","multiline_mode":false,"tooltip":"Содержит (1) для строк аксессуаров и (-1) для строк с визуализацией","type":{"types":["number"],"digits":1,"fraction_figits":0}}}}},"cachable":"doc","form":{"obj":{"head":{" ":["name","owner","calc_order","product","leading_product","leading_elm"],"Дополнительно":["x","y","z","s","clr","weight","condition_products"]},"tabular_sections":{"specification":{"fields":["elm","nom","clr","characteristic","qty","len","width","s","alp1","alp2","totqty1","price","amount","amount_marged"],"headers":"Эл.,Номенклатура,Цвет,Характеристика,Колич.,Длина&nbsp;выс.,Ширина,Площадь,Угол1,Угол2,Колич++,Цена,Сумма,Сумма++","widths":"50,*,70,*,50,70,70,80,70,70,70,70,70,80","min_widths":"50,180,70,180,50,80,70,70,70,70,70,70,70,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ref,ref,ref,calck,calck,calck,calck,calck,calck,ron,ron,ron,ron"},"constructions":{"fields":["cnstr","parent","x","y","w","h","furn","clr_furn","direction","h_ruch"],"headers":"Констр.,Внешн.,Ширина,Высота,Ширина фурн.,Высота фурн.,Фурнитура,Цвет фурн.,Открывание,Высота ручки","widths":"50,50,70,70,70,70,*,80,80,70","min_widths":"50,50,70,70,70,70,120,80,80,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ron,ron,ron,ron,ref,ro,ro,ro"},"coordinates":{"fields":["cnstr","parent","elm","elm_type","clr","inset","path_data","x1","y1","x2","y2","len","alp1","alp2","angle_hor","s","pos","orientation"],"headers":"Констр.,Внешн.,Эл.,Тип,Цвет,Вставка,Путь,x1,y1,x2,y2,Длина,Угол1,Угол2,Горизонт,Площадь,Положение,Ориентация","widths":"50,50,50,70,80,*,70,70,70,70,70,70,70,70,70,70,70,70","min_widths":"50,50,50,70,80,120,70,70,70,70,70,70,70,70,70,70,70,70","aligns":"","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":"ron,ron,ron,ref,ref,ref,ro,ron,ron,ron,ron,ron,ron,ron,ron,ron,ro,ro"},"inserts":{"fields":["cnstr","inset","clr"],"headers":"Констр.,Вставка,Цвет","widths":"50,*,*","min_widths":"50,100,100","aligns":"","sortings":"na,na,na","types":"calck,ref,ref"},"cnn_elmnts":{"fields":["elm1","elm2","node1","node2","aperture_len","cnn"],"headers":"Эл1,Эл2,Узел1,Узел2,Длина,Соединение","widths":"50,50,50,50,160,*","min_widths":"50,50,50,50,100,200","aligns":"","sortings":"na,na,na,na,na,na","types":"calck,calck,ed,ed,calck,ref"},"params":{"fields":["cnstr","inset","param","value","hide"],"headers":"Констр.,Вставка,Параметр,Значение,Скрыть","widths":"50,80,*,*,50","min_widths":"50,70,200,200,50","aligns":"","sortings":"na,na,na,na,na","types":"ron,ro,ro,ro,ch"}},"tabular_sections_order":["specification","constructions","coordinates","inserts","cnn_elmnts","params"]}}},"price_groups":{"name":"ЦеновыеГруппы","splitted":true,"synonym":"Ценовые группы","illustration":"","obj_presentation":"Ценовая группа","list_presentation":"Ценовые группы","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"definition":{"synonym":"Описание","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":1024}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"ram"},"nom_groups":{"name":"ГруппыФинансовогоУчетаНоменклатуры","splitted":true,"synonym":"Группы фин. учета номенклатуры","illustration":"Перечень номенклатурных групп для учета затрат и укрупненного планирования продаж, закупок и производства","obj_presentation":"Номенклатурная группа","list_presentation":"Номенклатурные группы","input_by_string":["name","id"],"hierarchical":true,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"Раздел","multiline_mode":false,"tooltip":"","type":{"types":["cat.nom_groups"],"is_ref":true}}},"tabular_sections":{},"cachable":"ram"},"insert_bind":{"name":"ПривязкиВставок","splitted":true,"synonym":"Привязки вставок","illustration":"Замена регистра \"Корректировка спецификации\"","obj_presentation":"Привязка вставки","list_presentation":"Привязки вставок","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Если указано, привязка распространяется только на продукцию, параметры окружения которой, совпадают с параметрами ключа параметров","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["cat.production_params","cat.nom"],"is_ref":true}}}},"inserts":{"name":"Вставки","synonym":"Вставки","tooltip":"Дополнительные вставки в изделие и контуры","fields":{"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["МоскитнаяСетка","Контур","Изделие","Водоотлив","Откос","Подоконник"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.inserts"],"is_ref":true}},"elm_type":{"synonym":"Контур","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Рама","Створка","Продукция"]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}}}}},"cachable":"ram"},"nonstandard_attributes":{"name":"ПризнакиНестандартов","splitted":true,"synonym":"Признаки нестандартов","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":0,"fields":{"crooked":{"synonym":"Кривой","multiline_mode":false,"tooltip":"Есть гнутые или наклонные элементы","type":{"types":["boolean"]}},"colored":{"synonym":"Цветной","multiline_mode":false,"tooltip":"Есть покраска или ламинация","type":{"types":["boolean"]}},"lay":{"synonym":"Раскладка","multiline_mode":false,"tooltip":"Содержит стеклопакеты с раскладкой","type":{"types":["boolean"]}},"made_to_order":{"synonym":"Заказной","multiline_mode":false,"tooltip":"Специальный материал под заказ","type":{"types":["boolean"]}},"packing":{"synonym":"Упаковка","multiline_mode":false,"tooltip":"Дополнительная услуга","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{},"cachable":"doc"},"delivery_directions":{"name":"НаправленияДоставки","splitted":true,"synonym":"Направления доставки","illustration":"Объединяет районы, территории или подразделения продаж","obj_presentation":"Направление доставки","list_presentation":"Направления доставки","input_by_string":["name","id"],"hierarchical":false,"has_owners":false,"group_hierarchy":true,"main_presentation_name":true,"code_length":9,"fields":{"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}}},"tabular_sections":{"composition":{"name":"Состав","synonym":"Состав","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.delivery_areas","cat.divisions"],"is_ref":true}}}}},"cachable":"doc"}},"dp":{"scheme_settings":{"name":"scheme_settings","synonym":"Варианты настроек","fields":{"scheme":{"synonym":"Текущая настройка","tooltip":"Текущий вариант настроек","mandatory":true,"type":{"types":["cat.scheme_settings"],"is_ref":true}}}},"builder_price":{"name":"builder_price","splitted":false,"synonym":"Цены номенклатуры","illustration":"Метаданные карточки цен номенклатуры","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"department":{"synonym":"Офис продаж","multiline_mode":false,"tooltip":"Подразделение продаж","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Цены","tooltip":"","fields":{"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.currencies"],"is_ref":true}}}}}},"buyers_order":{"name":"ЗаказПокупателя","splitted":false,"synonym":"Рисовалка","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys":{"synonym":"Система","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.production_params"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"depth":{"synonym":"Глубина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"quantity":{"synonym":"Колич., шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":150}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_percent_internal":{"synonym":"Скидка внутр. %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipping_date":{"synonym":"Дата доставки","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"client_number":{"synonym":"Номер клиента","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"inn":{"synonym":"ИНН Клиента","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":20}},"shipping_address":{"synonym":"Адрес доставки","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"phone":{"synonym":"Телефон","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":100}},"price_internal":{"synonym":"Цена внутр.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации (холдинг) или внешней (от дилера конечному клиенту)","type":{"types":["number"],"digits":15,"fraction_figits":2}},"base_block":{"synonym":"Типовой блок","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}}},"tabular_sections":{"product_params":{"name":"ПараметрыИзделия","synonym":"Параметры продукции","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"param":{"synonym":"Параметр","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["product_params","param"]}],"choice_groups_elm":"elm","choice_type":{"path":["product_params","param"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"hide":{"synonym":"Скрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}},"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"inset":{"synonym":"Продукция","multiline_mode":false,"tooltip":"","choice_params":[{"name":"insert_type","path":["Изделие","МоскитнаяСетка","Подоконник","Откос","Заполнение","Монтаж","Доставка"]},{"name":"available","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"len":{"synonym":"Длина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"height":{"synonym":"Высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"depth":{"synonym":"Глубина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"Площадь изделия","type":{"types":["number"],"digits":10,"fraction_figits":4}},"quantity":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":150}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ordn":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"ссылка на продукциию, к которой относится материал","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}}}},"glass_specification":{"name":"СпецификацияЗаполнений","synonym":"Спецификация заполнений (ORDGLP)","tooltip":"","fields":{"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"sorting":{"synonym":"Порядок","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"inset":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"elm":{"synonym":"№","multiline_mode":false,"tooltip":"Идентификатор строки спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"dop":{"synonym":"Доп","multiline_mode":false,"tooltip":"Элемент дополнительной спецификации","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура/Набор","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_set","path":true}],"choice_groups_elm":"elm","type":{"types":["cat.inserts","cat.nom","cat.furns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"handle_height_base":{"synonym":"Выс. ручк.","multiline_mode":false,"tooltip":"Стандартная высота ручки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_min":{"synonym":"Выс. ручк. min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"handle_height_max":{"synonym":"Выс. ручк. max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"contraction":{"synonym":"Укорочение","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"contraction_option":{"synonym":"Укороч. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.contraction_options"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"flap_weight_min":{"synonym":"Масса створки min","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"flap_weight_max":{"synonym":"Масса створки max","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"side":{"synonym":"Сторона","multiline_mode":false,"tooltip":"Сторона фурнитуры, на которую устанавливается элемент или на которой выполняется операция","type":{"types":["number"],"digits":1,"fraction_figits":0}},"cnn_side":{"synonym":"Сторона соед.","multiline_mode":false,"tooltip":"Фильтр: выполнять операцию, если примыкающий элемент примыкает с заданной стороны","choice_groups_elm":"elm","type":{"types":["enm.cnn_sides"],"is_ref":true}},"offset_option":{"synonym":"Смещ. от","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.offset_options"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}},"transfer_option":{"synonym":"Перенос опер.","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.transfer_operations_options"],"is_ref":true}},"is_main_specification_row":{"synonym":"Это строка основной спецификации","multiline_mode":false,"tooltip":"Интерфейсное поле (доп=0) для редактирования без кода","type":{"types":["boolean"]}},"is_set_row":{"synonym":"Это строка набора","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Фурнитура) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_procedure_row":{"synonym":"Это строка операции","multiline_mode":false,"tooltip":"Интерфейсное поле (Номенклатура=Номенклатура И ТипНоменклатуры = Техоперация) для редактирования без кода","type":{"types":["number"],"digits":1,"fraction_figits":0}},"is_order_row":{"synonym":"Это строка заказа","multiline_mode":false,"tooltip":"Если \"Истина\", строка будет добавлена в заказ, а не в спецификацию текущей продукции","type":{"types":["boolean"]}},"origin":{"synonym":"Происхождение","multiline_mode":false,"tooltip":"Ссылка на настройки построителя, из которых возникла строка спецификации","choice_groups_elm":"elm","type":{"types":["cat.inserts","number","cat.cnns","cat.furns"],"is_ref":true,"digits":6,"fraction_figits":0}}}},"charges_discounts":{"name":"СкидкиНаценки","synonym":"Скидки наценки","tooltip":"","fields":{"nom_kind":{"synonym":"Группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}}}}},"form":{"obj":{"head":{" ":["calc_order"]},"tabular_sections":{"production":{"fields":["row","inset","clr","len","height","depth","s","quantity","note"],"headers":"№,Продукция,Цвет,Длина,Высота,Глубина,Площадь,Колич.,Комментарий","widths":"40,*,120,80,75,75,75,75,*","min_widths":"30,200,100,70,70,70,70,70,80","aligns":"center,left,left,right,right,right,right,right,left","sortings":"na,na,na,na,na,na,na,na,na","types":"cntr,ref,ref,calck,calck,calck,calck,calck,txt"},"inserts":{"fields":["inset","clr"],"headers":"Вставка,Цвет","widths":"*,*","min_widths":"90,90","aligns":"","sortings":"na,na","types":"ref,ref"}}}}},"builder_lay_impost":{"name":"builder_lay_impost","splitted":false,"synonym":"Импосты и раскладки","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Импост","Раскладка","Рама"]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"split":{"synonym":"Тип деления","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.lay_split_types"],"is_ref":true}},"elm_by_y":{"synonym":"Элементов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"step_by_y":{"synonym":"Шаг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":4,"fraction_figits":0}},"align_by_y":{"synonym":"Опора","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Низ","Верх","Центр"]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"inset_by_y":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"elm_by_x":{"synonym":"Элементов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":2,"fraction_figits":0}},"step_by_x":{"synonym":"Шаг","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":4,"fraction_figits":0}},"align_by_x":{"synonym":"Опора","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Лев","Прав","Центр"]}],"choice_groups_elm":"elm","type":{"types":["enm.positions"],"is_ref":true}},"inset_by_x":{"synonym":"Вставка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"w":{"synonym":"Ширина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"h":{"synonym":"Высота","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}},"tabular_sections":{},"form":{"obj":{"head":{" ":["elm_type","clr","split"],"Деление Y":["inset_by_y","elm_by_y","step_by_y","align_by_y"],"Деление X":["inset_by_x","elm_by_x","step_by_x","align_by_x"],"Габариты":["w","h"]}}}},"builder_pen":{"name":"builder_pen","splitted":false,"synonym":"Рисование","illustration":"Метаданные инструмента pen (рисование профилей) графического построителя","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Рама","Импост","Раскладка","Добор","Соединитель","Водоотлив","Линия"]}],"choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"inset":{"synonym":"Материал профиля","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.inserts"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"bind_generatrix":{"synonym":"Магнит к профилю","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"bind_node":{"synonym":"Магнит к узлам","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}}},"tabular_sections":{}},"builder_text":{"name":"builder_text","splitted":false,"synonym":"Произвольный текст","illustration":"Метаданные инструмента text графического построителя","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"text":{"synonym":"Текст","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"font_family":{"synonym":"Шрифт","multiline_mode":true,"tooltip":"Имя шрифта","type":{"types":["string"],"str_len":50}},"bold":{"synonym":"Жирный","multiline_mode":true,"tooltip":"","type":{"types":["boolean"]}},"font_size":{"synonym":"Размер","multiline_mode":true,"tooltip":"Размер шрифта","type":{"types":["number"],"digits":3,"fraction_figits":0}},"angle":{"synonym":"Поворот","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"align":{"synonym":"Выравнивание","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.text_aligns"],"is_ref":true}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"x":{"synonym":"X коорд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"y":{"synonym":"Y коорд.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}},"tabular_sections":{}}},"doc":{"registers_correction":{"name":"КорректировкаРегистров","splitted":true,"synonym":"Корректировка регистров","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"original_doc_type":{"synonym":"Тип исходного документа","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Произвольный комментарий. ","type":{"types":["string"],"str_len":0}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"Для целей RLS","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}}},"tabular_sections":{"registers_table":{"name":"ТаблицаРегистров","synonym":"Таблица регистров","tooltip":"","fields":{"Имя":{"synonym":"Имя","multiline_mode":false,"tooltip":"Имя регистра, которому скорректированы записи.","mandatory":true,"type":{"types":["string"],"str_len":255}}}}},"cachable":"doc"},"purchase":{"name":"ПоступлениеТоваровУслуг","splitted":true,"synonym":"Поступление товаров и услуг","illustration":"Документы отражают поступление товаров и услуг","obj_presentation":"Поступление товаров и услуг","list_presentation":"Поступление товаров и услуг","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_supplier","path":true}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":false},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"unit":{"synonym":"Единица измерения","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_units"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Заказ резерв","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"services":{"name":"Услуги","synonym":"Услуги","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":true},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"content":{"synonym":"Содержание услуги, доп. сведения","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["string"],"str_len":0}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"nom_group":{"synonym":"Номенклатурная группа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_groups"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"cost_item":{"synonym":"Статья затрат","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":10}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"buyers_order":{"synonym":"Заказ затрат","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"work_centers_task":{"name":"НарядРЦ","splitted":true,"synonym":"Задание рабочему центру","illustration":"","obj_presentation":"Наряд","list_presentation":"Задания рабочим центрам","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Участок или станок в подразделении производства","choice_params":[{"name":"applying","path":"РабочийЦентр"}],"choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"recipient":{"synonym":"Получатель","multiline_mode":false,"tooltip":"СГП или следующий передел","choice_params":[{"name":"applying","path":"РабочийЦентр"}],"choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"biz_cuts":{"synonym":"Деловая обрезь","multiline_mode":false,"tooltip":"0 - не учитывать\n1 - учитывать\n2 - только исходящую\n3 - только входящую","type":{"types":["number"],"digits":1,"fraction_figits":0}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}},"demand":{"name":"Потребность","synonym":"Потребность","tooltip":"","fields":{"production":{"synonym":"Продукция","multiline_mode":false,"tooltip":"Ссылка на характеристику продукции или объект планирования. Указывает, к чему относится материал текущей строки","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"Номер экземпляра","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"НоменклатураСП":{"synonym":"Номенклатура СП","multiline_mode":false,"tooltip":"Номенклатура из спецификации продукции","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"ХарактеристикаСП":{"synonym":"Характеристика СП","multiline_mode":false,"tooltip":"Характеристика из спецификации продукции","choice_links":[{"name":["selection","owner"],"path":["demand","НоменклатураСП"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Номенклатура потребности. По умолчанию, совпадает с номенклатурой спецификации, но может содержать аналог","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"Характеристика потребности. По умолчанию, совпадает с характеристикой спецификации, но может содержать аналог","choice_links":[{"name":["selection","owner"],"path":["demand","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"ОстатокПотребности":{"synonym":"Остаток потребности","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"Закрыть":{"synonym":"Закрыть","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"ИзОбрези":{"synonym":"Из обрези","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":4}}}},"Обрезь":{"name":"Обрезь","synonym":"Обрезь","tooltip":"Приход и расход деловой обрези","fields":{"ВидДвижения":{"synonym":"Вид движения","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["enm.ВидыДвиженийПриходРасход"],"is_ref":true}},"Хлыст":{"synonym":"№ хлыста","multiline_mode":false,"tooltip":"№ листа (хлыста, заготовки)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"НомерПары":{"synonym":"№ пары","multiline_mode":false,"tooltip":"№ парной заготовки","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["Обрезь","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"длина в мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина","multiline_mode":false,"tooltip":"ширина в мм","type":{"types":["number"],"digits":8,"fraction_figits":1}},"КоординатаX":{"synonym":"Координата X","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"КоординатаY":{"synonym":"Координата Y","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"Количество в единицах хранения","type":{"types":["number"],"digits":8,"fraction_figits":1}},"cell":{"synonym":"Ячейка","multiline_mode":false,"tooltip":"№ ячейки (откуда брать заготовку или куда помещать деловой обрезок)","type":{"types":["string"],"str_len":9}}}},"Раскрой":{"name":"Раскрой","synonym":"Раскрой","tooltip":"","fields":{"production":{"synonym":"Продукция","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"Номер экземпляра","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["Раскрой","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"len":{"synonym":"Длина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"width":{"synonym":"Ширина","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"Хлыст":{"synonym":"№ хлыста","multiline_mode":false,"tooltip":"№ листа (заготовки), на котором размещать изделие","type":{"types":["number"],"digits":6,"fraction_figits":0}},"НомерПары":{"synonym":"№ пары","multiline_mode":false,"tooltip":"№ парного изделия","type":{"types":["number"],"digits":6,"fraction_figits":0}},"orientation":{"synonym":"Ориентация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.orientations"],"is_ref":true}},"elm_type":{"synonym":"Тип элемента","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.elm_types"],"is_ref":true}},"Угол1":{"synonym":"Угол1","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":2}},"Угол2":{"synonym":"Угол2","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":2}},"cell":{"synonym":"Ячейка","multiline_mode":false,"tooltip":"№ ячейки (куда помещать изделие)","type":{"types":["string"],"str_len":9}},"Партия":{"synonym":"Партия","multiline_mode":false,"tooltip":"Партия (такт, группа раскроя)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"КоординатаX":{"synonym":"Координата X","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"КоординатаY":{"synonym":"Координата Y","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"Поворот":{"synonym":"Поворот","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"ЭтоНестандарт":{"synonym":"Это нестандарт","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}}}}},"cachable":"doc"},"calc_order":{"name":"Расчет","splitted":true,"synonym":"Расчет-заказ","illustration":"Аналог заказа покупателя типовых конфигураций.\nСодержит инструменты для формирования спецификаций и подготовки данных производства и диспетчеризации","obj_presentation":"Расчет-заказ","list_presentation":"Расчеты-заказы","input_by_string":["number_doc","number_internal"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"number_internal":{"synonym":"Номер внутр","multiline_mode":false,"tooltip":"Дополнительный (внутренний) номер документа","type":{"types":["string"],"str_len":20}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_buyer","path":true},{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"client_of_dealer":{"synonym":"Клиент дилера","multiline_mode":false,"tooltip":"Наименование конечного клиента в дилерских заказах","type":{"types":["string"],"str_len":255}},"contract":{"synonym":"Договор контрагента","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.contracts"],"is_ref":true}},"bank_account":{"synonym":"Банковский счет","multiline_mode":false,"tooltip":"Банковский счет организации, на который планируется поступление денежных средств","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Дополнительная информация","type":{"types":["string"],"str_len":255}},"manager":{"synonym":"Менеджер","multiline_mode":false,"tooltip":"Менеджер, оформивший заказ","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"leading_manager":{"synonym":"Ведущий менеджер","multiline_mode":false,"tooltip":"Куратор, ведущий менеджер","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"department":{"synonym":"Офис продаж","multiline_mode":false,"tooltip":"Подразделение продаж","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"Склад отгрузки товаров по заказу","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_operation":{"synonym":"Сумма упр","multiline_mode":false,"tooltip":"Сумма в валюте управленческого учета","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"accessory_characteristic":{"synonym":"Характеристика аксессуаров","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"sys_profile":{"synonym":"Профиль","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"sys_furn":{"synonym":"Фурнитура","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"phone":{"synonym":"Телефон","multiline_mode":false,"tooltip":"Телефон по адресу доставки","type":{"types":["string"],"str_len":100}},"delivery_area":{"synonym":"Район","multiline_mode":false,"tooltip":"Район (зона, направление) доставки для группировки при планировании и оптимизации маршрута геокодером","choice_groups_elm":"elm","type":{"types":["cat.delivery_areas"],"is_ref":true}},"shipping_address":{"synonym":"Адрес доставки","multiline_mode":false,"tooltip":"Адрес доставки изделий заказа","type":{"types":["string"],"str_len":255}},"coordinates":{"synonym":"Координаты","multiline_mode":false,"tooltip":"Гео - координаты адреса доставки","type":{"types":["string"],"str_len":50}},"address_fields":{"synonym":"Значения полей адреса","multiline_mode":false,"tooltip":"Служебный реквизит","type":{"types":["string"],"str_len":0}},"difficult":{"synonym":"Сложный","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"vat_consider":{"synonym":"Учитывать НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"vat_included":{"synonym":"Сумма включает НДС","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"settlements_course":{"synonym":"Курс взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":4}},"settlements_multiplicity":{"synonym":"Кратность взаиморасчетов","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":0}},"extra_charge_external":{"synonym":"Наценка внешн.","multiline_mode":false,"tooltip":"Наценка внешней (дилерской) продажи по отношению к цене производителя, %.","type":{"types":["number"],"digits":5,"fraction_figits":2}},"obj_delivery_state":{"synonym":"Этап согласования","multiline_mode":false,"tooltip":"","choice_params":[{"name":"ref","path":["Подтвержден","Отклонен","Архив","Шаблон","Черновик"]}],"choice_groups_elm":"elm","type":{"types":["enm.obj_delivery_states"],"is_ref":true}},"category":{"synonym":"Категория заказа","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.order_categories"],"is_ref":true}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}},"unit":{"synonym":"Ед.","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["production","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.nom_units"],"is_ref":true}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина/высота, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, мм","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"Площадь изделия","type":{"types":["number"],"digits":10,"fraction_figits":6}},"first_cost":{"synonym":"Себест. ед.","multiline_mode":false,"tooltip":"Плановая себестоимость единицы продукции","type":{"types":["number"],"digits":15,"fraction_figits":4}},"marginality":{"synonym":"К. марж","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Скидка %","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount_percent_internal":{"synonym":"Скидка внутр. %","multiline_mode":false,"tooltip":"Процент скидки для внутренней перепродажи (холдинг) или внешней (дилеры)","type":{"types":["number"],"digits":5,"fraction_figits":2}},"discount":{"synonym":"Скидка","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"margin":{"synonym":"Маржа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"price_internal":{"synonym":"Цена внутр.","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_internal":{"synonym":"Сумма внутр.","multiline_mode":false,"tooltip":"Сумма внутренней реализации (холдинг) или внешней (от дилера конечному клиенту)","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"ordn":{"synonym":"Ведущая продукция","multiline_mode":false,"tooltip":"ссылка на продукциию, к которой относится материал","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"changed":{"synonym":"Запись изменена","multiline_mode":false,"tooltip":"Запись изменена оператором (1, -2) или добавлена корректировкой спецификации (-1)","type":{"types":["number"],"digits":1,"fraction_figits":0}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}},"contact_information":{"name":"КонтактнаяИнформация","synonym":"Контактная информация","tooltip":"Хранение контактной информации (адреса, веб-страницы, номера телефонов и др.)","fields":{"type":{"synonym":"Тип","multiline_mode":false,"tooltip":"Тип контактной информации (телефон, адрес и т.п.)","choice_groups_elm":"elm","type":{"types":["enm.contact_information_types"],"is_ref":true}},"kind":{"synonym":"Вид","multiline_mode":false,"tooltip":"Вид контактной информации","choice_groups_elm":"elm","type":{"types":["cat.contact_information_kinds"],"is_ref":true}},"presentation":{"synonym":"Представление","multiline_mode":false,"tooltip":"Представление контактной информации для отображения в формах","type":{"types":["string"],"str_len":500}},"values_fields":{"synonym":"Значения полей","multiline_mode":false,"tooltip":"Служебное поле, для хранения контактной информации","type":{"types":["string"],"str_len":0}},"country":{"synonym":"Страна","multiline_mode":false,"tooltip":"Страна (заполняется для адреса)","type":{"types":["string"],"str_len":100}},"region":{"synonym":"Регион","multiline_mode":false,"tooltip":"Регион (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"city":{"synonym":"Город","multiline_mode":false,"tooltip":"Город (заполняется для адреса)","type":{"types":["string"],"str_len":50}},"email_address":{"synonym":"Адрес ЭП","multiline_mode":false,"tooltip":"Адрес электронной почты","type":{"types":["string"],"str_len":100}},"server_domain_name":{"synonym":"Доменное имя сервера","multiline_mode":false,"tooltip":"Доменное имя сервера электронной почты или веб-страницы","type":{"types":["string"],"str_len":100}},"phone_number":{"synonym":"Номер телефона","multiline_mode":false,"tooltip":"Полный номер телефона","type":{"types":["string"],"str_len":20}},"phone_without_codes":{"synonym":"Номер телефона без кодов","multiline_mode":false,"tooltip":"Номер телефона без кодов и добавочного номера","type":{"types":["string"],"str_len":20}}}},"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"phase":{"synonym":"Фаза","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.planning_phases"],"is_ref":true}},"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"Плановая дата доставки или начала операции","type":{"types":["date"],"date_part":"date"}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"Ключ по графику доставок","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","calc_order"],"path":["ref"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"Трудоемкость или время операции","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","number_internal","partner","client_of_dealer","doc_amount","obj_delivery_state","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"number_internal","width":"160","type":"ro","align":"left","sort":"na","caption":"№ внутр"},{"id":"partner","width":"180","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"client_of_dealer","width":"*","type":"ro","align":"left","sort":"na","caption":"Клиент"},{"id":"doc_amount","width":"120","type":"ron","align":"right","sort":"na","caption":"Сумма"},{"id":"obj_delivery_state","width":"120","type":"ro","align":"left","sort":"na","caption":"Статус"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":["name","owner","calc_order","product","leading_product","leading_elm"]},"tabular_sections":{"production":{"fields":["row","nom","characteristic","note","qty","len","width","s","quantity","unit","discount_percent","price","amount","discount_percent_internal","price_internal","amount_internal"],"aligns":"center,left,left,left,right,right,right,right,right,left,right,right,right,right,right,right","sortings":"na,na,na,na,na,na,na,na,na,na,na,na,na,na,na,na","types":""},"planning":{"fields":["obj","elm","specimen","key","date","performance"],"aligns":"left,right,right,left,left,right","sortings":"na,na,na,na,na,na","headers":"Продукция,Элемент,Экземпляр,Ключ,Дата,Мощность","widths":"*,70,70,*,120,90","min_widths":"180,60,60,180,110,80","types":"ref,calck,calck,ref,dhxCalendar,calck"}},"tabular_sections_order":["production","planning"]}}},"credit_card_order":{"name":"ОплатаОтПокупателяПлатежнойКартой","splitted":true,"synonym":"Оплата от покупателя платежной картой","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"payment_details":{"fields":["row","cash_flow_article","trans","amount"],"headers":"№,Статья,Заказ,Сумма","aligns":"center,left,left,right","sortings":"na,na,na,na","types":"cntr,ref,ref,calck","widths":"50,*,*,120","min_widths":"40,140,140,80"}}}}},"work_centers_performance":{"name":"МощностиРЦ","splitted":true,"synonym":"Мощности рабочих центров","illustration":"","obj_presentation":"Мощность рабочих центров","list_presentation":"Мощности рабочих центров","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"start_date":{"synonym":"Дата начала","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"expiration_date":{"synonym":"Дата окончания","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"date":{"synonym":"Дата","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}}}}},"cachable":"doc"},"debit_bank_order":{"name":"ПлатежноеПоручениеВходящее","splitted":true,"synonym":"Платежное поручение входящее","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Плательщик","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"payment_details":{"fields":["row","cash_flow_article","trans","amount"],"headers":"№,Статья,Заказ,Сумма","aligns":"center,left,left,right","sortings":"na,na,na,na","types":"cntr,ref,ref,calck","widths":"50,*,*,120","min_widths":"40,140,140,80"}}}}},"credit_bank_order":{"name":"ПлатежноеПоручениеИсходящее","splitted":true,"synonym":"Платежное поручение исходящее","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Получатель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"debit_cash_order":{"name":"ПриходныйКассовыйОрдер","splitted":true,"synonym":"Приходный кассовый ордер","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"cashbox":{"synonym":"Касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","cashbox","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"payment_details":{"fields":["row","cash_flow_article","trans","amount"],"headers":"№,Статья,Заказ,Сумма","aligns":"center,left,left,right","sortings":"na,na,na,na","types":"cntr,ref,ref,calck","widths":"50,*,*,120","min_widths":"40,140,140,80"}}}}},"credit_cash_order":{"name":"РасходныйКассовыйОрдер","splitted":true,"synonym":"Расходный кассовый ордер","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент, подотчетник, Касса ККМ","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"cashbox":{"synonym":"Касса","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["cat.cashboxes"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"payment_details":{"name":"РасшифровкаПлатежа","synonym":"Расшифровка платежа","tooltip":"","fields":{"cash_flow_article":{"synonym":"Статья движения денежных средств","multiline_mode":false,"tooltip":"Статья движения денежных средств","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.cash_flow_articles"],"is_ref":true}},"trans":{"synonym":"Объект расчетов","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order","cat.contracts"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"Сумма платежа","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":2}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc"},"selling":{"name":"РеализацияТоваровУслуг","splitted":true,"synonym":"Реализация товаров и услуг","illustration":"Документы отражают факт реализации (отгрузки) товаров","obj_presentation":"Реализация товаров и услуг","list_presentation":"Реализация товаров и услуг","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.organizations"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_buyer","path":true}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.partners"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.divisions"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"doc_amount":{"synonym":"Сумма документа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"Пользователь, ответственный за  документ.","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":false},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"unit":{"synonym":"Единица измерения","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_units"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Процент скидки или наценки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"services":{"name":"Услуги","synonym":"Услуги","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_params":[{"name":"Услуга","path":true},{"name":"set","path":false}],"choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"content":{"synonym":"Содержание услуги, доп. сведения","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["string"],"str_len":0}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount_percent":{"synonym":"Процент скидки или наценки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":5,"fraction_figits":2}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_rate":{"synonym":"Ставка НДС","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.vat_rates"],"is_ref":true}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"Документ расчетов с партнером","choice_links":[{"name":["selection","partner"],"path":["partner"]},{"name":["selection","organization"],"path":["organization"]}],"choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}}}},"extra_fields":{"name":"ДополнительныеРеквизиты","synonym":"Дополнительные реквизиты","tooltip":"","fields":{"property":{"synonym":"Свойство","multiline_mode":false,"tooltip":"Дополнительный реквизит","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение дополнительного реквизита","choice_links":[{"name":["selection","owner"],"path":["extra_fields","property"]}],"choice_groups_elm":"elm","choice_type":{"path":["extra_fields","property"],"elm":0},"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}},"txt_row":{"synonym":"Текстовая строка","multiline_mode":false,"tooltip":"Полный текст строкового дополнительного реквизита","type":{"types":["string"],"str_len":0}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","organization","partner","doc_amount","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"organization","width":"*","type":"ro","align":"left","sort":"na","caption":"Организация"},{"id":"partner","width":"*","type":"ro","align":"left","sort":"na","caption":"Контрагент"},{"id":"doc_amount","width":"160","type":"ro","align":"left","sort":"na","caption":"Сумма"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","organization","partner","department","warehouse","responsible","note",{"id":"doc_amount","path":"o.doc_amount","type":"ro","synonym":"Сумма документа"}]},"tabular_sections":{"goods":{"fields":["row","nom","quantity","unit","price","discount_percent","vat_rate","amount","vat_amount","trans"],"headers":"№,Номенклатура,Количество,Ед.,Цена,Скидка,Ставка НДС,Сумма,Сумма НДС,Заказ","aligns":"center,left,right,left,right,right,left,right,right,left","sortings":"na,na,na,na,na,na,na,na,na,na","types":"cntr,ref,calck,ref,calck,calck,ref,calck,ron,ref","widths":"50,*,100,100,100,100,100,100,100,*","min_widths":"40,160,80,80,80,80,80,80,80,80,160"}}}}},"nom_prices_setup":{"name":"УстановкаЦенНоменклатуры","splitted":true,"synonym":"Установка цен номенклатуры","illustration":"","obj_presentation":"","list_presentation":"","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom_prices_types"],"is_ref":true}},"currency":{"synonym":"Валюта","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.currencies"],"is_ref":true}},"responsible":{"synonym":"Ответственный","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.users"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"goods":{"name":"Товары","synonym":"Товары","tooltip":"","fields":{"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom"],"is_ref":true}},"nom_characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["goods","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"price_type":{"synonym":"Тип Цен","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_prices_types"],"is_ref":true}},"price":{"synonym":"Цена","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":4}}}}},"cachable":"doc","form":{"selection":{"fields":["posted","date","number_doc","price_type","currency","note"],"cols":[{"id":"date","width":"160","type":"ro","align":"left","sort":"server","caption":"Дата"},{"id":"number_doc","width":"120","type":"ro","align":"left","sort":"na","caption":"№"},{"id":"price_type","width":"*","type":"ro","align":"left","sort":"na","caption":"Тип цен"},{"id":"currency","width":"120","type":"ro","align":"left","sort":"na","caption":"Валюта"},{"id":"note","width":"*","type":"ro","align":"left","sort":"na","caption":"Комментарий"}]},"obj":{"head":{" ":[{"id":"number_doc","path":"o.number_doc","type":"ro","synonym":"Номер"},"date","responsible","note","price_type","currency"]},"tabular_sections":{"goods":{"fields":["row","nom","nom_characteristic","price_type","price"],"headers":"№,Номенклатура,Характеристика,Тип цен,Цена","aligns":"center,left,left,left,right","sortings":"na,na,na,na,na","types":"cntr,ref,ref,ref,calck","widths":"50,*,*,80,90","min_widths":"40,200,140,0,80"}}}}},"planning_event":{"name":"СобытиеПланирования","splitted":true,"synonym":"Событие планирования","illustration":"","obj_presentation":"Событие планирования","list_presentation":"События планирования","input_by_string":["number_doc"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":11,"fields":{"phase":{"synonym":"Фаза","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["enm.planning_phases"],"is_ref":true}},"key":{"synonym":"Ключ","multiline_mode":false,"tooltip":"","choice_params":[{"name":"applying","path":["НаправлениеДоставки","РабочийЦентр"]}],"choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"recipient":{"synonym":"Получатель","multiline_mode":false,"tooltip":"СГП или следующий передел","choice_groups_elm":"elm","type":{"types":["cat.parameters_keys"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_params":[{"name":"is_folder","path":false}],"choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"project":{"synonym":"Проект","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.projects"],"is_ref":true}},"Основание":{"synonym":"Основание","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.planning_event"],"is_ref":true}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":0}}},"tabular_sections":{"executors":{"name":"Исполнители","synonym":"Исполнители","tooltip":"","fields":{"executor":{"synonym":"Исполнитель","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.individuals","cat.partners"],"is_ref":true}},"coefficient":{"synonym":"Коэффициент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":10,"fraction_figits":3}}}},"planning":{"name":"Планирование","synonym":"Планирование","tooltip":"","fields":{"obj":{"synonym":"Объект","multiline_mode":false,"tooltip":"Если указано - изделие, если пусто - Расчет из шапки","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"specimen":{"synonym":"Экземпляр","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"performance":{"synonym":"Мощность","multiline_mode":false,"tooltip":"Трудоемкость или время операции","type":{"types":["number"],"digits":8,"fraction_figits":1}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"Номенклатура работы или услуги события","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"begin_time":{"synonym":"Время начала","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date_time"}},"end_time":{"synonym":"Время окончания","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date_time"}}}}},"cachable":"doc"}},"areg":{},"rep":{"materials_demand":{"name":"materials_demand","splitted":false,"synonym":"Потребность в материалах","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"formula":{"synonym":"Формула","multiline_mode":false,"tooltip":"","choice_params":[{"name":"parent","path":["3220e252-ffcd-11e5-8303-e67fda7f6b46","3220e251-ffcd-11e5-8303-e67fda7f6b46"]}],"choice_groups_elm":"elm","type":{"types":["cat.formulas"],"is_ref":true}},"scheme":{"synonym":"Вариант настроек","multiline_mode":false,"tooltip":"","choice_params":[{"name":"obj","path":"rep.materials_demand.specification"}],"choice_groups_elm":"elm","type":{"types":["cat.scheme_settings"],"is_ref":true}}},"tabular_sections":{"production":{"name":"Продукция","synonym":"Продукция","tooltip":"","fields":{"use":{"synonym":"Использование","multiline_mode":false,"tooltip":"","type":{"types":["boolean"]}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true},"choice_params":[{"name":"calc_order","path":{"not":"00000000-0000-0000-0000-000000000000"}}]},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"№ элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"qty":{"synonym":"Количество, шт","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":3}}}},"specification":{"name":"Спецификация","synonym":"Спецификация","tooltip":"","fields":{"calc_order":{"synonym":"Расчет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"product":{"synonym":"Изделие","multiline_mode":false,"tooltip":"Для продукции - номер строки заказа, для характеристики стеклопакета - номер элемента","type":{"types":["number"],"digits":6,"fraction_figits":0}},"cnstr":{"synonym":"№ Конструкции","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":6,"fraction_figits":0}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"Номер элемента, если значение > 0, либо номер конструкции, если значение < 0","type":{"types":["number"],"digits":6,"fraction_figits":0}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"article":{"synonym":"Артикул","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"clr":{"synonym":"Цвет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.clrs"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["specification","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"nom_kind":{"synonym":"Вид номенклатуры","multiline_mode":false,"tooltip":"Указывается вид, к которому следует отнести данную позицию номенклатуры.","choice_groups_elm":"elm","mandatory":true,"type":{"types":["cat.nom_kinds"],"is_ref":true}},"qty":{"synonym":"Количество (шт)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"len":{"synonym":"Длина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"width":{"synonym":"Ширина, м","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"s":{"synonym":"Площадь, м²","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":6}},"material":{"synonym":"Материал","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":255}},"grouping":{"synonym":"Группировка","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"totqty":{"synonym":"Количество","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"totqty1":{"synonym":"Количество (+%)","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":14,"fraction_figits":4}},"alp1":{"synonym":"Угол 1, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"alp2":{"synonym":"Угол 2, °","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":8,"fraction_figits":1}},"sz":{"synonym":"Размер","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":50}},"price":{"synonym":"Себест.план","multiline_mode":false,"tooltip":"Цена плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount":{"synonym":"Сумма себест.","multiline_mode":false,"tooltip":"Сумма плановой себестоимости строки спецификации","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_marged":{"synonym":"Сумма с наценкой","multiline_mode":false,"tooltip":"Вклад строки спецификации в стоимость изделия для сценария КМАРЖ_В_СПЕЦИФИКАЦИИ","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"selling":{"name":"selling","splitted":false,"synonym":"Продажи","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.registers_correction","doc.selling","doc.purchase"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["data","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"quantity":{"synonym":"Количество","multiline_mode":false,"tooltip":"","mandatory":true,"type":{"types":["number"],"digits":15,"fraction_figits":3}},"amount":{"synonym":"Сумма","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"vat_amount":{"synonym":"Сумма НДС","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"discount":{"synonym":"Сумма скидки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"goods":{"name":"goods","splitted":false,"synonym":"Товары на складах","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.registers_correction","doc.selling","doc.purchase"],"is_ref":true}},"warehouse":{"synonym":"Склад","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.stores"],"is_ref":true}},"nom":{"synonym":"Номенклатура","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.nom"],"is_ref":true}},"characteristic":{"synonym":"Характеристика","multiline_mode":false,"tooltip":"","choice_links":[{"name":["selection","owner"],"path":["data","nom"]}],"choice_groups_elm":"elm","type":{"types":["cat.characteristics"],"is_ref":true}},"initial_balance":{"synonym":"Начальный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"debit":{"synonym":"Приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"credit":{"synonym":"Расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"final_balance":{"synonym":"Конечный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_initial_balance":{"synonym":"Сумма начальный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_debit":{"synonym":"Сумма приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_credit":{"synonym":"Сумма расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"amount_final_balance":{"synonym":"Сумма конечный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"invoice_execution":{"name":"invoice_execution","splitted":false,"synonym":"Исполнение заказов","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"department":{"synonym":"Подразделение","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.divisions"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"invoice":{"synonym":"Сумма заказа","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"pay":{"synonym":"Оплачено","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"pay_total":{"synonym":"Оплатить","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"pay_percent":{"synonym":"% Оплаты","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipment":{"synonym":"Отгружено","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipment_total":{"synonym":"Отгрузить","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"shipment_percent":{"synonym":"% Отгрузки","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"cash":{"name":"cash","splitted":false,"synonym":"Денежные средства","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.credit_card_order","doc.debit_bank_order","doc.registers_correction","doc.credit_cash_order","doc.debit_cash_order","doc.credit_bank_order"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"bank_account_cashbox":{"synonym":"Касса или банковский счет","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organization_bank_accounts","cat.cashboxes"],"is_ref":true}},"initial_balance":{"synonym":"Начальный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"debit":{"synonym":"Приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"credit":{"synonym":"Расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"final_balance":{"synonym":"Конечный остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}},"mutual_settlements":{"name":"mutual_settlements","splitted":false,"synonym":"Взаиморасчеты","illustration":"","obj_presentation":"","list_presentation":"","hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":false,"code_length":0,"fields":{},"tabular_sections":{"data":{"name":"data","synonym":"Данные","tooltip":"","fields":{"period":{"synonym":"Период","multiline_mode":false,"tooltip":"","type":{"types":["date"],"date_part":"date"}},"register":{"synonym":"Регистратор","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.credit_card_order","doc.debit_bank_order","doc.registers_correction","doc.credit_cash_order","doc.selling","doc.purchase","doc.debit_cash_order","doc.credit_bank_order"],"is_ref":true}},"organization":{"synonym":"Организация","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.organizations"],"is_ref":true}},"trans":{"synonym":"Сделка","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["doc.calc_order"],"is_ref":true}},"partner":{"synonym":"Контрагент","multiline_mode":false,"tooltip":"","choice_groups_elm":"elm","type":{"types":["cat.partners"],"is_ref":true}},"initial_balance":{"synonym":"Нач. остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"debit":{"synonym":"Приход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"credit":{"synonym":"Расход","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}},"final_balance":{"synonym":"Кон. остаток","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":15,"fraction_figits":2}}}}}}},"cch":{"predefined_elmnts":{"name":"ПредопределенныеЭлементы","splitted":true,"synonym":"Константы и списки","illustration":"Хранит значения настроек и параметров подсистем","obj_presentation":"Значение настроек","list_presentation":"","input_by_string":["name","synonym"],"hierarchical":true,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_type":{"path":["ТипЗначения"],"elm":0},"type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}},"definition":{"synonym":"Описание","multiline_mode":true,"tooltip":"","type":{"types":["string"],"str_len":0}},"synonym":{"synonym":"Синоним","multiline_mode":false,"tooltip":"Синоним предопределенного элемента","mandatory":true,"type":{"types":["string"],"str_len":50}},"list":{"synonym":"Список","multiline_mode":false,"tooltip":"","type":{"types":["number"],"digits":1,"fraction_figits":0}},"zone":{"synonym":"Область","multiline_mode":false,"tooltip":"Разделитель (префикс) данных","type":{"types":["number"],"digits":6,"fraction_figits":0}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"parent":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cch.predefined_elmnts"],"is_ref":true}},"type":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}}},"tabular_sections":{"elmnts":{"name":"Элементы","synonym":"Элементы","tooltip":"","fields":{"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"","choice_type":{"path":["ТипЗначения"],"elm":0},"type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}},"elm":{"synonym":"Элемент","multiline_mode":false,"tooltip":"","type":{"types":["cat.production_params","cat.currencies","cat.color_price_groups","cat.formulas","boolean","cat.nom_prices_types","cat.divisions","enm.elm_types","cat.parameters_keys","string","cat.nom_kinds","date","number","enm.planning_detailing","doc.calc_order","cat.nom","cat.furns","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date","digits":8,"fraction_figits":1}}}}},"cachable":"doc","form":{"obj":{"head":{" ":[{"id":"name","path":"o.name","synonym":"Наименование","type":"ro"},{"id":"synonym","path":"o.synonym","synonym":"Синоним","type":"ro"},"list","zone","value"]},"tabular_sections":{"elmnts":{"fields":["elm","value"],"headers":"Элемент,Значение","widths":"*,*","min_widths":"150,150","aligns":"","sortings":"na,na","types":"ref,ref"}}}}},"properties":{"name":"ДополнительныеРеквизитыИСведения","splitted":true,"synonym":"Дополнительные реквизиты и сведения","illustration":"","obj_presentation":"Дополнительный реквизит / сведение","list_presentation":"","input_by_string":["name"],"hierarchical":false,"has_owners":false,"group_hierarchy":false,"main_presentation_name":true,"code_length":0,"fields":{"shown":{"synonym":"Виден","multiline_mode":false,"tooltip":"Настройка видимости дополнительного реквизита","type":{"types":["boolean"]}},"sorting_field":{"synonym":"Порядок","multiline_mode":false,"tooltip":"Используется для упорядочивания (служебный)","type":{"types":["number"],"digits":6,"fraction_figits":0}},"extra_values_owner":{"synonym":"Владелец дополнительных значений","multiline_mode":false,"tooltip":"Свойство-образец, с которым у этого свойства одинаковый список дополнительных значений","choice_groups_elm":"elm","type":{"types":["cch.properties"],"is_ref":true}},"available":{"synonym":"Доступен","multiline_mode":false,"tooltip":"Настройка доступности дополнительного реквизита","type":{"types":["boolean"]}},"mandatory":{"synonym":"Заполнять обязательно","multiline_mode":false,"tooltip":"Настройка проверки заполненности дополнительного реквизита","type":{"types":["boolean"]}},"include_to_name":{"synonym":"Включать в наименование","multiline_mode":false,"tooltip":"Добавлять значение параметра в наименование продукции","type":{"types":["boolean"]}},"list":{"synonym":"Список","multiline_mode":false,"tooltip":"Реквизит подсистемы интеграции metadata.js - реализует функциональность списка опций","type":{"types":["number"],"digits":1,"fraction_figits":0}},"caption":{"synonym":"Наименование","multiline_mode":false,"tooltip":"Краткое представление свойства, которое\nвыводится в формах редактирования его значения","mandatory":true,"type":{"types":["string"],"str_len":75}},"note":{"synonym":"Комментарий","multiline_mode":false,"tooltip":"Поясняет назначение свойства","type":{"types":["string"],"str_len":0}},"destination":{"synonym":"Набор свойств","multiline_mode":false,"tooltip":"Набор свойств, которому принадлежит уникальное свойство. Если не задан, значит свойство общее.","choice_groups_elm":"elm","type":{"types":["cat.destinations"],"is_ref":true}},"tooltip":{"synonym":"Подсказка","multiline_mode":false,"tooltip":"Показывается пользователю при редактировании свойства в форме объекта","type":{"types":["string"],"str_len":0}},"is_extra_property":{"synonym":"Это дополнительное сведение","multiline_mode":false,"tooltip":"Свойство является дополнительным сведением, а не дополнительным реквизитом","type":{"types":["boolean"]}},"include_to_description":{"synonym":"Включать в описание","multiline_mode":false,"tooltip":"Добавлять имя и значение параметра в строку описания продукции","type":{"types":["boolean"]}},"predefined_name":{"synonym":"","multiline_mode":false,"tooltip":"","type":{"types":["string"],"str_len":256}},"type":{"synonym":"","multiline_mode":false,"tooltip":"Типы значения, которое можно ввести при заполнении свойства.","mandatory":true,"type":{"types":["cat.nom_groups","cat.production_params","cat.inserts","cat.price_groups","cat.currencies","enm.open_directions","cat.projects","cat.individuals","cat.users","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","cat.property_values","boolean","cat.divisions","enm.align_types","cat.parameters_keys","cat.partners","cat.nonstandard_attributes","string","enm.sz_line_types","cat.organizations","date","cat.units","number","enm.planning_detailing","cat.work_shifts","cat.cashboxes","cat.nom","cat.cnns","cat.furns","enm.vat_rates","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":1024,"date_part":"date_time","digits":15,"fraction_figits":3}}},"tabular_sections":{"extra_fields_dependencies":{"name":"ЗависимостиДополнительныхРеквизитов","synonym":"Зависимости дополнительных реквизитов","tooltip":"","fields":{"ЗависимоеСвойство":{"synonym":"Зависимое свойство","multiline_mode":false,"tooltip":"Имя свойства дополнительного реквизита, для которого настроена зависимость.","type":{"types":["string"],"str_len":0}},"field":{"synonym":"Реквизит","multiline_mode":false,"tooltip":"Имя реквизита формы или ссылка на дополнительный реквизит, от которого зависит текущий дополнительный реквизит.","choice_groups_elm":"elm","type":{"types":["string","cch.properties"],"str_len":99,"is_ref":true}},"condition":{"synonym":"Условие","multiline_mode":false,"tooltip":"Вид зависимости. \"Равно\", \"Не равно\", \"Заполнено\" или \"Не заполнено\".","type":{"types":["string"],"str_len":20}},"value":{"synonym":"Значение","multiline_mode":false,"tooltip":"Значение реквизита в условии.","choice_groups_elm":"elm","type":{"types":["cat.ПапкиЭлектронныхПисем","doc.work_centers_performance","enm.contact_information_types","enm.individual_legal","cat.nom_groups","enm.count_calculating_ways","enm.text_aligns","cat.production_params","cat.inserts","cat.price_groups","doc.credit_card_order","cat.nom_units","doc.planning_event","cch.predefined_elmnts","cat.currencies","enm.offset_options","enm.open_directions","doc.nom_prices_setup","enm.lay_split_types","cat.characteristics","cat.projects","cat.individuals","cat.users","cat.insert_bind","enm.cutting_optimization_types","enm.angle_calculating_ways","cat.partner_bank_accounts","cat.delivery_areas","cat.color_price_groups","cat.elm_visualization","doc.debit_bank_order","enm.specification_installation_methods","doc.registers_correction","cat.property_values_hierarchy","cat.formulas","cat.delivery_directions","enm.planning_phases","enm.contract_kinds","cat.property_values","boolean","enm.buyers_order_states","cat.banks_qualifier","doc.credit_cash_order","doc.selling","enm.order_categories","cat.nom_prices_types","cat.organization_bank_accounts","cat.divisions","cat.destinations","enm.elm_types","enm.color_price_group_destinations","enm.align_types","cat.parameters_keys","doc.purchase","enm.nom_types","cat.contact_information_kinds","cat.params_links","enm.contraction_options","cat.partners","cat.nonstandard_attributes","enm.transfer_operations_options","doc.debit_cash_order","string","enm.inserts_types","enm.sz_line_types","cat.nom_kinds","enm.orientations","cat.organizations","date","cat.countries","enm.mutual_contract_settlements","enm.inset_attrs_options","cat.units","number","enm.gender","enm.planning_detailing","doc.work_centers_task","cat.work_shifts","enm.impost_mount_options","doc.calc_order","enm.positions","cat.branches","doc.credit_bank_order","cat.cashboxes","enm.open_types","enm.cnn_types","cat.nom","enm.obj_delivery_states","enm.parameters_keys_applying","cat.cnns","cat.furns","enm.inserts_glass_types","cat.cash_flow_articles","enm.vat_rates","enm.cnn_sides","enm.specification_order_row_types","cat.meta_ids","cat.contracts","cat.stores","cch.properties","cat.clrs"],"is_ref":true,"str_len":50,"date_part":"date","digits":10,"fraction_figits":0}}}}},"cachable":"ram"}},"cacc":{},"bp":{},"tsk":{},"syns_1с":["arcCCW","CH","RADIUS","Автор","Адрес","АдресБанка","АдресДоставки","АдресЭП","Аксессуар","Активная","Арт1Стеклопакет","Арт1ТолькоВертикальный","Арт2Стеклопакет","Арт2ТолькоВертикальный","Артикул","Атрибуты","БазоваяЕдиницаИзмерения","Банк","БанкДляРасчетов","Банки","БанковскиеСчета","БанковскиеСчетаКонтрагентов","БанковскиеСчетаОрганизаций","БанковскийСчет","БизнесПроцесс","БИКБанка","БИКБанкаДляРасчетов","Булево","Валюта","ВалютаВзаиморасчетов","ВалютаДенежныхСредств","ВалютаДокумента","ВалютаЦены","Валюты","ВариантАтрибутов","ВариантПереноса","ВариантСмещения","ВариантУкорочения","ВариантыАтрибутовВставок","ВариантыКрепленияИмпостов","ВариантыПереносаОпераций","ВариантыСмещений","ВариантыУкорочений","ВариантыУравнивания","ВводПоСтроке","ВедениеВзаиморасчетов","ВедениеВзаиморасчетовПоДоговорам","Ведомый","ВедущаяПродукция","ВедущаяФормула","Ведущий","ВедущийМенеджер","ВедущийЭлемент","ВерсияДанных","Вес","Вид","ВидДоговора","Виден","ВидЗатрат","ВидНоменклатуры","ВидОперации","ВидРабот","ВидРабочегоЦентра","ВидСкидкиНаценки","ВидСравнения","ВидСчета","ВидыДоговоровКонтрагентов","ВидыЗатрат","ВидыКонтактнойИнформации","ВидыНоменклатуры","ВидыПолейФормы","ВидыРабочихЦентров","ВидыТранспортныхСредств","Визуализация","ВключатьВНаименование","ВключатьВОписание","Владелец","ВладелецДополнительныхЗначений","Владельцы","ВнутренниеЗаказы","ВремяИзменения","ВремяНачала","ВремяОкончания","ВремяСобытия","Всего","Вставка","Вставки","ВходящееИсходящееСобытие","ВыборГруппИЭлементов","Выполнена","ВыпуклаяДуга","ВыравниваниеТекста","Высота","ВысотаМакс","ВысотаМин","ВысотаРучки","ВысотаРучкиМакс","ВысотаРучкиМин","ВысотаРучкиФиксирована","Глубина","Город","ГородБанка","ГородБанкаДляРасчетов","Готовность","ГрафикРаботы","Группировка","ГруппыФинансовогоУчетаНоменклатуры","ДаНет","Дата","ДатаДоставки","ДатаИзменения","ДатаНачала","ДатаОкончания","ДатаРождения","ДатаСобытия","ДебетКредит","Действие","ДеловаяОбрезь","ДержатьРезервБезОплатыОграниченноеВремя","ДетализацияПланирования","ДеятельностьПрекращена","Длина","ДлинаКода","ДлинаМакс","ДлинаМин","ДлинаНомера","ДлинаПроема","ДнейДоГотовности","ДнейОтГотовности","ДниНедели","ДоговорКонтрагента","ДоговорыКонтрагентов","Документ.Расчет","ДокументУдостоверяющийЛичность","Долгота","ДоменноеИмяСервера","Доп","ДополнительныеРеквизиты","ДополнительныеРеквизитыИСведения","ДополнительныеСведения","ДопускаютсяНезамкнутыеКонтуры","ДопустимаяСуммаЗадолженности","ДопустимоеЧислоДнейЗадолженности","Доступен","ЕдиницаИзмерения","ЕдиницаПоКлассификатору","ЕдиницаХраненияОстатков","ЕдиницыИзмерения","Завершен","Завершение","ЗависимостиДополнительныхРеквизитов","Заголовок","Заказ","Заказной","ЗаказПокупателя","ЗаказПоставщику","Закрыт","Запасы","Заполнения","ЗаполнятьОбязательно","Запуск","Значение","ЗначениеЗаполнения","Значения","ЗначенияПолей","ЗначенияПолейАдреса","ЗначенияСвойствОбъектов","ЗначенияСвойствОбъектовИерархия","Идентификатор","ИдентификаторПользователяИБ","ИдентификаторПользователяСервиса","ИдентификаторыОбъектовМетаданных","Иерархический","ИерархияГруппИЭлементов","Изделие","ИмяПредопределенныхДанных","Инд","Индекс","ИндивидуальныйПредприниматель","ИНН","ИнтеграцияВидыСравнений","ИнтеграцияКешСсылок","ИнтеграцияНастройкиОтчетовИСписков","ИнтеграцияОтделыАбонентов","ИнтеграцияСостоянияТранспорта","ИнтеграцияТипВыгрузки","ИнтеграцияТипКеширования","ИнтеграцияТипСвёртки","Исполнители","Исполнитель","ИтогСебестоимость","Календари","КалендариGoogle","Календарь","Камеры","Касса","Кассы","КатегорииЗаказов","Категория","КлассификаторБанковРФ","КлассификаторЕдиницИзмерения","КлиентДилера","Ключ","Ключи","КлючиПараметров","КМарж","КМаржВнутр","КМаржМин","Код","КодАльфа2","КодАльфа3","КодИМНС","КодПоОКПО","КодЦветаДляСтанка","Количество","КоличествоСторон","Комментарий","Конструкции","Конструкция","КонтактнаяИнформация","КонтактныеЛица","КонтактныеЛицаКонтрагентов","Контрагент","Контрагенты","КонтролироватьСуммуЗадолженности","КонтролироватьЧислоДнейЗадолженности","КонцевыеКрепления","Координата","Координаты","КоординатыЗаполнений","КорректировкаРегистров","КоррСчет","КоррСчетБанка","КоррСчетБанкаДляРасчетов","Коэффициент","КоэффициентПотерь","КПП","Кратность","КратностьВзаиморасчетов","КрепитсяШтульп","КреплениеИмпостов","КреплениеШтульпа","Кривой","Курс","КурсВзаиморасчетов","КурсыВалют","ЛеваяПравая","Листовые","Маржа","Марка","Масса","МассаМакс","МассаМин","МассаСтворкиМакс","МассаСтворкиМин","Материал","МатериалОперация","Материалы","МеждународноеСокращение","Менеджер","МестоРождения","МногострочныйРежим","МожноПоворачивать","Москитка","Москитки","МощностиРЦ","Мощность","Набор","НаборСвойств","НаборФурнитуры","НаборыДополнительныхРеквизитовИСведений","НазначениеЦветовойГруппы","НазначенияЦветовыхГрупп","Наименование","НаименованиеБанка","НаименованиеПолное","НаименованиеСокращенное","НалогообложениеНДС","Направление","НаправлениеОткрывания","НаправленияДоставки","НаправленияСортировки","НаПроем","НарядРЦ","НастройкиОткрывания","Наценка","НаценкаВнешн","Недействителен","НеполноеОткрывание","Нестандарт","Номенклатура","Номенклатура1","Номенклатура2","НоменклатурнаяГруппа","Номер","НомерВнутр","НомерКлиента","НомерКонтура","НомерОтдела","НомерСтроки","НомерСчета","НомерТелефона","НомерТелефонаБезКодов","ОбластиДоступаGoogle","Область","Объект","ОбъектДоступа","ОбъектыДоступа","Объем","ОбязательноеЗаполнение","ОграниченияСпецификации","ОкруглятьВБольшуюСторону","ОкруглятьКоличество","Описание","ОплатаОтПокупателяПлатежнойКартой","Организации","Организация","Ориентация","ОриентацияЭлемента","ОсновнаяВалюта","ОсновнаяСтатьяДвиженияДенежныхСредств","ОсновноаяКасса","ОсновноеКонтактноеЛицо","ОсновноеПредставлениеИмя","ОсновнойБанковскийСчет","ОсновнойДоговорКонтрагента","ОсновнойМенеджерПокупателя","ОсновнойПроект","ОснЦвет","ОсьПоворота","Отбор","Ответственный","Отдел","ОтражатьВБухгалтерскомУчете","ОтражатьВНалоговомУчете","Отступы","Параметр","Параметры","ПараметрыВыбора","ПараметрыИзделия","ПараметрыОтбора","ПараметрыПрописиНаРусском","ПараметрыФурнитуры","ПарныйРаскрой","Период","ПериодыСмены","пзВизуализацияЭлементов","пзМаржинальныеКоэффициентыИСкидки","пзПараметрыПродукции","пзСоединения","пзФурнитура","пзЦвета","Планирование","ПлатежноеПоручениеВходящее","ПлатежноеПоручениеИсходящее","ПлатежныйКалендарь","Плотность","Площадь","ПлощадьМакс","ПлощадьМин","ПлощадьППМ","Поворачивать","ПоДоговоруВЦелом","Подразделение","ПодразделениеПроизводства","Подразделения","Подсказка","Подчиненый","ПоЗаказам","ПоКонтуру","Покупатель","Пол","ПолноеИмя","Положение","ПоложениеСтворокПоИмпостам","ПоложениеЭлемента","ПоложенияЗаголовка","Получатель","ПолФизическихЛиц","Пользователи","ПометкаУдаления","ПорогОкругления","Порядок","ПорядокОкругления","Поставщик","ПоступлениеТоваровУслуг","ПоСчетам","Потребность","ПоУмолчанию","Пояснение","Предоплата","ПредопределенныеЭлементы","Предопределенный","Представление","ПредставлениеИдентификатора","ПредставлениеОбъекта","ПредставлениеСписка","Префикс","Привязки","ПривязкиВставок","ПризнакиНестандартов","Применение","ПримененияКлючейПараметров","Принудительно","Приоритет","Припуск","ПриходныйКассовыйОрдер","Проведен","Продукция","Проект","Проекты","Происхождение","Пропорции","Процент","ПроцентПредоплаты","ПроцентСкидкиНаценки","ПроцентСкидкиНаценкиВнутр","Прочее","Прямоугольный","ПутьSVG","РаботаетВремяНачала","РаботаетВремяОкончания","Работники","Работы","РабочиеЦентры","Разделитель","Размер","Размер_B","РазмерМакс","РазмерМин","РазмерФальца","РазмерФурнПаза","РазныеЦвета","Район","РайоныДоставки","Раскладка","РасходныйКассовыйОрдер","Расценка","Расчет","РасчетныйСчет","РасчетыСКонтрагентами","РасширенныйРежим","РасшифровкаПлатежа","РеализацияТоваровУслуг","Регион","Реквизит","РеквизитДопУпорядочивания","Реквизиты","Родитель","РучкаНаСтороне","СвидетельствоДатаВыдачи","СвидетельствоКодОргана","СвидетельствоНаименованиеОргана","СвидетельствоСерияНомер","СВИФТБИК","Свойство","Связи","СвязиПараметров","СвязиПараметровВыбора","СвязьПоТипу","Сделка","Себестоимость","Синоним","Система","СистемыПрофилей","СистемыФурнитуры","Скидка","СкидкаВнешн","СкидкиНаценки","Склад","Склады","СКомиссионером","СКомитентом","Скрыть","Сложный","Служебный","Смена","Смены","Смещение","Событие","СобытиеПланирования","Содержание","Соедин","СоединяемыеЭлементы","Соответствие","СоответствиеЦветов","СортировкаВЛистеКомплектации","Состав","Состояние","СостояниеТранспорта","СостоянияЗаданий","СостоянияЗаказовКлиентов","Сотрудник","Сотрудники","Спецификации","Спецификация","СпецификацияЗаполнений","Список","СПокупателем","СпособРасчетаКоличества","СпособРасчетаУгла","СпособУстановкиКурса","СпособыРасчетаКоличества","СпособыРасчетаУгла","СпособыУстановкиКурсаВалюты","СпособыУстановкиСпецификации","СПоставщиком","СрокДействия","Ссылка","СтавкаНДС","СтавкиНДС","СтандартнаяВысотаРучки","СтандартныйПериод","Старт","Стартован","СтатусыЗаказов","СтатьиДвиженияДенежныхСредств","СтатьиЗатрат","СтатьяДвиженияДенежныхСредств","СтатьяЗатрат","Створка","СтворкиВРазныхПлоскостях","Стоимость","Сторона","Сторона1","Сторона2","СторонаСоединения","СторонаЭлемента","СтороныСоединений","Страна","СтраныМира","СтраховойНомерПФР","стрНомер","Строка","СтрокаПодключения","СтруктурнаяЕдиница","Сумма","СуммаАвтоматическойСкидки","СуммаВзаиморасчетов","СуммаВключаетНДС","СуммаВнутр","СуммаДокумента","СуммаНДС","СуммаСНаценкой","СуммаУпр","Суффикс","СчетУчета","ТаблицаРегистров","ТабличнаяЧасть","ТабличныеЧасти","ТекстКорреспондента","ТекстНазначения","ТекстоваяСтрока","Телефон","Телефоны","ТелефоныБанка","Тип","ТипВставки","ТипВставкиСтеклопакета","ТипДеления","ТипДенежныхСредств","ТипИсходногоДокумента","ТипНоменклатуры","ТиповойБлок","ТиповыеБлоки","ТипОптимизации","ТипОткрывания","ТипСоединения","ТипСчета","ТипЦен","ТипЦенВнутр","ТипЦенПрайс","ТипЦенСебестоимость","ТипыВставок","ТипыВставокСтеклопакета","ТипыДеленияРаскладки","ТипыДенежныхСредств","ТипыКонтактнойИнформации","ТипыНалогообложенияНДС","ТипыНоменклатуры","ТипыОптимизацийРаскроя","ТипыОткрывания","ТипыРазмерныхЛиний","ТипыСобытий","ТипыСоединений","ТипыСтрокВЗаказ","ТипыСтруктурныхЕдиниц","ТипыСчетов","ТипыЦен","ТипыЦенНоменклатуры","ТипыЭлементов","ТипЭлемента","Товары","Толщина","ТолщинаМакс","ТолщинаМин","ТолькоДляПрямыхПрофилей","ТолькоДляЦенообразования","ТочкаМаршрута","ТранспортныеСредства","УголКГоризонту","УголКГоризонтуМакс","УголКГоризонтуМин","УголМакс","УголМин","УголРеза1","УголРеза2","УголШага","УдлинениеАрки","Узел1","Узел2","Укорочение","УкорочениеПоКонтуру","Упаковка","Управленческий","Условие","УсловныхИзделий","Услуги","УстанавливатьСпецификацию","УстановкаЦенНоменклатуры","УточнятьРайонГеокодером","УчитыватьНДС","Фаза","ФазыПланирования","ФизическиеЛица","ФизическоеЛицо","Финиш","Формула","ФормулаВнешн","ФормулаВнутр","ФормулаПродажа","ФормулаРасчетаКурса","ФормулаУсловия","Формулы","Фурнитура","ФурнитураЦвет","Характеристика","ХарактеристикаАксессуаров","ХарактеристикаНоменклатуры","ХарактеристикаПродукции","ХарактеристикиНоменклатуры","Цвет","Цвет1","Цвет2","ЦветRAL","Цвета","ЦветВРисовалке","ЦветИзнутри","Цветной","ЦветоваяГруппа","ЦветоЦеновыеГруппы","ЦветСнаружи","Цена","ЦенаВключаетНДС","ЦенаВнутр","ЦеноваяГруппа","ЦеновыеГруппы","Центрировать","ЦеныНоменклатуры","Число","ЧислоДнейРезерваБезОплаты","Шаблон","Шаг","Ширина","ШиринаПилы","Широта","Шкала","Штуки","ШтульпБезимпСоед","Экземпляр","Элемент","Элемент1","Элемент2","Элементы","Эскиз","ЭтоАксессуар","ЭтоГруппа","ЭтоДополнительноеСведение","ЭтоНабор","ЭтоОсновнойЭлемент","ЭтоРаздвижка","ЭтоСоединение","ЭтоСтрокаЗаказа","ЭтоСтрокаНабора","ЭтоСтрокаОперации","ЭтоСтрокаОсновнойСпецификации","ЭтоСтрокаСочетанияНоменклатур","ЭтоТехоперация","ЭтоУслуга","ЮрЛицо","ЮрФизЛицо","Ячейка","Ячейки","НачальныйОстаток","КонечныйОстаток","Приход","Расход","СуммаНачальныйОстаток","СуммаКонечныйОстаток","СуммаПриход","СуммаРасход"],"syns_js":["arc_ccw","changed","arc_r","author","address","bank_address","shipping_address","email_address","accessory","active","art1glass","art1vert","art2glass","art2vert","article","attributes","base_unit","bank","settlements_bank","banks","bank_accounts","partner_bank_accounts","organization_bank_accounts","bank_account","buisness_process","bank_bic","settlements_bank_bic","boolean","currency","settlements_currency","funds_currency","doc_currency","price_currency","currencies","attrs_option","transfer_option","offset_option","contraction_option","inset_attrs_options","impost_mount_options","transfer_operations_options","offset_options","contraction_options","align_types","input_by_string","mutual_settlements","mutual_contract_settlements","slave","leading_product","leading_formula","master","leading_manager","leading_elm","data_version","heft","kind","contract_kind","shown","cost_kind","nom_kind","transactions_kind","work_kind","work_center_kind","charges_discounts_kind","comparison_type","account_kind","contract_kinds","costs_kinds","contact_information_kinds","nom_kinds","data_field_kinds","work_center_kinds","motor_vehicle_kinds","visualization","include_to_name","include_to_description","owner","extra_values_owner","owners","internal_orders","change_time","begin_time","end_time","event_time","altogether","inset","inserts","inbound_outbound","choice_groups_elm","completed","arc_available","text_aligns","height","hmax","hmin","h_ruch","handle_height_max","handle_height_min","fix_ruch","depth","city","bank_city","settlements_bank_city","readiness","worker_schedule","grouping","nom_groups","yes_no","date","shipping_date","change_date","start_date","expiration_date","birth_date","event_date","debit_credit","action","biz_cuts","check_days_without_pay","planning_detailing","activity_ceased","len","code_length","lmax","lmin","number_doc_len","aperture_len","days_to_execution","days_from_execution","week_days","contract","contracts","Документ.итРасчет","identification_document","longitude","server_domain_name","dop","extra_fields","properties","extra_properties","allow_open_cnn","allowable_debts_amount","allowable_debts_days","available","unit","qualifier_unit","storage_unit","nom_units","finished","completion","extra_fields_dependencies","caption","invoice","made_to_order","buyers_order","purchase_order","closed","inventories","glasses","mandatory","launch","value","fill_value","values","values_fields","address_fields","property_values","property_values_hierarchy","identifier","user_ib_uid","user_fresh_uid","meta_ids","hierarchical","group_hierarchy","product","predefined_name","icounter","ind","individual_entrepreneur","inn","comparison_types","integration_links_cache","scheme_settings","branches","obj_delivery_states","unload_type","caching_type","reduce_type","executors","executor","first_cost_total","calendars","calendars_google","calendar","coffer","cashbox","cashboxes","order_categories","category","banks_qualifier","units","client_of_dealer","key","keys","parameters_keys","marginality","marginality_internal","marginality_min","id","alpha2","alpha3","imns_code","okpo","machine_tools_clr","quantity","side_count","note","constructions","cnstr","contact_information","contact_persons","contact_persons_partners","partner","partners","check_debts_amount","check_debts_days","end_mount","coordinate","coordinates","glass_coordinates","registers_correction","correspondent_account","bank_correspondent_account","settlements_bank_correspondent_account","coefficient","loss_factor","kpp","multiplicity","settlements_multiplicity","shtulp_fix_here","impost_fixation","shtulp_fixation","crooked","course","settlements_course","currency_courses","left_right","is_sandwich","margin","brand","weight","mmax","mmin","flap_weight_max","flap_weight_min","material","material_operation","materials","international_short","manager","birth_place","multiline_mode","can_rotate","mskt","mosquito","work_centers_performance","performance","set","destination","furn_set","destinations","color_price_group_destination","color_price_group_destinations","name","bank_name","name_full","name_short","vat","direction","open_directions","delivery_directions","sort_directions","on_aperture","work_centers_task","open_tunes","extra_charge","extra_charge_external","invalid","partial_opening","nonstandard","nom","nom1","nom2","nom_group","number_doc","number_internal","client_number","contour_number","number_division","row","account_number","phone_number","phone_without_codes","google_access_areas","area","obj","acl_obj","acl_objs","volume","mandatory_fields","specification_restrictions","rounding_in_a_big_way","rounding_quantity","definition","credit_card_order","organizations","organization","orientation","orientations","main_currency","main_cash_flow_article","main_cashbox","primary_contact","main_presentation_name","main_bank_account","main_contract","buyer_main_manager","main_project","default_clr","rotation_axis","selection","responsible","branch","accounting_reflect","tax_accounting_reflect","offsets","param","params","choice_params","product_params","selection_params","parameters_russian_recipe","furn_params","double_cut","period","work_shift_periodes","elm_visualization","margin_coefficients","production_params","cnns","furns","clrs","planning","debit_bank_order","credit_bank_order","calendar_payments","density","s","smax","smin","coloration_area","rotate","by_entire_contract","department","department_manufactory","divisions","tooltip","has_owners","by_orders","by_contour","is_buyer","sex","full_moniker","pos","flap_pos_by_impost","positions","label_positions","recipient","gender","users","_deleted","rounding_threshold","sorting","rounding_order","is_supplier","purchase","by_invoices","demand","by_default","illustration","prepayment","predefined_elmnts","predefined","presentation","identifier_presentation","obj_presentation","list_presentation","prefix","bindings","insert_bind","nonstandard_attributes","applying","parameters_keys_applying","forcibly","priority","overmeasure","debit_cash_order","posted","production","project","projects","origin","proportions","rate","prepayment_percent","discount_percent","discount_percent_internal","others","is_rectangular","svg_path","work_begin_time","work_end_time","workers","jobs","work_centers","delimiter","sz","sizeb","sz_max","sz_min","sizefaltz","sizefurn","varclr","delivery_area","delivery_areas","lay","credit_cash_order","pricing","calc_order","current_account","invoice_payments","extended_mode","payment_details","selling","region","field","sorting_field","fields","parent","handle_side","certificate_date_issue","certificate_authority_code","certificate_authority_name","certificate_series_number","swift","property","links","params_links","choice_links","choice_type","trans","first_cost","synonym","sys","sys_profile","sys_furn","discount","discount_external","charges_discounts","warehouse","stores","with_commission_agent","with_committent","hide","difficult","ancillary","work_shift","work_shifts","offset","event","planning_event","content","cnn","cnn_elmnts","conformity","clr_conformity","complete_list_sorting","composition","state","obj_delivery_state","task_states","buyers_order_states","employee","staff","specifications","specification","glass_specification","list","with_buyer","count_calc_method","angle_calc_method","course_installation_method","count_calculating_ways","angle_calculating_ways","course_installation_methods","specification_installation_methods","with_supplier","validity","ref","vat_rate","vat_rates","handle_height_base","standard_period","start","started","invoice_conditions","cash_flow_articles","cost_items","cash_flow_article","cost_item","flap","var_layers","cost","side","sd1","sd2","cnn_side","elm_side","cnn_sides","country","countries","pfr_number","number_str","string","connection_str","organizational_unit","amount","discount_amount_automatic","amount_mutual","vat_included","amount_internal","doc_amount","vat_amount","amount_marged","amount_operation","suffix","account_accounting","registers_table","tabular_section","tabular_sections","correspondent_text","appointments_text","txt_row","phone","phone_numbers","bank_phone_numbers","type","insert_type","insert_glass_type","split_type","cash_flow_type","original_doc_type","nom_type","base_block","base_blocks","cutting_optimization_type","open_type","cnn_type","account_type","price_type","price_type_internal","price_type_sale","price_type_first_cost","inserts_types","inserts_glass_types","lay_split_types","cash_flow_types","contact_information_types","vat_types","nom_types","cutting_optimization_types","open_types","sz_line_types","event_types","cnn_types","specification_order_row_types","structural_unit_types","account_types","price_types","nom_prices_types","elm_types","elm_type","goods","thickness","tmax","tmin","for_direct_profile_only","for_pricing_only","buisness_process_point","transport_means","angle_hor","ahmax","ahmin","amax","amin","alp1","alp2","step_angle","arc_elongation","node1","node2","contraction","contraction_by_contour","packing","managerial","condition","condition_products","services","set_specification","nom_prices_setup","specify_area_by_geocoder","vat_consider","phase","planning_phases","individuals","individual_person","finish","formula","external_formula","internal_formula","sale_formula","course_calc_formula","condition_formula","formulas","furn","clr_furn","characteristic","accessory_characteristic","nom_characteristic","product_characteristic","characteristics","clr","clr1","clr2","ral","colors","clr_str","clr_in","colored","clr_group","color_price_groups","clr_out","price","vat_price_included","price_internal","price_group","price_groups","do_center","nom_prices","number","days_without_pay","template","step","width","saw_width","latitude","scale","is_pieces","shtulp_available","specimen","elm","elm1","elm2","elmnts","outline","is_accessory","is_folder","is_extra_property","is_set","is_main_elm","is_sliding","is_cnn","is_order_row","is_set_row","is_procedure_row","is_main_specification_row","is_nom_combinations_row","is_procedure","is_service","legal_person","individual_legal","cell","cells","initial_balance","final_balance","debit","credit","amount_initial_balance","amount_final_balance","amount_debit","amount_credit"]});(function(){const{EnumManager,CatManager,DocManager,DataProcessorsManager,ChartOfCharacteristicManager,ChartOfAccountManager,InfoRegManager,AccumRegManager,BusinessProcessManager,TaskManager,CatObj,DocObj,TabularSectionRow,DataProcessorObj,RegisterRow,BusinessProcessObj,TaskObj}=$p.constructor.classes;const _define=Object.defineProperties;$p.enm.create('accumulation_record_type');$p.enm.create('sort_directions');$p.enm.create('comparison_types');$p.enm.create('label_positions');$p.enm.create('data_field_kinds');$p.enm.create('standard_period');$p.enm.create('quick_access');$p.enm.create('report_output');$p.enm.create('inset_attrs_options');$p.enm.create('impost_mount_options');$p.enm.create('transfer_operations_options');$p.enm.create('offset_options');$p.enm.create('contraction_options');$p.enm.create('align_types');$p.enm.create('mutual_contract_settlements');$p.enm.create('contract_kinds');$p.enm.create('text_aligns');$p.enm.create('planning_detailing');$p.enm.create('obj_delivery_states');$p.enm.create('order_categories');$p.enm.create('color_price_group_destinations');$p.enm.create('open_directions');$p.enm.create('orientations');$p.enm.create('positions');$p.enm.create('gender');$p.enm.create('parameters_keys_applying');$p.enm.create('buyers_order_states');$p.enm.create('count_calculating_ways');$p.enm.create('angle_calculating_ways');$p.enm.create('specification_installation_methods');$p.enm.create('vat_rates');$p.enm.create('cnn_sides');$p.enm.create('inserts_types');$p.enm.create('inserts_glass_types');$p.enm.create('lay_split_types');$p.enm.create('contact_information_types');$p.enm.create('nom_types');$p.enm.create('cutting_optimization_types');$p.enm.create('open_types');$p.enm.create('sz_line_types');$p.enm.create('cnn_types');$p.enm.create('specification_order_row_types');$p.enm.create('elm_types');$p.enm.create('planning_phases');$p.enm.create('individual_legal');/**
* ### План видов характеристик ПредопределенныеЭлементы
* Хранит значения настроек и параметров подсистем
* @class CchPredefined_elmnts
* @extends CatObj
* @constructor 
*/class CchPredefined_elmnts extends CatObj{get value(){return this._getter('value');}set value(v){this._setter('value',v);}get definition(){return this._getter('definition');}set definition(v){this._setter('definition',v);}get synonym(){return this._getter('synonym');}set synonym(v){this._setter('synonym',v);}get list(){return this._getter('list');}set list(v){this._setter('list',v);}get zone(){return this._getter('zone');}set zone(v){this._setter('zone',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get type(){return this._getter('type');}set type(v){this._setter('type',v);}get elmnts(){return this._getter_ts('elmnts');}set elmnts(v){this._setter_ts('elmnts',v);}}$p.CchPredefined_elmnts=CchPredefined_elmnts;class CchPredefined_elmntsElmntsRow extends TabularSectionRow{get value(){return this._getter('value');}set value(v){this._setter('value',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}}$p.CchPredefined_elmntsElmntsRow=CchPredefined_elmntsElmntsRow;$p.cch.create('predefined_elmnts');/**
* ### План видов характеристик ДополнительныеРеквизитыИСведения
* Дополнительные реквизиты и сведения
* @class CchProperties
* @extends CatObj
* @constructor 
*/class CchProperties extends CatObj{get shown(){return this._getter('shown');}set shown(v){this._setter('shown',v);}get sorting_field(){return this._getter('sorting_field');}set sorting_field(v){this._setter('sorting_field',v);}get extra_values_owner(){return this._getter('extra_values_owner');}set extra_values_owner(v){this._setter('extra_values_owner',v);}get available(){return this._getter('available');}set available(v){this._setter('available',v);}get mandatory(){return this._getter('mandatory');}set mandatory(v){this._setter('mandatory',v);}get include_to_name(){return this._getter('include_to_name');}set include_to_name(v){this._setter('include_to_name',v);}get list(){return this._getter('list');}set list(v){this._setter('list',v);}get caption(){return this._getter('caption');}set caption(v){this._setter('caption',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get destination(){return this._getter('destination');}set destination(v){this._setter('destination',v);}get tooltip(){return this._getter('tooltip');}set tooltip(v){this._setter('tooltip',v);}get is_extra_property(){return this._getter('is_extra_property');}set is_extra_property(v){this._setter('is_extra_property',v);}get include_to_description(){return this._getter('include_to_description');}set include_to_description(v){this._setter('include_to_description',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get type(){return this._getter('type');}set type(v){this._setter('type',v);}get extra_fields_dependencies(){return this._getter_ts('extra_fields_dependencies');}set extra_fields_dependencies(v){this._setter_ts('extra_fields_dependencies',v);}}$p.CchProperties=CchProperties;class CchPropertiesExtra_fields_dependenciesRow extends TabularSectionRow{get ЗависимоеСвойство(){return this._getter('ЗависимоеСвойство');}set ЗависимоеСвойство(v){this._setter('ЗависимоеСвойство',v);}get field(){return this._getter('field');}set field(v){this._setter('field',v);}get condition(){return this._getter('condition');}set condition(v){this._setter('condition',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}}$p.CchPropertiesExtra_fields_dependenciesRow=CchPropertiesExtra_fields_dependenciesRow;$p.cch.create('properties');/**
* ### Справочник СвязиПараметров
* Подчиненные параметры
* @class CatParams_links
* @extends CatObj
* @constructor 
*/class CatParams_links extends CatObj{get master(){return this._getter('master');}set master(v){this._setter('master',v);}get slave(){return this._getter('slave');}set slave(v){this._setter('slave',v);}get hide(){return this._getter('hide');}set hide(v){this._setter('hide',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get zone(){return this._getter('zone');}set zone(v){this._setter('zone',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get values(){return this._getter_ts('values');}set values(v){this._setter_ts('values',v);}}$p.CatParams_links=CatParams_links;class CatParams_linksValuesRow extends TabularSectionRow{get value(){return this._getter('value');}set value(v){this._setter('value',v);}get by_default(){return this._getter('by_default');}set by_default(v){this._setter('by_default',v);}get forcibly(){return this._getter('forcibly');}set forcibly(v){this._setter('forcibly',v);}}$p.CatParams_linksValuesRow=CatParams_linksValuesRow;$p.cat.create('params_links');/**
* ### Справочник БанковскиеСчетаКонтрагентов
* Банковские счета сторонних контрагентов и физических лиц.
* @class CatPartner_bank_accounts
* @extends CatObj
* @constructor 
*/class CatPartner_bank_accounts extends CatObj{get account_number(){return this._getter('account_number');}set account_number(v){this._setter('account_number',v);}get bank(){return this._getter('bank');}set bank(v){this._setter('bank',v);}get settlements_bank(){return this._getter('settlements_bank');}set settlements_bank(v){this._setter('settlements_bank',v);}get correspondent_text(){return this._getter('correspondent_text');}set correspondent_text(v){this._setter('correspondent_text',v);}get appointments_text(){return this._getter('appointments_text');}set appointments_text(v){this._setter('appointments_text',v);}get funds_currency(){return this._getter('funds_currency');}set funds_currency(v){this._setter('funds_currency',v);}get bank_bic(){return this._getter('bank_bic');}set bank_bic(v){this._setter('bank_bic',v);}get bank_name(){return this._getter('bank_name');}set bank_name(v){this._setter('bank_name',v);}get bank_correspondent_account(){return this._getter('bank_correspondent_account');}set bank_correspondent_account(v){this._setter('bank_correspondent_account',v);}get bank_city(){return this._getter('bank_city');}set bank_city(v){this._setter('bank_city',v);}get bank_address(){return this._getter('bank_address');}set bank_address(v){this._setter('bank_address',v);}get bank_phone_numbers(){return this._getter('bank_phone_numbers');}set bank_phone_numbers(v){this._setter('bank_phone_numbers',v);}get settlements_bank_bic(){return this._getter('settlements_bank_bic');}set settlements_bank_bic(v){this._setter('settlements_bank_bic',v);}get settlements_bank_correspondent_account(){return this._getter('settlements_bank_correspondent_account');}set settlements_bank_correspondent_account(v){this._setter('settlements_bank_correspondent_account',v);}get settlements_bank_city(){return this._getter('settlements_bank_city');}set settlements_bank_city(v){this._setter('settlements_bank_city',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}}$p.CatPartner_bank_accounts=CatPartner_bank_accounts;$p.cat.create('partner_bank_accounts');/**
* ### Справочник БанковскиеСчетаОрганизаций
* Банковские счета собственных организаций. 
* @class CatOrganization_bank_accounts
* @extends CatObj
* @constructor 
*/class CatOrganization_bank_accounts extends CatObj{get bank(){return this._getter('bank');}set bank(v){this._setter('bank',v);}get bank_bic(){return this._getter('bank_bic');}set bank_bic(v){this._setter('bank_bic',v);}get funds_currency(){return this._getter('funds_currency');}set funds_currency(v){this._setter('funds_currency',v);}get account_number(){return this._getter('account_number');}set account_number(v){this._setter('account_number',v);}get settlements_bank(){return this._getter('settlements_bank');}set settlements_bank(v){this._setter('settlements_bank',v);}get settlements_bank_bic(){return this._getter('settlements_bank_bic');}set settlements_bank_bic(v){this._setter('settlements_bank_bic',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}}$p.CatOrganization_bank_accounts=CatOrganization_bank_accounts;$p.cat.create('organization_bank_accounts');/**
* ### Справочник ЗначенияСвойствОбъектовИерархия
* Дополнительные значения (иерархия)
* @class CatProperty_values_hierarchy
* @extends CatObj
* @constructor 
*/class CatProperty_values_hierarchy extends CatObj{get heft(){return this._getter('heft');}set heft(v){this._setter('heft',v);}get ПолноеНаименование(){return this._getter('ПолноеНаименование');}set ПолноеНаименование(v){this._setter('ПолноеНаименование',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatProperty_values_hierarchy=CatProperty_values_hierarchy;$p.cat.create('property_values_hierarchy');/**
* ### Справочник КлассификаторБанковРФ
* Классификатор банков РФ
* @class CatBanks_qualifier
* @extends CatObj
* @constructor 
*/class CatBanks_qualifier extends CatObj{get correspondent_account(){return this._getter('correspondent_account');}set correspondent_account(v){this._setter('correspondent_account',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get address(){return this._getter('address');}set address(v){this._setter('address',v);}get phone_numbers(){return this._getter('phone_numbers');}set phone_numbers(v){this._setter('phone_numbers',v);}get activity_ceased(){return this._getter('activity_ceased');}set activity_ceased(v){this._setter('activity_ceased',v);}get swift(){return this._getter('swift');}set swift(v){this._setter('swift',v);}get inn(){return this._getter('inn');}set inn(v){this._setter('inn',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatBanks_qualifier=CatBanks_qualifier;$p.cat.create('banks_qualifier');/**
* ### Справочник НаборыДополнительныхРеквизитовИСведений
* Наборы дополнительных реквизитов и сведений
* @class CatDestinations
* @extends CatObj
* @constructor 
*/class CatDestinations extends CatObj{get КоличествоРеквизитов(){return this._getter('КоличествоРеквизитов');}set КоличествоРеквизитов(v){this._setter('КоличествоРеквизитов',v);}get КоличествоСведений(){return this._getter('КоличествоСведений');}set КоличествоСведений(v){this._setter('КоличествоСведений',v);}get Используется(){return this._getter('Используется');}set Используется(v){this._setter('Используется',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}get extra_properties(){return this._getter_ts('extra_properties');}set extra_properties(v){this._setter_ts('extra_properties',v);}}$p.CatDestinations=CatDestinations;class CatDestinationsExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get _deleted(){return this._getter('_deleted');}set _deleted(v){this._setter('_deleted',v);}}$p.CatDestinationsExtra_fieldsRow=CatDestinationsExtra_fieldsRow;class CatDestinationsExtra_propertiesRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get _deleted(){return this._getter('_deleted');}set _deleted(v){this._setter('_deleted',v);}}$p.CatDestinationsExtra_propertiesRow=CatDestinationsExtra_propertiesRow;$p.cat.create('destinations');/**
* ### Справочник СтраныМира
* Страны мира
* @class CatCountries
* @extends CatObj
* @constructor 
*/class CatCountries extends CatObj{get name_full(){return this._getter('name_full');}set name_full(v){this._setter('name_full',v);}get alpha2(){return this._getter('alpha2');}set alpha2(v){this._setter('alpha2',v);}get alpha3(){return this._getter('alpha3');}set alpha3(v){this._setter('alpha3',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatCountries=CatCountries;$p.cat.create('countries');/**
* ### Справочник Формулы
* Формулы пользователя, для выполнения при расчете спецификаций в справочниках Вставки, Соединения, Фурнитура и регистре Корректировки спецификации
* @class CatFormulas
* @extends CatObj
* @constructor 
*/class CatFormulas extends CatObj{get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get leading_formula(){return this._getter('leading_formula');}set leading_formula(v){this._setter('leading_formula',v);}get condition_formula(){return this._getter('condition_formula');}set condition_formula(v){this._setter('condition_formula',v);}get definition(){return this._getter('definition');}set definition(v){this._setter('definition',v);}get template(){return this._getter('template');}set template(v){this._setter('template',v);}get sorting_field(){return this._getter('sorting_field');}set sorting_field(v){this._setter('sorting_field',v);}get async(){return this._getter('async');}set async(v){this._setter('async',v);}get disabled(){return this._getter('disabled');}set disabled(v){this._setter('disabled',v);}get zone(){return this._getter('zone');}set zone(v){this._setter('zone',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get params(){return this._getter_ts('params');}set params(v){this._setter_ts('params',v);}}$p.CatFormulas=CatFormulas;class CatFormulasParamsRow extends TabularSectionRow{get param(){return this._getter('param');}set param(v){this._setter('param',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}}$p.CatFormulasParamsRow=CatFormulasParamsRow;$p.cat.create('formulas');/**
* ### Справочник пзВизуализацияЭлементов
* Строки svg для рисования петель, ручек и графических примитивов
* @class CatElm_visualization
* @extends CatObj
* @constructor 
*/class CatElm_visualization extends CatObj{get svg_path(){return this._getter('svg_path');}set svg_path(v){this._setter('svg_path',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get attributes(){return this._getter('attributes');}set attributes(v){this._setter('attributes',v);}get rotate(){return this._getter('rotate');}set rotate(v){this._setter('rotate',v);}get offset(){return this._getter('offset');}set offset(v){this._setter('offset',v);}get side(){return this._getter('side');}set side(v){this._setter('side',v);}get elm_side(){return this._getter('elm_side');}set elm_side(v){this._setter('elm_side',v);}get cx(){return this._getter('cx');}set cx(v){this._setter('cx',v);}get cy(){return this._getter('cy');}set cy(v){this._setter('cy',v);}get angle_hor(){return this._getter('angle_hor');}set angle_hor(v){this._setter('angle_hor',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatElm_visualization=CatElm_visualization;$p.cat.create('elm_visualization');/**
* ### Справочник ИнтеграцияОтделыАбонентов
* Отделы абонентов
* @class CatBranches
* @extends CatObj
* @constructor 
*/class CatBranches extends CatObj{get suffix(){return this._getter('suffix');}set suffix(v){this._setter('suffix',v);}get direct(){return this._getter('direct');}set direct(v){this._setter('direct',v);}get use(){return this._getter('use');}set use(v){this._setter('use',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get organizations(){return this._getter_ts('organizations');}set organizations(v){this._setter_ts('organizations',v);}get partners(){return this._getter_ts('partners');}set partners(v){this._setter_ts('partners',v);}get divisions(){return this._getter_ts('divisions');}set divisions(v){this._setter_ts('divisions',v);}get price_types(){return this._getter_ts('price_types');}set price_types(v){this._setter_ts('price_types',v);}get keys(){return this._getter_ts('keys');}set keys(v){this._setter_ts('keys',v);}}$p.CatBranches=CatBranches;class CatBranchesOrganizationsRow extends TabularSectionRow{get acl_obj(){return this._getter('acl_obj');}set acl_obj(v){this._setter('acl_obj',v);}get by_default(){return this._getter('by_default');}set by_default(v){this._setter('by_default',v);}}$p.CatBranchesOrganizationsRow=CatBranchesOrganizationsRow;class CatBranchesPartnersRow extends TabularSectionRow{get acl_obj(){return this._getter('acl_obj');}set acl_obj(v){this._setter('acl_obj',v);}get by_default(){return this._getter('by_default');}set by_default(v){this._setter('by_default',v);}}$p.CatBranchesPartnersRow=CatBranchesPartnersRow;class CatBranchesDivisionsRow extends TabularSectionRow{get acl_obj(){return this._getter('acl_obj');}set acl_obj(v){this._setter('acl_obj',v);}get by_default(){return this._getter('by_default');}set by_default(v){this._setter('by_default',v);}}$p.CatBranchesDivisionsRow=CatBranchesDivisionsRow;class CatBranchesPrice_typesRow extends TabularSectionRow{get acl_obj(){return this._getter('acl_obj');}set acl_obj(v){this._setter('acl_obj',v);}}$p.CatBranchesPrice_typesRow=CatBranchesPrice_typesRow;class CatBranchesKeysRow extends TabularSectionRow{get acl_obj(){return this._getter('acl_obj');}set acl_obj(v){this._setter('acl_obj',v);}}$p.CatBranchesKeysRow=CatBranchesKeysRow;$p.cat.create('branches');/**
* ### Справочник Валюты
* Валюты, используемые при расчетах
* @class CatCurrencies
* @extends CatObj
* @constructor 
*/class CatCurrencies extends CatObj{get name_full(){return this._getter('name_full');}set name_full(v){this._setter('name_full',v);}get extra_charge(){return this._getter('extra_charge');}set extra_charge(v){this._setter('extra_charge',v);}get main_currency(){return this._getter('main_currency');}set main_currency(v){this._setter('main_currency',v);}get parameters_russian_recipe(){return this._getter('parameters_russian_recipe');}set parameters_russian_recipe(v){this._setter('parameters_russian_recipe',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatCurrencies=CatCurrencies;$p.cat.create('currencies');/**
* ### Справочник ВидыКонтактнойИнформации
* Виды контактной информации
* @class CatContact_information_kinds
* @extends CatObj
* @constructor 
*/class CatContact_information_kinds extends CatObj{get mandatory_fields(){return this._getter('mandatory_fields');}set mandatory_fields(v){this._setter('mandatory_fields',v);}get type(){return this._getter('type');}set type(v){this._setter('type',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatContact_information_kinds=CatContact_information_kinds;$p.cat.create('contact_information_kinds');/**
* ### Справочник ВидыНоменклатуры
* Виды номенклатуры
* @class CatNom_kinds
* @extends CatObj
* @constructor 
*/class CatNom_kinds extends CatObj{get nom_type(){return this._getter('nom_type');}set nom_type(v){this._setter('nom_type',v);}get НаборСвойствНоменклатура(){return this._getter('НаборСвойствНоменклатура');}set НаборСвойствНоменклатура(v){this._setter('НаборСвойствНоменклатура',v);}get НаборСвойствХарактеристика(){return this._getter('НаборСвойствХарактеристика');}set НаборСвойствХарактеристика(v){this._setter('НаборСвойствХарактеристика',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatNom_kinds=CatNom_kinds;$p.cat.create('nom_kinds');/**
* ### Справочник ДоговорыКонтрагентов
* Перечень договоров, заключенных с контрагентами
* @class CatContracts
* @extends CatObj
* @constructor 
*/class CatContracts extends CatObj{get settlements_currency(){return this._getter('settlements_currency');}set settlements_currency(v){this._setter('settlements_currency',v);}get mutual_settlements(){return this._getter('mutual_settlements');}set mutual_settlements(v){this._setter('mutual_settlements',v);}get contract_kind(){return this._getter('contract_kind');}set contract_kind(v){this._setter('contract_kind',v);}get date(){return this._getter('date');}set date(v){this._setter('date',v);}get check_days_without_pay(){return this._getter('check_days_without_pay');}set check_days_without_pay(v){this._setter('check_days_without_pay',v);}get allowable_debts_amount(){return this._getter('allowable_debts_amount');}set allowable_debts_amount(v){this._setter('allowable_debts_amount',v);}get allowable_debts_days(){return this._getter('allowable_debts_days');}set allowable_debts_days(v){this._setter('allowable_debts_days',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get check_debts_amount(){return this._getter('check_debts_amount');}set check_debts_amount(v){this._setter('check_debts_amount',v);}get check_debts_days(){return this._getter('check_debts_days');}set check_debts_days(v){this._setter('check_debts_days',v);}get number_doc(){return this._getter('number_doc');}set number_doc(v){this._setter('number_doc',v);}get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get main_cash_flow_article(){return this._getter('main_cash_flow_article');}set main_cash_flow_article(v){this._setter('main_cash_flow_article',v);}get main_project(){return this._getter('main_project');}set main_project(v){this._setter('main_project',v);}get accounting_reflect(){return this._getter('accounting_reflect');}set accounting_reflect(v){this._setter('accounting_reflect',v);}get tax_accounting_reflect(){return this._getter('tax_accounting_reflect');}set tax_accounting_reflect(v){this._setter('tax_accounting_reflect',v);}get prepayment_percent(){return this._getter('prepayment_percent');}set prepayment_percent(v){this._setter('prepayment_percent',v);}get validity(){return this._getter('validity');}set validity(v){this._setter('validity',v);}get vat_included(){return this._getter('vat_included');}set vat_included(v){this._setter('vat_included',v);}get price_type(){return this._getter('price_type');}set price_type(v){this._setter('price_type',v);}get vat_consider(){return this._getter('vat_consider');}set vat_consider(v){this._setter('vat_consider',v);}get days_without_pay(){return this._getter('days_without_pay');}set days_without_pay(v){this._setter('days_without_pay',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatContracts=CatContracts;$p.cat.create('contracts');/**
* ### Справочник ЕдиницыИзмерения
* Перечень единиц измерения номенклатуры и номенклатурных групп
* @class CatNom_units
* @extends CatObj
* @constructor 
*/class CatNom_units extends CatObj{get qualifier_unit(){return this._getter('qualifier_unit');}set qualifier_unit(v){this._setter('qualifier_unit',v);}get heft(){return this._getter('heft');}set heft(v){this._setter('heft',v);}get volume(){return this._getter('volume');}set volume(v){this._setter('volume',v);}get coefficient(){return this._getter('coefficient');}set coefficient(v){this._setter('coefficient',v);}get rounding_threshold(){return this._getter('rounding_threshold');}set rounding_threshold(v){this._setter('rounding_threshold',v);}get ПредупреждатьОНецелыхМестах(){return this._getter('ПредупреждатьОНецелыхМестах');}set ПредупреждатьОНецелыхМестах(v){this._setter('ПредупреждатьОНецелыхМестах',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}}$p.CatNom_units=CatNom_units;$p.cat.create('nom_units');/**
* ### Справочник ЗначенияСвойствОбъектов
* Дополнительные значения
* @class CatProperty_values
* @extends CatObj
* @constructor 
*/class CatProperty_values extends CatObj{get heft(){return this._getter('heft');}set heft(v){this._setter('heft',v);}get ПолноеНаименование(){return this._getter('ПолноеНаименование');}set ПолноеНаименование(v){this._setter('ПолноеНаименование',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatProperty_values=CatProperty_values;$p.cat.create('property_values');/**
* ### Справочник ИдентификаторыОбъектовМетаданных
* Идентификаторы объектов метаданных для использования в базе данных.
* @class CatMeta_ids
* @extends CatObj
* @constructor 
*/class CatMeta_ids extends CatObj{get full_moniker(){return this._getter('full_moniker');}set full_moniker(v){this._setter('full_moniker',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatMeta_ids=CatMeta_ids;$p.cat.create('meta_ids');/**
* ### Справочник Кассы
* Список мест фактического хранения и движения наличных денежных средств предприятия. Кассы разделены по организациям и валютам денежных средств. 
* @class CatCashboxes
* @extends CatObj
* @constructor 
*/class CatCashboxes extends CatObj{get funds_currency(){return this._getter('funds_currency');}set funds_currency(v){this._setter('funds_currency',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get current_account(){return this._getter('current_account');}set current_account(v){this._setter('current_account',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}}$p.CatCashboxes=CatCashboxes;$p.cat.create('cashboxes');/**
* ### Справочник КлассификаторЕдиницИзмерения
* Классификатор единиц измерения
* @class CatUnits
* @extends CatObj
* @constructor 
*/class CatUnits extends CatObj{get name_full(){return this._getter('name_full');}set name_full(v){this._setter('name_full',v);}get international_short(){return this._getter('international_short');}set international_short(v){this._setter('international_short',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatUnits=CatUnits;$p.cat.create('units');/**
* ### Справочник Контрагенты
* Список юридических или физических лиц клиентов (поставщиков, покупателей).
* @class CatPartners
* @extends CatObj
* @constructor 
*/class CatPartners extends CatObj{get name_full(){return this._getter('name_full');}set name_full(v){this._setter('name_full',v);}get main_bank_account(){return this._getter('main_bank_account');}set main_bank_account(v){this._setter('main_bank_account',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get kpp(){return this._getter('kpp');}set kpp(v){this._setter('kpp',v);}get okpo(){return this._getter('okpo');}set okpo(v){this._setter('okpo',v);}get inn(){return this._getter('inn');}set inn(v){this._setter('inn',v);}get individual_legal(){return this._getter('individual_legal');}set individual_legal(v){this._setter('individual_legal',v);}get main_contract(){return this._getter('main_contract');}set main_contract(v){this._setter('main_contract',v);}get identification_document(){return this._getter('identification_document');}set identification_document(v){this._setter('identification_document',v);}get buyer_main_manager(){return this._getter('buyer_main_manager');}set buyer_main_manager(v){this._setter('buyer_main_manager',v);}get is_buyer(){return this._getter('is_buyer');}set is_buyer(v){this._setter('is_buyer',v);}get is_supplier(){return this._getter('is_supplier');}set is_supplier(v){this._setter('is_supplier',v);}get primary_contact(){return this._getter('primary_contact');}set primary_contact(v){this._setter('primary_contact',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get contact_information(){return this._getter_ts('contact_information');}set contact_information(v){this._setter_ts('contact_information',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.CatPartners=CatPartners;class CatPartnersContact_informationRow extends TabularSectionRow{get type(){return this._getter('type');}set type(v){this._setter('type',v);}get kind(){return this._getter('kind');}set kind(v){this._setter('kind',v);}get presentation(){return this._getter('presentation');}set presentation(v){this._setter('presentation',v);}get values_fields(){return this._getter('values_fields');}set values_fields(v){this._setter('values_fields',v);}get country(){return this._getter('country');}set country(v){this._setter('country',v);}get region(){return this._getter('region');}set region(v){this._setter('region',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get email_address(){return this._getter('email_address');}set email_address(v){this._setter('email_address',v);}get server_domain_name(){return this._getter('server_domain_name');}set server_domain_name(v){this._setter('server_domain_name',v);}get phone_number(){return this._getter('phone_number');}set phone_number(v){this._setter('phone_number',v);}get phone_without_codes(){return this._getter('phone_without_codes');}set phone_without_codes(v){this._setter('phone_without_codes',v);}}$p.CatPartnersContact_informationRow=CatPartnersContact_informationRow;class CatPartnersExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatPartnersExtra_fieldsRow=CatPartnersExtra_fieldsRow;$p.cat.create('partners');/**
* ### Справочник Номенклатура
* Перечень товаров, продукции, материалов, полуфабрикатов, тары, услуг
* @class CatNom
* @extends CatObj
* @constructor 
*/class CatNom extends CatObj{get article(){return this._getter('article');}set article(v){this._setter('article',v);}get name_full(){return this._getter('name_full');}set name_full(v){this._setter('name_full',v);}get base_unit(){return this._getter('base_unit');}set base_unit(v){this._setter('base_unit',v);}get storage_unit(){return this._getter('storage_unit');}set storage_unit(v){this._setter('storage_unit',v);}get nom_kind(){return this._getter('nom_kind');}set nom_kind(v){this._setter('nom_kind',v);}get nom_group(){return this._getter('nom_group');}set nom_group(v){this._setter('nom_group',v);}get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get price_group(){return this._getter('price_group');}set price_group(v){this._setter('price_group',v);}get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get thickness(){return this._getter('thickness');}set thickness(v){this._setter('thickness',v);}get sizefurn(){return this._getter('sizefurn');}set sizefurn(v){this._setter('sizefurn',v);}get sizefaltz(){return this._getter('sizefaltz');}set sizefaltz(v){this._setter('sizefaltz',v);}get density(){return this._getter('density');}set density(v){this._setter('density',v);}get volume(){return this._getter('volume');}set volume(v){this._setter('volume',v);}get arc_elongation(){return this._getter('arc_elongation');}set arc_elongation(v){this._setter('arc_elongation',v);}get loss_factor(){return this._getter('loss_factor');}set loss_factor(v){this._setter('loss_factor',v);}get rounding_quantity(){return this._getter('rounding_quantity');}set rounding_quantity(v){this._setter('rounding_quantity',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get cutting_optimization_type(){return this._getter('cutting_optimization_type');}set cutting_optimization_type(v){this._setter('cutting_optimization_type',v);}get crooked(){return this._getter('crooked');}set crooked(v){this._setter('crooked',v);}get colored(){return this._getter('colored');}set colored(v){this._setter('colored',v);}get lay(){return this._getter('lay');}set lay(v){this._setter('lay',v);}get made_to_order(){return this._getter('made_to_order');}set made_to_order(v){this._setter('made_to_order',v);}get packing(){return this._getter('packing');}set packing(v){this._setter('packing',v);}get days_to_execution(){return this._getter('days_to_execution');}set days_to_execution(v){this._setter('days_to_execution',v);}get days_from_execution(){return this._getter('days_from_execution');}set days_from_execution(v){this._setter('days_from_execution',v);}get pricing(){return this._getter('pricing');}set pricing(v){this._setter('pricing',v);}get visualization(){return this._getter('visualization');}set visualization(v){this._setter('visualization',v);}get complete_list_sorting(){return this._getter('complete_list_sorting');}set complete_list_sorting(v){this._setter('complete_list_sorting',v);}get is_accessory(){return this._getter('is_accessory');}set is_accessory(v){this._setter('is_accessory',v);}get is_procedure(){return this._getter('is_procedure');}set is_procedure(v){this._setter('is_procedure',v);}get is_service(){return this._getter('is_service');}set is_service(v){this._setter('is_service',v);}get is_pieces(){return this._getter('is_pieces');}set is_pieces(v){this._setter('is_pieces',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.CatNom=CatNom;class CatNomExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatNomExtra_fieldsRow=CatNomExtra_fieldsRow;$p.cat.create('nom');/**
* ### Справочник Организации
* Организации
* @class CatOrganizations
* @extends CatObj
* @constructor 
*/class CatOrganizations extends CatObj{get prefix(){return this._getter('prefix');}set prefix(v){this._setter('prefix',v);}get individual_legal(){return this._getter('individual_legal');}set individual_legal(v){this._setter('individual_legal',v);}get individual_entrepreneur(){return this._getter('individual_entrepreneur');}set individual_entrepreneur(v){this._setter('individual_entrepreneur',v);}get inn(){return this._getter('inn');}set inn(v){this._setter('inn',v);}get kpp(){return this._getter('kpp');}set kpp(v){this._setter('kpp',v);}get main_bank_account(){return this._getter('main_bank_account');}set main_bank_account(v){this._setter('main_bank_account',v);}get main_cashbox(){return this._getter('main_cashbox');}set main_cashbox(v){this._setter('main_cashbox',v);}get certificate_series_number(){return this._getter('certificate_series_number');}set certificate_series_number(v){this._setter('certificate_series_number',v);}get certificate_date_issue(){return this._getter('certificate_date_issue');}set certificate_date_issue(v){this._setter('certificate_date_issue',v);}get certificate_authority_name(){return this._getter('certificate_authority_name');}set certificate_authority_name(v){this._setter('certificate_authority_name',v);}get certificate_authority_code(){return this._getter('certificate_authority_code');}set certificate_authority_code(v){this._setter('certificate_authority_code',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get contact_information(){return this._getter_ts('contact_information');}set contact_information(v){this._setter_ts('contact_information',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.CatOrganizations=CatOrganizations;class CatOrganizationsContact_informationRow extends TabularSectionRow{get type(){return this._getter('type');}set type(v){this._setter('type',v);}get kind(){return this._getter('kind');}set kind(v){this._setter('kind',v);}get presentation(){return this._getter('presentation');}set presentation(v){this._setter('presentation',v);}get values_fields(){return this._getter('values_fields');}set values_fields(v){this._setter('values_fields',v);}get country(){return this._getter('country');}set country(v){this._setter('country',v);}get region(){return this._getter('region');}set region(v){this._setter('region',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get email_address(){return this._getter('email_address');}set email_address(v){this._setter('email_address',v);}get server_domain_name(){return this._getter('server_domain_name');}set server_domain_name(v){this._setter('server_domain_name',v);}get phone_number(){return this._getter('phone_number');}set phone_number(v){this._setter('phone_number',v);}get phone_without_codes(){return this._getter('phone_without_codes');}set phone_without_codes(v){this._setter('phone_without_codes',v);}get ВидДляСписка(){return this._getter('ВидДляСписка');}set ВидДляСписка(v){this._setter('ВидДляСписка',v);}get ДействуетС(){return this._getter('ДействуетС');}set ДействуетС(v){this._setter('ДействуетС',v);}}$p.CatOrganizationsContact_informationRow=CatOrganizationsContact_informationRow;class CatOrganizationsExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatOrganizationsExtra_fieldsRow=CatOrganizationsExtra_fieldsRow;$p.cat.create('organizations');/**
* ### Справочник Вставки
* Армирование, пленки, вставки - дополнение спецификации, которое зависит от одного элемента
* @class CatInserts
* @extends CatObj
* @constructor 
*/class CatInserts extends CatObj{get article(){return this._getter('article');}set article(v){this._setter('article',v);}get insert_type(){return this._getter('insert_type');}set insert_type(v){this._setter('insert_type',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get lmin(){return this._getter('lmin');}set lmin(v){this._setter('lmin',v);}get lmax(){return this._getter('lmax');}set lmax(v){this._setter('lmax',v);}get hmin(){return this._getter('hmin');}set hmin(v){this._setter('hmin',v);}get hmax(){return this._getter('hmax');}set hmax(v){this._setter('hmax',v);}get smin(){return this._getter('smin');}set smin(v){this._setter('smin',v);}get smax(){return this._getter('smax');}set smax(v){this._setter('smax',v);}get for_direct_profile_only(){return this._getter('for_direct_profile_only');}set for_direct_profile_only(v){this._setter('for_direct_profile_only',v);}get ahmin(){return this._getter('ahmin');}set ahmin(v){this._setter('ahmin',v);}get ahmax(){return this._getter('ahmax');}set ahmax(v){this._setter('ahmax',v);}get priority(){return this._getter('priority');}set priority(v){this._setter('priority',v);}get mmin(){return this._getter('mmin');}set mmin(v){this._setter('mmin',v);}get mmax(){return this._getter('mmax');}set mmax(v){this._setter('mmax',v);}get impost_fixation(){return this._getter('impost_fixation');}set impost_fixation(v){this._setter('impost_fixation',v);}get shtulp_fixation(){return this._getter('shtulp_fixation');}set shtulp_fixation(v){this._setter('shtulp_fixation',v);}get can_rotate(){return this._getter('can_rotate');}set can_rotate(v){this._setter('can_rotate',v);}get sizeb(){return this._getter('sizeb');}set sizeb(v){this._setter('sizeb',v);}get clr_group(){return this._getter('clr_group');}set clr_group(v){this._setter('clr_group',v);}get is_order_row(){return this._getter('is_order_row');}set is_order_row(v){this._setter('is_order_row',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get insert_glass_type(){return this._getter('insert_glass_type');}set insert_glass_type(v){this._setter('insert_glass_type',v);}get available(){return this._getter('available');}set available(v){this._setter('available',v);}get slave(){return this._getter('slave');}set slave(v){this._setter('slave',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get specification(){return this._getter_ts('specification');}set specification(v){this._setter_ts('specification',v);}get selection_params(){return this._getter_ts('selection_params');}set selection_params(v){this._setter_ts('selection_params',v);}}$p.CatInserts=CatInserts;class CatInsertsSpecificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get nom_characteristic(){return this._getter('nom_characteristic');}set nom_characteristic(v){this._setter('nom_characteristic',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get sz(){return this._getter('sz');}set sz(v){this._setter('sz',v);}get coefficient(){return this._getter('coefficient');}set coefficient(v){this._setter('coefficient',v);}get angle_calc_method(){return this._getter('angle_calc_method');}set angle_calc_method(v){this._setter('angle_calc_method',v);}get count_calc_method(){return this._getter('count_calc_method');}set count_calc_method(v){this._setter('count_calc_method',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get lmin(){return this._getter('lmin');}set lmin(v){this._setter('lmin',v);}get lmax(){return this._getter('lmax');}set lmax(v){this._setter('lmax',v);}get ahmin(){return this._getter('ahmin');}set ahmin(v){this._setter('ahmin',v);}get ahmax(){return this._getter('ahmax');}set ahmax(v){this._setter('ahmax',v);}get smin(){return this._getter('smin');}set smin(v){this._setter('smin',v);}get smax(){return this._getter('smax');}set smax(v){this._setter('smax',v);}get for_direct_profile_only(){return this._getter('for_direct_profile_only');}set for_direct_profile_only(v){this._setter('for_direct_profile_only',v);}get step(){return this._getter('step');}set step(v){this._setter('step',v);}get step_angle(){return this._getter('step_angle');}set step_angle(v){this._setter('step_angle',v);}get offsets(){return this._getter('offsets');}set offsets(v){this._setter('offsets',v);}get do_center(){return this._getter('do_center');}set do_center(v){this._setter('do_center',v);}get attrs_option(){return this._getter('attrs_option');}set attrs_option(v){this._setter('attrs_option',v);}get end_mount(){return this._getter('end_mount');}set end_mount(v){this._setter('end_mount',v);}get is_order_row(){return this._getter('is_order_row');}set is_order_row(v){this._setter('is_order_row',v);}get is_main_elm(){return this._getter('is_main_elm');}set is_main_elm(v){this._setter('is_main_elm',v);}}$p.CatInsertsSpecificationRow=CatInsertsSpecificationRow;class CatInsertsSelection_paramsRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get param(){return this._getter('param');}set param(v){this._setter('param',v);}get comparison_type(){return this._getter('comparison_type');}set comparison_type(v){this._setter('comparison_type',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatInsertsSelection_paramsRow=CatInsertsSelection_paramsRow;$p.cat.create('inserts');/**
* ### Справочник КлючиПараметров
* Списки пар {Параметр:Значение} для фильтрации в подсистемах формирования спецификаций, планировании и ценообразовании

* @class CatParameters_keys
* @extends CatObj
* @constructor 
*/class CatParameters_keys extends CatObj{get priority(){return this._getter('priority');}set priority(v){this._setter('priority',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get sorting_field(){return this._getter('sorting_field');}set sorting_field(v){this._setter('sorting_field',v);}get applying(){return this._getter('applying');}set applying(v){this._setter('applying',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get params(){return this._getter_ts('params');}set params(v){this._setter_ts('params',v);}}$p.CatParameters_keys=CatParameters_keys;class CatParameters_keysParamsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get comparison_type(){return this._getter('comparison_type');}set comparison_type(v){this._setter('comparison_type',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatParameters_keysParamsRow=CatParameters_keysParamsRow;$p.cat.create('parameters_keys');/**
* ### Справочник пзПараметрыПродукции
* Настройки системы профилей и фурнитуры
* @class CatProduction_params
* @extends CatObj
* @constructor 
*/class CatProduction_params extends CatObj{get default_clr(){return this._getter('default_clr');}set default_clr(v){this._setter('default_clr',v);}get clr_group(){return this._getter('clr_group');}set clr_group(v){this._setter('clr_group',v);}get tmin(){return this._getter('tmin');}set tmin(v){this._setter('tmin',v);}get tmax(){return this._getter('tmax');}set tmax(v){this._setter('tmax',v);}get allow_open_cnn(){return this._getter('allow_open_cnn');}set allow_open_cnn(v){this._setter('allow_open_cnn',v);}get flap_pos_by_impost(){return this._getter('flap_pos_by_impost');}set flap_pos_by_impost(v){this._setter('flap_pos_by_impost',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get elmnts(){return this._getter_ts('elmnts');}set elmnts(v){this._setter_ts('elmnts',v);}get production(){return this._getter_ts('production');}set production(v){this._setter_ts('production',v);}get product_params(){return this._getter_ts('product_params');}set product_params(v){this._setter_ts('product_params',v);}get furn_params(){return this._getter_ts('furn_params');}set furn_params(v){this._setter_ts('furn_params',v);}get base_blocks(){return this._getter_ts('base_blocks');}set base_blocks(v){this._setter_ts('base_blocks',v);}}$p.CatProduction_params=CatProduction_params;class CatProduction_paramsElmntsRow extends TabularSectionRow{get by_default(){return this._getter('by_default');}set by_default(v){this._setter('by_default',v);}get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get pos(){return this._getter('pos');}set pos(v){this._setter('pos',v);}}$p.CatProduction_paramsElmntsRow=CatProduction_paramsElmntsRow;class CatProduction_paramsProductionRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get param(){return this._getter('param');}set param(v){this._setter('param',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}}$p.CatProduction_paramsProductionRow=CatProduction_paramsProductionRow;class CatProduction_paramsProduct_paramsRow extends TabularSectionRow{get param(){return this._getter('param');}set param(v){this._setter('param',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get hide(){return this._getter('hide');}set hide(v){this._setter('hide',v);}get forcibly(){return this._getter('forcibly');}set forcibly(v){this._setter('forcibly',v);}}$p.CatProduction_paramsProduct_paramsRow=CatProduction_paramsProduct_paramsRow;class CatProduction_paramsFurn_paramsRow extends TabularSectionRow{get param(){return this._getter('param');}set param(v){this._setter('param',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get hide(){return this._getter('hide');}set hide(v){this._setter('hide',v);}get forcibly(){return this._getter('forcibly');}set forcibly(v){this._setter('forcibly',v);}}$p.CatProduction_paramsFurn_paramsRow=CatProduction_paramsFurn_paramsRow;class CatProduction_paramsBase_blocksRow extends TabularSectionRow{get calc_order(){return this._getter('calc_order');}set calc_order(v){this._setter('calc_order',v);}}$p.CatProduction_paramsBase_blocksRow=CatProduction_paramsBase_blocksRow;$p.cat.create('production_params');/**
* ### Справочник РайоныДоставки
* Районы доставки
* @class CatDelivery_areas
* @extends CatObj
* @constructor 
*/class CatDelivery_areas extends CatObj{get country(){return this._getter('country');}set country(v){this._setter('country',v);}get region(){return this._getter('region');}set region(v){this._setter('region',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get latitude(){return this._getter('latitude');}set latitude(v){this._setter('latitude',v);}get longitude(){return this._getter('longitude');}set longitude(v){this._setter('longitude',v);}get ind(){return this._getter('ind');}set ind(v){this._setter('ind',v);}get delivery_area(){return this._getter('delivery_area');}set delivery_area(v){this._setter('delivery_area',v);}get specify_area_by_geocoder(){return this._getter('specify_area_by_geocoder');}set specify_area_by_geocoder(v){this._setter('specify_area_by_geocoder',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatDelivery_areas=CatDelivery_areas;$p.cat.create('delivery_areas');/**
* ### Справочник пзСоединения
* Спецификации соединений элементов
* @class CatCnns
* @extends CatObj
* @constructor 
*/class CatCnns extends CatObj{get priority(){return this._getter('priority');}set priority(v){this._setter('priority',v);}get amin(){return this._getter('amin');}set amin(v){this._setter('amin',v);}get amax(){return this._getter('amax');}set amax(v){this._setter('amax',v);}get sd1(){return this._getter('sd1');}set sd1(v){this._setter('sd1',v);}get sz(){return this._getter('sz');}set sz(v){this._setter('sz',v);}get cnn_type(){return this._getter('cnn_type');}set cnn_type(v){this._setter('cnn_type',v);}get ahmin(){return this._getter('ahmin');}set ahmin(v){this._setter('ahmin',v);}get ahmax(){return this._getter('ahmax');}set ahmax(v){this._setter('ahmax',v);}get lmin(){return this._getter('lmin');}set lmin(v){this._setter('lmin',v);}get lmax(){return this._getter('lmax');}set lmax(v){this._setter('lmax',v);}get tmin(){return this._getter('tmin');}set tmin(v){this._setter('tmin',v);}get tmax(){return this._getter('tmax');}set tmax(v){this._setter('tmax',v);}get var_layers(){return this._getter('var_layers');}set var_layers(v){this._setter('var_layers',v);}get for_direct_profile_only(){return this._getter('for_direct_profile_only');}set for_direct_profile_only(v){this._setter('for_direct_profile_only',v);}get art1vert(){return this._getter('art1vert');}set art1vert(v){this._setter('art1vert',v);}get art1glass(){return this._getter('art1glass');}set art1glass(v){this._setter('art1glass',v);}get art2glass(){return this._getter('art2glass');}set art2glass(v){this._setter('art2glass',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get specification(){return this._getter_ts('specification');}set specification(v){this._setter_ts('specification',v);}get cnn_elmnts(){return this._getter_ts('cnn_elmnts');}set cnn_elmnts(v){this._setter_ts('cnn_elmnts',v);}get selection_params(){return this._getter_ts('selection_params');}set selection_params(v){this._setter_ts('selection_params',v);}}$p.CatCnns=CatCnns;class CatCnnsSpecificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get nom_characteristic(){return this._getter('nom_characteristic');}set nom_characteristic(v){this._setter('nom_characteristic',v);}get coefficient(){return this._getter('coefficient');}set coefficient(v){this._setter('coefficient',v);}get sz(){return this._getter('sz');}set sz(v){this._setter('sz',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get sz_min(){return this._getter('sz_min');}set sz_min(v){this._setter('sz_min',v);}get sz_max(){return this._getter('sz_max');}set sz_max(v){this._setter('sz_max',v);}get amin(){return this._getter('amin');}set amin(v){this._setter('amin',v);}get amax(){return this._getter('amax');}set amax(v){this._setter('amax',v);}get set_specification(){return this._getter('set_specification');}set set_specification(v){this._setter('set_specification',v);}get for_direct_profile_only(){return this._getter('for_direct_profile_only');}set for_direct_profile_only(v){this._setter('for_direct_profile_only',v);}get by_contour(){return this._getter('by_contour');}set by_contour(v){this._setter('by_contour',v);}get contraction_by_contour(){return this._getter('contraction_by_contour');}set contraction_by_contour(v){this._setter('contraction_by_contour',v);}get on_aperture(){return this._getter('on_aperture');}set on_aperture(v){this._setter('on_aperture',v);}get angle_calc_method(){return this._getter('angle_calc_method');}set angle_calc_method(v){this._setter('angle_calc_method',v);}get contour_number(){return this._getter('contour_number');}set contour_number(v){this._setter('contour_number',v);}get is_order_row(){return this._getter('is_order_row');}set is_order_row(v){this._setter('is_order_row',v);}}$p.CatCnnsSpecificationRow=CatCnnsSpecificationRow;class CatCnnsCnn_elmntsRow extends TabularSectionRow{get nom1(){return this._getter('nom1');}set nom1(v){this._setter('nom1',v);}get clr1(){return this._getter('clr1');}set clr1(v){this._setter('clr1',v);}get nom2(){return this._getter('nom2');}set nom2(v){this._setter('nom2',v);}get clr2(){return this._getter('clr2');}set clr2(v){this._setter('clr2',v);}get varclr(){return this._getter('varclr');}set varclr(v){this._setter('varclr',v);}get is_nom_combinations_row(){return this._getter('is_nom_combinations_row');}set is_nom_combinations_row(v){this._setter('is_nom_combinations_row',v);}}$p.CatCnnsCnn_elmntsRow=CatCnnsCnn_elmntsRow;class CatCnnsSelection_paramsRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get param(){return this._getter('param');}set param(v){this._setter('param',v);}get comparison_type(){return this._getter('comparison_type');}set comparison_type(v){this._setter('comparison_type',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatCnnsSelection_paramsRow=CatCnnsSelection_paramsRow;$p.cat.create('cnns');/**
* ### Справочник пзФурнитура
* Описывает ограничения и правила формирования спецификаций фурнитуры
* @class CatFurns
* @extends CatObj
* @constructor 
*/class CatFurns extends CatObj{get flap_weight_max(){return this._getter('flap_weight_max');}set flap_weight_max(v){this._setter('flap_weight_max',v);}get left_right(){return this._getter('left_right');}set left_right(v){this._setter('left_right',v);}get is_set(){return this._getter('is_set');}set is_set(v){this._setter('is_set',v);}get is_sliding(){return this._getter('is_sliding');}set is_sliding(v){this._setter('is_sliding',v);}get furn_set(){return this._getter('furn_set');}set furn_set(v){this._setter('furn_set',v);}get side_count(){return this._getter('side_count');}set side_count(v){this._setter('side_count',v);}get handle_side(){return this._getter('handle_side');}set handle_side(v){this._setter('handle_side',v);}get open_type(){return this._getter('open_type');}set open_type(v){this._setter('open_type',v);}get name_short(){return this._getter('name_short');}set name_short(v){this._setter('name_short',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get open_tunes(){return this._getter_ts('open_tunes');}set open_tunes(v){this._setter_ts('open_tunes',v);}get specification(){return this._getter_ts('specification');}set specification(v){this._setter_ts('specification',v);}get selection_params(){return this._getter_ts('selection_params');}set selection_params(v){this._setter_ts('selection_params',v);}get specification_restrictions(){return this._getter_ts('specification_restrictions');}set specification_restrictions(v){this._setter_ts('specification_restrictions',v);}get colors(){return this._getter_ts('colors');}set colors(v){this._setter_ts('colors',v);}}$p.CatFurns=CatFurns;class CatFurnsOpen_tunesRow extends TabularSectionRow{get side(){return this._getter('side');}set side(v){this._setter('side',v);}get lmin(){return this._getter('lmin');}set lmin(v){this._setter('lmin',v);}get lmax(){return this._getter('lmax');}set lmax(v){this._setter('lmax',v);}get amin(){return this._getter('amin');}set amin(v){this._setter('amin',v);}get amax(){return this._getter('amax');}set amax(v){this._setter('amax',v);}get arc_available(){return this._getter('arc_available');}set arc_available(v){this._setter('arc_available',v);}get shtulp_available(){return this._getter('shtulp_available');}set shtulp_available(v){this._setter('shtulp_available',v);}get shtulp_fix_here(){return this._getter('shtulp_fix_here');}set shtulp_fix_here(v){this._setter('shtulp_fix_here',v);}get rotation_axis(){return this._getter('rotation_axis');}set rotation_axis(v){this._setter('rotation_axis',v);}get partial_opening(){return this._getter('partial_opening');}set partial_opening(v){this._setter('partial_opening',v);}get outline(){return this._getter('outline');}set outline(v){this._setter('outline',v);}}$p.CatFurnsOpen_tunesRow=CatFurnsOpen_tunesRow;class CatFurnsSpecificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get dop(){return this._getter('dop');}set dop(v){this._setter('dop',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get nom_characteristic(){return this._getter('nom_characteristic');}set nom_characteristic(v){this._setter('nom_characteristic',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get handle_height_base(){return this._getter('handle_height_base');}set handle_height_base(v){this._setter('handle_height_base',v);}get fix_ruch(){return this._getter('fix_ruch');}set fix_ruch(v){this._setter('fix_ruch',v);}get handle_height_min(){return this._getter('handle_height_min');}set handle_height_min(v){this._setter('handle_height_min',v);}get handle_height_max(){return this._getter('handle_height_max');}set handle_height_max(v){this._setter('handle_height_max',v);}get contraction(){return this._getter('contraction');}set contraction(v){this._setter('contraction',v);}get contraction_option(){return this._getter('contraction_option');}set contraction_option(v){this._setter('contraction_option',v);}get coefficient(){return this._getter('coefficient');}set coefficient(v){this._setter('coefficient',v);}get flap_weight_min(){return this._getter('flap_weight_min');}set flap_weight_min(v){this._setter('flap_weight_min',v);}get flap_weight_max(){return this._getter('flap_weight_max');}set flap_weight_max(v){this._setter('flap_weight_max',v);}get side(){return this._getter('side');}set side(v){this._setter('side',v);}get cnn_side(){return this._getter('cnn_side');}set cnn_side(v){this._setter('cnn_side',v);}get offset_option(){return this._getter('offset_option');}set offset_option(v){this._setter('offset_option',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get transfer_option(){return this._getter('transfer_option');}set transfer_option(v){this._setter('transfer_option',v);}get overmeasure(){return this._getter('overmeasure');}set overmeasure(v){this._setter('overmeasure',v);}get is_main_specification_row(){return this._getter('is_main_specification_row');}set is_main_specification_row(v){this._setter('is_main_specification_row',v);}get is_set_row(){return this._getter('is_set_row');}set is_set_row(v){this._setter('is_set_row',v);}get is_procedure_row(){return this._getter('is_procedure_row');}set is_procedure_row(v){this._setter('is_procedure_row',v);}get is_order_row(){return this._getter('is_order_row');}set is_order_row(v){this._setter('is_order_row',v);}}$p.CatFurnsSpecificationRow=CatFurnsSpecificationRow;class CatFurnsSelection_paramsRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get dop(){return this._getter('dop');}set dop(v){this._setter('dop',v);}get param(){return this._getter('param');}set param(v){this._setter('param',v);}get comparison_type(){return this._getter('comparison_type');}set comparison_type(v){this._setter('comparison_type',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatFurnsSelection_paramsRow=CatFurnsSelection_paramsRow;class CatFurnsSpecification_restrictionsRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get dop(){return this._getter('dop');}set dop(v){this._setter('dop',v);}get side(){return this._getter('side');}set side(v){this._setter('side',v);}get lmin(){return this._getter('lmin');}set lmin(v){this._setter('lmin',v);}get lmax(){return this._getter('lmax');}set lmax(v){this._setter('lmax',v);}get amin(){return this._getter('amin');}set amin(v){this._setter('amin',v);}get amax(){return this._getter('amax');}set amax(v){this._setter('amax',v);}get for_direct_profile_only(){return this._getter('for_direct_profile_only');}set for_direct_profile_only(v){this._setter('for_direct_profile_only',v);}}$p.CatFurnsSpecification_restrictionsRow=CatFurnsSpecification_restrictionsRow;class CatFurnsColorsRow extends TabularSectionRow{get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}}$p.CatFurnsColorsRow=CatFurnsColorsRow;$p.cat.create('furns');/**
* ### Справочник пзЦвета
* Цвета
* @class CatClrs
* @extends CatObj
* @constructor 
*/class CatClrs extends CatObj{get ral(){return this._getter('ral');}set ral(v){this._setter('ral',v);}get machine_tools_clr(){return this._getter('machine_tools_clr');}set machine_tools_clr(v){this._setter('machine_tools_clr',v);}get clr_str(){return this._getter('clr_str');}set clr_str(v){this._setter('clr_str',v);}get clr_out(){return this._getter('clr_out');}set clr_out(v){this._setter('clr_out',v);}get clr_in(){return this._getter('clr_in');}set clr_in(v){this._setter('clr_in',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatClrs=CatClrs;$p.cat.create('clrs');/**
* ### Справочник ЦветоЦеновыеГруппы
* Цвето-ценовые группы
* @class CatColor_price_groups
* @extends CatObj
* @constructor 
*/class CatColor_price_groups extends CatObj{get color_price_group_destination(){return this._getter('color_price_group_destination');}set color_price_group_destination(v){this._setter('color_price_group_destination',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get price_groups(){return this._getter_ts('price_groups');}set price_groups(v){this._setter_ts('price_groups',v);}get clr_conformity(){return this._getter_ts('clr_conformity');}set clr_conformity(v){this._setter_ts('clr_conformity',v);}}$p.CatColor_price_groups=CatColor_price_groups;class CatColor_price_groupsPrice_groupsRow extends TabularSectionRow{get price_group(){return this._getter('price_group');}set price_group(v){this._setter('price_group',v);}}$p.CatColor_price_groupsPrice_groupsRow=CatColor_price_groupsPrice_groupsRow;class CatColor_price_groupsClr_conformityRow extends TabularSectionRow{get clr1(){return this._getter('clr1');}set clr1(v){this._setter('clr1',v);}get clr2(){return this._getter('clr2');}set clr2(v){this._setter('clr2',v);}}$p.CatColor_price_groupsClr_conformityRow=CatColor_price_groupsClr_conformityRow;$p.cat.create('color_price_groups');/**
* ### Справочник Подразделения
* Перечень подразделений предприятия
* @class CatDivisions
* @extends CatObj
* @constructor 
*/class CatDivisions extends CatObj{get main_project(){return this._getter('main_project');}set main_project(v){this._setter('main_project',v);}get sorting_field(){return this._getter('sorting_field');}set sorting_field(v){this._setter('sorting_field',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.CatDivisions=CatDivisions;class CatDivisionsExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatDivisionsExtra_fieldsRow=CatDivisionsExtra_fieldsRow;$p.cat.create('divisions');/**
* ### Справочник Пользователи
* Пользователи
* @class CatUsers
* @extends CatObj
* @constructor 
*/class CatUsers extends CatObj{get invalid(){return this._getter('invalid');}set invalid(v){this._setter('invalid',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get individual_person(){return this._getter('individual_person');}set individual_person(v){this._setter('individual_person',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get ancillary(){return this._getter('ancillary');}set ancillary(v){this._setter('ancillary',v);}get user_ib_uid(){return this._getter('user_ib_uid');}set user_ib_uid(v){this._setter('user_ib_uid',v);}get user_fresh_uid(){return this._getter('user_fresh_uid');}set user_fresh_uid(v){this._setter('user_fresh_uid',v);}get id(){return this._getter('id');}set id(v){this._setter('id',v);}get prefix(){return this._getter('prefix');}set prefix(v){this._setter('prefix',v);}get branch(){return this._getter('branch');}set branch(v){this._setter('branch',v);}get push_only(){return this._getter('push_only');}set push_only(v){this._setter('push_only',v);}get suffix(){return this._getter('suffix');}set suffix(v){this._setter('suffix',v);}get direct(){return this._getter('direct');}set direct(v){this._setter('direct',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}get contact_information(){return this._getter_ts('contact_information');}set contact_information(v){this._setter_ts('contact_information',v);}get acl_objs(){return this._getter_ts('acl_objs');}set acl_objs(v){this._setter_ts('acl_objs',v);}}$p.CatUsers=CatUsers;class CatUsersExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatUsersExtra_fieldsRow=CatUsersExtra_fieldsRow;class CatUsersContact_informationRow extends TabularSectionRow{get type(){return this._getter('type');}set type(v){this._setter('type',v);}get kind(){return this._getter('kind');}set kind(v){this._setter('kind',v);}get presentation(){return this._getter('presentation');}set presentation(v){this._setter('presentation',v);}get values_fields(){return this._getter('values_fields');}set values_fields(v){this._setter('values_fields',v);}get country(){return this._getter('country');}set country(v){this._setter('country',v);}get region(){return this._getter('region');}set region(v){this._setter('region',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get email_address(){return this._getter('email_address');}set email_address(v){this._setter('email_address',v);}get server_domain_name(){return this._getter('server_domain_name');}set server_domain_name(v){this._setter('server_domain_name',v);}get phone_number(){return this._getter('phone_number');}set phone_number(v){this._setter('phone_number',v);}get phone_without_codes(){return this._getter('phone_without_codes');}set phone_without_codes(v){this._setter('phone_without_codes',v);}get ВидДляСписка(){return this._getter('ВидДляСписка');}set ВидДляСписка(v){this._setter('ВидДляСписка',v);}}$p.CatUsersContact_informationRow=CatUsersContact_informationRow;class CatUsersAcl_objsRow extends TabularSectionRow{get acl_obj(){return this._getter('acl_obj');}set acl_obj(v){this._setter('acl_obj',v);}get type(){return this._getter('type');}set type(v){this._setter('type',v);}get by_default(){return this._getter('by_default');}set by_default(v){this._setter('by_default',v);}}$p.CatUsersAcl_objsRow=CatUsersAcl_objsRow;class CatUsersManager extends CatManager{// при загрузке пользователей, морозим объект, чтобы его невозможно было изменить из интерфейса
load_array(aattr,forse){const res=[];for(let aobj of aattr){if(!aobj.acl_objs){aobj.acl_objs=[];}const{acl}=aobj;delete aobj.acl;const obj=new $p.CatUsers(aobj,this,true);const{_obj}=obj;if(_obj&&!_obj._acl){_obj._acl=acl;obj._set_loaded();Object.freeze(obj);Object.freeze(_obj);for(let j in _obj){if(typeof _obj[j]=='object'){Object.freeze(_obj[j]);for(let k in _obj[j]){typeof _obj[j][k]=='object'&&Object.freeze(_obj[j][k]);}}}res.push(obj);}}return res;}// пользователей не выгружаем
unload_obj(){}}$p.cat.create('users',CatUsersManager,true);/**
* ### Справочник Проекты
* Проекты
* @class CatProjects
* @extends CatObj
* @constructor 
*/class CatProjects extends CatObj{get start(){return this._getter('start');}set start(v){this._setter('start',v);}get finish(){return this._getter('finish');}set finish(v){this._setter('finish',v);}get launch(){return this._getter('launch');}set launch(v){this._setter('launch',v);}get readiness(){return this._getter('readiness');}set readiness(v){this._setter('readiness',v);}get finished(){return this._getter('finished');}set finished(v){this._setter('finished',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.CatProjects=CatProjects;class CatProjectsExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatProjectsExtra_fieldsRow=CatProjectsExtra_fieldsRow;$p.cat.create('projects');/**
* ### Справочник Склады
* Сведения о местах хранения товаров (складах), их структуре и физических лицах, назначенных материально ответственными (МОЛ) за тот или иной склад
* @class CatStores
* @extends CatObj
* @constructor 
*/class CatStores extends CatObj{get note(){return this._getter('note');}set note(v){this._setter('note',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.CatStores=CatStores;class CatStoresExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatStoresExtra_fieldsRow=CatStoresExtra_fieldsRow;$p.cat.create('stores');/**
* ### Справочник Смены
* Перечень рабочих смен предприятия
* @class CatWork_shifts
* @extends CatObj
* @constructor 
*/class CatWork_shifts extends CatObj{get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get work_shift_periodes(){return this._getter_ts('work_shift_periodes');}set work_shift_periodes(v){this._setter_ts('work_shift_periodes',v);}}$p.CatWork_shifts=CatWork_shifts;class CatWork_shiftsWork_shift_periodesRow extends TabularSectionRow{get begin_time(){return this._getter('begin_time');}set begin_time(v){this._setter('begin_time',v);}get end_time(){return this._getter('end_time');}set end_time(v){this._setter('end_time',v);}}$p.CatWork_shiftsWork_shift_periodesRow=CatWork_shiftsWork_shift_periodesRow;$p.cat.create('work_shifts');/**
* ### Справочник СтатьиДвиженияДенежныхСредств
* Перечень статей движения денежных средств (ДДС), используемых в предприятии для проведения анализа поступлений и расходов в разрезе статей движения денежных средств. 
* @class CatCash_flow_articles
* @extends CatObj
* @constructor 
*/class CatCash_flow_articles extends CatObj{get definition(){return this._getter('definition');}set definition(v){this._setter('definition',v);}get sorting_field(){return this._getter('sorting_field');}set sorting_field(v){this._setter('sorting_field',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatCash_flow_articles=CatCash_flow_articles;$p.cat.create('cash_flow_articles');/**
* ### Справочник ТипыЦенНоменклатуры
* Перечень типов отпускных цен предприятия
* @class CatNom_prices_types
* @extends CatObj
* @constructor 
*/class CatNom_prices_types extends CatObj{get price_currency(){return this._getter('price_currency');}set price_currency(v){this._setter('price_currency',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}get vat_price_included(){return this._getter('vat_price_included');}set vat_price_included(v){this._setter('vat_price_included',v);}get rounding_order(){return this._getter('rounding_order');}set rounding_order(v){this._setter('rounding_order',v);}get rounding_in_a_big_way(){return this._getter('rounding_in_a_big_way');}set rounding_in_a_big_way(v){this._setter('rounding_in_a_big_way',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatNom_prices_types=CatNom_prices_types;$p.cat.create('nom_prices_types');/**
* ### Справочник ФизическиеЛица
* Физические лица
* @class CatIndividuals
* @extends CatObj
* @constructor 
*/class CatIndividuals extends CatObj{get birth_date(){return this._getter('birth_date');}set birth_date(v){this._setter('birth_date',v);}get inn(){return this._getter('inn');}set inn(v){this._setter('inn',v);}get imns_code(){return this._getter('imns_code');}set imns_code(v){this._setter('imns_code',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get pfr_number(){return this._getter('pfr_number');}set pfr_number(v){this._setter('pfr_number',v);}get sex(){return this._getter('sex');}set sex(v){this._setter('sex',v);}get birth_place(){return this._getter('birth_place');}set birth_place(v){this._setter('birth_place',v);}get ОсновноеИзображение(){return this._getter('ОсновноеИзображение');}set ОсновноеИзображение(v){this._setter('ОсновноеИзображение',v);}get Фамилия(){return this._getter('Фамилия');}set Фамилия(v){this._setter('Фамилия',v);}get Имя(){return this._getter('Имя');}set Имя(v){this._setter('Имя',v);}get Отчество(){return this._getter('Отчество');}set Отчество(v){this._setter('Отчество',v);}get ФамилияРП(){return this._getter('ФамилияРП');}set ФамилияРП(v){this._setter('ФамилияРП',v);}get ИмяРП(){return this._getter('ИмяРП');}set ИмяРП(v){this._setter('ИмяРП',v);}get ОтчествоРП(){return this._getter('ОтчествоРП');}set ОтчествоРП(v){this._setter('ОтчествоРП',v);}get ОснованиеРП(){return this._getter('ОснованиеРП');}set ОснованиеРП(v){this._setter('ОснованиеРП',v);}get ДолжностьРП(){return this._getter('ДолжностьРП');}set ДолжностьРП(v){this._setter('ДолжностьРП',v);}get Должность(){return this._getter('Должность');}set Должность(v){this._setter('Должность',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get contact_information(){return this._getter_ts('contact_information');}set contact_information(v){this._setter_ts('contact_information',v);}}$p.CatIndividuals=CatIndividuals;class CatIndividualsContact_informationRow extends TabularSectionRow{get type(){return this._getter('type');}set type(v){this._setter('type',v);}get kind(){return this._getter('kind');}set kind(v){this._setter('kind',v);}get presentation(){return this._getter('presentation');}set presentation(v){this._setter('presentation',v);}get values_fields(){return this._getter('values_fields');}set values_fields(v){this._setter('values_fields',v);}get country(){return this._getter('country');}set country(v){this._setter('country',v);}get region(){return this._getter('region');}set region(v){this._setter('region',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get email_address(){return this._getter('email_address');}set email_address(v){this._setter('email_address',v);}get server_domain_name(){return this._getter('server_domain_name');}set server_domain_name(v){this._setter('server_domain_name',v);}get phone_number(){return this._getter('phone_number');}set phone_number(v){this._setter('phone_number',v);}get phone_without_codes(){return this._getter('phone_without_codes');}set phone_without_codes(v){this._setter('phone_without_codes',v);}get ВидДляСписка(){return this._getter('ВидДляСписка');}set ВидДляСписка(v){this._setter('ВидДляСписка',v);}}$p.CatIndividualsContact_informationRow=CatIndividualsContact_informationRow;$p.cat.create('individuals');/**
* ### Справочник ХарактеристикиНоменклатуры
* Дополнительные характеристики элементов номенклатуры: цвет, размер и т.п.
* @class CatCharacteristics
* @extends CatObj
* @constructor 
*/class CatCharacteristics extends CatObj{get x(){return this._getter('x');}set x(v){this._setter('x',v);}get y(){return this._getter('y');}set y(v){this._setter('y',v);}get z(){return this._getter('z');}set z(v){this._setter('z',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get weight(){return this._getter('weight');}set weight(v){this._setter('weight',v);}get calc_order(){return this._getter('calc_order');}set calc_order(v){this._setter('calc_order',v);}get product(){return this._getter('product');}set product(v){this._setter('product',v);}get leading_product(){return this._getter('leading_product');}set leading_product(v){this._setter('leading_product',v);}get leading_elm(){return this._getter('leading_elm');}set leading_elm(v){this._setter('leading_elm',v);}get origin(){return this._getter('origin');}set origin(v){this._setter('origin',v);}get base_block(){return this._getter('base_block');}set base_block(v){this._setter('base_block',v);}get sys(){return this._getter('sys');}set sys(v){this._setter('sys',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get owner(){return this._getter('owner');}set owner(v){this._setter('owner',v);}get constructions(){return this._getter_ts('constructions');}set constructions(v){this._setter_ts('constructions',v);}get coordinates(){return this._getter_ts('coordinates');}set coordinates(v){this._setter_ts('coordinates',v);}get inserts(){return this._getter_ts('inserts');}set inserts(v){this._setter_ts('inserts',v);}get params(){return this._getter_ts('params');}set params(v){this._setter_ts('params',v);}get cnn_elmnts(){return this._getter_ts('cnn_elmnts');}set cnn_elmnts(v){this._setter_ts('cnn_elmnts',v);}get glass_specification(){return this._getter_ts('glass_specification');}set glass_specification(v){this._setter_ts('glass_specification',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}get glasses(){return this._getter_ts('glasses');}set glasses(v){this._setter_ts('glasses',v);}get specification(){return this._getter_ts('specification');}set specification(v){this._setter_ts('specification',v);}}$p.CatCharacteristics=CatCharacteristics;class CatCharacteristicsConstructionsRow extends TabularSectionRow{get cnstr(){return this._getter('cnstr');}set cnstr(v){this._setter('cnstr',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get x(){return this._getter('x');}set x(v){this._setter('x',v);}get y(){return this._getter('y');}set y(v){this._setter('y',v);}get z(){return this._getter('z');}set z(v){this._setter('z',v);}get w(){return this._getter('w');}set w(v){this._setter('w',v);}get h(){return this._getter('h');}set h(v){this._setter('h',v);}get furn(){return this._getter('furn');}set furn(v){this._setter('furn',v);}get clr_furn(){return this._getter('clr_furn');}set clr_furn(v){this._setter('clr_furn',v);}get direction(){return this._getter('direction');}set direction(v){this._setter('direction',v);}get h_ruch(){return this._getter('h_ruch');}set h_ruch(v){this._setter('h_ruch',v);}get fix_ruch(){return this._getter('fix_ruch');}set fix_ruch(v){this._setter('fix_ruch',v);}get is_rectangular(){return this._getter('is_rectangular');}set is_rectangular(v){this._setter('is_rectangular',v);}}$p.CatCharacteristicsConstructionsRow=CatCharacteristicsConstructionsRow;class CatCharacteristicsCoordinatesRow extends TabularSectionRow{get cnstr(){return this._getter('cnstr');}set cnstr(v){this._setter('cnstr',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get path_data(){return this._getter('path_data');}set path_data(v){this._setter('path_data',v);}get x1(){return this._getter('x1');}set x1(v){this._setter('x1',v);}get y1(){return this._getter('y1');}set y1(v){this._setter('y1',v);}get x2(){return this._getter('x2');}set x2(v){this._setter('x2',v);}get y2(){return this._getter('y2');}set y2(v){this._setter('y2',v);}get r(){return this._getter('r');}set r(v){this._setter('r',v);}get arc_ccw(){return this._getter('arc_ccw');}set arc_ccw(v){this._setter('arc_ccw',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get angle_hor(){return this._getter('angle_hor');}set angle_hor(v){this._setter('angle_hor',v);}get alp1(){return this._getter('alp1');}set alp1(v){this._setter('alp1',v);}get alp2(){return this._getter('alp2');}set alp2(v){this._setter('alp2',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get pos(){return this._getter('pos');}set pos(v){this._setter('pos',v);}get orientation(){return this._getter('orientation');}set orientation(v){this._setter('orientation',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}}$p.CatCharacteristicsCoordinatesRow=CatCharacteristicsCoordinatesRow;class CatCharacteristicsInsertsRow extends TabularSectionRow{get cnstr(){return this._getter('cnstr');}set cnstr(v){this._setter('cnstr',v);}get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}}$p.CatCharacteristicsInsertsRow=CatCharacteristicsInsertsRow;class CatCharacteristicsParamsRow extends TabularSectionRow{get cnstr(){return this._getter('cnstr');}set cnstr(v){this._setter('cnstr',v);}get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get param(){return this._getter('param');}set param(v){this._setter('param',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get hide(){return this._getter('hide');}set hide(v){this._setter('hide',v);}}$p.CatCharacteristicsParamsRow=CatCharacteristicsParamsRow;class CatCharacteristicsCnn_elmntsRow extends TabularSectionRow{get elm1(){return this._getter('elm1');}set elm1(v){this._setter('elm1',v);}get node1(){return this._getter('node1');}set node1(v){this._setter('node1',v);}get elm2(){return this._getter('elm2');}set elm2(v){this._setter('elm2',v);}get node2(){return this._getter('node2');}set node2(v){this._setter('node2',v);}get cnn(){return this._getter('cnn');}set cnn(v){this._setter('cnn',v);}get aperture_len(){return this._getter('aperture_len');}set aperture_len(v){this._setter('aperture_len',v);}}$p.CatCharacteristicsCnn_elmntsRow=CatCharacteristicsCnn_elmntsRow;class CatCharacteristicsGlass_specificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get gno(){return this._getter('gno');}set gno(v){this._setter('gno',v);}get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}}$p.CatCharacteristicsGlass_specificationRow=CatCharacteristicsGlass_specificationRow;class CatCharacteristicsExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.CatCharacteristicsExtra_fieldsRow=CatCharacteristicsExtra_fieldsRow;class CatCharacteristicsGlassesRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get height(){return this._getter('height');}set height(v){this._setter('height',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get is_rectangular(){return this._getter('is_rectangular');}set is_rectangular(v){this._setter('is_rectangular',v);}get is_sandwich(){return this._getter('is_sandwich');}set is_sandwich(v){this._setter('is_sandwich',v);}get thickness(){return this._getter('thickness');}set thickness(v){this._setter('thickness',v);}get coffer(){return this._getter('coffer');}set coffer(v){this._setter('coffer',v);}}$p.CatCharacteristicsGlassesRow=CatCharacteristicsGlassesRow;class CatCharacteristicsSpecificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get qty(){return this._getter('qty');}set qty(v){this._setter('qty',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get alp1(){return this._getter('alp1');}set alp1(v){this._setter('alp1',v);}get alp2(){return this._getter('alp2');}set alp2(v){this._setter('alp2',v);}get totqty(){return this._getter('totqty');}set totqty(v){this._setter('totqty',v);}get totqty1(){return this._getter('totqty1');}set totqty1(v){this._setter('totqty1',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get amount_marged(){return this._getter('amount_marged');}set amount_marged(v){this._setter('amount_marged',v);}get origin(){return this._getter('origin');}set origin(v){this._setter('origin',v);}get changed(){return this._getter('changed');}set changed(v){this._setter('changed',v);}get dop(){return this._getter('dop');}set dop(v){this._setter('dop',v);}}$p.CatCharacteristicsSpecificationRow=CatCharacteristicsSpecificationRow;$p.cat.create('characteristics');/**
* ### Справочник ЦеновыеГруппы
* Ценовые группы
* @class CatPrice_groups
* @extends CatObj
* @constructor 
*/class CatPrice_groups extends CatObj{get definition(){return this._getter('definition');}set definition(v){this._setter('definition',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatPrice_groups=CatPrice_groups;$p.cat.create('price_groups');/**
* ### Справочник ГруппыФинансовогоУчетаНоменклатуры
* Перечень номенклатурных групп для учета затрат и укрупненного планирования продаж, закупок и производства
* @class CatNom_groups
* @extends CatObj
* @constructor 
*/class CatNom_groups extends CatObj{get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get parent(){return this._getter('parent');}set parent(v){this._setter('parent',v);}}$p.CatNom_groups=CatNom_groups;$p.cat.create('nom_groups');/**
* ### Справочник ПривязкиВставок
* Замена регистра "Корректировка спецификации"
* @class CatInsert_bind
* @extends CatObj
* @constructor 
*/class CatInsert_bind extends CatObj{get key(){return this._getter('key');}set key(v){this._setter('key',v);}get zone(){return this._getter('zone');}set zone(v){this._setter('zone',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get production(){return this._getter_ts('production');}set production(v){this._setter_ts('production',v);}get inserts(){return this._getter_ts('inserts');}set inserts(v){this._setter_ts('inserts',v);}}$p.CatInsert_bind=CatInsert_bind;class CatInsert_bindProductionRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}}$p.CatInsert_bindProductionRow=CatInsert_bindProductionRow;class CatInsert_bindInsertsRow extends TabularSectionRow{get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}}$p.CatInsert_bindInsertsRow=CatInsert_bindInsertsRow;$p.cat.create('insert_bind');/**
* ### Справочник ПризнакиНестандартов
* Признаки нестандартов
* @class CatNonstandard_attributes
* @extends CatObj
* @constructor 
*/class CatNonstandard_attributes extends CatObj{get crooked(){return this._getter('crooked');}set crooked(v){this._setter('crooked',v);}get colored(){return this._getter('colored');}set colored(v){this._setter('colored',v);}get lay(){return this._getter('lay');}set lay(v){this._setter('lay',v);}get made_to_order(){return this._getter('made_to_order');}set made_to_order(v){this._setter('made_to_order',v);}get packing(){return this._getter('packing');}set packing(v){this._setter('packing',v);}get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}}$p.CatNonstandard_attributes=CatNonstandard_attributes;$p.cat.create('nonstandard_attributes');/**
* ### Справочник НаправленияДоставки
* Объединяет районы, территории или подразделения продаж
* @class CatDelivery_directions
* @extends CatObj
* @constructor 
*/class CatDelivery_directions extends CatObj{get predefined_name(){return this._getter('predefined_name');}set predefined_name(v){this._setter('predefined_name',v);}get composition(){return this._getter_ts('composition');}set composition(v){this._setter_ts('composition',v);}}$p.CatDelivery_directions=CatDelivery_directions;class CatDelivery_directionsCompositionRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}}$p.CatDelivery_directionsCompositionRow=CatDelivery_directionsCompositionRow;$p.cat.create('delivery_directions');/**
* ### Документ КорректировкаРегистров
* Корректировка регистров
* @class DocRegisters_correction
* @extends DocObj
* @constructor 
*/class DocRegisters_correction extends DocObj{get original_doc_type(){return this._getter('original_doc_type');}set original_doc_type(v){this._setter('original_doc_type',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get registers_table(){return this._getter_ts('registers_table');}set registers_table(v){this._setter_ts('registers_table',v);}}$p.DocRegisters_correction=DocRegisters_correction;class DocRegisters_correctionRegisters_tableRow extends TabularSectionRow{get Имя(){return this._getter('Имя');}set Имя(v){this._setter('Имя',v);}}$p.DocRegisters_correctionRegisters_tableRow=DocRegisters_correctionRegisters_tableRow;$p.doc.create('registers_correction');/**
* ### Документ ПоступлениеТоваровУслуг
* Документы отражают поступление товаров и услуг
* @class DocPurchase
* @extends DocObj
* @constructor 
*/class DocPurchase extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get warehouse(){return this._getter('warehouse');}set warehouse(v){this._setter('warehouse',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get goods(){return this._getter_ts('goods');}set goods(v){this._setter_ts('goods',v);}get services(){return this._getter_ts('services');}set services(v){this._setter_ts('services',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocPurchase=DocPurchase;class DocPurchaseGoodsRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get unit(){return this._getter('unit');}set unit(v){this._setter('unit',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get vat_amount(){return this._getter('vat_amount');}set vat_amount(v){this._setter('vat_amount',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}}$p.DocPurchaseGoodsRow=DocPurchaseGoodsRow;class DocPurchaseServicesRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get content(){return this._getter('content');}set content(v){this._setter('content',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get vat_amount(){return this._getter('vat_amount');}set vat_amount(v){this._setter('vat_amount',v);}get nom_group(){return this._getter('nom_group');}set nom_group(v){this._setter('nom_group',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get cost_item(){return this._getter('cost_item');}set cost_item(v){this._setter('cost_item',v);}get project(){return this._getter('project');}set project(v){this._setter('project',v);}get buyers_order(){return this._getter('buyers_order');}set buyers_order(v){this._setter('buyers_order',v);}}$p.DocPurchaseServicesRow=DocPurchaseServicesRow;class DocPurchaseExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocPurchaseExtra_fieldsRow=DocPurchaseExtra_fieldsRow;$p.doc.create('purchase');/**
* ### Документ НарядРЦ
* Задание рабочему центру
* @class DocWork_centers_task
* @extends DocObj
* @constructor 
*/class DocWork_centers_task extends DocObj{get key(){return this._getter('key');}set key(v){this._setter('key',v);}get recipient(){return this._getter('recipient');}set recipient(v){this._setter('recipient',v);}get biz_cuts(){return this._getter('biz_cuts');}set biz_cuts(v){this._setter('biz_cuts',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get planning(){return this._getter_ts('planning');}set planning(v){this._setter_ts('planning',v);}get demand(){return this._getter_ts('demand');}set demand(v){this._setter_ts('demand',v);}get Обрезь(){return this._getter_ts('Обрезь');}set Обрезь(v){this._setter_ts('Обрезь',v);}get Раскрой(){return this._getter_ts('Раскрой');}set Раскрой(v){this._setter_ts('Раскрой',v);}}$p.DocWork_centers_task=DocWork_centers_task;class DocWork_centers_taskPlanningRow extends TabularSectionRow{get obj(){return this._getter('obj');}set obj(v){this._setter('obj',v);}get specimen(){return this._getter('specimen');}set specimen(v){this._setter('specimen',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get performance(){return this._getter('performance');}set performance(v){this._setter('performance',v);}}$p.DocWork_centers_taskPlanningRow=DocWork_centers_taskPlanningRow;class DocWork_centers_taskDemandRow extends TabularSectionRow{get production(){return this._getter('production');}set production(v){this._setter('production',v);}get specimen(){return this._getter('specimen');}set specimen(v){this._setter('specimen',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get НоменклатураСП(){return this._getter('НоменклатураСП');}set НоменклатураСП(v){this._setter('НоменклатураСП',v);}get ХарактеристикаСП(){return this._getter('ХарактеристикаСП');}set ХарактеристикаСП(v){this._setter('ХарактеристикаСП',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get ОстатокПотребности(){return this._getter('ОстатокПотребности');}set ОстатокПотребности(v){this._setter('ОстатокПотребности',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get Закрыть(){return this._getter('Закрыть');}set Закрыть(v){this._setter('Закрыть',v);}get ИзОбрези(){return this._getter('ИзОбрези');}set ИзОбрези(v){this._setter('ИзОбрези',v);}}$p.DocWork_centers_taskDemandRow=DocWork_centers_taskDemandRow;class DocWork_centers_taskОбрезьRow extends TabularSectionRow{get ВидДвижения(){return this._getter('ВидДвижения');}set ВидДвижения(v){this._setter('ВидДвижения',v);}get Хлыст(){return this._getter('Хлыст');}set Хлыст(v){this._setter('Хлыст',v);}get НомерПары(){return this._getter('НомерПары');}set НомерПары(v){this._setter('НомерПары',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get КоординатаX(){return this._getter('КоординатаX');}set КоординатаX(v){this._setter('КоординатаX',v);}get КоординатаY(){return this._getter('КоординатаY');}set КоординатаY(v){this._setter('КоординатаY',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get cell(){return this._getter('cell');}set cell(v){this._setter('cell',v);}}$p.DocWork_centers_taskОбрезьRow=DocWork_centers_taskОбрезьRow;class DocWork_centers_taskРаскройRow extends TabularSectionRow{get production(){return this._getter('production');}set production(v){this._setter('production',v);}get specimen(){return this._getter('specimen');}set specimen(v){this._setter('specimen',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get Хлыст(){return this._getter('Хлыст');}set Хлыст(v){this._setter('Хлыст',v);}get НомерПары(){return this._getter('НомерПары');}set НомерПары(v){this._setter('НомерПары',v);}get orientation(){return this._getter('orientation');}set orientation(v){this._setter('orientation',v);}get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}get Угол1(){return this._getter('Угол1');}set Угол1(v){this._setter('Угол1',v);}get Угол2(){return this._getter('Угол2');}set Угол2(v){this._setter('Угол2',v);}get cell(){return this._getter('cell');}set cell(v){this._setter('cell',v);}get Партия(){return this._getter('Партия');}set Партия(v){this._setter('Партия',v);}get КоординатаX(){return this._getter('КоординатаX');}set КоординатаX(v){this._setter('КоординатаX',v);}get КоординатаY(){return this._getter('КоординатаY');}set КоординатаY(v){this._setter('КоординатаY',v);}get Поворот(){return this._getter('Поворот');}set Поворот(v){this._setter('Поворот',v);}get ЭтоНестандарт(){return this._getter('ЭтоНестандарт');}set ЭтоНестандарт(v){this._setter('ЭтоНестандарт',v);}}$p.DocWork_centers_taskРаскройRow=DocWork_centers_taskРаскройRow;$p.doc.create('work_centers_task');/**
* ### Документ Расчет
* Аналог заказа покупателя типовых конфигураций.
Содержит инструменты для формирования спецификаций и подготовки данных производства и диспетчеризации
* @class DocCalc_order
* @extends DocObj
* @constructor 
*/class DocCalc_order extends DocObj{get number_internal(){return this._getter('number_internal');}set number_internal(v){this._setter('number_internal',v);}get project(){return this._getter('project');}set project(v){this._setter('project',v);}get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get client_of_dealer(){return this._getter('client_of_dealer');}set client_of_dealer(v){this._setter('client_of_dealer',v);}get contract(){return this._getter('contract');}set contract(v){this._setter('contract',v);}get bank_account(){return this._getter('bank_account');}set bank_account(v){this._setter('bank_account',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get manager(){return this._getter('manager');}set manager(v){this._setter('manager',v);}get leading_manager(){return this._getter('leading_manager');}set leading_manager(v){this._setter('leading_manager',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get warehouse(){return this._getter('warehouse');}set warehouse(v){this._setter('warehouse',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get amount_operation(){return this._getter('amount_operation');}set amount_operation(v){this._setter('amount_operation',v);}get amount_internal(){return this._getter('amount_internal');}set amount_internal(v){this._setter('amount_internal',v);}get accessory_characteristic(){return this._getter('accessory_characteristic');}set accessory_characteristic(v){this._setter('accessory_characteristic',v);}get sys_profile(){return this._getter('sys_profile');}set sys_profile(v){this._setter('sys_profile',v);}get sys_furn(){return this._getter('sys_furn');}set sys_furn(v){this._setter('sys_furn',v);}get phone(){return this._getter('phone');}set phone(v){this._setter('phone',v);}get delivery_area(){return this._getter('delivery_area');}set delivery_area(v){this._setter('delivery_area',v);}get shipping_address(){return this._getter('shipping_address');}set shipping_address(v){this._setter('shipping_address',v);}get coordinates(){return this._getter('coordinates');}set coordinates(v){this._setter('coordinates',v);}get address_fields(){return this._getter('address_fields');}set address_fields(v){this._setter('address_fields',v);}get difficult(){return this._getter('difficult');}set difficult(v){this._setter('difficult',v);}get vat_consider(){return this._getter('vat_consider');}set vat_consider(v){this._setter('vat_consider',v);}get vat_included(){return this._getter('vat_included');}set vat_included(v){this._setter('vat_included',v);}get settlements_course(){return this._getter('settlements_course');}set settlements_course(v){this._setter('settlements_course',v);}get settlements_multiplicity(){return this._getter('settlements_multiplicity');}set settlements_multiplicity(v){this._setter('settlements_multiplicity',v);}get extra_charge_external(){return this._getter('extra_charge_external');}set extra_charge_external(v){this._setter('extra_charge_external',v);}get obj_delivery_state(){return this._getter('obj_delivery_state');}set obj_delivery_state(v){this._setter('obj_delivery_state',v);}get category(){return this._getter('category');}set category(v){this._setter('category',v);}get production(){return this._getter_ts('production');}set production(v){this._setter_ts('production',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}get contact_information(){return this._getter_ts('contact_information');}set contact_information(v){this._setter_ts('contact_information',v);}get planning(){return this._getter_ts('planning');}set planning(v){this._setter_ts('planning',v);}}$p.DocCalc_order=DocCalc_order;class DocCalc_orderProductionRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get unit(){return this._getter('unit');}set unit(v){this._setter('unit',v);}get qty(){return this._getter('qty');}set qty(v){this._setter('qty',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get first_cost(){return this._getter('first_cost');}set first_cost(v){this._setter('first_cost',v);}get marginality(){return this._getter('marginality');}set marginality(v){this._setter('marginality',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}get discount_percent_internal(){return this._getter('discount_percent_internal');}set discount_percent_internal(v){this._setter('discount_percent_internal',v);}get discount(){return this._getter('discount');}set discount(v){this._setter('discount',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get margin(){return this._getter('margin');}set margin(v){this._setter('margin',v);}get price_internal(){return this._getter('price_internal');}set price_internal(v){this._setter('price_internal',v);}get amount_internal(){return this._getter('amount_internal');}set amount_internal(v){this._setter('amount_internal',v);}get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get vat_amount(){return this._getter('vat_amount');}set vat_amount(v){this._setter('vat_amount',v);}get ordn(){return this._getter('ordn');}set ordn(v){this._setter('ordn',v);}get changed(){return this._getter('changed');}set changed(v){this._setter('changed',v);}}$p.DocCalc_orderProductionRow=DocCalc_orderProductionRow;class DocCalc_orderExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocCalc_orderExtra_fieldsRow=DocCalc_orderExtra_fieldsRow;class DocCalc_orderContact_informationRow extends TabularSectionRow{get type(){return this._getter('type');}set type(v){this._setter('type',v);}get kind(){return this._getter('kind');}set kind(v){this._setter('kind',v);}get presentation(){return this._getter('presentation');}set presentation(v){this._setter('presentation',v);}get values_fields(){return this._getter('values_fields');}set values_fields(v){this._setter('values_fields',v);}get country(){return this._getter('country');}set country(v){this._setter('country',v);}get region(){return this._getter('region');}set region(v){this._setter('region',v);}get city(){return this._getter('city');}set city(v){this._setter('city',v);}get email_address(){return this._getter('email_address');}set email_address(v){this._setter('email_address',v);}get server_domain_name(){return this._getter('server_domain_name');}set server_domain_name(v){this._setter('server_domain_name',v);}get phone_number(){return this._getter('phone_number');}set phone_number(v){this._setter('phone_number',v);}get phone_without_codes(){return this._getter('phone_without_codes');}set phone_without_codes(v){this._setter('phone_without_codes',v);}}$p.DocCalc_orderContact_informationRow=DocCalc_orderContact_informationRow;class DocCalc_orderPlanningRow extends TabularSectionRow{get phase(){return this._getter('phase');}set phase(v){this._setter('phase',v);}get date(){return this._getter('date');}set date(v){this._setter('date',v);}get key(){return this._getter('key');}set key(v){this._setter('key',v);}get obj(){return this._getter('obj');}set obj(v){this._setter('obj',v);}get specimen(){return this._getter('specimen');}set specimen(v){this._setter('specimen',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get performance(){return this._getter('performance');}set performance(v){this._setter('performance',v);}}$p.DocCalc_orderPlanningRow=DocCalc_orderPlanningRow;$p.doc.create('calc_order');/**
* ### Документ ОплатаОтПокупателяПлатежнойКартой
* Оплата от покупателя платежной картой
* @class DocCredit_card_order
* @extends DocObj
* @constructor 
*/class DocCredit_card_order extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get payment_details(){return this._getter_ts('payment_details');}set payment_details(v){this._setter_ts('payment_details',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocCredit_card_order=DocCredit_card_order;class DocCredit_card_orderPayment_detailsRow extends TabularSectionRow{get cash_flow_article(){return this._getter('cash_flow_article');}set cash_flow_article(v){this._setter('cash_flow_article',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}}$p.DocCredit_card_orderPayment_detailsRow=DocCredit_card_orderPayment_detailsRow;class DocCredit_card_orderExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocCredit_card_orderExtra_fieldsRow=DocCredit_card_orderExtra_fieldsRow;$p.doc.create('credit_card_order');/**
* ### Документ МощностиРЦ
* Мощности рабочих центров
* @class DocWork_centers_performance
* @extends DocObj
* @constructor 
*/class DocWork_centers_performance extends DocObj{get start_date(){return this._getter('start_date');}set start_date(v){this._setter('start_date',v);}get expiration_date(){return this._getter('expiration_date');}set expiration_date(v){this._setter('expiration_date',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get planning(){return this._getter_ts('planning');}set planning(v){this._setter_ts('planning',v);}}$p.DocWork_centers_performance=DocWork_centers_performance;class DocWork_centers_performancePlanningRow extends TabularSectionRow{get date(){return this._getter('date');}set date(v){this._setter('date',v);}get key(){return this._getter('key');}set key(v){this._setter('key',v);}get performance(){return this._getter('performance');}set performance(v){this._setter('performance',v);}}$p.DocWork_centers_performancePlanningRow=DocWork_centers_performancePlanningRow;$p.doc.create('work_centers_performance');/**
* ### Документ ПлатежноеПоручениеВходящее
* Платежное поручение входящее
* @class DocDebit_bank_order
* @extends DocObj
* @constructor 
*/class DocDebit_bank_order extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get payment_details(){return this._getter_ts('payment_details');}set payment_details(v){this._setter_ts('payment_details',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocDebit_bank_order=DocDebit_bank_order;class DocDebit_bank_orderPayment_detailsRow extends TabularSectionRow{get cash_flow_article(){return this._getter('cash_flow_article');}set cash_flow_article(v){this._setter('cash_flow_article',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}}$p.DocDebit_bank_orderPayment_detailsRow=DocDebit_bank_orderPayment_detailsRow;class DocDebit_bank_orderExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocDebit_bank_orderExtra_fieldsRow=DocDebit_bank_orderExtra_fieldsRow;$p.doc.create('debit_bank_order');/**
* ### Документ ПлатежноеПоручениеИсходящее
* Платежное поручение исходящее
* @class DocCredit_bank_order
* @extends DocObj
* @constructor 
*/class DocCredit_bank_order extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get payment_details(){return this._getter_ts('payment_details');}set payment_details(v){this._setter_ts('payment_details',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocCredit_bank_order=DocCredit_bank_order;class DocCredit_bank_orderPayment_detailsRow extends TabularSectionRow{get cash_flow_article(){return this._getter('cash_flow_article');}set cash_flow_article(v){this._setter('cash_flow_article',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}}$p.DocCredit_bank_orderPayment_detailsRow=DocCredit_bank_orderPayment_detailsRow;class DocCredit_bank_orderExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocCredit_bank_orderExtra_fieldsRow=DocCredit_bank_orderExtra_fieldsRow;$p.doc.create('credit_bank_order');/**
* ### Документ ПриходныйКассовыйОрдер
* Приходный кассовый ордер
* @class DocDebit_cash_order
* @extends DocObj
* @constructor 
*/class DocDebit_cash_order extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get cashbox(){return this._getter('cashbox');}set cashbox(v){this._setter('cashbox',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get payment_details(){return this._getter_ts('payment_details');}set payment_details(v){this._setter_ts('payment_details',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocDebit_cash_order=DocDebit_cash_order;class DocDebit_cash_orderPayment_detailsRow extends TabularSectionRow{get cash_flow_article(){return this._getter('cash_flow_article');}set cash_flow_article(v){this._setter('cash_flow_article',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}}$p.DocDebit_cash_orderPayment_detailsRow=DocDebit_cash_orderPayment_detailsRow;class DocDebit_cash_orderExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocDebit_cash_orderExtra_fieldsRow=DocDebit_cash_orderExtra_fieldsRow;$p.doc.create('debit_cash_order');/**
* ### Документ РасходныйКассовыйОрдер
* Расходный кассовый ордер
* @class DocCredit_cash_order
* @extends DocObj
* @constructor 
*/class DocCredit_cash_order extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get cashbox(){return this._getter('cashbox');}set cashbox(v){this._setter('cashbox',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get payment_details(){return this._getter_ts('payment_details');}set payment_details(v){this._setter_ts('payment_details',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocCredit_cash_order=DocCredit_cash_order;class DocCredit_cash_orderPayment_detailsRow extends TabularSectionRow{get cash_flow_article(){return this._getter('cash_flow_article');}set cash_flow_article(v){this._setter('cash_flow_article',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}}$p.DocCredit_cash_orderPayment_detailsRow=DocCredit_cash_orderPayment_detailsRow;class DocCredit_cash_orderExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocCredit_cash_orderExtra_fieldsRow=DocCredit_cash_orderExtra_fieldsRow;$p.doc.create('credit_cash_order');/**
* ### Документ РеализацияТоваровУслуг
* Документы отражают факт реализации (отгрузки) товаров
* @class DocSelling
* @extends DocObj
* @constructor 
*/class DocSelling extends DocObj{get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get warehouse(){return this._getter('warehouse');}set warehouse(v){this._setter('warehouse',v);}get doc_amount(){return this._getter('doc_amount');}set doc_amount(v){this._setter('doc_amount',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get goods(){return this._getter_ts('goods');}set goods(v){this._setter_ts('goods',v);}get services(){return this._getter_ts('services');}set services(v){this._setter_ts('services',v);}get extra_fields(){return this._getter_ts('extra_fields');}set extra_fields(v){this._setter_ts('extra_fields',v);}}$p.DocSelling=DocSelling;class DocSellingGoodsRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get unit(){return this._getter('unit');}set unit(v){this._setter('unit',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get vat_amount(){return this._getter('vat_amount');}set vat_amount(v){this._setter('vat_amount',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}}$p.DocSellingGoodsRow=DocSellingGoodsRow;class DocSellingServicesRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get content(){return this._getter('content');}set content(v){this._setter('content',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get vat_rate(){return this._getter('vat_rate');}set vat_rate(v){this._setter('vat_rate',v);}get vat_amount(){return this._getter('vat_amount');}set vat_amount(v){this._setter('vat_amount',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}}$p.DocSellingServicesRow=DocSellingServicesRow;class DocSellingExtra_fieldsRow extends TabularSectionRow{get property(){return this._getter('property');}set property(v){this._setter('property',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get txt_row(){return this._getter('txt_row');}set txt_row(v){this._setter('txt_row',v);}}$p.DocSellingExtra_fieldsRow=DocSellingExtra_fieldsRow;$p.doc.create('selling');/**
* ### Документ УстановкаЦенНоменклатуры
* Установка цен номенклатуры
* @class DocNom_prices_setup
* @extends DocObj
* @constructor 
*/class DocNom_prices_setup extends DocObj{get price_type(){return this._getter('price_type');}set price_type(v){this._setter('price_type',v);}get currency(){return this._getter('currency');}set currency(v){this._setter('currency',v);}get responsible(){return this._getter('responsible');}set responsible(v){this._setter('responsible',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get goods(){return this._getter_ts('goods');}set goods(v){this._setter_ts('goods',v);}}$p.DocNom_prices_setup=DocNom_prices_setup;class DocNom_prices_setupGoodsRow extends TabularSectionRow{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get nom_characteristic(){return this._getter('nom_characteristic');}set nom_characteristic(v){this._setter('nom_characteristic',v);}get price_type(){return this._getter('price_type');}set price_type(v){this._setter('price_type',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}}$p.DocNom_prices_setupGoodsRow=DocNom_prices_setupGoodsRow;$p.doc.create('nom_prices_setup');/**
* ### Документ СобытиеПланирования
* Событие планирования
* @class DocPlanning_event
* @extends DocObj
* @constructor 
*/class DocPlanning_event extends DocObj{get phase(){return this._getter('phase');}set phase(v){this._setter('phase',v);}get key(){return this._getter('key');}set key(v){this._setter('key',v);}get recipient(){return this._getter('recipient');}set recipient(v){this._setter('recipient',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get project(){return this._getter('project');}set project(v){this._setter('project',v);}get Основание(){return this._getter('Основание');}set Основание(v){this._setter('Основание',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get executors(){return this._getter_ts('executors');}set executors(v){this._setter_ts('executors',v);}get planning(){return this._getter_ts('planning');}set planning(v){this._setter_ts('planning',v);}}$p.DocPlanning_event=DocPlanning_event;class DocPlanning_eventExecutorsRow extends TabularSectionRow{get executor(){return this._getter('executor');}set executor(v){this._setter('executor',v);}get coefficient(){return this._getter('coefficient');}set coefficient(v){this._setter('coefficient',v);}}$p.DocPlanning_eventExecutorsRow=DocPlanning_eventExecutorsRow;class DocPlanning_eventPlanningRow extends TabularSectionRow{get obj(){return this._getter('obj');}set obj(v){this._setter('obj',v);}get specimen(){return this._getter('specimen');}set specimen(v){this._setter('specimen',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get performance(){return this._getter('performance');}set performance(v){this._setter('performance',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get begin_time(){return this._getter('begin_time');}set begin_time(v){this._setter('begin_time',v);}get end_time(){return this._getter('end_time');}set end_time(v){this._setter('end_time',v);}}$p.DocPlanning_eventPlanningRow=DocPlanning_eventPlanningRow;$p.doc.create('planning_event');/**
* ### Регистр сведений log_view
* Просмотр журнала событий
* @class IregLog_view
* @extends RegisterRow
* @constructor 
*/class IregLog_view extends RegisterRow{get key(){return this._getter('key');}set key(v){this._setter('key',v);}get user(){return this._getter('user');}set user(v){this._setter('user',v);}}$p.IregLog_view=IregLog_view;$p.ireg.create('log_view');/**
* ### Регистр сведений СостоянияЗаказовКлиентов
* Состояния заказов клиентов
* @class IregBuyers_order_states
* @extends RegisterRow
* @constructor 
*/class IregBuyers_order_states extends RegisterRow{get invoice(){return this._getter('invoice');}set invoice(v){this._setter('invoice',v);}get state(){return this._getter('state');}set state(v){this._setter('state',v);}get event_date(){return this._getter('event_date');}set event_date(v){this._setter('event_date',v);}get СуммаОплаты(){return this._getter('СуммаОплаты');}set СуммаОплаты(v){this._setter('СуммаОплаты',v);}get ПроцентОплаты(){return this._getter('ПроцентОплаты');}set ПроцентОплаты(v){this._setter('ПроцентОплаты',v);}get СуммаОтгрузки(){return this._getter('СуммаОтгрузки');}set СуммаОтгрузки(v){this._setter('СуммаОтгрузки',v);}get ПроцентОтгрузки(){return this._getter('ПроцентОтгрузки');}set ПроцентОтгрузки(v){this._setter('ПроцентОтгрузки',v);}get СуммаДолга(){return this._getter('СуммаДолга');}set СуммаДолга(v){this._setter('СуммаДолга',v);}get ПроцентДолга(){return this._getter('ПроцентДолга');}set ПроцентДолга(v){this._setter('ПроцентДолга',v);}get ЕстьРасхожденияОрдерНакладная(){return this._getter('ЕстьРасхожденияОрдерНакладная');}set ЕстьРасхожденияОрдерНакладная(v){this._setter('ЕстьРасхожденияОрдерНакладная',v);}}$p.IregBuyers_order_states=IregBuyers_order_states;$p.ireg.create('buyers_order_states');/**
* ### Регистр сведений КурсыВалют
* Курсы валют
* @class IregCurrency_courses
* @extends RegisterRow
* @constructor 
*/class IregCurrency_courses extends RegisterRow{get currency(){return this._getter('currency');}set currency(v){this._setter('currency',v);}get period(){return this._getter('period');}set period(v){this._setter('period',v);}get course(){return this._getter('course');}set course(v){this._setter('course',v);}get multiplicity(){return this._getter('multiplicity');}set multiplicity(v){this._setter('multiplicity',v);}}$p.IregCurrency_courses=IregCurrency_courses;$p.ireg.create('currency_courses');/**
* ### Регистр сведений пзМаржинальныеКоэффициентыИСкидки
* Маржинальные коэффициенты
* @class IregMargin_coefficients
* @extends RegisterRow
* @constructor 
*/class IregMargin_coefficients extends RegisterRow{get price_group(){return this._getter('price_group');}set price_group(v){this._setter('price_group',v);}get key(){return this._getter('key');}set key(v){this._setter('key',v);}get condition_formula(){return this._getter('condition_formula');}set condition_formula(v){this._setter('condition_formula',v);}get marginality(){return this._getter('marginality');}set marginality(v){this._setter('marginality',v);}get marginality_min(){return this._getter('marginality_min');}set marginality_min(v){this._setter('marginality_min',v);}get marginality_internal(){return this._getter('marginality_internal');}set marginality_internal(v){this._setter('marginality_internal',v);}get price_type_first_cost(){return this._getter('price_type_first_cost');}set price_type_first_cost(v){this._setter('price_type_first_cost',v);}get price_type_sale(){return this._getter('price_type_sale');}set price_type_sale(v){this._setter('price_type_sale',v);}get price_type_internal(){return this._getter('price_type_internal');}set price_type_internal(v){this._setter('price_type_internal',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get sale_formula(){return this._getter('sale_formula');}set sale_formula(v){this._setter('sale_formula',v);}get internal_formula(){return this._getter('internal_formula');}set internal_formula(v){this._setter('internal_formula',v);}get external_formula(){return this._getter('external_formula');}set external_formula(v){this._setter('external_formula',v);}get extra_charge_external(){return this._getter('extra_charge_external');}set extra_charge_external(v){this._setter('extra_charge_external',v);}get discount_external(){return this._getter('discount_external');}set discount_external(v){this._setter('discount_external',v);}get discount(){return this._getter('discount');}set discount(v){this._setter('discount',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}}$p.IregMargin_coefficients=IregMargin_coefficients;$p.ireg.create('margin_coefficients');/**
* ### Обработка builder_price
* Метаданные карточки цен номенклатуры
* @class DpBuilder_price
* @extends DataProcessorObj
* @constructor 
*/class DpBuilder_price extends DataProcessorObj{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get goods(){return this._getter_ts('goods');}set goods(v){this._setter_ts('goods',v);}}$p.DpBuilder_price=DpBuilder_price;class DpBuilder_priceGoodsRow extends TabularSectionRow{get price_type(){return this._getter('price_type');}set price_type(v){this._setter('price_type',v);}get date(){return this._getter('date');}set date(v){this._setter('date',v);}get nom_characteristic(){return this._getter('nom_characteristic');}set nom_characteristic(v){this._setter('nom_characteristic',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get currency(){return this._getter('currency');}set currency(v){this._setter('currency',v);}}$p.DpBuilder_priceGoodsRow=DpBuilder_priceGoodsRow;$p.dp.create('builder_price');/**
* ### Обработка ЗаказПокупателя
* Рисовалка
* @class DpBuyers_order
* @extends DataProcessorObj
* @constructor 
*/class DpBuyers_order extends DataProcessorObj{get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get sys(){return this._getter('sys');}set sys(v){this._setter('sys',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get height(){return this._getter('height');}set height(v){this._setter('height',v);}get depth(){return this._getter('depth');}set depth(v){this._setter('depth',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get first_cost(){return this._getter('first_cost');}set first_cost(v){this._setter('first_cost',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}get discount_percent_internal(){return this._getter('discount_percent_internal');}set discount_percent_internal(v){this._setter('discount_percent_internal',v);}get discount(){return this._getter('discount');}set discount(v){this._setter('discount',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get shipping_date(){return this._getter('shipping_date');}set shipping_date(v){this._setter('shipping_date',v);}get client_number(){return this._getter('client_number');}set client_number(v){this._setter('client_number',v);}get inn(){return this._getter('inn');}set inn(v){this._setter('inn',v);}get shipping_address(){return this._getter('shipping_address');}set shipping_address(v){this._setter('shipping_address',v);}get phone(){return this._getter('phone');}set phone(v){this._setter('phone',v);}get price_internal(){return this._getter('price_internal');}set price_internal(v){this._setter('price_internal',v);}get amount_internal(){return this._getter('amount_internal');}set amount_internal(v){this._setter('amount_internal',v);}get base_block(){return this._getter('base_block');}set base_block(v){this._setter('base_block',v);}get product_params(){return this._getter_ts('product_params');}set product_params(v){this._setter_ts('product_params',v);}get production(){return this._getter_ts('production');}set production(v){this._setter_ts('production',v);}get glass_specification(){return this._getter_ts('glass_specification');}set glass_specification(v){this._setter_ts('glass_specification',v);}get specification(){return this._getter_ts('specification');}set specification(v){this._setter_ts('specification',v);}get charges_discounts(){return this._getter_ts('charges_discounts');}set charges_discounts(v){this._setter_ts('charges_discounts',v);}}$p.DpBuyers_order=DpBuyers_order;class DpBuyers_orderProduct_paramsRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get param(){return this._getter('param');}set param(v){this._setter('param',v);}get value(){return this._getter('value');}set value(v){this._setter('value',v);}get hide(){return this._getter('hide');}set hide(v){this._setter('hide',v);}}$p.DpBuyers_orderProduct_paramsRow=DpBuyers_orderProduct_paramsRow;class DpBuyers_orderProductionRow extends TabularSectionRow{get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get height(){return this._getter('height');}set height(v){this._setter('height',v);}get depth(){return this._getter('depth');}set depth(v){this._setter('depth',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get note(){return this._getter('note');}set note(v){this._setter('note',v);}get first_cost(){return this._getter('first_cost');}set first_cost(v){this._setter('first_cost',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get ordn(){return this._getter('ordn');}set ordn(v){this._setter('ordn',v);}get qty(){return this._getter('qty');}set qty(v){this._setter('qty',v);}}$p.DpBuyers_orderProductionRow=DpBuyers_orderProductionRow;class DpBuyers_orderGlass_specificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get sorting(){return this._getter('sorting');}set sorting(v){this._setter('sorting',v);}get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}}$p.DpBuyers_orderGlass_specificationRow=DpBuyers_orderGlass_specificationRow;class DpBuyers_orderSpecificationRow extends TabularSectionRow{get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get dop(){return this._getter('dop');}set dop(v){this._setter('dop',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get handle_height_base(){return this._getter('handle_height_base');}set handle_height_base(v){this._setter('handle_height_base',v);}get handle_height_min(){return this._getter('handle_height_min');}set handle_height_min(v){this._setter('handle_height_min',v);}get handle_height_max(){return this._getter('handle_height_max');}set handle_height_max(v){this._setter('handle_height_max',v);}get contraction(){return this._getter('contraction');}set contraction(v){this._setter('contraction',v);}get contraction_option(){return this._getter('contraction_option');}set contraction_option(v){this._setter('contraction_option',v);}get coefficient(){return this._getter('coefficient');}set coefficient(v){this._setter('coefficient',v);}get flap_weight_min(){return this._getter('flap_weight_min');}set flap_weight_min(v){this._setter('flap_weight_min',v);}get flap_weight_max(){return this._getter('flap_weight_max');}set flap_weight_max(v){this._setter('flap_weight_max',v);}get side(){return this._getter('side');}set side(v){this._setter('side',v);}get cnn_side(){return this._getter('cnn_side');}set cnn_side(v){this._setter('cnn_side',v);}get offset_option(){return this._getter('offset_option');}set offset_option(v){this._setter('offset_option',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get transfer_option(){return this._getter('transfer_option');}set transfer_option(v){this._setter('transfer_option',v);}get is_main_specification_row(){return this._getter('is_main_specification_row');}set is_main_specification_row(v){this._setter('is_main_specification_row',v);}get is_set_row(){return this._getter('is_set_row');}set is_set_row(v){this._setter('is_set_row',v);}get is_procedure_row(){return this._getter('is_procedure_row');}set is_procedure_row(v){this._setter('is_procedure_row',v);}get is_order_row(){return this._getter('is_order_row');}set is_order_row(v){this._setter('is_order_row',v);}get origin(){return this._getter('origin');}set origin(v){this._setter('origin',v);}}$p.DpBuyers_orderSpecificationRow=DpBuyers_orderSpecificationRow;class DpBuyers_orderCharges_discountsRow extends TabularSectionRow{get nom_kind(){return this._getter('nom_kind');}set nom_kind(v){this._setter('nom_kind',v);}get discount_percent(){return this._getter('discount_percent');}set discount_percent(v){this._setter('discount_percent',v);}}$p.DpBuyers_orderCharges_discountsRow=DpBuyers_orderCharges_discountsRow;$p.dp.create('buyers_order');/**
* ### Обработка builder_lay_impost
* Импосты и раскладки
* @class DpBuilder_lay_impost
* @extends DataProcessorObj
* @constructor 
*/class DpBuilder_lay_impost extends DataProcessorObj{get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get split(){return this._getter('split');}set split(v){this._setter('split',v);}get elm_by_y(){return this._getter('elm_by_y');}set elm_by_y(v){this._setter('elm_by_y',v);}get step_by_y(){return this._getter('step_by_y');}set step_by_y(v){this._setter('step_by_y',v);}get align_by_y(){return this._getter('align_by_y');}set align_by_y(v){this._setter('align_by_y',v);}get inset_by_y(){return this._getter('inset_by_y');}set inset_by_y(v){this._setter('inset_by_y',v);}get elm_by_x(){return this._getter('elm_by_x');}set elm_by_x(v){this._setter('elm_by_x',v);}get step_by_x(){return this._getter('step_by_x');}set step_by_x(v){this._setter('step_by_x',v);}get align_by_x(){return this._getter('align_by_x');}set align_by_x(v){this._setter('align_by_x',v);}get inset_by_x(){return this._getter('inset_by_x');}set inset_by_x(v){this._setter('inset_by_x',v);}get w(){return this._getter('w');}set w(v){this._setter('w',v);}get h(){return this._getter('h');}set h(v){this._setter('h',v);}}$p.DpBuilder_lay_impost=DpBuilder_lay_impost;$p.dp.create('builder_lay_impost');/**
* ### Обработка builder_pen
* Метаданные инструмента pen (рисование профилей) графического построителя
* @class DpBuilder_pen
* @extends DataProcessorObj
* @constructor 
*/class DpBuilder_pen extends DataProcessorObj{get elm_type(){return this._getter('elm_type');}set elm_type(v){this._setter('elm_type',v);}get inset(){return this._getter('inset');}set inset(v){this._setter('inset',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get bind_generatrix(){return this._getter('bind_generatrix');}set bind_generatrix(v){this._setter('bind_generatrix',v);}get bind_node(){return this._getter('bind_node');}set bind_node(v){this._setter('bind_node',v);}}$p.DpBuilder_pen=DpBuilder_pen;$p.dp.create('builder_pen');/**
* ### Обработка builder_text
* Метаданные инструмента text графического построителя
* @class DpBuilder_text
* @extends DataProcessorObj
* @constructor 
*/class DpBuilder_text extends DataProcessorObj{get text(){return this._getter('text');}set text(v){this._setter('text',v);}get font_family(){return this._getter('font_family');}set font_family(v){this._setter('font_family',v);}get bold(){return this._getter('bold');}set bold(v){this._setter('bold',v);}get font_size(){return this._getter('font_size');}set font_size(v){this._setter('font_size',v);}get angle(){return this._getter('angle');}set angle(v){this._setter('angle',v);}get align(){return this._getter('align');}set align(v){this._setter('align',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get x(){return this._getter('x');}set x(v){this._setter('x',v);}get y(){return this._getter('y');}set y(v){this._setter('y',v);}}$p.DpBuilder_text=DpBuilder_text;$p.dp.create('builder_text');/**
* ### Отчет materials_demand
* Потребность в материалах
* @class RepMaterials_demand
* @extends DataProcessorObj
* @constructor 
*/class RepMaterials_demand extends DataProcessorObj{get calc_order(){return this._getter('calc_order');}set calc_order(v){this._setter('calc_order',v);}get formula(){return this._getter('formula');}set formula(v){this._setter('formula',v);}get scheme(){return this._getter('scheme');}set scheme(v){this._setter('scheme',v);}get production(){return this._getter_ts('production');}set production(v){this._setter_ts('production',v);}get specification(){return this._getter_ts('specification');}set specification(v){this._setter_ts('specification',v);}}$p.RepMaterials_demand=RepMaterials_demand;class RepMaterials_demandProductionRow extends TabularSectionRow{get use(){return this._getter('use');}set use(v){this._setter('use',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get qty(){return this._getter('qty');}set qty(v){this._setter('qty',v);}}$p.RepMaterials_demandProductionRow=RepMaterials_demandProductionRow;class RepMaterials_demandSpecificationRow extends TabularSectionRow{get calc_order(){return this._getter('calc_order');}set calc_order(v){this._setter('calc_order',v);}get product(){return this._getter('product');}set product(v){this._setter('product',v);}get cnstr(){return this._getter('cnstr');}set cnstr(v){this._setter('cnstr',v);}get elm(){return this._getter('elm');}set elm(v){this._setter('elm',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get article(){return this._getter('article');}set article(v){this._setter('article',v);}get clr(){return this._getter('clr');}set clr(v){this._setter('clr',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get nom_kind(){return this._getter('nom_kind');}set nom_kind(v){this._setter('nom_kind',v);}get qty(){return this._getter('qty');}set qty(v){this._setter('qty',v);}get len(){return this._getter('len');}set len(v){this._setter('len',v);}get width(){return this._getter('width');}set width(v){this._setter('width',v);}get s(){return this._getter('s');}set s(v){this._setter('s',v);}get material(){return this._getter('material');}set material(v){this._setter('material',v);}get grouping(){return this._getter('grouping');}set grouping(v){this._setter('grouping',v);}get totqty(){return this._getter('totqty');}set totqty(v){this._setter('totqty',v);}get totqty1(){return this._getter('totqty1');}set totqty1(v){this._setter('totqty1',v);}get alp1(){return this._getter('alp1');}set alp1(v){this._setter('alp1',v);}get alp2(){return this._getter('alp2');}set alp2(v){this._setter('alp2',v);}get sz(){return this._getter('sz');}set sz(v){this._setter('sz',v);}get price(){return this._getter('price');}set price(v){this._setter('price',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get amount_marged(){return this._getter('amount_marged');}set amount_marged(v){this._setter('amount_marged',v);}}$p.RepMaterials_demandSpecificationRow=RepMaterials_demandSpecificationRow;$p.rep.create('materials_demand');/**
* ### Отчет selling
* Продажи
* @class RepSelling
* @extends DataProcessorObj
* @constructor 
*/class RepSelling extends DataProcessorObj{get data(){return this._getter_ts('data');}set data(v){this._setter_ts('data',v);}}$p.RepSelling=RepSelling;class RepSellingDataRow extends TabularSectionRow{get period(){return this._getter('period');}set period(v){this._setter('period',v);}get register(){return this._getter('register');}set register(v){this._setter('register',v);}get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get quantity(){return this._getter('quantity');}set quantity(v){this._setter('quantity',v);}get amount(){return this._getter('amount');}set amount(v){this._setter('amount',v);}get vat_amount(){return this._getter('vat_amount');}set vat_amount(v){this._setter('vat_amount',v);}get discount(){return this._getter('discount');}set discount(v){this._setter('discount',v);}}$p.RepSellingDataRow=RepSellingDataRow;$p.rep.create('selling');/**
* ### Отчет goods
* Товары на складах
* @class RepGoods
* @extends DataProcessorObj
* @constructor 
*/class RepGoods extends DataProcessorObj{get data(){return this._getter_ts('data');}set data(v){this._setter_ts('data',v);}}$p.RepGoods=RepGoods;class RepGoodsDataRow extends TabularSectionRow{get period(){return this._getter('period');}set period(v){this._setter('period',v);}get register(){return this._getter('register');}set register(v){this._setter('register',v);}get warehouse(){return this._getter('warehouse');}set warehouse(v){this._setter('warehouse',v);}get nom(){return this._getter('nom');}set nom(v){this._setter('nom',v);}get characteristic(){return this._getter('characteristic');}set characteristic(v){this._setter('characteristic',v);}get initial_balance(){return this._getter('initial_balance');}set initial_balance(v){this._setter('initial_balance',v);}get debit(){return this._getter('debit');}set debit(v){this._setter('debit',v);}get credit(){return this._getter('credit');}set credit(v){this._setter('credit',v);}get final_balance(){return this._getter('final_balance');}set final_balance(v){this._setter('final_balance',v);}get amount_initial_balance(){return this._getter('amount_initial_balance');}set amount_initial_balance(v){this._setter('amount_initial_balance',v);}get amount_debit(){return this._getter('amount_debit');}set amount_debit(v){this._setter('amount_debit',v);}get amount_credit(){return this._getter('amount_credit');}set amount_credit(v){this._setter('amount_credit',v);}get amount_final_balance(){return this._getter('amount_final_balance');}set amount_final_balance(v){this._setter('amount_final_balance',v);}}$p.RepGoodsDataRow=RepGoodsDataRow;$p.rep.create('goods');/**
* ### Отчет invoice_execution
* Исполнение заказов
* @class RepInvoice_execution
* @extends DataProcessorObj
* @constructor 
*/class RepInvoice_execution extends DataProcessorObj{get data(){return this._getter_ts('data');}set data(v){this._setter_ts('data',v);}}$p.RepInvoice_execution=RepInvoice_execution;class RepInvoice_executionDataRow extends TabularSectionRow{get period(){return this._getter('period');}set period(v){this._setter('period',v);}get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get department(){return this._getter('department');}set department(v){this._setter('department',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get invoice(){return this._getter('invoice');}set invoice(v){this._setter('invoice',v);}get pay(){return this._getter('pay');}set pay(v){this._setter('pay',v);}get pay_total(){return this._getter('pay_total');}set pay_total(v){this._setter('pay_total',v);}get pay_percent(){return this._getter('pay_percent');}set pay_percent(v){this._setter('pay_percent',v);}get shipment(){return this._getter('shipment');}set shipment(v){this._setter('shipment',v);}get shipment_total(){return this._getter('shipment_total');}set shipment_total(v){this._setter('shipment_total',v);}get shipment_percent(){return this._getter('shipment_percent');}set shipment_percent(v){this._setter('shipment_percent',v);}}$p.RepInvoice_executionDataRow=RepInvoice_executionDataRow;$p.rep.create('invoice_execution');/**
* ### Отчет cash
* Денежные средства
* @class RepCash
* @extends DataProcessorObj
* @constructor 
*/class RepCash extends DataProcessorObj{get data(){return this._getter_ts('data');}set data(v){this._setter_ts('data',v);}}$p.RepCash=RepCash;class RepCashDataRow extends TabularSectionRow{get period(){return this._getter('period');}set period(v){this._setter('period',v);}get register(){return this._getter('register');}set register(v){this._setter('register',v);}get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get bank_account_cashbox(){return this._getter('bank_account_cashbox');}set bank_account_cashbox(v){this._setter('bank_account_cashbox',v);}get initial_balance(){return this._getter('initial_balance');}set initial_balance(v){this._setter('initial_balance',v);}get debit(){return this._getter('debit');}set debit(v){this._setter('debit',v);}get credit(){return this._getter('credit');}set credit(v){this._setter('credit',v);}get final_balance(){return this._getter('final_balance');}set final_balance(v){this._setter('final_balance',v);}}$p.RepCashDataRow=RepCashDataRow;$p.rep.create('cash');/**
* ### Отчет mutual_settlements
* Взаиморасчеты
* @class RepMutual_settlements
* @extends DataProcessorObj
* @constructor 
*/class RepMutual_settlements extends DataProcessorObj{get data(){return this._getter_ts('data');}set data(v){this._setter_ts('data',v);}}$p.RepMutual_settlements=RepMutual_settlements;class RepMutual_settlementsDataRow extends TabularSectionRow{get period(){return this._getter('period');}set period(v){this._setter('period',v);}get register(){return this._getter('register');}set register(v){this._setter('register',v);}get organization(){return this._getter('organization');}set organization(v){this._setter('organization',v);}get trans(){return this._getter('trans');}set trans(v){this._setter('trans',v);}get partner(){return this._getter('partner');}set partner(v){this._setter('partner',v);}get initial_balance(){return this._getter('initial_balance');}set initial_balance(v){this._setter('initial_balance',v);}get debit(){return this._getter('debit');}set debit(v){this._setter('debit',v);}get credit(){return this._getter('credit');}set credit(v){this._setter('credit',v);}get final_balance(){return this._getter('final_balance');}set final_balance(v){this._setter('final_balance',v);}}$p.RepMutual_settlementsDataRow=RepMutual_settlementsDataRow;$p.rep.create('mutual_settlements');})();};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const request = __webpack_require__(19);

module.exports = async (ctx, $p) => {

  // если указано ограничение по ip - проверяем
  const { restrict_ips } = ctx.app;
  if (restrict_ips.length && restrict_ips.indexOf(ctx.req.headers['x-real-ip'] || ctx.ip) == -1) {
    ctx.status = 403;
    ctx.body = 'ip restricted:' + ctx.ip;
    return;
  }

  let { authorization, suffix } = ctx.req.headers;
  if (!authorization || !suffix) {
    ctx.status = 403;
    ctx.body = 'access denied';
    return;
  }

  const { couch_local, zone } = $p.job_prm;
  const _auth = { 'username': '' };
  const resp = await new Promise((resolve, reject) => {

    try {
      const auth = new Buffer(authorization.substr(6), 'base64').toString();
      const sep = auth.indexOf(':');
      _auth.pass = auth.substr(sep + 1);
      _auth.username = auth.substr(0, sep);

      while (suffix.length < 4) {
        suffix = '0' + suffix;
      }

      _auth.suffix = suffix;

      request({
        url: couch_local + zone + '_doc_' + suffix,
        auth: { 'user': _auth.username, 'pass': _auth.pass, sendImmediately: true
        }
      }, (e, r, body) => {
        if (r && r.statusCode < 201) {
          $p.wsql.set_user_param("user_name", _auth.username);
          resolve(true);
        } else {
          ctx.status = r && r.statusCode || 500;
          ctx.body = body || e && e.message;
          resolve(false);
        }
      });
    } catch (e) {
      ctx.status = 500;
      ctx.body = e.message;
      resolve(false);
    }
  });

  return resp && Object.assign(_auth, { user: $p.cat.users.by_id(_auth.username) });
};

/***/ }),
/* 19 */
/***/ (function(module, exports) {

module.exports = require("request");

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const debug = __webpack_require__(0)('wb:router');
debug('start');

const Router = __webpack_require__(21);
const router = Router({ prefix: '/prm' });

router.loadMethods().get('/:class/:ref', __webpack_require__(2)).post('/:class/:ref', __webpack_require__(22));

module.exports = router;

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = require("koa-better-router");

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const debug = __webpack_require__(0)('wb:post');
const $p = __webpack_require__(1);
const { serialize_prod } = __webpack_require__(2);

debug('required');

// формирует json описания продукции заказа
async function calc_order(ctx, next) {

  const { _query, params } = ctx;
  const ref = (params.ref || '').toLowerCase();
  const res = { ref, production: [] };
  const { cat, doc, utils, job_prm } = $p;
  const { contracts, nom, inserts, clrs } = cat;

  try {
    if (!utils.is_guid(res.ref)) {
      ctx.status = 404;
      ctx.body = `Параметр запроса ref=${res.ref} не соответствует маске уникального идентификатора`;
      return;
    }

    const o = await doc.calc_order.get(res.ref, 'promise');
    const dp = $p.dp.buyers_order.create();
    dp.calc_order = o;

    let prod;
    if (o.is_new()) {
      await o.after_create();
    } else {
      if (o.posted) {
        ctx.status = 403;
        ctx.body = `Запрещено изменять проведенный заказ ${res.ref}`;
        return o.unload();
      }
      if (o.obj_delivery_state == 'Отправлен' && _query.obj_delivery_state != 'Отозван') {
        ctx.status = 403;
        ctx.body = `Запрещено изменять отправленный заказ ${res.ref} - его сначала нужно отозвать`;
        return o.unload();
      }
      prod = await o.load_production();
      o.production.clear();
    }

    // включаем режим загрузки, чтобы в пустую не выполнять обработчики при изменении реквизитов
    o._data._loading = true;

    // заполняем шапку заказа
    o.date = utils.moment(_query.date).toDate();
    o.number_internal = _query.number_doc;
    if (_query.note) {
      o.note = _query.note;
    }
    o.obj_delivery_state = 'Черновик';
    if (_query.partner) {
      o.partner = _query.partner;
    }
    if (o.contract.empty() || _query.partner) {
      o.contract = contracts.by_partner_and_org(o.partner, o.organization);
    }
    o.vat_consider = o.vat_included = true;

    // допреквизиты: бежим структуре входного параметра, если свойства нет в реквизитах, проверяем доп
    for (const fld in _query) {
      if (o._metadata(fld)) {
        continue;
      }
      const property = job_prm.properties[fld];
      if (property && !property.empty()) {
        let finded;
        o.extra_fields.find_rows({ property }, row => {
          row.value = _query[fld];
          finded = true;
          return false;
        });
        if (!finded) {
          o.extra_fields.add({ property, value: _query[fld] });
        }
      }
    }

    // подготавливаем массив продукций
    for (let row of _query.production) {
      if (!nom.by_ref[row.nom] || nom.by_ref[row.nom].is_new()) {
        if (!inserts.by_ref[row.nom] || inserts.by_ref[row.nom].is_new()) {
          ctx.status = 404;
          ctx.body = `Не найдена номенклатура или вставка ${row.nom}`;
          return o.unload();
        }
        row.inset = row.nom;
        delete row.nom;
      }
      if (row.clr && row.clr != utils.blank.guid && !clrs.by_ref[row.clr]) {
        ctx.status = 404;
        ctx.body = `Не найден цвет ${row.clr}`;
        return o.unload();
      }
      const prow = dp.production.add(row);
    }

    // добавляем строки продукций и материалов
    const ax = await o.process_add_product_list(dp);
    await Promise.all(ax);
    o.obj_delivery_state = _query.obj_delivery_state == 'Отозван' ? 'Отозван' : _query.obj_delivery_state == 'Черновик' ? 'Черновик' : 'Отправлен';

    // записываем
    await o.save();

    // формируем ответ
    serialize_prod({ o, prod, ctx });
    o.unload();
  } catch (err) {
    ctx.status = 500;
    ctx.body = err ? err.stack || err.message : `Ошибка при расчете параметрической спецификации заказа ${res.ref}`;
    debug(err);
  }
}

// формирует json описания продукций массива заказов
async function array(ctx, next) {

  ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  //ctx.body = res;
}

// сохраняет объект в локальном хранилище отдела абонента
async function store(ctx, next) {

  // данные авторизации получаем из контекста
  let { _auth, _query } = ctx;

  if (typeof _query == 'object') {
    const { doc } = $p.adapters.pouch.remote;
    if (Array.isArray(_query)) {
      _query = { rows: _query };
    }
    _query._id = `_local/store.${_auth.suffix}.${ctx.params.ref || 'mapping'}`;
    ctx.body = await doc.get(_query._id).catch(err => null).then(rev => {
      if (rev) {
        _query._rev = rev._rev;
      }
    }).then(() => doc.put(_query));
  }
}

// возвращает список документов
async function docs(ctx, next) {

  const { _auth, params, _query } = ctx;
  const { couch_local, zone } = $p.job_prm;

  const { selector } = _query;

  //class__name (имя класса) должен быть всегда
  if (!selector.class_name) {
    ctx.status = 403;
    ctx.body = {
      error: true,
      message: `Не указан класс объектов в селекторе`
    };
    return;
  }

  const point = selector.class_name.indexOf('.');
  const md_class = selector.class_name.substr(0, point);
  const data_mgr = $p.md.mgr_by_class_name(selector.class_name);
  const md = data_mgr.metadata();

  //Работаем только с данными, кешируемыми в doc, для остального есть отдельный endpoint
  if (md.cachable == 'doc') {
    //Сразу соединяемся с pouch базы партнера, чтобы брать данные из нее
    const pouch = new $p.classes.PouchDB(couch_local + zone + '_doc_' + _auth.suffix, {
      auth: {
        username: _auth.username,
        password: _auth.pass
      },
      skip_setup: true
    });

    const { class_name } = selector;

    //Если в селекторе есть _id, то запрошен перечень конкретных ссылок, и mango query не нужен
    if ('_id' in selector) {
      const keys = [];

      if (Array.isArray(selector._id)) {
        selector._id.forEach(key => {
          keys.push(class_name + "|" + key);
        });
      } else {
        keys.push(class_name + "|" + selector._id);
      }

      const res = await pouch.allDocs({ 'include_docs': true, 'inclusive_end': true, 'keys': keys });

      ctx.body = res;
    } else {
      //Нужен mango query, поэтому пересоберем селектор, чтобы были правильные поля в правильном порядке
      const _s = { 'class_name': class_name };

      if (md_class == 'doc') {
        if (selector.date) {
          _s.date = selector.date;
        } else {
          _s.date = { '$ne': null };
        }
      }

      if (selector.search) {
        _s.search = selector.search;
      } else {
        _s.search = { $ne: null };
      }

      const predefined_keys = new Set();
      predefined_keys.add('class_name');
      predefined_keys.add('date');
      predefined_keys.add('search');

      //Добавим в селектор остальные поля, кроме class_name, date и search
      for (const key in selector) {
        if (!predefined_keys.has(key)) {
          _s[key] = selector[key];
        }
      }

      _query.selector = _s;

      const res = await pouch.find(_query);

      //расчет презентаций - кода, номера документа, наименования и т.д. для ссылочных реквизитов
      res.docs.forEach(doc => {
        representation(doc, md);
      });

      ctx.body = res;
    }
  } else {
    ctx.body = [];
  }
}

//Функция смотрит на реквизиты объекта, и подменяет ссылки на объекты,
//содержащие основные данные - код, наименование, номер документа, и саму ссылку
function representation(obj, md) {
  const fake_data_mgr = $p.doc.calc_order;

  function get_new_field(_obj, field, type) {
    const data_mgr = fake_data_mgr.value_mgr(_obj, field, type, false, _obj[field]);

    if (data_mgr && (data_mgr.metadata().cachable == 'ram' || data_mgr.metadata().cachable == 'doc_ram')) {
      const field_obj = data_mgr.get(_obj[field]);

      const point = data_mgr.class_name.indexOf('.');
      const md_class = data_mgr.class_name.substr(0, point);

      const new_field = { 'ref': _obj[field] };
      new_field._mixin(field_obj, md_class == 'doc' ? ['number_doc', 'date'] : ['id', 'name'], []);

      _obj[field] = new_field;

      return;
    }
    return;
  }

  //реквизиты
  for (const field in md.fields) {
    if (obj[field]) {
      get_new_field(obj, field, md.fields[field].type);
    }
  }

  //табличные части
  for (const ts in md.tabular_sections) {
    if (obj[ts]) {
      const fields = md.tabular_sections[ts].fields;

      obj[ts].forEach(row => {
        //реквизиты табличных частей
        for (const field in fields) {
          if (row[field]) {
            get_new_field(row, field, fields[field].type);
          }
        }
      });
    }
  }
}

// возаращает конкретный документ по ссылке
async function doc(ctx, next) {

  const { _query, params, _auth } = ctx;
  const ref = (params.ref || '').toLowerCase();
  const { couch_local, zone } = $p.job_prm;

  const data_mgr = $p.md.mgr_by_class_name(params.class);
  const md = data_mgr.metadata();
  const res = { docs: [] };

  if (md.cachable == 'doc') {
    const pouch = new $p.classes.PouchDB(couch_local + zone + '_doc_' + _auth.suffix, {
      auth: {
        username: _auth.username,
        password: _auth.pass
      },
      skip_setup: true
    });

    const obj = await pouch.get(params.class + '|' + ref);
    res.docs.push(obj);
  } else {
    const obj = data_mgr.get(ref);
    res.docs.push(obj);
  }

  representation(res.docs[0], md);

  ctx.body = res;
}

//Запускает загрузку данных из doc
async function load_doc_ram(ctx, next) {
  $p.adapters.pouch.load_doc_ram();
  ctx.body = { 'doc_ram_loading_started': true };
}

module.exports = async (ctx, next) => {

  try {
    switch (ctx.params.class) {
      case 'doc.calc_order':
        return await calc_order(ctx, next);
      case 'array':
        return await array(ctx, next);
      case 'store':
        return await store(ctx, next);
      case 'docs':
        return await docs(ctx, next);
      case 'load_doc_ram':
        return load_doc_ram(ctx, next);
      default:
        if (/(doc|cat|cch)\./.test(ctx.params.class)) {
          return await doc(ctx, next);
        }

        ctx.status = 404;
        ctx.body = {
          error: true,
          message: `Неизвестный класс ${ctx.params.class}`
        };
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = {
      error: true,
      message: err.stack || err.message
    };
    debug(err);
  }
};

/***/ })
/******/ ]);
//# sourceMappingURL=index.js.map