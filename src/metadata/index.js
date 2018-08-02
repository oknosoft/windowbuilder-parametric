
const debug = require('debug')('wb:meta');

// конструктор MetaEngine
import metaCore from 'metadata-core';
import metaPouchdb from 'metadata-pouchdb';
const MetaEngine = metaCore.plugin(metaPouchdb);

// функция установки параметров сеанса
const settings = require('./config/report.settings');

// функция инициализации структуры метаданных
const meta_init = require('./src/metadata/init.js');

debug('required');

// создаём контекст MetaEngine
const $p = global.$p = new MetaEngine();
debug('created');

// параметры сеанса инициализируем сразу
$p.wsql.init(settings);

// инициализируем параметры сеанса и метаданные
(async () => {

  // реквизиты подключения к couchdb
  const {user_node} = settings();

  // выполняем скрипт инициализации метаданных
  meta_init($p);

  // сообщяем адаптерам пути, суффиксы и префиксы
  const {wsql, job_prm, adapters: {pouch}} = $p;
  pouch.init(wsql, job_prm);

  // // подключим модификаторы
  // modifiers($p);

  // загружаем кешируемые справочники в ram и начинаем следить за изменениями ram
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
        debug(`change error ${err}`);
      });
      debug(`loadind to ram: READY`);
    },
  });

})();

export default $p;




