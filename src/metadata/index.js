
// дополняем прототип Object методами observe
require('./observe');

const debug = require('debug')('wb:meta');

// конструктор MetaEngine
const MetaEngine = require('../../node_modules/metadata-core/index').default
  .plugin(require('../../node_modules/metadata-pouchdb/index').default);
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
  await pouch.log_in(user_node.username, user_node.password);
  $p.md.emit('pouch_data_loaded', []);
  pouch.local.ram.changes({
    since: 'now',
    live: true,
    include_docs: true
  }).on('change', (change) => {
    // формируем новый
    pouch.load_changes({docs: [change.doc]});
  }).on('error', (err) => {
    // handle errors
  });

  debug('logged in');

})();

module.exports = $p;




