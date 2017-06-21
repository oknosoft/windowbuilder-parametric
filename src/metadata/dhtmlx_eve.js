/**
 * Эмулирует излучатель событий dhtmlx
 */

module.exports = function($p) {

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
      if(ev){
        $p.md.off(ev[0], ev[1]);
        delete this.cache[id];
      }
    }

  };

}
