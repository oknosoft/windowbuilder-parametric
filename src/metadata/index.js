// дополняем прототип Object методами observe
require('./observe');

const debug = require('debug')('wb:meta');

// конструктор MetaEngine
const MetaEngine = require('metadata-core')
  .plugin(require('metadata-pouchdb'));
debug('required');

// создаём контекст MetaEngine
const $p = new MetaEngine();
debug('created');

// эмулируем излучатель событий dhtmlx
require('./dhtmlx_eve')($p);

// обеспечиваем совместимость DataManager с v0.12
require('./meta_pouchdb')($p.classes.DataManager.prototype);


// инициализируем параметры сеанса и метаданные
(async () => {

  // функция установки параметров сеанса
  const config_init = require('../../config/report.settings');

  // функция инициализации структуры метаданных
  const meta_init = require('./init');

  // модификаторы data-объектов
  const modifiers = require('./modifiers');

  // реквизиты подключения к couchdb
  const {user_node} = config_init();

  // инициализируем метаданные
  $p.wsql.init(config_init, meta_init);

  // подключим модификаторы
  modifiers($p);
  debug('inited & modified');

  // загружаем кешируемые справочники в ram и начинаем следить за изменениями ram
  const {pouch} = $p.adapters;
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
        // формируем новый
        pouch.load_changes({docs: [change.doc]});
      }).on('error', (err) => {
        // handle errors
      });
      debug(`loadind to ram: READY`);
    },
  });

})();

module.exports = $p;




