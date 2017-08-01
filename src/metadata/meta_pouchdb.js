/**
 * Обеспечивает совместимость DataManager с v0.12
 */

module.exports = function(proto) {
  Object.defineProperties(proto, {

    // pouch_db: {
    //   get: function() {
    //     return this.adapter.db(this);
    //   }
    // },
    //
    // pouch_load_view: {
    //   value: function (view) {
    //     return this.adapter.load_view(this, view);
    //   }
    // },
    //
    // pouch_find_rows: {
    //   get: function () {
    //     return this.find_rows_remote
    //   }
    // },

    handle_event: {
      value: function (obj, name, attr) {
        this.emit(name, obj, attr);
      }
    },

  });
}
