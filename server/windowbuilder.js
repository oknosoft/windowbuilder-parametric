'use strict';

const $p = require('./metadata');

const debug = require('debug')('wb:paper');

const paper = require('paper/dist/paper-core.js');
debug('required');

class Editor extends paper.PaperScope {

  constructor(format = 'png'){

    super();

    // уточняем константы
    consts.tune_paper(this.settings);

    // создаём экземпляр проекта Scheme
    this.create_scheme(format);
  }

  create_scheme(format = 'png') {
    const _canvas = paper.createCanvas(480, 480, format); // собственно, канвас
    _canvas.style.backgroundColor = "#f9fbfa";
    this.setup(_canvas);
    new Scheme(_canvas, this);
  }
};
$p.Editor = Editor;


/**
 * ### Абстрактное заполнение
 * Общие свойства заполнения и контура
 *
 * @module geometry
 * @submodule abstract_filling
 *
 * Created by Evgeniy Malyarov on 12.05.2017.
 */

const AbstractFilling = (superclass) => class extends superclass {

  /**
   * Тест положения контура в изделии
   */
  is_pos(pos) {
    // если в изделии один контур или если контур является створкой, он занимает одновременно все положения
    if(this.project.contours.count == 1 || this.parent){
      return true;
    }

    // если контур реально верхний или правый и т.д. - возвращаем результат сразу
    let res = Math.abs(this.bounds[pos] - this.project.bounds[pos]) < consts.sticking_l;

    if(!res){
      let rect;
      if(pos == "top"){
        rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.topRight.add([0, -200]));
      }
      else if(pos == "left"){
        rect = new paper.Rectangle(this.bounds.topLeft, this.bounds.bottomLeft.add([-200, 0]));
      }
      else if(pos == "right"){
        rect = new paper.Rectangle(this.bounds.topRight, this.bounds.bottomRight.add([200, 0]));
      }
      else if(pos == "bottom"){
        rect = new paper.Rectangle(this.bounds.bottomLeft, this.bounds.bottomRight.add([0, 200]));
      }

      res = !this.project.contours.some((l) => {
        return l != this && rect.intersects(l.bounds);
      });
    }

    return res;
  }

  /**
   * Возвращает структуру профилей по сторонам
   */
  profiles_by_side(side) {
    // получаем таблицу расстояний профилей от рёбер габаритов
    const {profiles} = this;
    const bounds = {
      left: Infinity,
      top: Infinity,
      bottom: -Infinity,
      right: -Infinity
    };
    const res = {};
    const ares = [];

    function by_side(name) {
      ares.some((elm) => {
        if(elm[name] == bounds[name]){
          res[name] = elm.profile;
          return true;
        }
      })
    }

    if (profiles.length) {
      profiles.forEach((profile) => {
        const {b, e} = profile;
        const x = b.x + e.x;
        const y = b.y + e.y;
        if(x < bounds.left){
          bounds.left = x;
        }
        if(x > bounds.right){
          bounds.right = x;
        }
        if(y < bounds.top){
          bounds.top = y;
        }
        if(y > bounds.bottom){
          bounds.bottom = y;
        }
        ares.push({
          profile: profile,
          left: x,
          top: y,
          bottom: y,
          right: x
        });
      });
      if (side) {
        by_side(side);
        return res[side];
      }

      Object.keys(bounds).forEach(by_side);
    }

    return res;
  }

  /**
   * Возвращает массив вложенных контуров текущего контура
   * @property contours
   * @for Contour
   * @type Array
   */
  get contours() {
    return this.children.filter((elm) => elm instanceof Contour);
  }

  /**
   * Cлужебная группа размерных линий
   */
  get l_dimensions() {
    const {_attr} = this;
    return _attr._dimlns || (_attr._dimlns = new DimensionDrawer({parent: this}));
  }

  /**
   * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
   */
  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLineCustom}).forEach((dl) => {
      bounds = bounds.unite(dl.bounds);
    });
    return bounds;
  }

}

/**
 * ### Контур (слой) изделия
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule contour
 */

/* global paper, $p */

/**
 * ### Сегмент заполнения
 * содержит информацию о примыкающем профиле и координатах начала и конца
 * @class GlassSegment
 * @constructor
 */
class GlassSegment {

  constructor(profile, b, e, outer) {

    this.profile = profile;
    this.b = b.clone();
    this.e = e.clone();
    this.outer = !!outer;

    this.segment();

  }

  segment() {

    let gen;

    if(this.profile.children.some((addl) => {

        if(addl instanceof ProfileAddl && this.outer == addl.outer){

          if(!gen){
            gen = this.profile.generatrix;
          }

          const b = this.profile instanceof ProfileAddl ? this.profile.b : this.b;
          const e = this.profile instanceof ProfileAddl ? this.profile.e : this.e;

          // TODO: учесть импосты, привязанные к добору

          if(b.is_nearest(gen.getNearestPoint(addl.b), true) && e.is_nearest(gen.getNearestPoint(addl.e), true)){
            this.profile = addl;
            this.outer = false;
            return true;
          }
        }
      })){

      this.segment();
    }

  }

  get _sub() {
    const {sub_path} = this;
    return {
      get b() {
        return sub_path ? sub_path.firstSegment.point : new paper.Point()
      },
      set b(v) {
        sub_path && (sub_path.firstSegment.point = v);
      },
      get e() {
        return sub_path ? sub_path.lastSegment.point : new paper.Point()
      },
      set e(v) {
        sub_path && (sub_path.lastSegment.point = v);
      }
    }
  }
}

/**
 * ### Контур (слой) изделия
 * Унаследован от  [paper.Layer](http://paperjs.org/reference/layer/)
 * новые элементы попадают в активный слой-контур и не могут его покинуть
 * @class Contour
 * @constructor
 * @extends paper.Layer
 * @menuorder 30
 * @tooltip Контур (слой) изделия
 */
class Contour extends AbstractFilling(paper.Layer) {

  constructor (attr) {

    super({parent: attr.parent});

    this._attr = {};

    // за этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
    this._noti = {};

    // метод - нотификатор
    this._notifier = Object.getNotifier(this._noti);

    // строка в таблице конструкций
    if(attr.row){
      this._row = attr.row;
    }
    else{
      const {constructions} = this.project.ox;
      this._row = constructions.add({ parent: attr.parent ? attr.parent.cnstr : 0 });
      this._row.cnstr = constructions.aggregate([], ["cnstr"], "MAX") + 1;
    }

    // добавляем элементы контура
    if(this.cnstr){

      const {coordinates} = this.project.ox;

      // профили и доборы
      coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.profiles}}, (row) => {
        const profile = new Profile({row: row, parent: this});
        coordinates.find_rows({cnstr: row.cnstr, parent: {in: [row.elm, -row.elm]}, elm_type: $p.enm.elm_types.Добор}, (row) => {
          new ProfileAddl({row: row,	parent: profile});
        });
      });

      // заполнения
      coordinates.find_rows({cnstr: this.cnstr, elm_type: {in: $p.enm.elm_types.glasses}}, (row) => {
        new Filling({row: row,	parent: this});
      });

      // разрезы
      coordinates.find_rows({cnstr: this.cnstr, elm_type: $p.enm.elm_types.Водоотлив}, (row) => {
        new Sectional({row: row, parent: this});
      });

      // остальные элементы (текст)
      coordinates.find_rows({cnstr: this.cnstr, elm_type: $p.enm.elm_types.Текст}, (row) => {
        new FreeText({row: row, parent: this.l_text});
      });
    }

  }

  /**
   * Врезаем оповещение при активации слоя
   */
  activate(custom) {
    this.project._activeLayer = this;
    if(this._row){
      $p.eve.callEvent("layer_activated", [this, !custom]);
      this.project.register_update();
    }
  }


  /**
   * указатель на фурнитуру
   */
  get furn() {
    return this._row.furn;
  }
  set furn(v) {
    if(this._row.furn == v){
      return;
    }

    this._row.furn = v;

    // при необходимости устанавливаем направление открывания
    if(this.direction.empty()){
      this.project._dp.sys.furn_params.find_rows({
        param: $p.job_prm.properties.direction
      }, function (row) {
        this.direction = row.value;
        return false;
      }.bind(this._row));
    }

    // перезаполняем параметры фурнитуры
    this._row.furn.refill_prm(this);

    this.project.register_change(true);

    setTimeout($p.eve.callEvent.bind($p.eve, "furn_changed", [this]));
  }

  /**
   * Возвращает массив заполнений + створок текущего контура
   * @property glasses
   * @for Contour
   * @param [hide] {Boolean} - если истина, устанавливает для заполнений visible=false
   * @param [glass_only] {Boolean} - если истина, возвращает только заполнения
   * @returns {Array}
   */
  glasses(hide, glass_only) {
    return this.children.filter((elm) => {
      if((!glass_only && elm instanceof Contour) || elm instanceof Filling) {
        if(hide){
          elm.visible = false;
        }
        return true;
      }
    });
  }

  /**
   * Возвращает массив массивов сегментов - база для построения пути заполнений
   * @property glass_contours
   * @type Array
   */
  get glass_contours() {
    const segments = this.glass_segments;
    const res = [];
    let curr, acurr;

    // возвращает массив сегментов, которые могут следовать за текущим
    function find_next(curr){
      if(!curr.anext){
        curr.anext = [];
        segments.forEach((segm) => {
          if(segm == curr || segm.profile == curr.profile)
            return;
          // если конец нашего совпадает с началом следующего...
          // и если существует соединение нашего со следующим
          if(curr.e.is_nearest(segm.b) && curr.profile.has_cnn(segm.profile, segm.b)){

            if(segments.length < 3 || curr.e.subtract(curr.b).getDirectedAngle(segm.e.subtract(segm.b)) >= 0)
              curr.anext.push(segm);
          }

        });
      }
      return curr.anext;
    }

    // рекурсивно получает следующий сегмент, пока не уткнётся в текущий
    function go_go(segm){
      const anext = find_next(segm);
      for(let i = 0; i < anext.length; i++){
        if(anext[i] == curr){
          return anext;
        }
        else if(acurr.every((el) => el != anext[i] )){
          acurr.push(anext[i]);
          return go_go(anext[i]);
        }
      }
    }

    while(segments.length){

      curr = segments[0];
      acurr = [curr];
      if(go_go(curr) && acurr.length > 1){
        res.push(acurr);
      }

      // удаляем из segments уже задействованные или не пригодившиеся сегменты
      acurr.forEach((el) => {
        const ind = segments.indexOf(el);
        if(ind != -1){
          segments.splice(ind, 1);
        }
      });
    }

    return res;
  }

  /**
   * Ищет и привязывает узлы профилей к пути заполнения
   * @method glass_nodes
   * @for Contour
   * @param path {paper.Path} - массив ограничивается узлами, примыкающими к пути
   * @param [nodes] {Array} - если указано, позволяет не вычислять исходный массив узлов контура, а использовать переданный
   * @param [bind] {Boolean} - если указано, сохраняет пары узлов в path._attr.curve_nodes
   * @returns {Array}
   */
  glass_nodes(path, nodes, bind) {
    const curve_nodes = [];
    const path_nodes = [];
    const ipoint = path.interiorPoint.negate();
    let curve, findedb, findede, d, node1, node2;

    if(!nodes){
      nodes = this.nodes;
    }

    // имеем путь и контур.
    for(let i in path.curves){
      curve = path.curves[i];

      // в node1 и node2 получаем ближайший узел контура к узлам текущего сегмента
      let d1 = Infinity;
      let d2 = Infinity;
      nodes.forEach((n) => {
        if((d = n.getDistance(curve.point1, true)) < d1){
          d1 = d;
          node1 = n;
        }
        if((d = n.getDistance(curve.point2, true)) < d2){
          d2 = d;
          node2 = n;
        }
      });

      // в path_nodes просто накапливаем узлы. наверное, позже они будут упорядочены
      if(path_nodes.indexOf(node1) == -1)
        path_nodes.push(node1);
      if(path_nodes.indexOf(node2) == -1)
        path_nodes.push(node2);

      if(!bind)
        continue;

      // заполнение может иметь больше курв, чем профиль
      if(node1 == node2)
        continue;
      findedb = false;
      for(let n in curve_nodes){
        if(curve_nodes[n].node1 == node1 && curve_nodes[n].node2 == node2){
          findedb = true;
          break;
        }
      }
      if(!findedb){
        findedb = this.profile_by_nodes(node1, node2);
        const loc1 = findedb.generatrix.getNearestLocation(node1);
        const loc2 = findedb.generatrix.getNearestLocation(node2);
        // уточняем порядок нод
        if(node1.add(ipoint).getDirectedAngle(node2.add(ipoint)) < 0)
          curve_nodes.push({node1: node2, node2: node1, profile: findedb, out: loc2.index == loc1.index ? loc2.parameter > loc1.parameter : loc2.index > loc1.index});
        else
          curve_nodes.push({node1: node1, node2: node2, profile: findedb, out: loc1.index == loc2.index ? loc1.parameter > loc2.parameter : loc1.index > loc2.index});
      }
    }

    this.sort_nodes(curve_nodes);

    return path_nodes;
  }

  /**
   * Получает замкнутые контуры, ищет подходящие створки или заполнения, при необходимости создаёт новые
   * @method glass_recalc
   * @for Contour
   */
  glass_recalc() {
    const {glass_contours} = this;      // массиы новых рёбер
    const glasses = this.glasses(true); // массив старых заполнений
    const binded = new Set();

    function calck_rating(glcontour, glass) {

      const {outer_profiles} = glass;

      // вычисляем рейтинг
      let crating = 0;

      // если есть привязанные профили, используем их. иначе - координаты узлов
      if (outer_profiles.length) {
        glcontour.some((cnt) => {
          outer_profiles.some((curr) => {
            if (cnt.profile == curr.profile &&
              cnt.b.is_nearest(curr.b) &&
              cnt.e.is_nearest(curr.e)) {
              crating++;
              return true;
            }
          });
          if (crating > 2){
            return true;
          }
        });
      }
      else{
        const {nodes} = glass;
        glcontour.some((cnt) => {
          nodes.some((node) => {
            if (cnt.b.is_nearest(node)) {
              crating++;
              return true;
            }
          });
          if (crating > 2){
            return true;
          }
        })
      }

      return crating;

    }

    // сначала, пробегаем по заполнениям и пытаемся оставить их на месте
    glasses.forEach((glass) => {
      if (glass.visible) {
        return;
      }
      glass_contours.some((glcontour) => {
        if(binded.has(glcontour)){
          return;
        }
        if(calck_rating(glcontour, glass) > 2){
          glass.path = glcontour;
          glass.visible = true;
          if (glass instanceof Filling) {
            glass.redraw();
          }
          binded.add(glcontour);
          return true;
        }
      });
    });

    // бежим по найденным контурам заполнений и выполняем привязку
    glass_contours.forEach((glcontour) => {

      if(binded.has(glcontour)){
        return;
      }

      let rating = 0, glass, crating, cglass, glass_center;

      for (let g in glasses) {

        glass = glasses[g];
        if (glass.visible) {
          continue;
        }

        // вычисляем рейтинг
        crating = calck_rating(glcontour, glass);

        if (crating > rating || !cglass) {
          rating = crating;
          cglass = glass;
        }
        if (crating == rating && cglass != glass) {
          if (!glass_center) {
            glass_center = glcontour.reduce((sum, val) => sum.add(val.b), new paper.Point).divide(glcontour.length)
          }
          if (glass_center.getDistance(glass.bounds.center, true) < glass_center.getDistance(cglass.bounds.center, true)) {
            cglass = glass;
          }
        }
      }

      // TODO реализовать настоящее ранжирование
      if (cglass || (cglass = this.getItem({class: Filling, visible: false}))) {
        cglass.path = glcontour;
        cglass.visible = true;
        if (cglass instanceof Filling) {
          cglass.redraw();
        }
      }
      else {
        // добавляем заполнение
        // 1. ищем в изделии любое заполнение
        // 2. если не находим, используем умолчание системы
        if (glass = this.getItem({class: Filling})) {

        }
        else if (glass = this.project.getItem({class: Filling})) {

        }
        else {

        }
        cglass = new Filling({proto: glass, parent: this, path: glcontour});
        cglass.redraw();
      }
    });
  }

  /**
   * Возвращает массив отрезков, которые потенциально могут образовывать заполнения
   * (соединения с пустотой отбрасываются)
   * @property glass_segments
   * @type Array
   */
  get glass_segments() {
    const nodes = [];

    function fn_sort(a, b) {
      const da = this.getOffsetOf(a.point);
      const db = this.getOffsetOf(b.point);
      if (da < db){
        return -1;
      }
      else if (da > db){
        return 1;
      }
      return 0;
    }

    // для всех профилей контура
    this.profiles.forEach((p) => {

      const sort = fn_sort.bind(p.generatrix);

      // ищем примыкания T к текущему профилю
      const ip = p.joined_imposts();
      const pb = p.cnn_point("b");
      const pe = p.cnn_point("e");

      // для створочных импостов используем не координаты их b и e, а ближайшие точки примыкающих образующих
      const pbg = pb.is_t && pb.profile.d0 ? pb.profile.generatrix.getNearestPoint(p.b) : p.b;
      const peg = pe.is_t && pe.profile.d0 ? pe.profile.generatrix.getNearestPoint(p.e) : p.e;

      // если есть примыкания T, добавляем сегменты, исключая соединения с пустотой
      if(ip.inner.length){

        ip.inner.sort(sort);

        if(!pb.is_i && !pbg.is_nearest(ip.inner[0].point)){
          nodes.push(new GlassSegment(p, pbg, ip.inner[0].point));
        }

        for(let i = 1; i < ip.inner.length; i++){
          nodes.push(new GlassSegment(p, ip.inner[i-1].point, ip.inner[i].point));
        }

        if(!pe.is_i && !ip.inner[ip.inner.length-1].point.is_nearest(peg)){
          nodes.push(new GlassSegment(p, ip.inner[ip.inner.length-1].point, peg));
        }

      }
      if(ip.outer.length){

        ip.outer.sort(sort);

        if(!pb.is_i && !ip.outer[0].point.is_nearest(pbg)){
          nodes.push(new GlassSegment(p, ip.outer[0].point, pbg, true));
        }

        for(let i = 1; i < ip.outer.length; i++){
          nodes.push(new GlassSegment(p, ip.outer[i].point, ip.outer[i-1].point, true));
        }

        if(!pe.is_i && !peg.is_nearest(ip.outer[ip.outer.length-1].point)){
          nodes.push(new GlassSegment(p, peg, ip.outer[ip.outer.length-1].point, true));
        }
      }

      // добавляем, если нет соединений с пустотой
      if(!ip.inner.length){
        if(!pb.is_i && !pe.is_i){
          nodes.push(new GlassSegment(p, pbg, peg));
        }
      }

      // для импостов добавляем сегмент в обратном направлении
      if(!ip.outer.length && (pb.is_cut || pe.is_cut || pb.is_t || pe.is_t)){
        if(!pb.is_i && !pe.is_i){
          nodes.push(new GlassSegment(p, peg, pbg, true));
        }
      }

    });

    return nodes;
  }

  /**
   * Признак прямоугольности
   */
  get is_rectangular() {
    return (this.side_count != 4) || !this.profiles.some((profile) => {
        return !(profile.is_linear() && Math.abs(profile.angle_hor % 90) < 1);
      });
  }

  move(delta) {
    const {contours, profiles, project} = this;
    const crays = (p) => p.rays.clear();
    this.translate(delta);
    contours.forEach((elm) => elm.profiles.forEach(crays));
    profiles.forEach(crays);
    project.register_change();
  }

  /**
   * Возвращает массив узлов текущего контура
   * @property nodes
   * @type Array
   */
  get nodes () {
    const nodes = [];
    this.profiles.forEach((p) => {
      let findedb;
      let findede;
      nodes.forEach((n) => {
        if (p.b.is_nearest(n)) {
          findedb = true
        }
        if (p.e.is_nearest(n)) {
          findede = true
        }
      });
      if (!findedb) {
        nodes.push(p.b.clone())
      }
      if (!findede) {
        nodes.push(p.e.clone())
      }
    });
    return nodes;
  }


  /**
   * Формирует оповещение для тех, кто следит за this._noti
   * @param obj
   */
  notify(obj) {
    this._notifier.notify(obj);
    this.project.register_change();
  }

  /**
   * Возвращает массив внешних профилей текущего контура. Актуально для створок, т.к. они всегда замкнуты
   * @property outer_nodes
   * @type Array
   */
  get outer_nodes() {
    return this.outer_profiles.map((v) => v.elm);
  }

  /**
   * Возвращает массив внешних и примыкающих профилей текущего контура
   */
  get outer_profiles() {
    // сначала получим все профили
    const {profiles} = this;
    const to_remove = [];
    const res = [];

    let findedb, findede;

    // прочищаем, выкидывая такие, начало или конец которых соединениы не в узле
    for(let i=0; i<profiles.length; i++){
      const elm = profiles[i];
      if(elm._attr.simulated)
        continue;
      findedb = false;
      findede = false;
      for(let j=0; j<profiles.length; j++){
        if(profiles[j] == elm)
          continue;
        if(!findedb && elm.has_cnn(profiles[j], elm.b) && elm.b.is_nearest(profiles[j].e))
          findedb = true;
        if(!findede && elm.has_cnn(profiles[j], elm.e) && elm.e.is_nearest(profiles[j].b))
          findede = true;
      }
      if(!findedb || !findede)
        to_remove.push(elm);
    }
    for(let i=0; i<profiles.length; i++){
      const elm = profiles[i];
      if(to_remove.indexOf(elm) != -1)
        continue;
      elm._attr.binded = false;
      res.push({
        elm: elm,
        profile: elm.nearest(),
        b: elm.b,
        e: elm.e
      });
    }
    return res;
  }

  /**
   * Возвращает профиль по номеру стороны фурнитуры, учитывает направление открывания, по умолчанию - левое
   * - первая первая сторона всегда нижняя
   * - далее, по часовой стрелке 2 - левая, 3 - верхняя и т.д.
   * - если направление правое, обход против часовой
   * @param side {Number}
   * @param cache {Object}
   */
  profile_by_furn_side(side, cache) {

    if (!cache) {
      cache = {
        profiles: this.outer_nodes,
        bottom: this.profiles_by_side("bottom")
      };
    }

    const profile_node = this.direction == $p.enm.open_directions.Правое ? "b" : "e";
    const other_node = profile_node == "b" ? "e" : "b";

    let profile = cache.bottom;

    const next = () => {
      side--;
      if (side <= 0) {
        return profile;
      }

      cache.profiles.some((curr) => {
        if (curr[other_node].is_nearest(profile[profile_node])) {
          profile = curr;
          return true;
        }
      });

      return next();
    };

    return next();

  }


  /**
   * Возвращает ребро текущего контура по узлам
   * @param n1 {paper.Point} - первый узел
   * @param n2 {paper.Point} - второй узел
   * @param [point] {paper.Point} - дополнительная проверочная точка
   * @returns {Profile}
   */
  profile_by_nodes(n1, n2, point) {
    const profiles = this.profiles;
    for(let i = 0; i < profiles.length; i++){
      const {generatrix} = profiles[i];
      if(generatrix.getNearestPoint(n1).is_nearest(n1) && generatrix.getNearestPoint(n2).is_nearest(n2)){
        if(!point || generatrix.getNearestPoint(point).is_nearest(point))
          return profiles[i];
      }
    }
  }

  /**
   * Удаляет контур из иерархии проекта
   * Одновлеменно, удаляет строку из табчасти _Конструкции_ и подчиненные строки из табчасти _Координаты_
   * @method remove
   */
  remove() {
    //удаляем детей
    const {children, _row} = this;
    while(children.length){
      children[0].remove();
    }

    if(_row){
      const {ox} = this.project;
      ox.coordinates.find_rows({cnstr: this.cnstr}).forEach((row) => ox.coordinates.del(row._row));

      // удаляем себя
      if(ox === _row._owner._owner){
        _row._owner.del(_row);
      }
      this._row = null;
    }

    // стандартные действия по удалению элемента paperjs
    super.remove();
  }

  /**
   * виртуальный датаменеджер для автоформ
   */
  get _manager() {
    return this.project._dp._manager;
  }

  /**
   * виртуальные метаданные для автоформ
   */
  get _metadata() {

    const {tabular_sections} = this.project.ox._metadata;
    const _xfields = tabular_sections.constructions.fields;

    return {
      fields: {
        furn: _xfields.furn,
        direction: _xfields.direction,
        h_ruch: _xfields.h_ruch
      },
      tabular_sections: {
        params: tabular_sections.params
      }
    };

  }

  /**
   * Габариты по внешним краям профилей контура
   */
  get bounds() {
    const {_attr, parent} = this;
    if(!_attr._bounds || !_attr._bounds.width || !_attr._bounds.height){

      this.profiles.forEach((profile) => {
        const path = profile.path && profile.path.segments.length ? profile.path : profile.generatrix;
        if(path){
          _attr._bounds = _attr._bounds ? _attr._bounds.unite(path.bounds) : path.bounds;
          if(!parent){
            const {d0} = profile;
            if(d0){
              _attr._bounds = _attr._bounds.unite(profile.generatrix.bounds)
            }
          }
        }
      });

      if(!_attr._bounds){
        _attr._bounds = new paper.Rectangle();
      }
    }
    return _attr._bounds;
  }

  /**
   * Номер конструкции текущего слоя
   */
  get cnstr() {
    return this._row ? this._row.cnstr : 0;
  }
  set cnstr(v) {
    this._row && (this._row.cnstr = v);
  }

  /**
   * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
   */
  get dimension_bounds() {
    let bounds = super.dimension_bounds;
    const ib = this.l_visualization._by_insets.bounds;
    if(ib.height && ib.bottom > bounds.bottom){
      const delta = ib.bottom - bounds.bottom + 10;
      bounds = bounds.unite(
        new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
      );
    }
    return bounds;
  }

  /**
   * Направление открывания
   */
  get direction() {
    return this._row.direction;
  }
  set direction(v) {
    this._row.direction = v;
    this.project.register_change(true);
  }

  /**
   * ### Изменяет центр и масштаб, чтобы слой вписался в размер окна
   * Используется инструментом {{#crossLink "ZoomFit"}}{{/crossLink}}, вызывается при открытии изделия и после загрузки типового блока
   *
   * @method zoom_fit
   */
  zoom_fit() {
    const {strokeBounds, view} = this;
    if(strokeBounds){
      let {width, height, center} = strokeBounds;
      if(width < 800){
        width = 800;
      }
      if(height < 800){
        height = 800;
      }
      width += 120;
      height += 120;
      view.zoom = Math.min(view.viewSize.height / height, view.viewSize.width / width);
      const shift = (view.viewSize.width - width * view.zoom);
      view.center = center.add([shift, 40]);
    }
  }

  /**
   * Рисует ошибки соединений
   */
  draw_cnn_errors() {

    const {l_visualization} = this;

    if(l_visualization._cnn){
      l_visualization._cnn.removeChildren();
    }
    else{
      l_visualization._cnn = new paper.Group({ parent: l_visualization });
    }

    const err_attrs = {
      strokeColor: 'red',
      strokeWidth: 2,
      strokeCap: 'round',
      strokeScaling: false,
      dashOffset: 4,
      dashArray: [4, 4],
      guide: true,
      parent: l_visualization._cnn,
    }

    // ошибки соединений с заполнениями
    this.glasses(false, true).forEach((elm) => {
      let err;
      elm.profiles.forEach(({cnn, sub_path}) => {
        if(!cnn){
          Object.assign(sub_path, err_attrs);
          err = true;
        }
      });
      if(err){
        elm.fill_error();
      }
      else{
        elm.path.fillColor = BuilderElement.clr_by_clr.call(elm, elm._row.clr, false);
      }
    });

    // ошибки соединений профиля
    this.profiles.forEach((elm) => {
      const {b, e} = elm.rays;
      if(!b.cnn){
        Object.assign(new paper.Path.Circle({
          center: elm.corns(4).add(elm.corns(1)).divide(2),
          radius: 80,
        }), err_attrs);
      }
      if(!e.cnn){
        Object.assign(new paper.Path.Circle({
          center: elm.corns(2).add(elm.corns(3)).divide(2),
          radius: 80,
        }), err_attrs);
      }
      // ошибки примыкающих соединений
      if(elm.nearest() && (!elm._attr._nearest_cnn || elm._attr._nearest_cnn.empty())){
        Object.assign(elm.path.get_subpath(elm.corns(1), elm.corns(2)), err_attrs);
      }
      // если у профиля есть доборы, проверим их соединения
      elm.addls.forEach((elm) => {
        if(elm.nearest() && (!elm._attr._nearest_cnn || elm._attr._nearest_cnn.empty())){
          Object.assign(elm.path.get_subpath(elm.corns(1), elm.corns(2)), err_attrs);
        }
      })
    });

  }

  /**
   * Рисут визуализацию москитки
   */
  draw_mosquito() {
    const {l_visualization} = this;
    this.project.ox.inserts.find_rows({cnstr: this.cnstr}, (row) => {
      if(row.inset.insert_type == $p.enm.inserts_types.МоскитнаяСетка){
        const props = {
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          strokeWidth: 3,
          dashArray: [6, 4],
          strokeScaling: false,
        };
        let sz, imposts;
        row.inset.specification.forEach((rspec) => {
          if(!sz && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоПериметру && rspec.nom.elm_type == $p.enm.elm_types.Рама){
            sz = rspec.sz;
          }
          if(!imposts && rspec.count_calc_method == $p.enm.count_calculating_ways.ПоШагам && rspec.nom.elm_type == $p.enm.elm_types.Импост){
            imposts = rspec;
          }
        });

        // рисуем контур
        const perimetr = [];
        if(typeof sz != 'number'){
          sz = 20;
        }
        this.outer_profiles.forEach((curr) => {
          // получаем внешнюю палку, на которую будет повешена москитка
          const profile = curr.profile || curr.elm;
          const is_outer = Math.abs(profile.angle_hor - curr.elm.angle_hor) > 60;
          const ray = is_outer ? profile.rays.outer : profile.rays.inner;
          const segm = ray.get_subpath(curr.b, curr.e).equidistant(sz);
          perimetr.push(Object.assign(segm, props));
        });

        const count = perimetr.length - 1;
        perimetr.forEach((curr, index) => {
          const prev = index == 0 ? perimetr[count] : perimetr[index - 1];
          const next = index == count ? perimetr[0] : perimetr[index + 1];
          const b = curr.getIntersections(prev);
          const e = curr.getIntersections(next);
          if(b.length){
            curr.firstSegment.point = b[0].point;
          }
          if(e.length){
            curr.lastSegment.point = e[0].point;
          }
        });

        // добавляем текст
        const {elm_font_size} = consts;
        const {bounds} = props.parent;
        new paper.PointText({
          parent: props.parent,
          fillColor: 'black',
          fontSize: consts.elm_font_size,
          guide: true,
          content: row.inset.presentation,
          point: bounds.bottomLeft.add([elm_font_size * 1.2, -elm_font_size * 0.4]),
        });

        // рисуем поперечину
        if(imposts){
          const {offsets, do_center, step} = imposts;

          function add_impost(y) {
            const impost = Object.assign(new paper.Path({
              insert: false,
              segments: [[bounds.left, y], [bounds.right, y]]
          }), props);
            const {length} = impost;
            perimetr.forEach((curr) => {
              const aloc = curr.getIntersections(impost);
              if(aloc.length){
                const l1 = impost.firstSegment.point.getDistance(aloc[0].point);
                const l2 = impost.lastSegment.point.getDistance(aloc[0].point);
                if(l1 < length / 2){
                  impost.firstSegment.point = aloc[0].point;
                }
                if(l2 < length / 2){
                  impost.lastSegment.point = aloc[0].point;
                }
              }
            });
          }

          if(step){
            const height = bounds.height - offsets;
            if(height >= step){
              if(do_center){
                add_impost(bounds.centerY);
              }
              else{
                for(let y = step; y < height; y += step){
                  add_impost(y);
                }
              }
            }
          }
        }

        return false;
      }
    });
  }

  /**
   * Рисут визуализацию подоконника
   */
  draw_sill() {
    const {l_visualization, project, cnstr} = this;
    const {ox} = project;
    ox.inserts.find_rows({cnstr}, (row) => {
      if (row.inset.insert_type == $p.enm.inserts_types.Подоконник) {

        // ищем длину и ширину
        const {length, width} = $p.job_prm.properties;
        const bottom = this.profiles_by_side("bottom");
        let vlen, vwidth;
        ox.params.find_rows({cnstr: cnstr, inset: row.inset}, (prow) => {
          if(prow.param == length){
            vlen = prow.value;
          }
          if(prow.param == width){
            vwidth = prow.value;
          }
        });
        if(!vlen){
          vlen = bottom.length + 160;
        }
        if(vwidth){
          vwidth = vwidth * 0.7;
        }
        else{
          vwidth = 200;
        }
        const delta = (vlen - bottom.length) / 2;

        new paper.Path({
          parent: new paper.Group({parent: l_visualization._by_insets}),
          strokeColor: 'grey',
          fillColor: BuilderElement.clr_by_clr(row.clr),
          shadowColor: 'grey',
          shadowBlur: 20,
          shadowOffset: [10, 20],
          opacity: 0.7,
          strokeWidth: 1,
          strokeScaling: false,
          closed: true,
          segments: [
            bottom.b.add([delta, 0]),
            bottom.e.add([-delta, 0]),
            bottom.e.add([-delta - vwidth, vwidth]),
            bottom.b.add([delta - vwidth, vwidth]),
          ]
        });

        return false;
      }
    });
  }

  /**
   * Рисует направление открывания
   */
  draw_opening() {

    const _contour = this;
    const {l_visualization, furn} = this;

    if(!this.parent || !$p.enm.open_types.is_opening(furn.open_type)){
      if(l_visualization._opening && l_visualization._opening.visible)
        l_visualization._opening.visible = false;
      return;
    }

    // создаём кеш элементов по номеру фурнитуры
    const cache = {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side("bottom")
    };

    // рисует линии открывания на поворотной, поворотнооткидной и фрамужной фурнитуре
    function rotary_folding() {

      const {_opening} = l_visualization;
      const {side_count} = _contour;

      furn.open_tunes.forEach((row) => {

        if(row.rotation_axis){
          const axis = _contour.profile_by_furn_side(row.side, cache);
          const other = _contour.profile_by_furn_side(
            row.side + 2 <= side_count ? row.side + 2 : row.side - 2, cache);

          _opening.moveTo(axis.corns(3));
          _opening.lineTo(other.rays.inner.getPointAt(other.rays.inner.length / 2));
          _opening.lineTo(axis.corns(4));

        }
      });
    }

    // рисует линии открывания на раздвижке
    function sliding() {
      // находим центр
      const {center} = _contour.bounds;
      const {_opening} = l_visualization;

      if(_contour.direction == $p.enm.open_directions.Правое) {
        _opening.moveTo(center.add([-100,0]));
        _opening.lineTo(center.add([100,0]));
        _opening.moveTo(center.add([30,30]));
        _opening.lineTo(center.add([100,0]));
        _opening.lineTo(center.add([30,-30]));
      }
      else {
        _opening.moveTo(center.add([100,0]));
        _opening.lineTo(center.add([-100,0]));
        _opening.moveTo(center.add([-30,30]));
        _opening.lineTo(center.add([-100,0]));
        _opening.lineTo(center.add([-30,-30]));
      }
    }

    // подготавливаем слой для рисования
    if(!l_visualization._opening){
      l_visualization._opening = new paper.CompoundPath({
        parent: _contour.l_visualization,
        strokeColor: 'black'
      });
    }
    else{
      l_visualization._opening.removeChildren();
    }

    // рисуем раправление открывания
    return furn.is_sliding ? sliding() : rotary_folding();

  }

  /**
   * Рисует дополнительную визуализацию. Данные берёт из спецификации и проблемных соединений
   */
  draw_visualization() {

    const {profiles, l_visualization} = this;
    l_visualization._by_spec.removeChildren();

    // получаем строки спецификации с визуализацией
    this.project.ox.specification.find_rows({dop: -1}, (row) => {
      profiles.some((elm) => {
        if(row.elm == elm.elm){
          // есть визуализация для текущего профиля
          row.nom.visualization.draw(elm, l_visualization, row.len * 1000);
          return true;
        }
      });
    });

    // перерисовываем вложенные контуры
    this.contours.forEach((l) => l.draw_visualization());

  }

  get hidden() {
    return !!this._hidden;
  }
  set hidden(v) {
    if(this.hidden != v){
      this._hidden = v;
      const visible = !this._hidden;
      this.children.forEach((elm) => {
        if(elm instanceof BuilderElement){
          elm.visible = visible;
        }
      })
      this.l_visualization.visible = visible;
      this.l_dimensions.visible = visible;
    }

  }

  hide_generatrix() {
    this.profiles.forEach((elm) => {
      elm.generatrix.visible = false;
    })
  }

  /**
   * Возвращает массив импостов текущего + вложенных контуров
   * @property imposts
   * @for Contour
   * @returns {Array.<Profile>}
   */
  get imposts() {
    return this.getItems({class: Profile}).filter((elm) => {
      const {b, e} = elm.rays;
      return b.is_tt || e.is_tt || b.is_i || e.is_i;
    });
  }

  /**
   * виртуальная табличная часть параметров фурнитуры
   */
  get params() {
    return this.project.ox.params;
  }

  /**
   * путь контура - при чтении похож на bounds
   * для вложенных контуров определяет положение, форму и количество сегментов створок
   * @property attr {Array}
   */
  get path() {
    return this.bounds;
  }
  set path(attr) {
    if(!Array.isArray(attr)){
      return;
    }

    const noti = {type: consts.move_points, profiles: [], points: []};
    const {outer_nodes} = this;

    let need_bind = attr.length,
      available_bind = outer_nodes.length,
      elm, curr;

    function set_node(n) {
      if(!curr[n].is_nearest(elm[n], 0)){
        elm.rays.clear(true);
        elm[n] = curr[n];
        if(noti.profiles.indexOf(elm) == -1){
          noti.profiles.push(elm);
        }
        if(!noti.points.some((point) => point.is_nearest(elm[n], 0))){
          noti.points.push(elm[n]);
        }
      }
    }

    // первый проход: по двум узлам либо примыканию к образующей
    if(need_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];             // curr.profile - сегмент внешнего профиля
        for(let j = 0; j < outer_nodes.length; j++){
          elm = outer_nodes[j];   // elm - сегмент профиля текущего контура
          if(elm._attr.binded){
            continue;
          }
          if(curr.profile.is_nearest(elm)){
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    // второй проход: по одному узлу
    if(need_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];
        if(curr.binded)
          continue;
        for(let j = 0; j < outer_nodes.length; j++){
          elm = outer_nodes[j];
          if(elm._attr.binded)
            continue;
          if(curr.b.is_nearest(elm.b, true) || curr.e.is_nearest(elm.e, true)){
            elm._attr.binded = true;
            curr.binded = true;
            need_bind--;
            available_bind--;

            set_node('b');
            set_node('e');

            break;
          }
        }
      }
    }

    // третий проход - из оставшихся
    if(need_bind && available_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];
        if(curr.binded)
          continue;
        for(let j = 0; j < outer_nodes.length; j++){
          elm = outer_nodes[j];
          if(elm._attr.binded)
            continue;
          elm._attr.binded = true;
          curr.binded = true;
          need_bind--;
          available_bind--;
          // TODO заменить на клонирование образующей

          set_node('b');
          set_node('e');

          break;
        }
      }
    }

    // четвертый проход - добавляем
    if(need_bind){
      for(let i = 0; i < attr.length; i++){
        curr = attr[i];
        if(curr.binded){
          continue;
        }
        elm = new Profile({
          generatrix: curr.profile.generatrix.get_subpath(curr.b, curr.e),
          proto: outer_nodes.length ? outer_nodes[0] : {
            parent: this,
            clr: this.project.default_clr()
          }
        });
        elm._attr._nearest = curr.profile;
        elm._attr.binded = true;
        elm._attr.simulated = true;

        curr.profile = elm;
        delete curr.outer;
        curr.binded = true;

        noti.profiles.push(elm);
        noti.points.push(elm.b);
        noti.points.push(elm.e);

        need_bind--;
      }
    }

    // удаляем лишнее
    if(available_bind){
      outer_nodes.forEach((elm) => {
        if(!elm._attr.binded){
          elm.rays.clear(true);
          elm.remove();
          available_bind--;
        }
      });
    }

    // пересчитываем вставки створок
    this.profiles.forEach((p) => p.default_inset());

    // информируем систему об изменениях
    if(noti.points.length){
      this.profiles.forEach((p) => p._attr._rays && p._attr._rays.clear());
      this.notify(noti);
    }

    this._attr._bounds = null;
  }

  /**
   * Массив с рёбрами периметра
   */
  get perimeter () {
    const res = [];
    this.outer_profiles.forEach((curr) => {
      const tmp = curr.sub_path ? {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle
      } : {
        len: curr.elm.length,
        angle: curr.elm.angle_hor
      };
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
      tmp.profile = curr.profile || curr.elm;
    });
    return res;
  }

  /**
   * Положение контура в изделии или створки в контуре
   */
  get pos() {

  }

  /**
   * Возвращает массив профилей текущего контура
   * @property profiles
   * @for Contour
   * @returns {Array.<Profile>}
   */
  get profiles() {
    return this.children.filter((elm) => elm instanceof Profile);
  }

  get sectionals() {
    return this.children.filter((elm) => elm instanceof Sectional);
  }

  /**
   * Перерисовывает элементы контура
   * @method redraw
   * @for Contour
   */
  redraw(on_redrawed) {

    if(!this.visible){
      return;
    }

    // сбрасываем кеш габаритов
    this._attr._bounds = null;

    // чистим визуализацию
    const {l_visualization} = this;

    l_visualization._by_insets.removeChildren();
    !this.project._attr._saving && l_visualization._by_spec.removeChildren();

    // сначала перерисовываем все профили контура
    this.profiles.forEach((elm) => elm.redraw());

    // затем, создаём и перерисовываем заполнения, которые перерисуют свои раскладки
    this.glass_recalc();

    // рисуем направление открывания
    this.draw_opening();

    // перерисовываем вложенные контуры
    this.contours.forEach((elm) => elm.redraw());

    // рисуем ошибки соединений
    this.draw_cnn_errors();

    // рисуем москитки
    this.draw_mosquito();

    // рисуем подоконники
    this.draw_sill();

    // перерисовываем все водоотливы контура
    this.sectionals.forEach((elm) => elm.redraw());

    // информируем мир о новых размерах нашего контура
    $p.eve.callEvent("contour_redrawed", [this, this._attr._bounds]);

  }

  refresh_links() {

    const {cnstr} = this;
    let notify;

    // пробегаем по всем строкам
    this.params.find_rows({
      cnstr: cnstr || -9999,
      inset: $p.utils.blank.guid,
      hide: {not: true}
    }, (prow) => {
      const {param} = prow;
      const links = param.params_links({grid: {selection: {cnstr}}, obj: prow});
      const hide = links.some((link) => link.hide);

      // проверим вхождение значения в доступные и при необходимости изменим
      if(links.length && param.linked_values(links, prow)){
        this.project.register_change();
        notify = true;
        Object.getNotifier(this).notify({
          type: 'row',
          row: prow,
          tabular: prow._owner._name,
          name: 'value'
        });
      }
      if(!notify){
        notify = hide;
      }
    });

    // информируем мир о новых размерах нашего контура
    if(notify){
      $p.eve.callEvent("refresh_links", [this]);
    }
  }

  /**
   * Вычисляемые поля в таблицах конструкций и координат
   * @method save_coordinates
   * @param short {Boolean} - короткий вариант - только координаты контура
   */
  save_coordinates(short) {

    if(!short){
      // удаляем скрытые заполнения
      this.glasses(false, true).forEach((glass) => !glass.visible && glass.remove());

      // запись в таблице координат, каждый элемент пересчитывает самостоятельно
      const {l_text, l_dimensions} = this;
      for(let elm of this.children){
        if(elm.save_coordinates){
          elm.save_coordinates();
        }
        else if(elm == l_text || elm == l_dimensions){
          elm.children.forEach((elm) => elm.save_coordinates && elm.save_coordinates());
        }
      }
    }

    // ответственность за строку в таблице конструкций лежит на контуре
    const {bounds} = this;
    this._row.x = bounds ? bounds.width.round(4) : 0;
    this._row.y = bounds ? bounds.height.round(4) : 0;
    this._row.is_rectangular = this.is_rectangular;
    if(this.parent){
      this._row.w = this.w.round(4);
      this._row.h = this.h.round(4);
    }
    else{
      this._row.w = 0;
      this._row.h = 0;
    }
  }

  /**
   * Упорядочивает узлы, чтобы по ним можно было построить путь заполнения
   * @method sort_nodes
   * @param [nodes] {Array}
   */
  sort_nodes(nodes) {
    if (!nodes.length) {
      return nodes;
    }
    let prev = nodes[0];
    const res = [prev];
    let couner = nodes.length + 1;

    while (res.length < nodes.length && couner) {
      couner--;
      for (let i = 0; i < nodes.length; i++) {
        const curr = nodes[i];
        if (res.indexOf(curr) != -1)
          continue;
        if (prev.node2 == curr.node1) {
          res.push(curr);
          prev = curr;
          break;
        }
      }
    }
    if (couner) {
      nodes.length = 0;
      for (let i = 0; i < res.length; i++) {
        nodes.push(res[i]);
      }
      res.length = 0;
    }
  }


  /**
   * Кеш используется при расчете спецификации фурнитуры
   * @return {Object}
   */
  get furn_cache() {
    return {
      profiles: this.outer_nodes,
      bottom: this.profiles_by_side("bottom"),
      ox: this.project.ox,
      w: this.w,
      h: this.h,
    }
  }

  /**
   * Возаращает линию, проходящую через ручку
   *
   * @param elm {Profile}
   */
  handle_line(elm) {

    // строим горизонтальную линию от нижней границы контура, находим пересечение и offset
    const {bounds, h_ruch} = this;
    const by_side = this.profiles_by_side();
    return (elm == by_side.top || elm == by_side.bottom) ?
      new paper.Path({
        insert: false,
        segments: [[bounds.left + h_ruch, bounds.top - 200], [bounds.left + h_ruch, bounds.bottom + 200]]
      }) :
      new paper.Path({
        insert: false,
        segments: [[bounds.left - 200, bounds.bottom - h_ruch], [bounds.right + 200, bounds.bottom - h_ruch]]
      });

  }

  /**
   * Уточняет высоту ручки
   * @param cache {Object}
   */
  update_handle_height(cache) {

    const {furn, _row} = this;
    const {furn_set, handle_side} = furn;
    if(!handle_side || furn_set.empty()){
      return;
    }

    if(!cache){
      cache = this.furn_cache;
    }

    // получаем элемент, на котором ручка и длину элемента
    const elm = this.profile_by_furn_side(handle_side, cache);
    if(!elm){
      return;
    }

    const {len} = elm._row;

    function set_handle_height(row){
      const {handle_height_base} = row;
      if(handle_height_base < 0){
        if(handle_height_base == -2 || (handle_height_base == -1 && _row.fix_ruch != -3)){
          _row.h_ruch = (len / 2).round(0);
          return _row.fix_ruch = handle_height_base;
        }
      }
      else if(handle_height_base > 0){
        _row.h_ruch = handle_height_base;
        return _row.fix_ruch = 1;
      }
    }

    // бежим по спецификации набора в поисках строки про ручку
    furn.furn_set.specification.find_rows({dop: 0}, (row) => {

      // проверяем, проходит ли строка
      if(!row.quantity || !row.check_restrictions(this, cache)){
        return;
      }
      if(set_handle_height(row)){
        return false;
      }
      if(row.is_set_row){
        let ok = false;
        row.nom.get_spec(this, cache, true).each((sub_row) => {
          if(set_handle_height(sub_row)){
            return !(ok = true);
          }
        });
        if(ok){
          return false;
        }
      }
    });
    Object.getNotifier(this).notify({
      type: 'update',
      name: 'h_ruch'
    });
  }

  /**
   * Высота ручки
   */
  get h_ruch() {
    const {layer, _row} = this;
    return layer ? _row.h_ruch : 0;
  }
  set h_ruch(v) {
    const {layer, _row, project} = this;
    if(layer){
      if(_row.fix_ruch == -3 && v == 0){
        _row.fix_ruch = -1;
      }
      this.update_handle_height();
      // Высота ручки по умолчению
      // >0: фиксированная высота
      // =0: Высоту задаёт оператор
      // -1: Ручка по центру, но можно редактировать
      // -2: Ручка по центру, нельзя редактировать
      if(v != 0 && (_row.fix_ruch == 0 || _row.fix_ruch == -1 || _row.fix_ruch == -3)){
          _row.h_ruch = v;
        if(_row.fix_ruch == -1){
          _row.fix_ruch = -3;
        }
      }
      project.register_change();
    }
    else{
      _row.h_ruch = 0;
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'h_ruch'
      });
    }
  }

  /**
   * Количество сторон контура
   * TODO: строго говоря, количество сторон != количеству палок
   */
  get side_count() {
    return this.profiles.length;
  }

  /**
   * Ширина контура по фальцу
   */
  get w() {
    const {is_rectangular, bounds} = this;
    const {left, right} = this.profiles_by_side();
    return bounds ? bounds.width - left.nom.sizefurn - right.nom.sizefurn : 0;
  }

  /**
   * Высота контура по фальцу
   */
  get h() {
    const {is_rectangular, bounds} = this;
    const {top, bottom} = this.profiles_by_side();
    return bounds ? bounds.height - top.nom.sizefurn - bottom.nom.sizefurn : 0;
  }

  /**
   * Cлужебная группа текстовых комментариев
   */
  get l_text() {
    const {_attr} = this;
    return _attr._txt || (_attr._txt = new paper.Group({ parent: this }));
  }

  /**
   * Cлужебная группа визуализации допов,  петель и ручек
   */
  get l_visualization() {
    const {_attr} = this;
    if(!_attr._visl){
      _attr._visl = new paper.Group({parent: this, guide: true});
      _attr._visl._by_insets = new paper.Group({parent: _attr._visl});
      _attr._visl._by_spec = new paper.Group({parent: _attr._visl});
    }
    return _attr._visl;
  }

  /**
   * ### Непрозрачность без учета вложенных контуров
   * В отличии от прототипа `opacity`, затрагивает только элементы текущего слоя
   */
  get opacity() {
    return this.children.length ? this.children[0].opacity : 1;
  }
  set opacity(v) {
    this.children.forEach((elm) => {
      if(elm instanceof BuilderElement)
        elm.opacity = v;
    });
  }

  /**
   * Обработчик события при удалении элемента
   */
  on_remove_elm(elm) {
    // при удалении любого профиля, удаляем размрные линии импостов
    if(this.parent){
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading){
      this.l_dimensions.clear();
    }
  }

  /**
   * Обработчик события при вставке элемента
   */
  on_insert_elm(elm) {
    // при вставке любого профиля, удаляем размрные линии импостов
    if(this.parent){
      this.parent.on_remove_elm(elm);
    }
    if (elm instanceof Profile && !this.project._attr._loading){
      this.l_dimensions.clear();
    }
  }

  /**
   * Обработчик при изменении системы
   */
  on_sys_changed() {
    this.profiles.forEach((elm) => elm.default_inset(true));

    this.glasses().forEach((elm) => {
      if (elm instanceof Contour){
        elm.on_sys_changed();
      }
      else{
        // заполнения проверяем по толщине
        if(elm.thickness < elm.project._dp.sys.tmin || elm.thickness > elm.project._dp.sys.tmax)
          elm._row.inset = elm.project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
        // проверяем-изменяем соединения заполнений с профилями
        elm.profiles.forEach((curr) => {
          if(!curr.cnn || !curr.cnn.check_nom2(curr.profile))
            curr.cnn = $p.cat.cnns.elm_cnn(elm, curr.profile, $p.enm.cnn_types.acn.ii);
        });
      }
    });
  }

}

/**
 * Экспортируем конструктор Contour, чтобы фильтровать инстанции этого типа
 * @property Contour
 * @for MetaEngine
 * @type function
 */
Editor.Contour = Contour;


/**
 * ### Вспомогательные классы для формирования размерных линий
 *
 * Created by Evgeniy Malyarov on 12.05.2017.
 *
 * @module geometry
 * @submodule dimension_drawer
 */

class DimensionGroup {

  clear(){
    for(let key in this){
      this[key].removeChildren();
      this[key].remove();
      delete this[key];
    }
  }

  has_size(size) {
    for(let key in this){
      const {path} = this[key];
      if(path && Math.abs(path.length - size) < 1){
        return true;
      }
    }
  }

}

/**
 * ### Служебный слой размерных линий
 * Унаследован от [paper.Layer](http://paperjs.org/reference/layer/)
 *
 * @class DimensionLayer
 * @extends paper.Layer
 * @param attr
 * @constructor
 */
class DimensionLayer extends paper.Layer {

  get bounds() {
    return this.project.bounds;
  }

  get owner_bounds() {
    return this.bounds;
  }

  get dimension_bounds() {
    return this.project.dimension_bounds;
  }

}

/**
 * ### Построитель авторазмерных линий
 *
 * @class DimensionDrawer
 * @extends paper.Group
 * @param attr
 * @param attr.parent - {paper.Item}, родитель должен иметь свойства profiles_by_side(), is_pos(), profiles, imposts
 * @constructor
 */
class DimensionDrawer extends paper.Group {

  constructor(attr) {
    super(attr);
    this.bringToFront();
  }

  /**
   * ### Стирает размерные линии
   *
   * @method clear
   */
  clear() {

    this.ihor && this.ihor.clear();
    this.ivert && this.ivert.clear();

    for(let pos of ['bottom','top','right','left']){
      if(this[pos]){
        this[pos].removeChildren();
        this[pos].remove();
        this[pos] = null;
      }
    }

    this.layer.parent && this.layer.parent.l_dimensions.clear();
  }

  /**
   * формирует авторазмерные линии
   */
  redraw(forse) {

    const {parent} = this;
    const {contours, bounds} = parent;

    if(forse){
      this.clear();
    }

    // сначала, перерисовываем размерные линии вложенных контуров, чтобы получить отступы
    for(let chld of parent.contours){
      chld.l_dimensions.redraw();
    }

    // для внешних контуров строим авторазмерные линии
    if(!parent.parent || forse){

      const by_side = parent.profiles_by_side();
      if(!Object.keys(by_side).length){
        return this.clear();
      }

      // сначала, строим размерные линии импостов

      // получаем все профили контура, делим их на вертикальные и горизонтальные
      const ihor = [
        {
          point: bounds.top.round(0),
          elm: by_side.top,
          p: by_side.top.b.y < by_side.top.e.y ? "b" : "e"
        },
        {
          point: bounds.bottom.round(0),
          elm: by_side.bottom,
          p: by_side.bottom.b.y < by_side.bottom.e.y ? "b" : "e"
        }];
      const ivert = [
        {
          point: bounds.left.round(0),
          elm: by_side.left,
          p: by_side.left.b.x > by_side.left.e.x ? "b" : "e"
        },
        {
          point: bounds.right.round(0),
          elm: by_side.right,
          p: by_side.right.b.x > by_side.right.e.x ? "b" : "e"
        }];

      // подмешиваем импосты вложенных контуров
      const profiles = new Set(parent.profiles);
      parent.imposts.forEach((elm) => elm.visible && profiles.add(elm));

      for(let elm of profiles){

        // получаем точки начала и конца элемента
        const our = !elm.parent || elm.parent === parent;
        const eb = our ? (elm instanceof GlassSegment ? elm.sub_path.firstSegment.point : elm.b) : elm.rays.b.npoint;
        const ee = our ? (elm instanceof GlassSegment ? elm.sub_path.lastSegment.point : elm.e) : elm.rays.e.npoint;

        if(ihor.every((v) => v.point != eb.y.round(0))){
          ihor.push({
            point: eb.y.round(0),
            elm: elm,
            p: "b"
          });
        }
        if(ihor.every((v) => v.point != ee.y.round(0))){
          ihor.push({
            point: ee.y.round(0),
            elm: elm,
            p: "e"
          });
        }
        if(ivert.every((v) => v.point != eb.x.round(0))){
          ivert.push({
            point: eb.x.round(0),
            elm: elm,
            p: "b"
          });
        }
        if(ivert.every((v) => v.point != ee.x.round(0))){
          ivert.push({
            point: ee.x.round(0),
            elm: elm,
            p: "e"
          });
        }
      };

      // для ihor добавляем по вертикали
      if(ihor.length > 2){
        ihor.sort((a, b) => b.point - a.point);
        if(parent.is_pos("right")){
          this.by_imposts(ihor, this.ihor, "right");
        }
        else if(parent.is_pos("left")){
          this.by_imposts(ihor, this.ihor, "left");
        }
      }
      else{
        ihor.length = 0;
      }

      // для ivert добавляем по горизонтали
      if(ivert.length > 2){
        ivert.sort((a, b) => a.point - b.point);
        if(parent.is_pos("bottom")){
          this.by_imposts(ivert, this.ivert, "bottom");
        }
        else if(parent.is_pos("top")){
          this.by_imposts(ivert, this.ivert, "top");
        }
      }
      else{
        ivert.length = 0;
      }

      // далее - размерные линии контура
      this.by_contour(ihor, ivert, forse);

    }

    // перерисовываем размерные линии текущего контура
    for(let dl of this.children){
      dl.redraw && dl.redraw()
    }

  }

  /**
   * ### Формирует размерные линии импоста
   */
  by_imposts(arr, collection, pos) {
    const offset = (pos == "right" || pos == "bottom") ? -130 : 90;
    for(let i = 0; i < arr.length - 1; i++){
      if(!collection[i]){
        collection[i] = new DimensionLine({
          pos: pos,
          elm1: arr[i].elm,
          p1: arr[i].p,
          elm2: arr[i+1].elm,
          p2: arr[i+1].p,
          parent: this,
          offset: offset,
          impost: true
        });
      }
    }
  }

  /**
   * ### Формирует размерные линии контура
   */
  by_contour (ihor, ivert, forse) {

    const {project, parent} = this;
    const {bounds} = parent;


    if (project.contours.length > 1 || forse) {

      if(parent.is_pos("left") && !parent.is_pos("right") && project.bounds.height != bounds.height){
        if(!this.ihor.has_size(bounds.height)){
          if(!this.left){
            this.left = new DimensionLine({
              pos: "left",
              parent: this,
              offset: ihor.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else{
            this.left.offset = ihor.length > 2 ? 220 : 90;
          }
        }
      }
      else{
        if(this.left){
          this.left.remove();
          this.left = null;
        }
      }

      if(parent.is_pos("right") && (project.bounds.height != bounds.height || forse)){
        if(!this.ihor.has_size(bounds.height)){
          if(!this.right){
            this.right = new DimensionLine({
              pos: "right",
              parent: this,
              offset: ihor.length > 2 ? -260 : -130,
              contour: true
            });
          }
          else{
            this.right.offset = ihor.length > 2 ? -260 : -130;
          }
        }
      }
      else{
        if(this.right){
          this.right.remove();
          this.right = null;
        }
      }

      if(parent.is_pos("top") && !parent.is_pos("bottom") && project.bounds.width != bounds.width){
        if(!this.ivert.has_size(bounds.width)){
          if(!this.top){
            this.top = new DimensionLine({
              pos: "top",
              parent: this,
              offset: ivert.length > 2 ? 220 : 90,
              contour: true
            });
          }
          else{
            this.top.offset = ivert.length > 2 ? 220 : 90;
          }
        }
      }
      else{
        if(this.top){
          this.top.remove();
          this.top = null;
        }
      }

      if(parent.is_pos("bottom") && (project.bounds.width != bounds.width || forse)){
        if(!this.ivert.has_size(bounds.width)){
          if(!this.bottom){
            this.bottom = new DimensionLine({
              pos: "bottom",
              parent: this,
              offset: ivert.length > 2 ? -260 : -130,
              contour: true
            });
          }else{
            this.bottom.offset = ivert.length > 2 ? -260 : -130;
          }
        }
      }
      else{
        if(this.bottom){
          this.bottom.remove();
          this.bottom = null;
        }
      }

    }
  }

  get owner_bounds() {
    return this.parent.bounds;
  }

  get dimension_bounds() {
    return this.parent.dimension_bounds;
  }

  get ihor() {
    return this._ihor || (this._ihor = new DimensionGroup())
  }

  get ivert() {
    return this._ivert || (this._ivert = new DimensionGroup())
  }
}

/**
 * ### Размерные линии на эскизе
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 21.08.2015
 *
 * @module geometry
 * @submodule dimension_line
 */

/**
 * ### Размерная линия на эскизе
 * Унаследована от [paper.Group](http://paperjs.org/reference/group/)<br />
 * См. так же, {{#crossLink "DimensionLineCustom"}}{{/crossLink}} - размерная линия, устанавливаемая пользователем
 *
 * @class DimensionLine
 * @extends paper.Group
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @constructor
 * @menuorder 46
 * @tooltip Размерная линия
 */

class DimensionLine extends paper.Group {

  constructor(attr) {

    super({parent: attr.parent});

    const _attr = this._attr = {};

    this._row = attr.row;

    if(this._row && this._row.path_data){
      attr._mixin(JSON.parse(this._row.path_data));
      if(attr.elm1){
        attr.elm1 = this.project.getItem({elm: attr.elm1});
      }
      if(attr.elm2){
        attr.elm2 = this.project.getItem({elm: attr.elm2});
      }
    }

    _attr.pos = attr.pos;
    _attr.elm1 = attr.elm1;
    _attr.elm2 = attr.elm2 || _attr.elm1;
    _attr.p1 = attr.p1 || "b";
    _attr.p2 = attr.p2 || "e";
    _attr.offset = attr.offset;

    if(attr.impost){
      _attr.impost = true;
    }

    if(attr.contour){
      _attr.contour = true;
    }

    if(!_attr.pos && (!_attr.elm1 || !_attr.elm2)){
      this.remove();
      return null;
    }

    // создаём детей
    new paper.Path({parent: this, name: 'callout1', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'callout2', strokeColor: 'black', guide: true});
    new paper.Path({parent: this, name: 'scale', strokeColor: 'black', guide: true});
    new paper.PointText({
      parent: this,
      name: 'text',
      justification: 'center',
      fillColor: 'black',
      fontSize: 72});

    this.on({
      mouseenter: this._mouseenter,
      mouseleave: this._mouseleave,
      click: this._click
    });

    $p.eve.attachEvent("sizes_wnd", this._sizes_wnd.bind(this));

  }

  // виртуальные метаданные для автоформ
  get _metadata() {
    return $p.dp.builder_text.metadata();
  }

  // виртуальный датаменеджер для автоформ
  get _manager() {
    return $p.dp.builder_text;
  }

  _mouseenter() {
    paper.canvas_cursor('cursor-arrow-ruler');
  }

  _mouseleave() {
    //paper.canvas_cursor('cursor-arrow-white');
  }

  _click(event) {
    event.stop();
    this.wnd = new RulerWnd(null, this);
    this.wnd.size = this.size;
  }

  _move_points(event, xy) {

    let _bounds, delta;

    const {_attr} = this;

    // получаем дельту - на сколько смещать
    if(_attr.elm1){

      // в _bounds[event.name] надо поместить координату по x или у (в зависисмости от xy), которую будем двигать
      _bounds = {};

      const p1 = (_attr.elm1._sub || _attr.elm1)[_attr.p1];
      const p2 = (_attr.elm2._sub || _attr.elm2)[_attr.p2];

      if(this.pos == "top" || this.pos == "bottom"){
        const size = Math.abs(p1.x - p2.x);
        if(event.name == "right"){
          delta = new paper.Point(event.size - size, 0);
          _bounds[event.name] = Math.max(p1.x, p2.x);
        }
        else{
          delta = new paper.Point(size - event.size, 0);
          _bounds[event.name] = Math.min(p1.x, p2.x);
        }
      }
      else{
        const size = Math.abs(p1.y - p2.y);
        if(event.name == "bottom"){
          delta = new paper.Point(0, event.size - size);
          _bounds[event.name] = Math.max(p1.y, p2.y);
        }
        else{
          delta = new paper.Point(0, size - event.size);
          _bounds[event.name] = Math.min(p1.y, p2.y);
        }
      }
    }
    else {
      _bounds = this.layer.bounds;
      if(this.pos == "top" || this.pos == "bottom")
        if(event.name == "right")
          delta = new paper.Point(event.size - _bounds.width, 0);
        else
          delta = new paper.Point(_bounds.width - event.size, 0);
      else{
        if(event.name == "bottom")
          delta = new paper.Point(0, event.size - _bounds.height);
        else
          delta = new paper.Point(0, _bounds.height - event.size);
      }
    }

    if(delta.length){
      const {project} = this;
      project.deselect_all_points();
      project.getItems({class: ProfileItem})
        .forEach(({b, e, generatrix, width}) => {
          width /= 2;
          if(Math.abs(b[xy] - _bounds[event.name]) < width && Math.abs(e[xy] - _bounds[event.name]) < width){
            generatrix.segments.forEach((segm) => segm.selected = true)
          }
          else if(Math.abs(b[xy] - _bounds[event.name]) < width){
            generatrix.firstSegment.selected = true;
          }
          else if(Math.abs(e[xy] - _bounds[event.name]) < width){
            generatrix.lastSegment.selected = true;
          }
      });
      project.move_points(delta, false);
      setTimeout(function () {
        this.deselect_all_points(true);
        this.register_update();
      }.bind(project), 200);
    }

  }

  _sizes_wnd(event) {

    if(this.wnd && event.wnd == this.wnd.wnd){

      switch(event.name) {
        case 'close':
          if(this.children.text){
            this.children.text.selected = false;
          }
          this.wnd = null;
          break;

        case 'left':
        case 'right':
          if(this.pos == "top" || this.pos == "bottom"){
            this._move_points(event, "x");
          }
          break;

        case 'top':
        case 'bottom':
          if(this.pos == "left" || this.pos == "right"){
            this._move_points(event, "y");
          }
          break;
      }
    }

  }

  redraw() {

    const {children} = this;
    if(!children.length){
      return;
    }

    const {path} = this;
    if(!path){
      this.visible = false;
      return;
    }

    // прячем крошечные размеры
    const length = path.length;
    if(length < consts.sticking_l){
      this.visible = false;
      return;
    }
    this.visible = true;

    const b = path.firstSegment.point;
    const e = path.lastSegment.point;
    const normal = path.getNormalAt(0).multiply(this.offset + path.offset);
    const bs = b.add(normal.multiply(0.8));
    const es = e.add(normal.multiply(0.8));

    if(children.callout1.segments.length){
      children.callout1.firstSegment.point = b;
      children.callout1.lastSegment.point = b.add(normal);
    }
    else{
      children.callout1.addSegments([b, b.add(normal)]);
    }

    if(children.callout2.segments.length){
      children.callout2.firstSegment.point = e;
      children.callout2.lastSegment.point = e.add(normal);
    }
    else{
      children.callout2.addSegments([e, e.add(normal)]);
    }

    if(children.scale.segments.length){
      children.scale.firstSegment.point = bs;
      children.scale.lastSegment.point = es;
    }
    else{
      children.scale.addSegments([bs, es]);
    }

    children.text.content = length.toFixed(0);
    children.text.rotation = e.subtract(b).angle;
    children.text.point = bs.add(es).divide(2);
  }

  get path() {

    const {parent, project, children, _attr, pos} = this;
    if(!children.length){
      return;
    }
    const {owner_bounds, dimension_bounds} = parent;
    let offset = 0, b, e;

    if(!pos){
      b = typeof _attr.p1 == "number" ? _attr.elm1.corns(_attr.p1) : _attr.elm1[_attr.p1];
      e = typeof _attr.p2 == "number" ? _attr.elm2.corns(_attr.p2) : _attr.elm2[_attr.p2];
    }
    else if(pos == "top"){
      b = owner_bounds.topLeft;
      e = owner_bounds.topRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "left"){
      b = owner_bounds.bottomLeft;
      e = owner_bounds.topLeft;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "bottom"){
      b = owner_bounds.bottomLeft;
      e = owner_bounds.bottomRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }
    else if(pos == "right"){
      b = owner_bounds.bottomRight;
      e = owner_bounds.topRight;
      offset = owner_bounds[pos] - dimension_bounds[pos];
    }

    // если точки профиля еще не нарисованы - выходим
    if(!b || !e){
      return;
    }

    const path = new paper.Path({ insert: false, segments: [b, e] });

    if(_attr.elm1 && pos){
      b = path.getNearestPoint(_attr.elm1[_attr.p1]);
      e = path.getNearestPoint(_attr.elm2[_attr.p2]);
      if(path.getOffsetOf(b) > path.getOffsetOf(e)){
        [b, e] = [e, b]
      }
      path.firstSegment.point = b;
      path.lastSegment.point = e;
    }
    path.offset = offset;

    return path;
  }

  // размер
  get size() {
    return parseFloat(this.children.text.content) || 0;
  }
  set size(v) {
    this.children.text.content = parseFloat(v).round(1);
  }

  // угол к горизонту в направлении размера
  get angle() {
    return 0;
  }
  set angle(v) {

  }

  // расположение относительно контура $p.enm.pos
  get pos() {
    return this._attr.pos || "";
  }
  set pos(v) {
    this._attr.pos = v;
    this.redraw();
  }

  // отступ от внешней границы изделия
  get offset() {
    return this._attr.offset || 90;
  }
  set offset(v) {
    const offset = (parseInt(v) || 90).round(0);
    if(this._attr.offset != offset){
      this._attr.offset = offset;
      this.project.register_change(true);
    }
  }

  /**
   * Удаляет элемент из контура и иерархии проекта
   * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
   * @method remove
   */
  remove() {
    if(this._row){
      this._row._owner.del(this._row);
      this._row = null;
      this.project.register_change();
    }
    super.remove();
  }
}


/**
 * ### Размерные линии, определяемые пользователем
 * @class DimensionLineCustom
 * @extends DimensionLine
 * @param attr
 * @constructor
 */
class DimensionLineCustom extends DimensionLine {

  constructor(attr) {

    if(!attr.row){
      attr.row = attr.parent.project.ox.coordinates.add();
    }

    // слой, которому принадлежит размерная линия
    if(!attr.row.cnstr){
      attr.row.cnstr = attr.parent.layer.cnstr;
    }

    // номер элемента
    if(!attr.row.elm){
      attr.row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    super(attr);

  }

  /**
   * Возвращает тип элемента (размерная линия)
   */
  get elm_type() {
    return $p.enm.elm_types.Размер;
  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   */
  save_coordinates() {
    const {_row, _attr, elm_type, pos, offset, size} = this;

    // сохраняем размер
    _row.len = size;

    // устанавливаем тип элемента
    _row.elm_type = elm_type;

    // сериализованные данные
    _row.path_data = JSON.stringify({
      pos: pos,
      elm1: _attr.elm1.elm,
      elm2: _attr.elm2.elm,
      p1: _attr.p1,
      p2: _attr.p2,
      offset: offset
    });
  }

  _click(event) {
    event.stop();
    if(paper.tool instanceof ToolRuler){
      this.selected = true;
    }
  }

  _mouseenter() {
    if(paper.tool instanceof ToolRuler){
      paper.canvas_cursor('cursor-arrow-ruler');
    }
    else{
      paper.canvas_cursor('cursor-arrow-ruler-dis');
    }
  }


}


/**
 * ### Базовый класс элементов построителя
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule element
 */


/**
 * ### Базовый класс элементов построителя
 * Унаследован от [paper.Group](http://paperjs.org/reference/group/). Cвойства и методы `BuilderElement` присущи всем элементам построителя,
 * но не характерны для классов [Path](http://paperjs.org/reference/path/) и [Group](http://paperjs.org/reference/group/) фреймворка [paper.js](http://paperjs.org/about/),
 * т.к. описывают не линию и не коллекцию графических примитивов, а элемент конструкции с определенной физикой и поведением
 *
 * @class BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента
 *  @param attr.b {paper.Point} - координата узла начала элемента - не путать с координатами вершин пути элемента
 *  @param attr.e {paper.Point} - координата узла конца элемента - не путать с координатами вершин пути элемента
 *  @param attr.contour {Contour} - контур, которому принадлежит элемент
 *  @param attr.type_el {_enm.elm_types}  может измениться при конструировании. например, импост -> рама
 *  @param [attr.inset] {_cat.inserts} -  вставка элемента. если не указано, будет вычислена по типу элемента
 *  @param [attr.path] (r && arc_ccw && more_180)
 * @constructor
 * @extends paper.Group
 * @menuorder 40
 * @tooltip Элемент изделия
 */
class BuilderElement extends paper.Group {

  constructor(attr) {

    super(attr);

    if(!attr.row){
      attr.row = this.project.ox.coordinates.add();
    }

    this._row = attr.row;

    this._attr = {};

    if(attr.proto){

      if(attr.proto.inset){
        this.inset = attr.proto.inset;
      }

      if(attr.parent){
        this.parent = attr.parent;
      }
      else if(attr.proto.parent){
        this.parent = attr.proto.parent;
      }

      if(attr.proto instanceof Profile){
        this.insertBelow(attr.proto);
      }

      this.clr = attr.proto.clr;

    }
    else if(attr.parent){
      this.parent = attr.parent;
    }

    if(!this._row.cnstr && this.layer.cnstr){
      this._row.cnstr = this.layer.cnstr;
    }

    if(!this._row.elm){
      this._row.elm = this.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    if(this._row.elm_type.empty() && !this.inset.empty()){
      this._row.elm_type = this.inset.nom().elm_type;
    }

    this.project.register_change();

  }

  /**
   * ### Элемент - владелец
   * имеет смысл для раскладок и рёбер заполнения
   * @property owner
   * @type BuilderElement
   */
  get owner() {
    return this._attr.owner;
  }
  set owner(v) {
    this._attr.owner = v;
  }

  /**
   * ### Образующая
   * прочитать - установить путь образующей. здесь может быть линия, простая дуга или безье
   * по ней будут пересчитаны pathData и прочие свойства
   * @property generatrix
   * @type paper.Path
   */
  get generatrix() {
    return this._attr.generatrix;
  }
  set generatrix(attr) {

    const {_attr} = this;
    _attr.generatrix.removeSegments();

    if(this.hasOwnProperty('rays')){
      this.rays.clear();
    }

    if(Array.isArray(attr)){
      _attr.generatrix.addSegments(attr);
    }
    else if(attr.proto &&  attr.p1 &&  attr.p2){

      // сначала, выясняем направление пути
      let tpath = attr.proto;
      if(tpath.getDirectedAngle(attr.ipoint) < 0){
        tpath.reverse();
      }

      // далее, уточняем порядок p1, p2
      let d1 = tpath.getOffsetOf(attr.p1);
      let d2 = tpath.getOffsetOf(attr.p2), d3;
      if(d1 > d2){
        d3 = d2;
        d2 = d1;
        d1 = d3;
      }
      if(d1 > 0){
        tpath = tpath.split(d1);
        d2 = tpath.getOffsetOf(attr.p2);
      }
      if(d2 < tpath.length){
        tpath.split(d2);
      }

      _attr.generatrix.remove();
      _attr.generatrix = tpath;
      _attr.generatrix.parent = this;

      if(this.layer.parent){
        _attr.generatrix.guide = true;
      }
    }
  }

  /**
   * путь элемента - состоит из кривых, соединяющих вершины элемента
   * для профиля, вершин всегда 4, для заполнений может быть <> 4
   * @property path
   * @type paper.Path
   */
  get path() {
    return this._attr.path;
  }
  set path(attr) {
    if(attr instanceof paper.Path){
      const {_attr} = this;
      _attr.path.removeSegments();
      _attr.path.addSegments(attr.segments);
      if(!_attr.path.closed){
        _attr.path.closePath(true);
      }
    }
  }

  // виртуальные метаданные для автоформ
  get _metadata() {
    const {fields, tabular_sections} = this.project.ox._metadata;
    const t = this,
      _xfields = tabular_sections.coordinates.fields, //_dgfields = t.project._dp._metadata.fields
      inset = Object.assign({}, _xfields.inset),
      arc_h = Object.assign({}, _xfields.r, {synonym: "Высота дуги"}),
      info = Object.assign({}, fields.note, {synonym: "Элемент"}),
      cnn1 = Object.assign({}, tabular_sections.cnn_elmnts.fields.cnn),
      cnn2 = Object.assign({}, cnn1),
      cnn3 = Object.assign({}, cnn1);

    function cnn_choice_links(o, cnn_point){

      const nom_cnns = $p.cat.cnns.nom_cnn(t, cnn_point.profile, cnn_point.cnn_types);

      if($p.utils.is_data_obj(o)){
        return nom_cnns.some((cnn) => o == cnn);
      }
      else{
        let refs = "";
        nom_cnns.forEach((cnn) => {
          if(refs){
            refs += ", ";
          }
          refs += "'" + cnn.ref + "'";
        });
        return "_t_.ref in (" + refs + ")";
      }
    }


    // динамические отборы для вставок и соединений
    const {_inserts_types_filling} = $p.cat.inserts;
    inset.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => {
        const {sys} = this.project._dp;

          let selection;

          if(this instanceof Filling){
            if($p.utils.is_data_obj(o)){
              const {thickness, insert_type, insert_glass_type} = o;
              return _inserts_types_filling.indexOf(insert_type) != -1 &&
                thickness >= sys.tmin && thickness <= sys.tmax &&
                (insert_glass_type.empty() || insert_glass_type == $p.enm.inserts_glass_types.Заполнение);
            }
            else{
              let refs = "";
              $p.cat.inserts.by_thickness(sys.tmin, sys.tmax).forEach((o) => {
                if(o.insert_glass_type.empty() || o.insert_glass_type == $p.enm.inserts_glass_types.Заполнение){
                  if(refs){
                    refs += ", ";
                  }
                  refs += "'" + o.ref + "'";
                }
              });
              return "_t_.ref in (" + refs + ")";
            }
          }
          else if(this instanceof Profile){
            if(this.nearest()){
              selection = {elm_type: {in: [$p.enm.elm_types.Створка, $p.enm.elm_types.Добор]}};
            }
            else{
              selection = {elm_type: {in: [$p.enm.elm_types.Рама, $p.enm.elm_types.Импост, $p.enm.elm_types.Добор]}};
            }
          }
          else{
            selection = {elm_type: this.nom.elm_type};
          }

          if($p.utils.is_data_obj(o)){
            let ok = false;
            selection.nom = o;
            sys.elmnts.find_rows(selection, (row) => {
              ok = true;
              return false;
            });
            return ok;
          }
          else{
            let refs = "";
            sys.elmnts.find_rows(selection, (row) => {
              if(refs){
                refs += ", ";
              }
              refs += "'" + row.nom.ref + "'";
            });
            return "_t_.ref in (" + refs + ")";
          }
        }]}
    ];

    cnn1.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => cnn_choice_links(o, this.rays.b)]
    }];

    cnn2.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o, f) => cnn_choice_links(o, this.rays.e)]
    }];

    cnn3.choice_links = [{
      name: ["selection",	"ref"],
      path: [(o) => {
        const cnn_ii = this.selected_cnn_ii();
        let nom_cnns = [$p.utils.blank.guid];

        if(cnn_ii){
          if (cnn_ii.elm instanceof Filling) {
            nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, this, $p.enm.cnn_types.acn.ii);
          }
          else if (cnn_ii.elm_type == $p.enm.elm_types.Створка && this.elm_type != $p.enm.elm_types.Створка) {
            nom_cnns = $p.cat.cnns.nom_cnn(cnn_ii.elm, this, $p.enm.cnn_types.acn.ii);
          }
          else {
            nom_cnns = $p.cat.cnns.nom_cnn(this, cnn_ii.elm, $p.enm.cnn_types.acn.ii);
          }
        }

        if ($p.utils.is_data_obj(o)) {
          return nom_cnns.some((cnn) => o == cnn);
        }
        else {
          var refs = "";
          nom_cnns.forEach((cnn) => {
            if (refs) {
              refs += ", ";
            }
            refs += "'" + cnn.ref + "'";
          });
          return "_t_.ref in (" + refs + ")";
        }
      }]
    }];

    // дополняем свойства поля цвет отбором по служебным цветам
    $p.cat.clrs.selection_exclude_service(_xfields.clr, this);

    return {
      fields: {
        info: info,
        inset: inset,
        clr: _xfields.clr,
        x1: _xfields.x1,
        x2: _xfields.x2,
        y1: _xfields.y1,
        y2: _xfields.y2,
        cnn1: cnn1,
        cnn2: cnn2,
        cnn3: cnn3,
        arc_h: arc_h,
        r: _xfields.r,
        arc_ccw: _xfields.arc_ccw
      }
    };
  }

  // виртуальный датаменеджер для автоформ
  get _manager() {
    return this.project._dp._manager;
  }

  /**
   * ### Номенклатура
   * свойство только для чтения, т.к. вычисляется во вставке
   * @type CatNom
   */
  get nom() {
    return this.inset.nom(this);
  }

  // номер элемента - свойство только для чтения
  get elm() {
    return this._row ? this._row.elm : 0;
  }

  // информация для редактора свойств
  get info() {
    return "№" + this.elm;
  }

  // виртуальная ссылка
  get ref() {
    const {inset} = this;
    const nom = inset.nom(this);
    return nom && !nom.empty() ? nom.ref : inset.ref;
  }

  // ширина
  get width() {
    return this.nom.width || 80;
  }

  // толщина (для заполнений и, возможно, профилей в 3D)
  get thickness() {
    return this.inset.thickness;
  }

  // опорный размер (0 для рам и створок, 1/2 ширины для импостов)
  get sizeb() {
    return this.inset.sizeb || 0;
  }

  // размер до фурнитурного паза
  get sizefurn() {
    return this.nom.sizefurn || 20;
  }

  /**
   * Примыкающее соединение для диалога свойств
   */
  get cnn3(){
    const cnn_ii = this.selected_cnn_ii();
    return cnn_ii ? cnn_ii.row.cnn : $p.cat.cnns.get();
  }
  set cnn3(v) {
    const cnn_ii = this.selected_cnn_ii();
    if(cnn_ii && cnn_ii.row.cnn != v){
      cnn_ii.row.cnn = v;
      if(this._attr._nearest_cnn){
        this._attr._nearest_cnn = cnn_ii.row.cnn;
      }
      if(this.rays){
        this.rays.clear();
      }
      this.project.register_change();
    }
  }

  // вставка
  get inset() {
    return (this._row ? this._row.inset : null) || $p.cat.inserts.get();
  }
  set inset(v) {
    this.set_inset(v);
  }

  // цвет элемента
  get clr() {
    return this._row.clr;
  }
  set clr(v) {
    this.set_clr(v);
  }

  /**
   * Сеттер вставки с учетом выделенных элементов
   * @param v {CatInserts}
   * @param [ignore_select] {Boolean}
   */
  set_inset(v, ignore_select) {
    const {_row, _attr, project} = this;
    if(_row.inset != v){
      _row.inset = v;
      if(_attr && _attr._rays){
        _attr._rays.clear(true);
      }
      project.register_change();
    }
  }

  /**
   * Сеттер цвета элемента
   * @param v {CatClrs}
   * @param [ignore_select] {Boolean}
   */
  set_clr(v, ignore_select) {
    this._row.clr = v;
    // цвет элементу присваиваем только если он уже нарисован
    if(this.path instanceof paper.Path){
      this.path.fillColor = BuilderElement.clr_by_clr.call(this, this._row.clr, false);
    }
    this.project.register_change();
  }

  /**
   * Подключает окно редактор свойств текущего элемента, выбранного инструментом
   */
  attache_wnd(cell) {
    if(!this._attr._grid || !this._attr._grid.cell){

      this._attr._grid = cell.attachHeadFields({
        obj: this,
        oxml: this.oxml
      });
      this._attr._grid.attachEvent("onRowSelect", function(id){
        if(["x1","y1","cnn1"].indexOf(id) != -1){
          this._obj.select_node("b");
        }
        else if(["x2","y2","cnn2"].indexOf(id) != -1){
          this._obj.select_node("e");
        }
      });
    }
    else if(this._attr._grid._obj != this){
      this._attr._grid.attach({
        obj: this,
        oxml: this.oxml
      });
    }
  }

  /**
   * Отключает и выгружает из памяти окно свойств элемента
   */
  detache_wnd() {
    const {_grid} = this._attr;
    if(_grid && _grid.destructor){
      _grid._owner_cell.detachObject(true);
      delete this._attr._grid;
    }
  }

  /**
   * Возвращает примыкающий элемент и строку табчасти соединений
   */
  selected_cnn_ii() {
    const {project, elm} = this;
    const sel = project.getSelectedItems();
    const {cnns} = project.connections;
    const items = [];
    let res;

    sel.forEach((item) => {
      if(item.parent instanceof ProfileItem || item.parent instanceof Filling)
        items.push(item.parent);
      else if(item instanceof Filling)
        items.push(item);
    });

    if(items.length > 1 &&
      items.some((item) => item == this) &&
      items.some((item) => {
        if(item != this){
          cnns.forEach((row) => {
            if(!row.node1 && !row.node2 &&
              ((row.elm1 == elm && row.elm2 == item.elm) || (row.elm1 == item.elm && row.elm2 == elm))){
              res = {elm: item, row: row};
              return false;
            }
          });
          if(res){
            return true;
          }
        }
      })){
      return res;
    }
  }

  /**
   * ### Удаляет элемент из контура и иерархии проекта
   * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_ и отключает наблюдателя
   * @method remove
   */
  remove() {
    this.detache_wnd();

    if(this.parent){
      if (this.parent.on_remove_elm){
        this.parent.on_remove_elm(this);
      }
      if (this.parent._noti && this._observer){
        Object.unobserve(this.parent._noti, this._observer);
        delete this._observer;
      }
    }

    if(this._row && this._row._owner && this.project.ox === this._row._owner._owner){
      this._row._owner.del(this._row);
    }

    this.project.register_change();

    super.remove();
  }

  static clr_by_clr(clr, view_out) {
    let {clr_str, clr_in, clr_out} = clr;

    if(!view_out){
      if(!clr_in.empty() && clr_in.clr_str)
        clr_str = clr_in.clr_str;
    }else{
      if(!clr_out.empty() && clr_out.clr_str)
        clr_str = clr_out.clr_str;
    }

    if(!clr_str){
      clr_str = this.default_clr_str ? this.default_clr_str : "fff";
    }

    if(clr_str){
      clr = clr_str.split(",");
      if(clr.length == 1){
        if(clr_str[0] != "#")
          clr_str = "#" + clr_str;
        clr = new paper.Color(clr_str);
        clr.alpha = 0.96;
      }
      else if(clr.length == 4){
        clr = new paper.Color(clr[0], clr[1], clr[2], clr[3]);
      }
      else if(clr.length == 3){
        if(this.path && this.path.bounds)
          clr = new paper.Color({
            stops: [clr[0], clr[1], clr[2]],
            origin: this.path.bounds.bottomLeft,
            destination: this.path.bounds.topRight
          });
        else
          clr = new paper.Color(clr[0]);
      }
      return clr;
    }
  }
}


Editor.BuilderElement = BuilderElement;


/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module geometry
 * @submodule filling
 */


/**
 * ### Заполнение
 * - Инкапсулирует поведение элемента заполнения
 * - У заполнения есть коллекция рёбер, образующая путь контура
 * - Путь всегда замкнутый, образует простой многоугольник без внутренних пересечений, рёбра могут быть гнутыми
 *
 * @class Filling
 * @param attr {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 * @menuorder 45
 * @tooltip Заполнение
 */

class Filling extends AbstractFilling(BuilderElement) {

  constructor(attr) {

    const {path} = attr;
    if(path){
      delete attr.path;
    }

    super(attr);

    if(path){
      attr.path = path;
    }

    /**
     * За этим полем будут "следить" элементы раскладок и пересчитывать - перерисовывать себя при изменениях соседей
     */
    this._noti = {};

    /**
     * Формирует оповещение для тех, кто следит за this._noti
     * @param obj
     */
    this.notify = function (obj) {
      Object.getNotifier(this._noti).notify(obj);
      this.project.register_change();
    }.bind(this);


    // initialize
    this.initialize(attr);

  }

  initialize(attr) {

    const _row = attr.row;
    const {_attr, project} = this;
    const h = project.bounds.height + project.bounds.y;

    if(_row.path_data){
      _attr.path = new paper.Path(_row.path_data);
    }

    else if(attr.path){
      _attr.path = new paper.Path();
      this.path = attr.path;
    }
    else{
      _attr.path = new paper.Path([
        [_row.x1, h - _row.y1],
        [_row.x1, h - _row.y2],
        [_row.x2, h - _row.y2],
        [_row.x2, h - _row.y1]
      ]);
    }

    _attr.path.closePath(true);
    _attr.path.reduce();
    _attr.path.strokeWidth = 0;

    // для нового устанавливаем вставку по умолчанию
    if(_row.inset.empty()){
      _row.inset = project.default_inset({elm_type: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]});
    }

    // для нового устанавливаем цвет по умолчанию
    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({nom: _row.inset}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    if(_row.clr.empty()){
      project._dp.sys.elmnts.find_rows({elm_type: {in: [$p.enm.elm_types.Стекло, $p.enm.elm_types.Заполнение]}}, (row) => {
        _row.clr = row.clr;
        return false;
      });
    }
    this.clr = _row.clr;

    if(_row.elm_type.empty()){
      _row.elm_type = $p.enm.elm_types.Стекло;
    }

    _attr.path.visible = false;

    this.addChild(_attr.path);

    // раскладки текущего заполнения
    project.ox.coordinates.find_rows({
      cnstr: this.layer.cnstr,
      parent: this.elm,
      elm_type: $p.enm.elm_types.Раскладка
    }, (row) => new Onlay({row: row, parent: this}));

  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   * @for Filling
   */
  save_coordinates() {

    const {_row, project, profiles, bounds, imposts, nom} = this;
    const h = project.bounds.height + project.bounds.y;
    const cnns = project.connections.cnns;
    const length = profiles.length;

    // строка в таблице заполнений продукции
    project.ox.glasses.add({
      elm: _row.elm,
      nom: nom,
      formula: this.formula(),
      width: bounds.width,
      height: bounds.height,
      s: this.s,
      is_rectangular: this.is_rectangular,
      is_sandwich: nom.elm_type == $p.enm.elm_types.Заполнение,
      thickness: this.thickness,
    });

    let curr, prev,	next

    // координаты bounds
    _row.x1 = (bounds.bottomLeft.x - project.bounds.x).round(3);
    _row.y1 = (h - bounds.bottomLeft.y).round(3);
    _row.x2 = (bounds.topRight.x - project.bounds.x).round(3);
    _row.y2 = (h - bounds.topRight.y).round(3);
    _row.path_data = this.path.pathData;

    // получаем пути граней профиля
    for(let i=0; i<length; i++ ){

      curr = profiles[i];

      if(!curr.profile || !curr.profile._row || !curr.cnn){
        if($p.job_prm.debug)
          throw new ReferenceError("Не найдено ребро заполнения");
        else
          return;
      }

      curr.aperture_path = curr.profile.generatrix.get_subpath(curr.b, curr.e)._reversed ?
        curr.profile.rays.outer : curr.profile.rays.inner;
    }

    // получам пересечения
    for(let i=0; i<length; i++ ){

      prev = i === 0 ? profiles[length-1] : profiles[i-1];
      curr = profiles[i];
      next = i === length-1 ? profiles[0] : profiles[i+1];

      const pb = curr.aperture_path.intersect_point(prev.aperture_path, curr.b, true);
      const pe = curr.aperture_path.intersect_point(next.aperture_path, curr.e, true);

      if(!pb || !pe){
        if($p.job_prm.debug)
          throw "Filling:path";
        else
          return;
      }

      // соединения с профилями
      cnns.add({
        elm1: _row.elm,
        elm2: curr.profile._row.elm,
        node1: "",
        node2: "",
        cnn: curr.cnn.ref,
        aperture_len: curr.aperture_path.get_subpath(pb, pe).length.round(1)
      });

    }

    // удаляем лишние ссылки
    for(let i=0; i<length; i++ ){
      delete profiles[i].aperture_path;
    }

    // дочерние раскладки
    imposts.forEach((curr) => curr.save_coordinates());
  }

  /**
   * Создаёт створку в текущем заполнении
   */
  create_leaf() {

    // прибиваем соединения текущего заполнения
    this.project.connections.cnns.clear(true, {elm1: this.elm});

    // создаём пустой новый слой
    const contour = new Contour( {parent: this.parent});

    // задаём его путь - внутри будут созданы профили
    contour.path = this.profiles;

    // помещаем себя вовнутрь нового слоя
    this.parent = contour;
    this._row.cnstr = contour.cnstr;

    // фурнитура и параметры по умолчанию
    contour.furn = this.project.default_furn;

    // оповещаем мир о новых слоях
    Object.getNotifier(this.project._noti).notify({
      type: 'rows',
      tabular: "constructions"
    });

    // делаем створку текущей
    contour.activate();
  }

  /**
   * Возвращает сторону соединения заполнения с профилем раскладки
   */
  cnn_side() {
    return $p.enm.cnn_sides.Изнутри;
  }

  select_node(v) {
    let point, segm, delta = Infinity;
    if(v === "b"){
      point = this.bounds.bottomLeft;
    }else{
      point = this.bounds.topRight;
    }
    this._attr.path.segments.forEach((curr) => {
      curr.selected = false;
      if(point.getDistance(curr.point) < delta){
        delta = point.getDistance(curr.point);
        segm = curr;
      }
    });
    if(segm){
      segm.selected = true;
      this.view.update();
    }
  }

  setSelection(selection) {
    super.setSelection(selection);
    if(selection){
      const {path} = this;
      for(let elm of this.children){
        if(elm != path){
          elm.selected = false;
        }
      }
    }
  }

  /**
   * Перерисовывает раскладки текущего заполнения
   */
  redraw() {

    this.sendToBack();

    const {path, imposts, _attr, is_rectangular} = this;
    const {elm_font_size} = consts;

    path.visible = true;
    imposts.forEach((elm) => elm.redraw());

    // прочистим пути
    this.purge_path();

    // если текст не создан - добавляем
    if(!_attr._text){
      _attr._text = new paper.PointText({
        parent: this,
        fillColor: 'black',
        fontSize: elm_font_size,
        guide: true,
      });
    }
    _attr._text.visible = is_rectangular;

    if(is_rectangular){
      const {bounds} = path;
      _attr._text.content = this.formula();
      _attr._text.point = bounds.bottomLeft.add([elm_font_size * 0.6, -elm_font_size]);
      if(_attr._text.bounds.width > (bounds.width - 2 * elm_font_size)){
        const atext = _attr._text.content.split(' ');
        if(atext.length > 1){
          _attr._text.content = '';
          atext.forEach((text, index) => {
            if(!_attr._text.content){
              _attr._text.content = text;
            }
            else{
              _attr._text.content += ((index === atext.length - 1) ? '\n' : ' ') + text;
            }
          })
          _attr._text.point.y -= elm_font_size;
        }
      }
    }
    else{

    }
  }

  /**
   * ### Рисует заполнение отдельным элементом
   */
  draw_fragment() {
    const {l_dimensions, layer, path} = this;
    this.visible = true;
    path.set({
      strokeColor: 'black',
      strokeWidth: 1,
      strokeScaling: false,
      opacity: 0.6,
    });
    l_dimensions.redraw(true);
    layer.zoom_fit();
  }

  /**
   * Сеттер вставки с учетом выделенных элементов
   * @param v {CatInserts}
   * @param [ignore_select] {Boolean}
   */
  set_inset(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){

      const {glass_specification} = this.project.ox;
      const proto = glass_specification.find_rows({elm: this.elm});

      this.project.selected_glasses().forEach((elm) => {
        if(elm !== this){
          // копируем вставку
          elm.set_inset(v, true);
          // копируем состав заполнения
          glass_specification.clear(true, {elm: elm.elm});
          proto.forEach((row) => glass_specification.add({
            elm: elm.elm,
            inset: row.inset,
            clr: row.clr,
          }));
        }
      });
    }
    super.set_inset(v);
  }

  /**
   * Сеттер цвета элемента
   * @param v {CatClrs}
   * @param ignore_select {Boolean}
   */
  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){
      this.project.selected_glasses().forEach((elm) => {
        if(elm !== this){
          elm.set_clr(v, true);
        }
      });
    }
    super.set_clr(v);
  }

  /**
   * Прочищает паразитные пути
   */
  purge_path() {
    const paths = this.children.filter((child) => child instanceof paper.Path);
    const {path} = this;
    paths.forEach((p) => p != path && p.remove());
  }

  fill_error() {
    const {path} = this;
    path.fillColor = new paper.Color({
      stops: ["#fee", "#fcc", "#fdd"],
      origin: path.bounds.bottomLeft,
      destination: path.bounds.topRight
    });
  }

  get profiles() {
    return this._attr._profiles || [];
  }

  /**
   * Массив раскладок
   */
  get imposts() {
    return this.getItems({class: Onlay});
  }

  /**
   * Удаляет все раскладки заполнения
   */
  remove_onlays() {
    for(let onlay of this.imposts){
      onlay.remove();
    }
  }

  /**
   * Площадь заполнения
   * @return {number}
   */
  get s() {
    return this.bounds.width * this.bounds.height / 1000000;
  }

  /**
   * ### Точка внутри пути
   * Возвращает точку, расположенную гарантированно внутри pfgjk
   *
   * @property interiorPoint
   * @type paper.Point
   */
  interiorPoint() {
    return this.path.interiorPoint;
  }

  /**
   * Признак прямоугольности
   */
  get is_rectangular() {
    return this.profiles.length === 4 && !this._attr.path.hasHandles();
  }

  get generatrix() {
    return this.path;
  }

  /**
   * путь элемента - состоит из кривых, соединяющих вершины элемента
   * @property path
   * @type paper.Path
   */
  get path() {
    return this._attr.path;
  }
  set path(attr) {
    let {_attr, path} = this;

    if(path){
      path.removeSegments();
    }
    else{
      path = _attr.path = new paper.Path({parent: this});
    }

    _attr._profiles = [];

    if(attr instanceof paper.Path){
      path.addSegments(attr.segments);
    }
    else if(Array.isArray(attr)){
      const {length} = attr;
      const {connections} = this.project;
      let prev, curr, next, sub_path;
      // получам эквидистанты сегментов, смещенные на размер соединения
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        sub_path = curr.profile.generatrix.get_subpath(curr.b, curr.e);

        curr.cnn = $p.cat.cnns.elm_cnn(this, curr.profile, $p.enm.cnn_types.acn.ii,
          curr.cnn || connections.elm_cnn(this, curr.profile), false, curr.outer);

        curr.sub_path = sub_path.equidistant(
          (sub_path._reversed ? -curr.profile.d1 : curr.profile.d2) + (curr.cnn ? curr.cnn.sz : 20), consts.sticking);

      }
      // получам пересечения
      for(let i=0; i<length; i++ ){
        prev = i === 0 ? attr[length-1] : attr[i-1];
        curr = attr[i];
        next = i === length-1 ? attr[0] : attr[i+1];
        if(!curr.pb)
          curr.pb = prev.pe = curr.sub_path.intersect_point(prev.sub_path, curr.b, true);
        if(!curr.pe)
          curr.pe = next.pb = curr.sub_path.intersect_point(next.sub_path, curr.e, true);
        if(!curr.pb || !curr.pe){
          if($p.job_prm.debug)
            throw "Filling:path";
          else
            continue;
        }
        curr.sub_path = curr.sub_path.get_subpath(curr.pb, curr.pe);
      }
      // формируем путь
      for(let i=0; i<length; i++ ){
        curr = attr[i];
        path.addSegments(curr.sub_path.segments);
        ["anext","pb","pe"].forEach((prop) => { delete curr[prop] });
        _attr._profiles.push(curr);
      }
    }

    if(path.segments.length && !path.closed){
      path.closePath(true);
    }

    path.reduce();
  }

  // возвращает текущие (ранее установленные) узлы заполнения
  get nodes() {
    let res = this.profiles.map((curr) => curr.b);
    if(!res.length){
      const {path, parent} = this;
      if(path){
        res = parent.glass_nodes(path);
      }
    }
    return res;
  }

  /**
   * Возвращает массив внешних примыкающих профилей текущего заполнения
   */
  get outer_profiles() {
    return this.profiles;
  }

  /**
   * Массив с рёбрами периметра
   */
  get perimeter() {
    const res = [];
    this.profiles.forEach((curr) => {
      const tmp = {
        len: curr.sub_path.length,
        angle: curr.e.subtract(curr.b).angle,
        profile: curr.profile
      }
      res.push(tmp);
      if(tmp.angle < 0){
        tmp.angle += 360;
      }
    });
    return res;
  }

  get bounds() {
    const {path} = this;
    return path ? path.bounds : new paper.Rectangle();
  }

  /**
   * Координата x левой границы (только для чтения)
   */
  get x1() {
    return (this.bounds.left - this.project.bounds.x).round(1);
  }

  /**
   * Координата x правой границы (только для чтения)
   */
  get x2() {
    return (this.bounds.right - this.project.bounds.x).round(1);
  }

  /**
   * Координата y нижней границы (только для чтения)
   */
  get y1() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.bottom).round(1);
  }

  /**
   * Координата y верхней (только для чтения)
   */
  get y2() {
    return (this.project.bounds.height + this.project.bounds.y - this.bounds.top).round(1);
  }

  /**
   * информация для редактора свойста
   */
  get info() {
    const {elm, bounds, thickness} = this;
    return "№" + elm + " w:" + bounds.width.toFixed(0) + " h:" + bounds.height.toFixed(0) + " z:" + thickness.toFixed(0);
  }

  /**
   * Описание полей диалога свойств элемента
   */
  get oxml() {
    const oxml = {
      " ": [
        {id: "info", path: "o.info", type: "ro"},
        "inset",
        "clr"
      ],
      "Начало": [
        {id: "x1", path: "o.x1", synonym: "X1", type: "ro"},
        {id: "y1", path: "o.y1", synonym: "Y1", type: "ro"}
      ],
      "Конец": [
        {id: "x2", path: "o.x2", synonym: "X2", type: "ro"},
        {id: "y2", path: "o.y2", synonym: "Y2", type: "ro"}
      ]
    };
    if(this.selected_cnn_ii()){
      oxml["Примыкание"] = ["cnn3"];
    }
    return oxml;
  }

  get default_clr_str() {
    return "#def,#d0ddff,#eff";
  }

  /**
   * Возвращает формулу (код состава) заполнения
   * @type String
   */
  formula(by_art) {
    let res;
    this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
      let {name, article} = row.inset;
      const aname = row.inset.name.split(' ');
      if(by_art && article){
        name = article;
      }
      else if(aname.length){
        name = aname[0];
      }
      if(!res){
        res = name;
      }
      else{
        res += (by_art ? '*' : 'x') + name;
      }
    });
    return res || (by_art ? this.inset.article || this.inset.name : this.inset.name);
  }

  // виртуальная ссылка для заполнений равна толщине
  get ref() {
    return this.thickness.toFixed();
  }

  // переопределяем геттер вставки
  get inset() {
    const ins = super.inset;
    const {_attr} = this;
    if(!_attr._ins_proxy || _attr._ins_proxy._ins !== ins){
      _attr._ins_proxy = new Proxy(ins, {
        get: (target, prop) => {
          switch (prop){
            case 'presentation':
              return this.formula();

            case 'thickness':
              let res = 0;
              this.project.ox.glass_specification.find_rows({elm: this.elm}, (row) => {
                res += row.inset.thickness;
              });
              return res || ins.thickness;

            default:
              return target[prop];
          }
        }
      });
      _attr._ins_proxy._ins = ins;
    }
    return _attr._ins_proxy;
  }
  set inset(v) {
    this.set_inset(v);
  }

}

Editor.Filling = Filling;

/**
 *
 * Created 21.08.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author    Evgeniy Malyarov
 *
 * @module geometry
 * @submodule freetext
 */

/**
 * ### Произвольный текст на эскизе
 *
 * @class FreeText
 * @param attr {Object} - объект с указанием на строку координат и родительского слоя
 * @param attr.parent {BuilderElement} - элемент, к которому привязывается комментарий
 * @constructor
 * @extends paper.PointText
 * @menuorder 46
 * @tooltip Текст на эскизе
 */
class FreeText extends paper.PointText {

  constructor(attr) {

    if(!attr.fontSize){
      attr.fontSize = consts.font_size;
    }

    super(attr);

    if(attr.row){
      this._row = attr.row;
    }
    else{
      this._row = attr.row = attr.parent.project.ox.coordinates.add();
    }

    const {_row} = this;

    if(!_row.cnstr){
      _row.cnstr = attr.parent.layer.cnstr;
    }

    if(!_row.elm){
      _row.elm = attr.parent.project.ox.coordinates.aggregate([], ["elm"], "max") + 1;
    }

    if(attr.point){
      if(attr.point instanceof paper.Point)
        this.point = attr.point;
      else
        this.point = new paper.Point(attr.point);
    }
    else{

      this.clr = _row.clr;
      this.angle = _row.angle_hor;

      if(_row.path_data){
        var path_data = JSON.parse(_row.path_data);
        this.x = _row.x1 + path_data.bounds_x || 0;
        this.y = _row.y1 - path_data.bounds_y || 0;
        this._mixin(path_data, null, ["bounds_x","bounds_y"]);
      }else{
        this.x = _row.x1;
        this.y = _row.y1;
      }
    }

    this.bringToFront();

  }

  /**
   * Удаляет элемент из контура и иерархии проекта
   * Одновлеменно, удаляет строку из табчасти табчасти _Координаты_
   * @method remove
   */
  remove() {
    this._row._owner.del(this._row);
    this._row = null;
    paper.PointText.prototype.remove.call(this);
  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   */
  save_coordinates() {
    const {_row} = this;

    _row.x1 = this.x;
    _row.y1 = this.y;
    _row.angle_hor = this.angle;

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;

    // сериализованные данные
    _row.path_data = JSON.stringify({
      text: this.text,
      font_family: this.font_family,
      font_size: this.font_size,
      bold: this.bold,
      align: this.align.ref,
      bounds_x: this.project.bounds.x,
      bounds_y: this.project.bounds.y
    });
  }

  /**
   * ### Перемещает элемент и информирует об этом наблюдателя
   * @method move_points
   */
  move_points(point) {
    this.point = point;

    Object.getNotifier(this).notify({
      type: 'update',
      name: "x"
    });
    Object.getNotifier(this).notify({
      type: 'update',
      name: "y"
    });
  }

  /**
   * Возвращает тип элемента (Текст)
   * @property elm_type
   * @for FreeText
   */
  get elm_type() {
    return $p.enm.elm_types.Текст;
  }

  // виртуальные метаданные для автоформ
  get _metadata() {
    return $p.dp.builder_text.metadata();
  }

  // виртуальный датаменеджер для автоформ
  get _manager() {
    return $p.dp.builder_text;
  }

  // транслирует цвет из справочника в строку и обратно
  get clr() {
    return this._row ? this._row.clr : $p.cat.clrs.get();
  }
  set clr(v) {
    this._row.clr = v;
    if(this._row.clr.clr_str.length == 6)
      this.fillColor = "#" + this._row.clr.clr_str;
    this.project.register_update();
  }

  // семейство шрифта
  get font_family() {
    return this.fontFamily || "";
  }
  set font_family(v) {
    this.fontFamily = v;
    this.project.register_update();
  }

  // размер шрифта
  get font_size() {
    return this.fontSize || consts.font_size;
  }
  set font_size(v) {
    this.fontSize = v;
    this.project.register_update();
  }

  // жирность шрифта
  get bold() {
    return this.fontWeight != 'normal';
  }
  set bold(v) {
    this.fontWeight = v ? 'bold' : 'normal';
  }

  // координата x
  get x() {
    return (this.point.x - this.project.bounds.x).round(1);
  }
  set x(v) {
    this.point.x = parseFloat(v) + this.project.bounds.x;
    this.project.register_update();
  }

  // координата y
  get y() {
    return (this.project.bounds.height + this.project.bounds.y - this.point.y).round(1);
  }
  set y(v) {
    this.point.y = this.project.bounds.height + this.project.bounds.y - parseFloat(v);
  }

  // текст элемента - при установке пустой строки, элемент удаляется
  get text() {
    return this.content;
  }
  set text(v) {
    if(v){
      this.content = v;
      this.project.register_update();
    }
    else{
      Object.getNotifier(this).notify({
        type: 'unload'
      });
      setTimeout(this.remove.bind(this), 50);
    }
  }

  // угол к горизонту
  get angle() {
    return Math.round(this.rotation);
  }
  set angle(v) {
    this.rotation = v;
    this.project.register_update();
  }

  // выравнивание текста
  get align() {
    return $p.enm.text_aligns.get(this.justification);
  }
  set align(v) {
    this.justification = $p.utils.is_data_obj(v) ? v.ref : v;
    this.project.register_update();
  }

}


/**
 * ### Элемент c образующей
 * Виртуальный класс - BuilderElement, у которго есть образующая
 *
 * @class GeneratrixElement
 * @extends BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @menuorder 41
 * @tooltip Элемент c образующей
 */
class GeneratrixElement extends BuilderElement {

  constructor(attr = {}) {
    const {generatrix} = attr;
    if (generatrix) {
      delete attr.generatrix;
    }
    super(attr);
    if (generatrix) {
      attr.generatrix = generatrix;
    }
    this.initialize(attr);
  }

  /**
   * ### Координаты начала элемента
   * @property b
   * @type paper.Point
   */
  get b() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.firstSegment.point;
  }
  set b(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.firstSegment.point = v;
  }

  /**
   * Координаты конца элемента
   * @property e
   * @type Point
   */
  get e() {
    const {generatrix} = this._attr;
    return generatrix && generatrix.lastSegment.point;
  }
  set e(v) {
    const {_rays, generatrix} = this._attr;
    _rays.clear();
    if(generatrix) generatrix.lastSegment.point = v;
  }

  /**
   * ### Координата x начала профиля
   *
   * @property x1
   * @type Number
   */
  get x1() {
    const {bounds} = this.project;
    return bounds ? (this.b.x - bounds.x).round(1) : 0;
  }
  set x1(v) {
    const {bounds} = this.project;
    if(bounds && (v = parseFloat(v) + bounds.x - this.b.x)){
      this.select_node("b");
      this.move_points(new paper.Point(v, 0));
    }
  }

  /**
   * ### Координата y начала профиля
   *
   * @property y1
   * @type Number
   */
  get y1() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.b.y).round(1) : 0;
  }
  set y1(v) {
    const {bounds} = this.project;
    if(bounds && (v = bounds.height + bounds.y - parseFloat(v) - this.b.y)){
      this.select_node("b");
      this.move_points(new paper.Point(0, v));
    }
  }

  /**
   * ###Координата x конца профиля
   *
   * @property x2
   * @type Number
   */
  get x2() {
    const {bounds} = this.project;
    return bounds ? (this.e.x - bounds.x).round(1) : 0;
  }
  set x2(v) {
    const {bounds} = this.project;
    if(bounds && (v = parseFloat(v) + bounds.x - this.e.x)){
      this.select_node("e");
      this.move_points(new paper.Point(v, 0));
    }
  }

  /**
   * ### Координата y конца профиля
   *
   * @property y2
   * @type Number
   */
  get y2() {
    const {bounds} = this.project;
    return bounds ? (bounds.height + bounds.y - this.e.y).round(1) : 0;
  }
  set y2(v) {
    const {bounds} = this.project;
    if(bounds && (v = bounds.height + bounds.y - parseFloat(v) - this.e.y)){
      this.select_node("e");
      this.move_points(new paper.Point(0, v));
    }
  }

  /**
   * ### Выделяет начало или конец профиля
   *
   * @method select_node
   * @param node {String} b, e - начало или конец элемента
   */
  select_node(node) {
    const {generatrix, project, _attr, view} = this;
    project.deselect_all_points();
    if(_attr.path){
      _attr.path.selected = false;
    }
    if(node == "b"){
      generatrix.firstSegment.selected = true;
    }
    else{
      generatrix.lastSegment.selected = true;
    }
    view.update();
  }

  /**
   * ### Двигает узлы
   * Обрабатывает смещение выделенных сегментов образующей профиля
   *
   * @method move_points
   * @param delta {paper.Point} - куда и насколько смещать
   * @param [all_points] {Boolean} - указывает двигать все сегменты пути, а не только выделенные
   * @param [start_point] {paper.Point} - откуда началось движение
   */
  move_points(delta, all_points, start_point) {

    if(!delta.length){
      return;
    }

    const	other = [];
    const noti = {type: consts.move_points, profiles: [this], points: []};

    let changed;

    // если не выделено ни одного сегмента, двигаем все сегменты
    if(!all_points){
      all_points = !this.generatrix.segments.some((segm) => {
        if (segm.selected)
          return true;
      });
    }

    this.generatrix.segments.forEach((segm) => {

      let cnn_point;

      if (segm.selected || all_points){

        const noti_points = {old: segm.point.clone(), delta: delta};

        // собственно, сдвиг узлов
        const free_point = segm.point.add(delta);

        if(segm.point == this.b){
          cnn_point = this.rays.b;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("b", free_point);
          }
        }
        else if(segm.point == this.e){
          cnn_point = this.rays.e;
          if(!cnn_point.profile_point || paper.Key.isDown('control')){
            cnn_point = this.cnn_point("e", free_point);
          }
        }

        if(cnn_point && cnn_point.cnn_types == $p.enm.cnn_types.acn.t && (segm.point == this.b || segm.point == this.e)){
          segm.point = cnn_point.point;
        }
        else{
          segm.point = free_point;
          // если соединение угловое диагональное, тянем тянем соседние узлы сразу
          if(cnn_point && !paper.Key.isDown('control')){
            if(cnn_point.profile && cnn_point.profile_point && !cnn_point.profile[cnn_point.profile_point].is_nearest(free_point)){
              if(this instanceof Onlay){
                this.move_nodes(noti_points.old, free_point);
              }
              else{
                other.push(cnn_point.profile_point == "b" ? cnn_point.profile._attr.generatrix.firstSegment : cnn_point.profile._attr.generatrix.lastSegment );
                cnn_point.profile[cnn_point.profile_point] = free_point;
                noti.profiles.push(cnn_point.profile);
              }
            }
          }
        }

        // накапливаем точки в нотификаторе
        noti_points.new = segm.point;
        if(start_point){
          noti_points.start = start_point;
        }
        noti.points.push(noti_points);

        changed = true;
      }

    });


    // информируем систему об изменениях
    if(changed){

      this._attr._rays.clear();

      this.layer && this.layer.notify && this.layer.notify(noti);

      const notifier = Object.getNotifier(this);
      notifier.notify({ type: 'update', name: "x1" });
      notifier.notify({ type: 'update', name: "y1" });
      notifier.notify({ type: 'update', name: "x2" });
      notifier.notify({ type: 'update', name: "y2" });
    }

    return other;
  }

}

/**
 * Расширения объектов paper.js
 *
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module geometry
 * @submodule paper_ex
 */

/**
 * Расширение класса Path
 */
Object.defineProperties(paper.Path.prototype, {

    /**
     * Вычисляет направленный угол в точке пути
     * @param point
     * @return {number}
     */
    getDirectedAngle: {
      value: function (point) {
        var np = this.getNearestPoint(point),
          offset = this.getOffsetOf(np);
        return this.getTangentAt(offset).getDirectedAngle(point.add(np.negate()));
      }
    },

    /**
     * Угол по отношению к соседнему пути _other_ в точке _point_
     */
    angle_to: {
      value : function(other, point, interior, round){
        const p1 = this.getNearestPoint(point),
          p2 = other.getNearestPoint(point),
          t1 = this.getTangentAt(this.getOffsetOf(p1)),
          t2 = other.getTangentAt(other.getOffsetOf(p2));
        let res = t2.angle - t1.angle;
        if(res < 0){
          res += 360;
        }
        if(interior && res > 180){
          res = 180 - (res - 180);
        }
        return round ? res.round(round) : res.round(1);
      },
      enumerable : false
    },

    /**
     * Выясняет, является ли путь прямым
     * @return {Boolean}
     */
    is_linear: {
      value: function () {
        // если в пути единственная кривая и она прямая - путь прямой
        if(this.curves.length == 1 && this.firstCurve.isLinear())
          return true;
        // если в пути есть искривления, путь кривой
        else if(this.hasHandles())
          return false;
        else{
          // если у всех кривых пути одинаковые направленные углы - путь прямой
          var curves = this.curves,
            da = curves[0].point1.getDirectedAngle(curves[0].point2), dc;
          for(var i = 1; i < curves.lenght; i++){
            dc = curves[i].point1.getDirectedAngle(curves[i].point2);
            if(Math.abs(dc - da) > consts.epsilon)
              return false;
          }
        }
        return true;
      }
    },

    /**
     * возвращает фрагмент пути между точками
     * @param point1 {paper.Point}
     * @param point2 {paper.Point}
     * @return {paper.Path}
     */
    get_subpath: {
      value: function (point1, point2) {
        let tmp;

        if(!this.length || (point1.is_nearest(this.firstSegment.point) && point2.is_nearest(this.lastSegment.point))){
          tmp = this.clone(false);
        }
        else if(point2.is_nearest(this.firstSegment.point) && point1.is_nearest(this.lastSegment.point)){
          tmp = this.clone(false);
          tmp.reverse();
          tmp._reversed = true;
        }
        else{
          let loc1 = this.getLocationOf(point1);
          let loc2 = this.getLocationOf(point2);
          if(!loc1)
            loc1 = this.getNearestLocation(point1);
          if(!loc2)
            loc2 = this.getNearestLocation(point2);

          if(this.is_linear()){
            // для прямого формируем новый путь из двух точек
            tmp = new paper.Path({
              segments: [loc1.point, loc2.point],
              insert: false
            });
          }
          else{
            // для кривого строим по точкам, наподобие эквидистанты
            const step = (loc2.offset - loc1.offset) * 0.02;

            tmp = new paper.Path({
              segments: [point1],
              insert: false
            });

            if(step < 0){
              tmp._reversed = true;
              for(var i = loc1.offset; i>=loc2.offset; i+=step)
                tmp.add(this.getPointAt(i));
            }else if(step > 0){
              for(var i = loc1.offset; i<=loc2.offset; i+=step)
                tmp.add(this.getPointAt(i));
            }
            tmp.add(point2);
            tmp.simplify(0.8);
          }

          if(loc1.offset > loc2.offset)
            tmp._reversed = true;
        }

        return tmp;
      }
    },

    /**
     * возвращает путь, равноотстоящий от текущего пути
     * @param delta {number} - расстояние, на которое будет смещен новый путь
     * @param elong {number} - удлинение нового пути с каждого конца
     * @return {paper.Path}
     */
    equidistant: {
      value: function (delta, elong) {

        var normal = this.getNormalAt(0),
          res = new paper.Path({
            segments: [this.firstSegment.point.add(normal.multiply(delta))],
            insert: false
          });

        if(this.is_linear()) {
          // добавляем последнюю точку
          res.add(this.lastSegment.point.add(normal.multiply(delta)));

        }else{

          // для кривого бежим по точкам
          var len = this.length, step = len * 0.02, point;

          for(var i = step; i<=len; i+=step) {
            point = this.getPointAt(i);
            if(!point)
              continue;
            normal = this.getNormalAt(i);
            res.add(point.add(normal.multiply(delta)));
          }

          // добавляем последнюю точку
          normal = this.getNormalAt(len);
          res.add(this.lastSegment.point.add(normal.multiply(delta)));

          res.simplify(0.8);
        }

        return res.elongation(elong);
      }
    },

    /**
     * Удлиняет путь касательными в начальной и конечной точках
     */
    elongation: {
      value: function (delta) {

        if(delta){
          var tangent = this.getTangentAt(0);
          if(this.is_linear()) {
            this.firstSegment.point = this.firstSegment.point.add(tangent.multiply(-delta));
            this.lastSegment.point = this.lastSegment.point.add(tangent.multiply(delta));
          }else{
            this.insert(0, this.firstSegment.point.add(tangent.multiply(-delta)));
            tangent = this.getTangentAt(this.length);
            this.add(this.lastSegment.point.add(tangent.multiply(delta)));
          }
        }

        return this;

      }
    },

    /**
     * Находит координату пересечения путей в окрестности точки
     * @method intersect_point
     * @for Path
     * @param path {paper.Path}
     * @param point {paper.Point}
     * @param elongate {Boolean} - если истина, пути будут продолжены до пересечения
     * @return point {paper.Point}
     */
    intersect_point: {
      value: function (path, point, elongate) {
        const intersections = this.getIntersections(path);
        let delta = Infinity, tdelta, tpoint;

        if(intersections.length == 1){
          return intersections[0].point;
        }
        else if(intersections.length > 1){

          if(!point){
            point = this.getPointAt(this.length /2);
          }

          intersections.forEach((o) => {
            tdelta = o.point.getDistance(point, true);
            if(tdelta < delta){
              delta = tdelta;
              tpoint = o.point;
            }
          });
          return tpoint;
        }
        else if(elongate == "nearest"){

          // ищем проекцию ближайшей точки на path на наш путь
          return this.getNearestPoint(path.getNearestPoint(point));

        }
        else if(elongate){

          // продлеваем пути до пересечения
          let p1 = this.getNearestPoint(point),
            p2 = path.getNearestPoint(point),
            p1last = this.firstSegment.point.getDistance(p1, true) > this.lastSegment.point.getDistance(p1, true),
            p2last = path.firstSegment.point.getDistance(p2, true) > path.lastSegment.point.getDistance(p2, true),
            tg;

          tg = (p1last ? this.getTangentAt(this.length) : this.getTangentAt(0).negate()).multiply(100);
          if(this.is_linear){
            if(p1last)
              this.lastSegment.point = this.lastSegment.point.add(tg);
            else
              this.firstSegment.point = this.firstSegment.point.add(tg);
          }

          tg = (p2last ? path.getTangentAt(path.length) : path.getTangentAt(0).negate()).multiply(100);
          if(path.is_linear){
            if(p2last)
              path.lastSegment.point = path.lastSegment.point.add(tg);
            else
              path.firstSegment.point = path.firstSegment.point.add(tg);
          }

          return this.intersect_point(path, point);

        }
      }
    }

  });


Object.defineProperties(paper.Point.prototype, {

	/**
	 * Выясняет, расположена ли точка в окрестности точки
	 * @param point {paper.Point}
	 * @param [sticking] {Boolean|Number}
	 * @return {Boolean}
	 */
	is_nearest: {
		value: function (point, sticking) {
		  if(sticking === 0){
        return Math.abs(this.x - point.x) < consts.epsilon && Math.abs(this.y - point.y) < consts.epsilon;
      }
			return this.getDistance(point, true) < (sticking ? consts.sticking2 : 16);
		}
	},

	/**
	 * ПоложениеТочкиОтносительноПрямой
	 * @param x1 {Number}
	 * @param y1 {Number}
	 * @param x2 {Number}
	 * @param y2 {Number}
	 * @return {number}
	 */
	point_pos: {
		value: function(x1,y1, x2,y2){
			if (Math.abs(x1-x2) < 0.2){
				// вертикаль  >0 - справа, <0 - слева,=0 - на линии
				return (this.x-x1)*(y1-y2);
			}
			if (Math.abs(y1-y2) < 0.2){
				// горизонталь >0 - снизу, <0 - сверху,=0 - на линии
				return (this.y-y1)*(x2-x1);
			}
			// >0 - справа, <0 - слева,=0 - на линии
			return (this.y-y1)*(x2-x1)-(y2-y1)*(this.x-x1);
		}
	},

	/**
	 * ### Рассчитывает координаты центра окружности по точкам и радиусу
	 * @param x1 {Number}
	 * @param y1 {Number}
	 * @param x2 {Number}
	 * @param y2 {Number}
	 * @param r {Number}
	 * @param arc_ccw {Boolean}
	 * @param more_180 {Boolean}
	 * @return {Point}
	 */
	arc_cntr: {
		value: function(x1,y1, x2,y2, r0, ccw){
			var a,b,p,r,q,yy1,xx1,yy2,xx2;
			if(ccw){
				var tmpx=x1, tmpy=y1;
				x1=x2; y1=y2; x2=tmpx; y2=tmpy;
			}
			if (x1!=x2){
				a=(x1*x1 - x2*x2 - y2*y2 + y1*y1)/(2*(x1-x2));
				b=((y2-y1)/(x1-x2));
				p=b*b+ 1;
				r=-2*((x1-a)*b+y1);
				q=(x1-a)*(x1-a) - r0*r0 + y1*y1;
				yy1=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				xx1=a+b*yy1;
				yy2=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				xx2=a+b*yy2;
			} else{
				a=(y1*y1 - y2*y2 - x2*x2 + x1*x1)/(2*(y1-y2));
				b=((x2-x1)/(y1-y2));
				p=b*b+ 1;
				r=-2*((y1-a)*b+x1);
				q=(y1-a)*(y1-a) - r0*r0 + x1*x1;
				xx1=(-r - Math.sqrt(r*r - 4*p*q))/(2*p);
				yy1=a+b*xx1;
				xx2=(-r + Math.sqrt(r*r - 4*p*q))/(2*p);
				yy2=a+b*xx2;
			}

			if (new paper.Point(xx1,yy1).point_pos(x1,y1, x2,y2)>0)
				return {x: xx1, y: yy1};
			else
				return {x: xx2, y: yy2}
		}
	},

	/**
	 * ### Рассчитывает координаты точки, лежащей на окружности
	 * @param x1
	 * @param y1
	 * @param x2
	 * @param y2
	 * @param r
	 * @param arc_ccw
	 * @param more_180
	 * @return {{x: number, y: number}}
	 */
	arc_point: {
		value: function(x1,y1, x2,y2, r, arc_ccw, more_180){
			const point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
			if (r>0){
				let dx = x1-x2, dy = y1-y2, dr = r*r-(dx*dx+dy*dy)/4, l, h, centr;
				if(dr >= 0){
					centr = this.arc_cntr(x1,y1, x2,y2, r, arc_ccw);
					dx = centr.x - point.x;
					dy = point.y - centr.y;	// т.к. Y перевернут
					l = Math.sqrt(dx*dx + dy*dy);

					if(more_180)
						h = r+Math.sqrt(dr);
					else
						h = r-Math.sqrt(dr);

					point.x += dx*h/l;
					point.y += dy*h/l;
				}
			}
			return point;
		}
	},

  /**
   * Рассчитывает радиус окружности по двум точкам и высоте
   */
  arc_r: {
	  value: function (x1,y1,x2,y2,h) {
      if (!h){
        return 0;
      }
	    const [dx, dy] = [(x1-x2), (y1-y2)];
      return (h/2 + (dx * dx + dy * dy) / (8 * h)).round(3);
    }
  },

	/**
	 * ### Привязка к углу
	 * Сдвигает точку к ближайшему лучу с углом, кратным snapAngle
	 *
	 * @param [snapAngle] {Number} - шаг угла, по умолчанию 45°
	 * @return {paper.Point}
	 */
	snap_to_angle: {
		value: function(snapAngle) {

			if(!snapAngle){
        snapAngle = Math.PI*2/8;
      }

			let angle = Math.atan2(this.y, this.x);
			angle = Math.round(angle/snapAngle) * snapAngle;

			const dirx = Math.cos(angle),
				diry = Math.sin(angle),
				d = dirx*this.x + diry*this.y;

			return new paper.Point(dirx*d, diry*d);
		}
	},

  bind_to_nodes: {
	  value: function (sticking) {
      return paper.project.activeLayer.nodes.some((point) => {
        if(point.is_nearest(this, sticking)){
          this.x = point.x;
          this.y = point.y;
          return true;
        }
      });
    }
  }

});






/**
 * Created 24.07.2015<br />
 * &copy; http://www.oknosoft.ru 2014-2015
 * @author	Evgeniy Malyarov
 *
 * @module geometry
 * @submodule profile
 */

/**
 * Объект, описывающий геометрию соединения
 * @class CnnPoint
 * @constructor
 */
class CnnPoint {

  constructor(parent, node) {

    this._parent = parent;
    this._node = node;

    this.initialize();
  }

  /**
   * Проверяет, является ли соединение в точке Т-образным.
   * L для примыкающих рассматривается, как Т
   */
  get is_t() {
    // если это угол, то точно не T
    if(!this.cnn || this.cnn.cnn_type == $p.enm.cnn_types.УгловоеДиагональное){
      return false;
    }

    // если это Ʇ, или † то без вариантов T
    if(this.cnn.cnn_type == $p.enm.cnn_types.ТОбразное){
      return true;
    }

    // если это Ꞁ или └─, то может быть T в разрыв - проверяем
    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной && this.parent.orientation != $p.enm.orientations.vert){
      return true;
    }

    if(this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной && this.parent.orientation != $p.enm.orientations.hor){
      return true;
    }

    return false;
  }

  /**
   * Строгий вариант свойства is_t: Ꞁ и └ не рассматриваются, как T
   */
  get is_tt() {
    // если это угол, то точно не T
    return !(this.is_i || this.profile_point == "b" || this.profile_point == "e" || this.profile == this.parent);
  }

  /**
   * Проверяет, является ли соединение в точке L-образным
   * Соединения Т всегда L-образные
   */
  get is_l() {
    return this.is_t ||
      !!(this.cnn && (this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКВертикальной ||
      this.cnn.cnn_type == $p.enm.cnn_types.УгловоеКГоризонтальной));
  }

  /**
   * Проверяет, является ли соединение в точке соединением с пустотой
   */
  get is_i() {
    return !this.profile && !this.is_cut;
  }

  /**
   * Профиль, которому принадлежит точка соединения
   * @type Profile
   */
  get parent() {
    return this._parent;
  }

  /**
   * Имя точки соединения (b или e)
   * @type String
   */
  get node() {
    return this._node;
  }

  clear() {
    if(this.profile_point){
      delete this.profile_point;
    }
    if(this.is_cut){
      delete this.is_cut;
    }
    this.profile = null;
    this.err = null;
    this.distance = Infinity;
    this.cnn_types = $p.enm.cnn_types.acn.i;
    if(this.cnn && this.cnn.cnn_type != $p.enm.cnn_types.i){
      this.cnn = null;
    }
  }

  /**
   * Массив ошибок соединения
   * @type Array
   */
  get err() {
    return this._err;
  }
  set err(v) {
    if(!v){
      this._err.length = 0;
    }
    else if(this._err.indexOf(v) == -1){
      this._err.push(v);
    }
  }

  /**
   * Профиль, с которым пересекается наш элемент в точке соединения
   * @property profile
   * @type Profile
   */
  get profile() {
    if(this._profile === undefined && this._row && this._row.elm2){
      this._profile = this.parent.layer.getItem({elm: this._row.elm2});
      delete this._row;
    }
    return this._profile;
  }
  set profile(v) {
    this._profile = v;
  }

  get npoint() {
    const point = this.point || this.parent[this.node];
    if(!this.is_tt){
      return point;
    }
    const {profile} = this;
    if(!profile || !profile.nearest(true)){
      return point;
    }
    return profile.nearest(true).generatrix.getNearestPoint(point) || point;
  }

  initialize() {

    const {_parent, _node} = this;

    //  массив ошибок соединения
    this._err = [];

    // строка в таблице соединений
    this._row = _parent.project.connections.cnns.find({elm1: _parent.elm, node1: _node});

    // примыкающий профиль
    this._profile;

    if(this._row){

      /**
       * Текущее соединение - объект справочника соединения
       * @type _cat.cnns
       */
      this.cnn = this._row.cnn;

      /**
       * Массив допустимых типов соединений
       * По умолчанию - соединение с пустотой
       * @type Array
       */
      if($p.enm.cnn_types.acn.a.indexOf(this.cnn.cnn_type) != -1){
        this.cnn_types = $p.enm.cnn_types.acn.a;
      }
      else if($p.enm.cnn_types.acn.t.indexOf(this.cnn.cnn_type) != -1){
        this.cnn_types = $p.enm.cnn_types.acn.t;
      }
      else{
        this.cnn_types = $p.enm.cnn_types.acn.i;
      }
    }
    else{
      this.cnn = null;
      this.cnn_types = $p.enm.cnn_types.acn.i;
    }

    /**
     * Расстояние до ближайшего профиля
     * @type Number
     */
    this.distance = Infinity;

    this.point = null;

    this.profile_point = "";

  }
}

/**
 * Объект, описывающий лучи пути профиля
 * @class ProfileRays
 * @constructor
 */
class ProfileRays {

  constructor(parent) {
    this.parent = parent;
    this.b = new CnnPoint(this.parent, "b");
    this.e = new CnnPoint(this.parent, "e");
    this.inner = new paper.Path({ insert: false });
    this.outer = new paper.Path({ insert: false });
  }

  clear_segments() {
    if(this.inner.segments.length){
      this.inner.removeSegments();
    }
    if(this.outer.segments.length){
      this.outer.removeSegments();
    }
  }

  clear(with_cnn) {
    this.clear_segments();
    if(with_cnn){
      this.b.clear();
      this.e.clear();
    }
  }

  recalc() {

    const {parent} = this;
    const path = parent.generatrix;
    const len = path.length;

    this.clear();

    if(!len){
      return;
    }

    const {d1, d2, width} = parent;
    const ds = 3 * width;
    const step = len * 0.02;

    // первая точка эквидистанты. аппроксимируется касательной на участке (from < начала пути)
    let point_b = path.firstSegment.point,
      tangent_b = path.getTangentAt(0),
      normal_b = path.getNormalAt(0),
      point_e = path.lastSegment.point,
      tangent_e, normal_e;

    // добавляем первые точки путей
    this.outer.add(point_b.add(normal_b.multiply(d1)).add(tangent_b.multiply(-ds)));
    this.inner.add(point_b.add(normal_b.multiply(d2)).add(tangent_b.multiply(-ds)));

    // для прямого пути, строим в один проход
    if(path.is_linear()){
      this.outer.add(point_e.add(normal_b.multiply(d1)).add(tangent_b.multiply(ds)));
      this.inner.add(point_e.add(normal_b.multiply(d2)).add(tangent_b.multiply(ds)));
    }
    else{

      this.outer.add(point_b.add(normal_b.multiply(d1)));
      this.inner.add(point_b.add(normal_b.multiply(d2)));

      for(let i = step; i<=len; i+=step) {
        point_b = path.getPointAt(i);
        if(!point_b){
          continue;
        }
        normal_b = path.getNormalAt(i);
        this.outer.add(point_b.add(normal_b.normalize(d1)));
        this.inner.add(point_b.add(normal_b.normalize(d2)));
      }

      normal_e = path.getNormalAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)));
      this.inner.add(point_e.add(normal_e.multiply(d2)));

      tangent_e = path.getTangentAt(len);
      this.outer.add(point_e.add(normal_e.multiply(d1)).add(tangent_e.multiply(ds)));
      this.inner.add(point_e.add(normal_e.multiply(d2)).add(tangent_e.multiply(ds)));

      this.outer.simplify(0.8);
      this.inner.simplify(0.8);
    }

    this.inner.reverse();
  }

}


/**
 * ### Элемент профиля
 * Виртуальный класс описывает общие свойства профиля и раскладки
 *
 * @class ProfileItem
 * @extends BuilderElement
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @menuorder 41
 * @tooltip Элемент профиля
 */
class ProfileItem extends GeneratrixElement {

  /**
   * Расстояние от узла до внешнего ребра элемента
   * для рамы, обычно = 0, для импоста 1/2 ширины, зависит от `d0` и `sizeb`
   * @property d1
   * @type Number
   */
  get d1() {
    return -(this.d0 - this.sizeb)
  }

  /**
   * Расстояние от узла до внутреннего ребра элемента
   * зависит от ширины элементов и свойств примыкающих соединений
   * @property d2
   * @type Number
   */
  get d2() {
    return this.d1 - this.width
  }

  /**
   * ### Точка проекции высоты ручки на ребро профиля
   *
   * @param side
   * @return Point|undefined
   */
  hhpoint(side) {
    const {layer, rays} = this;
    const {h_ruch, furn} = layer;
    const {furn_set, handle_side} = furn;
    if(!h_ruch || !handle_side || furn_set.empty()){
      return;
    }
    // получаем элемент, на котором ручка и длину элемента
    if(layer.profile_by_furn_side(handle_side) == this){
      return rays[side].intersect_point(layer.handle_line(this));
    }
  }

  /**
   * ### Точка проекции высоты ручки на внутреннее ребро профиля
   *
   * @property hhi
   * @type Point|undefined
   */
  get hhi() {
    return this.hhpoint('inner');
  }

  /**
   * ### Точка проекции высоты ручки на внешнее ребро профиля
   *
   * @property hho
   * @type Point|undefined
   */
  get hho() {
    return this.hhpoint('outer');
  }

  /**
   * ### Соединение в точке 'b' для диалога свойств
   *
   * @property cnn1
   * @type _cat.cnns
   * @private
   */
  get cnn1() {
    return this.cnn_point("b").cnn || $p.cat.cnns.get();
  }
  set cnn1(v){
    const {rays, project} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.b.cnn != cnn){
      rays.b.cnn = cnn;
      project.register_change();
    }
  }

  /**
   * Соединение в точке 'e' для диалога свойств
   *
   * @property cnn2
   * @type _cat.cnns
   * @private
   */
  get cnn2() {
    return this.cnn_point("e").cnn || $p.cat.cnns.get();
  }
  set cnn2(v){
    const {rays, project} = this;
    const cnn = $p.cat.cnns.get(v);
    if(rays.e.cnn != cnn){
      rays.e.cnn = cnn;
      project.register_change();
    }
  }

  /**
   * информация для диалога свойств
   *
   * @property info
   * @type String
   * @final
   * @private
   */
  get info() {
    return "№" + this.elm + " α:" + this.angle_hor.toFixed(0) + "° l:" + this.length.toFixed(0);
  }

  /**
   * ### Радиус сегмента профиля
   *
   * @property r
   * @type Number
   */
  get r() {
    return this._row.r;
  }
  set r(v){
    const {_row, _attr} = this;
    if(_row.r != v){
      _attr._rays.clear();
      _row.r = v;
      this.set_generatrix_radius();
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'arc_h'
      });
    }
  }

  /**
   * ### Направление дуги сегмента профиля против часовой стрелки
   *
   * @property arc_ccw
   * @type Boolean
   */
  get arc_ccw() {
    return this._row.arc_ccw;
  }
  set arc_ccw(v){
    const {_row, _attr} = this;
    if(_row.arc_ccw != v){
      _attr._rays.clear();
      _row.arc_ccw = v;
      this.set_generatrix_radius();
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'arc_h'
      });
    }
  }

  /**
   * ### Высота дуги сегмента профиля
   *
   * @property arc_ccw
   * @type Boolean
   */
  get arc_h() {
    const {_row, b, e, generatrix} = this;
    if(_row.r){
      const p = generatrix.getPointAt(generatrix.length / 2);
      return paper.Line.getSignedDistance(b.x, b.y, e.x, e.y, p.x, p.y).round(1);
    }
    return 0;
  }
  set arc_h(v) {
    const {_row, _attr, b, e, arc_h} = this;
    v = parseFloat(v);
    if(arc_h != v){
      _attr._rays.clear();
      if(v < 0){
        v = -v;
        _row.arc_ccw = true;
      }
      else{
        _row.arc_ccw = false;
      }
      _row.r = b.arc_r(b.x, b.y, e.x, e.y, v);
      this.set_generatrix_radius(v);
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'r'
      });
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'arc_ccw'
      });
    }
  }

  /**
   * ### Угол к горизонту
   * Рассчитывается для прямой, проходящей через узлы
   *
   * @property angle_hor
   * @type Number
   * @final
   */
  get angle_hor() {
    const {b, e} = this;
    const res = (new paper.Point(e.x - b.x, b.y - e.y)).angle.round(2);
    return res < 0 ? res + 360 : res;
  }

  /**
   * ### Длина профиля с учетом соединений
   *
   * @property length
   * @type Number
   * @final
   */
  get length() {
    const {b, e, outer} = this.rays;
    const gen = this.elm_type == $p.enm.elm_types.Импост ? this.generatrix : outer;
    const ppoints = {};

    // находим проекции четырёх вершин на образующую
    for(let i = 1; i<=4; i++){
      ppoints[i] = gen.getNearestPoint(this.corns(i));
    }

    // находим точки, расположенные ближе к концам
    ppoints.b = gen.getOffsetOf(ppoints[1]) < gen.getOffsetOf(ppoints[4]) ? ppoints[1] : ppoints[4];
    ppoints.e = gen.getOffsetOf(ppoints[2]) > gen.getOffsetOf(ppoints[3]) ? ppoints[2] : ppoints[3];

    // получаем фрагмент образующей
    const sub_gen = gen.get_subpath(ppoints.b, ppoints.e);
    const res = sub_gen.length + (b.cnn ? b.cnn.sz : 0) + (e.cnn ? e.cnn.sz : 0);
    sub_gen.remove();

    return res;
  }

  /**
   * ### Ориентация профиля
   * Вычисляется по гулу к горизонту.
   * Если угол в пределах `orientation_delta`, элемент признаётся горизонтальным или вертикальным. Иначе - наклонным
   *
   * @property orientation
   * @type _enm.orientations
   * @final
   */
  get orientation() {
    let {angle_hor} = this;
    if(angle_hor > 180){
      angle_hor -= 180;
    }
    if((angle_hor > -consts.orientation_delta && angle_hor < consts.orientation_delta) ||
      (angle_hor > 180-consts.orientation_delta && angle_hor < 180+consts.orientation_delta)){
      return $p.enm.orientations.hor;
    }
    if((angle_hor > 90-consts.orientation_delta && angle_hor < 90+consts.orientation_delta) ||
      (angle_hor > 270-consts.orientation_delta && angle_hor < 270+consts.orientation_delta)){
      return $p.enm.orientations.vert;
    }
    return $p.enm.orientations.incline;
  }

  /**
   * ### Опорные точки и лучи
   *
   * @property rays
   * @type ProfileRays
   * @final
   */
  get rays() {
    const {_rays} = this._attr;
    if(!_rays.inner.segments.length || !_rays.outer.segments.length){
      _rays.recalc();
    }
    return _rays;
  }

  /**
   * ### Доборы текущего профиля
   *
   * @property addls
   * @type Array.<ProfileAddl>
   * @final
   */
  get addls() {
    return this.children.filter((elm) => elm instanceof ProfileAddl);
  }

  /**
   * Описание полей диалога свойств элемента
   */
  get oxml() {
    const oxml = {
      " ": [
        {id: "info", path: "o.info", type: "ro"},
        "inset",
        "clr"
      ],
      "Начало": ["x1", "y1", "cnn1"],
      "Конец": ["x2", "y2", "cnn2"]
    };
    if(this.selected_cnn_ii()){
      oxml["Примыкание"] = ["cnn3"];
    }
    return oxml;
  }

  /**
   * Строка цвета по умолчанию для эскиза
   */
  get default_clr_str() {
    return "FEFEFE"
  }

  /**
   * ### Непрозрачность профиля
   * В отличии от прототипа `opacity`, не изменяет прозрачость образующей
   */
  get opacity() {
    return this.path ? this.path.opacity : 1;
  }
  set opacity(v){
    this.path && (this.path.opacity = v);
  }


  setSelection(selection) {
    super.setSelection(selection);

    const {generatrix, path} = this._attr;

    generatrix.setSelection(selection);
    this.ruler_line_select(false);

    if(selection){

      const {inner, outer} = this.rays;

      if(this._hatching){
        this._hatching.removeChildren();
      }
      else{
        this._hatching = new paper.CompoundPath({
          parent: this,
          guide: true,
          strokeColor: 'grey',
          strokeScaling: false
        })
      }

      path.setSelection(0);

      for(let t = 0; t < inner.length; t+=50){
        const ip = inner.getPointAt(t);
        const np = inner.getNormalAt(t).multiply(400).rotate(-35).negate();
        const fp = new paper.Path({
          insert: false,
          segments: [ip, ip.add(np)]
        })
        const op = fp.intersect_point(outer, ip);

        if(ip && op){
          const cip = path.getNearestPoint(ip);
          const cop = path.getNearestPoint(op);
          const nip = cip.is_nearest(ip);
          const nop = cop.is_nearest(op);
          if(nip && nop){
            this._hatching.moveTo(cip);
            this._hatching.lineTo(cop);
          }
          else if(nip && !nop){
            const pp = fp.intersect_point(path, op);
            if(pp){
              this._hatching.moveTo(cip);
              this._hatching.lineTo(pp);
            }
          }
          else if(!nip && nop){
            const pp = fp.intersect_point(path, ip);
            if(pp){
              this._hatching.moveTo(pp);
              this._hatching.lineTo(cop);
            }
          }
        }
      }

    }
    else{
      if(this._hatching){
        this._hatching.remove();
        this._hatching = null;
      }
    }
  }

  // выделяет внутреннее или внешнее ребро профиля
  ruler_line_select(mode) {

    const {_attr} = this;

    if(_attr.ruler_line_path){
      _attr.ruler_line_path.remove();
      delete _attr.ruler_line_path;
    }

    if(mode){
      switch(_attr.ruler_line = mode){

        case 'inner':
          _attr.ruler_line_path = this.path.get_subpath(this.corns(3), this.corns(4))
          _attr.ruler_line_path.parent = this;
          _attr.ruler_line_path.selected = true;
          break;

        case 'outer':
          _attr.ruler_line_path = this.path.get_subpath(this.corns(1), this.corns(2))
          _attr.ruler_line_path.parent = this;
          _attr.ruler_line_path.selected = true;
          break;

        default:
          this.generatrix.selected = true;
          break;
      }
    }
    else if(_attr.ruler_line) {
      delete _attr.ruler_line;
    }
  }

  // координата стороны или образующей профиля
  ruler_line_coordin(xy) {
    switch(this._attr.ruler_line){
      case 'inner':
        return (this.corns(3)[xy] + this.corns(4)[xy]) / 2;
      case 'outer':
        return (this.corns(1)[xy] + this.corns(2)[xy]) / 2;
      default:
        return (this.b[xy] + this.e[xy]) / 2;
    }
  }

  /**
   * ### Вычисляемые поля в таблице координат
   * @method save_coordinates
   */
  save_coordinates() {

    const {_attr, _row, rays, generatrix, project} = this;

    if(!generatrix){
      return;
    }

    const cnns = project.connections.cnns;
    const b = rays.b;
    const e = rays.e;
    const	row_b = cnns.add({
        elm1: _row.elm,
        node1: "b",
        cnn: b.cnn,
        aperture_len: this.corns(1).getDistance(this.corns(4)).round(1)
      });
    const row_e = cnns.add({
        elm1: _row.elm,
        node1: "e",
        cnn: e.cnn,
        aperture_len: this.corns(2).getDistance(this.corns(3)).round(1)
      });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;


    // добавляем припуски соединений
    _row.len = this.length.round(1);

    // сохраняем информацию о соединениях
    if(b.profile){
      row_b.elm2 = b.profile.elm;
      if(b.profile.e.is_nearest(b.point))
        row_b.node2 = "e";
      else if(b.profile.b.is_nearest(b.point))
        row_b.node2 = "b";
      else
        row_b.node2 = "t";
    }
    if(e.profile){
      row_e.elm2 = e.profile.elm;
      if(e.profile.b.is_nearest(e.point))
        row_e.node2 = "b";
      else if(e.profile.e.is_nearest(e.point))
        row_e.node2 = "b";
      else
        row_e.node2 = "t";
    }

    // для створочных и доборных профилей добавляем соединения с внешними элементами
    const nrst = this.nearest();
    if(nrst){
      cnns.add({
        elm1: _row.elm,
        elm2: nrst.elm,
        cnn: _attr._nearest_cnn,
        aperture_len: _row.len
      });
    }

    // получаем углы между элементами и к горизонту
    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0){
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0){
      _row.alp2 = _row.alp2 + 360;
    }

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;

    // TODO: Рассчитать положение и ориентацию

    // вероятно, импост, всегда занимает положение "центр"


    // координаты доборов
    this.addls.forEach((addl) => addl.save_coordinates());
  }

  /**
   * Вызывается из конструктора - создаёт пути и лучи
   * @method initialize
   * @private
   */
  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    if(attr.r){
      _row.r = attr.r;
    }

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
      if(_attr.generatrix._reversed){
        delete _attr.generatrix._reversed;
      }
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else{
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r){
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
              _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else{
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    // точки пересечения профиля с соседями с внутренней стороны
    _attr._corns = [];

    // кеш лучей в узлах профиля
    _attr._rays = new ProfileRays(this);

    _attr.generatrix.strokeColor = 'gray';

    _attr.path = new paper.Path();
    _attr.path.strokeColor = 'black';
    _attr.path.strokeWidth = 1;
    _attr.path.strokeScaling = false;

    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;
    //_attr.path.fillColor = new paper.Color(0.96, 0.98, 0.94, 0.96);

    this.addChild(_attr.path);
    this.addChild(_attr.generatrix);

  }

  /**
   * ### Обсервер
   * Наблюдает за изменениями контура и пересчитывает путь элемента при изменении соседних элементов
   *
   * @method observer
   * @private
   */
  observer(an) {
    if(Array.isArray(an)){

      const moved = an[an.length-1];

      if(moved.profiles.indexOf(this) == -1){

        // если среди профилей есть такой, к которму примыкает текущий, пробуем привязку
        moved.profiles.forEach((p) => {
          this.do_bind(p, this.cnn_point("b"), this.cnn_point("e"), moved);
        });

        moved.profiles.push(this);
      }

    }
    else if(an instanceof Profile || an instanceof ProfileConnective){
      this.do_bind(an, this.cnn_point("b"), this.cnn_point("e"));
    }
  }

  /**
   * Возвращает сторону соединения текущего профиля с указанным
   */
  cnn_side(profile, interior, rays) {
    if(!interior){
      interior = profile.interiorPoint();
    }
    if(!rays){
      rays = this.rays;
    }
    if(!rays || !interior){
      return $p.enm.cnn_sides.Изнутри;
    }
    return rays.inner.getNearestPoint(interior).getDistance(interior, true) <
      rays.outer.getNearestPoint(interior).getDistance(interior, true) ? $p.enm.cnn_sides.Изнутри : $p.enm.cnn_sides.Снаружи;
  }

  /**
   * Искривляет образующую в соответствии с радиусом
   */
  set_generatrix_radius(height) {
    const {generatrix, _row, layer, project, selected} = this;
    const b = generatrix.firstSegment.point.clone();
    const e = generatrix.lastSegment.point.clone();
    const min_radius = b.getDistance(e) / 2;

    generatrix.removeSegments(1);
    generatrix.firstSegment.handleIn = null;
    generatrix.firstSegment.handleOut = null;

    let full;
    if(_row.r && _row.r <= min_radius){
      _row.r = min_radius + 0.0001;
      full = true;
    }
    if(height && height > min_radius){
      height = min_radius;
      Object.getNotifier(this).notify({
        type: 'update',
        name: 'arc_h'
      });
    }

    if(selected){
      this.selected = false;
    }

    if(_row.r){
      let p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, _row.arc_ccw, false));
      if(p.point_pos(b.x, b.y, e.x, e.y) > 0 && !_row.arc_ccw || p.point_pos(b.x, b.y, e.x, e.y) < 0 && _row.arc_ccw){
        p = new paper.Point(b.arc_point(b.x, b.y, e.x, e.y, _row.r, !_row.arc_ccw, false));
      }
      if(full || height){
        const start = b.add(e).divide(2);
        const vector = p.subtract(start);
        vector.normalize(height || min_radius);
        p = start.add(vector);
      }
      generatrix.arcTo(p, e);
    }
    else{
      generatrix.lineTo(e);
    }

    layer.notify({
      type: consts.move_points,
      profiles: [this],
      points: []
    });

    if(selected){
      setTimeout(() => this.selected = selected, 100);
    }
  }

  /**
   * Сеттер вставки с учетом выделенных элементов
   * @param v {CatInserts}
   * @param ignore_select {Boolean}
   */
  set_inset(v, ignore_select) {

    const {_row, _attr, project} = this;

    if(!ignore_select && project.selectedItems.length > 1){
      project.selected_profiles(true).forEach((elm) => {
        if(elm != this && elm.elm_type == this.elm_type){
          elm.set_inset(v, true);
        }
      });
    }

    if(_row.inset != v){

      _row.inset = v;

      // для уже нарисованных элементов...
      if(_attr && _attr._rays){

        _attr._rays.clear(true);

        // прибиваем соединения в точках b и e
        const b = this.cnn_point('b');
        const e = this.cnn_point('e');

        if(b.profile && b.profile_point == 'e'){
          const {_rays} = b.profile._attr;
          if(_rays){
            _rays.clear();
            _rays.e.cnn = null;
          }
        }
        if(e.profile && e.profile_point == 'b'){
          const {_rays} = e.profile._attr;
          if(_rays){
            _rays.clear();
            _rays.b.cnn = null;
          }
        }

        const {cnns} = project.connections;
        // для соединительных профилей и элементов со створками, пересчитываем соседей
        this.joined_nearests().forEach((profile) => {
          const {_attr, elm} = profile;
          _attr._rays && _attr._rays.clear(true);
          _attr._nearest_cnn = null;
          cnns.clear({elm1: elm, elm2: this.elm});
        });

        // так же, пересчитываем соединения с примыкающими заполнениями
        this.layer.glasses(false, true).forEach((glass) => {
          cnns.clear({elm1: glass.elm, elm2: this.elm});
        })
      }

      project.register_change();
    }
  }

  /**
   * Сеттер цвета элемента
   * @param v {CatClrs}
   * @param ignore_select {Boolean}
   */
  set_clr(v, ignore_select) {
    if(!ignore_select && this.project.selectedItems.length > 1){
      this.project.selected_profiles(true).forEach((elm) => {
        if(elm != this){
          elm.set_clr(v, true);
        }
      });
    }
    BuilderElement.prototype.set_clr.call(this, v);
  }

  /**
   * ### Дополняет cnn_point свойствами соединения
   *
   * @method postcalc_cnn
   * @param node {String} b, e - начало или конец элемента
   * @return CnnPoint
   */
  postcalc_cnn(node) {
    const cnn_point = this.cnn_point(node);

    cnn_point.cnn = $p.cat.cnns.elm_cnn(this, cnn_point.profile, cnn_point.cnn_types, cnn_point.cnn);

    if(!cnn_point.point){
      cnn_point.point = this[node];
    }

    return cnn_point;
  }

  /**
   * ### Пересчитывает вставку после пересчета соединений
   * Контроль пока только по типу элемента
   *
   * @method postcalc_inset
   * @chainable
   */
  postcalc_inset() {
    // если слева и справа T - и тип не импост или есть не T и тпи импост
    this.set_inset(this.project.check_inset({ elm: this }), true);
    return this;
  }

  /**
   * ### Пересчитывает вставку при смене системы или добавлении створки
   * Контроль пока только по типу элемента
   *
   * @method default_inset
   * @param all {Boolean} - пересчитывать для любых (не только створочных) элементов
   */
  default_inset(all) {
    const {orientation, project, _attr, elm_type} = this;
    const nearest = this.nearest(true);

    if(nearest || all){
      let pos = nearest && project._dp.sys.flap_pos_by_impost && elm_type == $p.enm.elm_types.Створка ? nearest.pos : this.pos;
      if(pos == $p.enm.positions.Центр){
        if(orientation == $p.enm.orientations.vert){
          pos = [pos, $p.enm.positions.ЦентрВертикаль]
        }
        if(orientation == $p.enm.orientations.hor){
          pos = [pos, $p.enm.positions.ЦентрГоризонталь]
        }
      }
      this.set_inset(this.project.default_inset({
        elm_type: elm_type,
        pos: pos,
        inset: this.inset
      }), true);
    }
    if(nearest){
      _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, _attr._nearest, $p.enm.cnn_types.acn.ii, _attr._nearest_cnn);
    }
  }

  /**
   * ### Рассчитывает точки пути
   * на пересечении текущего и указанного профилей
   *
   * @method path_points
   * @param cnn_point {CnnPoint}
   */
  path_points(cnn_point, profile_point) {

    const {_attr, rays, generatrix} = this;
    if(!generatrix.curves.length){
      return cnn_point;
    }
    const _profile = this;
    const {_corns} = _attr;

    let prays,  normal;

    // ищет точку пересечения открытых путей
    // если указан индекс, заполняет точку в массиве _corns. иначе - возвращает расстояние от узла до пересечения
    function intersect_point(path1, path2, index){
      const intersections = path1.getIntersections(path2);
      let delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1)
        if(index)
          _corns[index] = intersections[0].point;
        else
          return intersections[0].point.getDistance(cnn_point.point, true);

      else if(intersections.length > 1){
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(cnn_point.point, true);
          if(tdelta < delta){
            delta = tdelta;
            point = o.point;
          }
        });
        if(index)
          _corns[index] = point;
        else
          return delta;
      }
    }

    // если пересечение в узлах, используем лучи профиля
    if(cnn_point.profile instanceof ProfileItem){
      prays = cnn_point.profile.rays;
    }
    else if(cnn_point.profile instanceof Filling){
      prays = {
        inner: cnn_point.profile.path,
        outer: cnn_point.profile.path
      };
    }

    const {cnn_type} = cnn_point.cnn || {};
    // импосты рисуем с учетом стороны примыкания
    if(cnn_point.is_t){

      // при необходимости, перерисовываем ведущий элемент
      !cnn_point.profile.path.segments.length && cnn_point.profile.redraw();

      // для Т-соединений сначала определяем, изнутри или снаружи находится наш профиль
      if(profile_point == "b"){
        // в зависимости от стороны соединения
        if(cnn_point.profile.cnn_side(this, null, prays) === $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else{
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
      }
      else if(profile_point == "e"){
        // в зависимости от стороны соединения
        if(cnn_point.profile.cnn_side(this, null, prays) === $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
        else{
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
    }
    // для соединения крест в стык, отступаем ширину профиля
    else if(cnn_type == $p.enm.cnn_types.xx) {
      const {width} = this;
      const l = profile_point == "b" ? width : generatrix.length - width;
      const p = generatrix.getPointAt(l);
      const n = generatrix.getNormalAt(l).normalize(width);
      const np = new paper.Path({
        insert: false,
        segments: [p.subtract(n), p.add(n)],
      });
      if(profile_point == "b"){
        intersect_point(np, rays.outer, 1);
        intersect_point(np, rays.inner, 4);
      }
      else if(profile_point == "e"){
        intersect_point(np, rays.outer, 2);
        intersect_point(np, rays.inner, 3);
      }
    }
    // соединение с пустотой
    else if(!cnn_point.profile_point || !cnn_point.cnn || cnn_type == $p.enm.cnn_types.i){
      if(profile_point == "b"){
        normal = this.generatrix.firstCurve.getNormalAt(0, true);
        _corns[1] = this.b.add(normal.normalize(this.d1));
        _corns[4] = this.b.add(normal.normalize(this.d2));

      }else if(profile_point == "e"){
        normal = this.generatrix.lastCurve.getNormalAt(1, true);
        _corns[2] = this.e.add(normal.normalize(this.d1));
        _corns[3] = this.e.add(normal.normalize(this.d2));
      }
    }
    // угловое диагональное
    else if(cnn_type == $p.enm.cnn_types.ad){
      if(profile_point == "b"){
        intersect_point(prays.outer, rays.outer, 1);
        intersect_point(prays.inner, rays.inner, 4);

      }else if(profile_point == "e"){
        intersect_point(prays.outer, rays.outer, 2);
        intersect_point(prays.inner, rays.inner, 3);
      }

    }
    // угловое к вертикальной
    else if(cnn_type == $p.enm.cnn_types.av){
      if(this.orientation == $p.enm.orientations.vert){
        if(profile_point == "b"){
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);

        }else if(profile_point == "e"){
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }else if(this.orientation == $p.enm.orientations.hor){
        if(profile_point == "b"){
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);

        }else if(profile_point == "e"){
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }else{
        cnn_point.err = "orientation";
      }
    }
    // угловое к горизонтальной
    else if(cnn_type == $p.enm.cnn_types.ah){
      if(this.orientation == $p.enm.orientations.vert){
        if(profile_point == "b"){
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);

        }else if(profile_point == "e"){
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }else if(this.orientation == $p.enm.orientations.hor){
        if(profile_point == "b"){
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);

        }else if(profile_point == "e"){
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
      }else{
        cnn_point.err = "orientation";
      }
    }

    // если точка не рассчиталась - рассчитываем по умолчанию - как с пустотой
    if(profile_point == "b"){
      if(!_corns[1])
        _corns[1] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      if(!_corns[4])
        _corns[4] = this.b.add(this.generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
    }
    else if(profile_point == "e"){
      if(!_corns[2])
        _corns[2] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      if(!_corns[3])
        _corns[3] = this.e.add(this.generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
    }

    return cnn_point;
  }

  /**
   * ### Точка внутри пути
   * Возвращает точку, расположенную гарантированно внутри профиля
   *
   * @property interiorPoint
   * @type paper.Point
   */
  interiorPoint() {
    const {generatrix, d1, d2} = this;
    const igen = generatrix.curves.length == 1 ? generatrix.firstCurve.getPointAt(0.5, true) : (
        generatrix.curves.length == 2 ? generatrix.firstCurve.point2 : generatrix.curves[1].point2
      );
    const normal = generatrix.getNormalAt(generatrix.getOffsetOf(igen));
    return igen.add(normal.multiply(d1).add(normal.multiply(d2)).divide(2));
  }


  /**
   * ### Выделяет сегмент пути профиля, ближайший к точке
   *
   * @method select_corn
   * @param point {paper.Point}
   */
  select_corn(point) {

    const res = this.corns(point);

    this.path.segments.forEach((segm) => {
      if(segm.point.is_nearest(res.point)){
        res.segm = segm;
      }
    });

    if(!res.segm && res.point == this.b){
      res.segm = this.generatrix.firstSegment;
    }

    if(!res.segm && res.point == this.e){
      res.segm = this.generatrix.lastSegment;
    }

    if(res.segm && res.dist < consts.sticking0){
      this.project.deselectAll();
      res.segm.selected = true;
    }

    return res
  }

  /**
   * ### Признак прямолинейности
   * Вычисляется, как `is_linear()` {{#crossLink "BuilderElement/generatrix:property"}}образующей{{/crossLink}}
   *
   * @method is_linear
   * @return Boolean
   */
  is_linear() {
    return this.generatrix.is_linear();
  }

  /**
   * ### Выясняет, примыкает ли указанный профиль к текущему
   * Вычисления делаются на основании близости координат концов текущего профиля образующей соседнего
   *
   * @method is_nearest
   * @param p {ProfileItem}
   * @return Boolean
   */
  is_nearest(p) {
    return (this.b.is_nearest(p.b, true) || this.generatrix.getNearestPoint(p.b).is_nearest(p.b)) &&
      (this.e.is_nearest(p.e, true) || this.generatrix.getNearestPoint(p.e).is_nearest(p.e));
  }

  /**
   * ### Выясняет, параллельны ли профили
   * в пределах `consts.orientation_delta`
   *
   * @method is_collinear
   * @param p {ProfileItem}
   * @return Boolean
   */
  is_collinear(p) {
    let angl = p.e.subtract(p.b).getDirectedAngle(this.e.subtract(this.b));
    if (angl < -180){
      angl += 180;
    }
    return Math.abs(angl) < consts.orientation_delta;
  }

  /**
   * Возвращает массив примыкающих профилей
   */
  joined_nearests() {
    return [];
  }

  /**
   * ### Формирует путь сегмента профиля
   * Пересчитывает соединения с соседями и стоит путь профиля на основании пути образующей
   * - Сначала, вызывает {{#crossLink "ProfileItem/postcalc_cnn:method"}}postcalc_cnn(){{/crossLink}} для узлов `b` и `e`
   * - Внутри `postcalc_cnn`, выполняется {{#crossLink "ProfileItem/cnn_point:method"}}cnn_point(){{/crossLink}} для пересчета соединений на концах профиля
   * - Внутри `cnn_point`:
   *    + {{#crossLink "ProfileItem/check_distance:method"}}check_distance(){{/crossLink}} - проверяет привязку, если вернулось false, `cnn_point` завершает свою работы
   *    + цикл по всем профилям и поиск привязки
   * - {{#crossLink "ProfileItem/postcalc_inset:method"}}postcalc_inset(){{/crossLink}} - проверяет корректность вставки, заменяет при необходимости
   * - {{#crossLink "ProfileItem/path_points:method"}}path_points(){{/crossLink}} - рассчитывает координаты вершин пути профиля
   *
   * @method redraw
   * @chainable
   */
  redraw() {
    // получаем узлы
    const bcnn = this.postcalc_cnn("b");
    const ecnn = this.postcalc_cnn("e");
    const {path, generatrix, rays, project} = this;

    // получаем соединения концов профиля и точки пересечения с соседями
    this.path_points(bcnn, "b");
    this.path_points(ecnn, "e");

    // очищаем существующий путь
    path.removeSegments();

    // TODO отказаться от повторного пересчета и задействовать клоны rays-ов
    path.add(this.corns(1));

    if(generatrix.is_linear()){
      path.add(this.corns(2), this.corns(3));
    }
    else{

      let tpath = new paper.Path({insert: false});
      let offset1 = rays.outer.getNearestLocation(this.corns(1)).offset;
      let offset2 = rays.outer.getNearestLocation(this.corns(2)).offset;
      let step = (offset2 - offset1) / 50;

      for(let i = offset1 + step; i<offset2; i+=step){
        tpath.add(rays.outer.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);
      path.add(this.corns(2));

      path.add(this.corns(3));

      tpath = new paper.Path({insert: false});
      offset1 = rays.inner.getNearestLocation(this.corns(3)).offset;
      offset2 = rays.inner.getNearestLocation(this.corns(4)).offset;
      step = (offset2 - offset1) / 50;
      for(let i = offset1 + step; i<offset2; i+=step){
        tpath.add(rays.inner.getPointAt(i));
      }
      tpath.simplify(0.8);
      path.join(tpath);

    }

    path.add(this.corns(4));
    path.closePath();
    path.reduce();

    this.children.forEach((elm) => {
      if(elm instanceof ProfileAddl){
        elm.observer(elm.parent);
        elm.redraw();
      }
    });

    return this;
  }


  /**
   * ### Координаты вершин (cornx1...corny4)
   *
   * @method corns
   * @param corn {String|Number} - имя или номер вершины
   * @return {Point|Number} - координата или точка
   */
  corns(corn) {
    const {_corns} = this._attr;
    if(typeof corn == "number"){
      return _corns[corn];
    }
    else if(corn instanceof paper.Point){

      const res = {dist: Infinity, profile: this};
      let dist;

      for(let i = 1; i<5; i++){
        dist = _corns[i].getDistance(corn);
        if(dist < res.dist){
          res.dist = dist;
          res.point = _corns[i];
          res.point_name = i;
        }
      }

      const {hhi} = this;
      if(hhi){
        dist = hhi.getDistance(corn);
        if(dist <= res.dist){
          res.dist = hhi.getDistance(corn);
          res.point = hhi;
          res.point_name = "hhi";
        }
        const {hho} = this;
        dist = hho.getDistance(corn);
        if(dist <= res.dist){
          res.dist = hho.getDistance(corn);
          res.point = hho;
          res.point_name = "hho";
        }
      }

      dist = this.b.getDistance(corn);
      if(dist <= res.dist){
        res.dist = this.b.getDistance(corn);
        res.point = this.b;
        res.point_name = "b";
      }
      else{
        dist = this.e.getDistance(corn);
        if(dist <= res.dist){
          res.dist = this.e.getDistance(corn);
          res.point = this.e;
          res.point_name = "e";
        }
      }

      return res;
    }
    else{
      const index = corn.substr(corn.length-1, 1);
      const axis = corn.substr(corn.length-2, 1);
      return _corns[index][axis];
    }
  }

  /**
   * Выясняет, имеет ли текущий профиль соединение с `profile` в окрестности точки `point`
   */
  has_cnn(profile, point) {

    let t = this;

    while (t.parent instanceof ProfileItem){
      t = t.parent;
    }

    while (profile.parent instanceof ProfileItem){
      profile = profile.parent;
    }

    if(
      (t.b.is_nearest(point, true) && t.cnn_point("b").profile == profile) ||
      (t.e.is_nearest(point, true) && t.cnn_point("e").profile == profile) ||
      (profile.b.is_nearest(point, true) && profile.cnn_point("b").profile == t) ||
      (profile.e.is_nearest(point, true) && profile.cnn_point("e").profile == t)
    ){
      return true;
    }
    else{
      return false;
    }
  }

  /**
   * Вызывает одноименную функцию _scheme в контексте текущего профиля
   */
  check_distance(element, res, point, check_only) {
    return this.project.check_distance(element, this, res, point, check_only);
  }

  max_right_angle(ares) {
    const {generatrix} = this;
    let has_a = true;
    ares.forEach((res) => {
      res._angle = generatrix.angle_to(res.profile.generatrix, res.point);
      if(res._angle > 180){
        res._angle = 360 - res._angle;
      }
    });
    ares.sort((a, b) => {
      const aa = Math.abs(a._angle - 90);
      const ab = Math.abs(b._angle - 90);
      return aa - ab;
    });
    return has_a;
  }

}


/**
 * ### Профиль
 * Класс описывает поведение сегмента профиля (створка, рама, импост)<br />
 * У профиля есть координаты конца и начала, есть путь образующей - прямая или кривая линия
 *
 * @class Profile
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 * @menuorder 42
 * @tooltip Профиль
 *
 * @example
 *
 *     // Создаём элемент профиля на основании пути образующей
 *     // одновременно, указываем контур, которому будет принадлежать профиль, вставку и цвет
 *     new Profile({
 *       generatrix: new paper.Path({
 *         segments: [[1000,100], [0, 100]]
 *       }),
 *       proto: {
 *         parent: _contour,
 *         inset: _inset
 *         clr: _clr
 *       }
 *     });
 */
class Profile extends ProfileItem {

  constructor(attr) {

    super(attr);

    if(this.parent){

      // Подключаем наблюдателя за событиями контура с именем _consts.move_points_
      this._observer = this.observer.bind(this);
      Object.observe(this.layer._noti, this._observer, [consts.move_points]);

      // Информируем контур о том, что у него появился новый ребёнок
      this.layer.on_insert_elm(this);
    }

  }

  /**
   * Расстояние от узла до опорной линии
   * для сегментов створок и вложенных элементов зависит от ширины элементов и свойств примыкающих соединений
   * @property d0
   * @type Number
   */
  get d0() {
    const {_attr} = this;
    if(!_attr.hasOwnProperty('d0')){
      _attr.d0 = 0;
      const nearest = this.nearest();
      if(nearest){
        _attr.d0 -= nearest.d2 + (_attr._nearest_cnn ? _attr._nearest_cnn.sz : 20);
      }
    }
    return _attr.d0;
  }

  /**
   * Возвращает тип элемента (рама, створка, импост)
   */
  get elm_type() {
    const {_rays} = this._attr;

    // если начало или конец элемента соединены с соседями по Т, значит это импост
    if(_rays && (_rays.b.is_tt || _rays.e.is_tt)){
      return $p.enm.elm_types.Импост;
    }

    // Если вложенный контур, значит это створка
    if(this.layer.parent instanceof Contour){
      return $p.enm.elm_types.Створка;
    }

    return $p.enm.elm_types.Рама;
  }

  /**
   * Положение элемента в контуре
   */
  get pos() {
    const by_side = this.layer.profiles_by_side();
    if(by_side.top == this){
      return $p.enm.positions.Верх;
    }
    if(by_side.bottom == this){
      return $p.enm.positions.Низ;
    }
    if(by_side.left == this){
      return $p.enm.positions.Лев;
    }
    if(by_side.right == this){
      return $p.enm.positions.Прав;
    }
    // TODO: рассмотреть случай с выносом стоек и разрывами
    return $p.enm.positions.Центр;
  }

  /**
   * Примыкающий внешний элемент - имеет смысл для сегментов створок, доборов и рам с внешними соединителями
   * @property nearest
   * @type Profile
   */
  nearest(ign_cnn) {

    const {b, e, _attr, layer, project} = this;
    let {_nearest, _nearest_cnn} = _attr;

    if(!ign_cnn && this.inset.empty()){
      ign_cnn = true;
    }

    const check_nearest = (elm) => {
      if(!(elm instanceof Profile || elm instanceof ProfileConnective) || !elm.isInserted()){
        return;
      }
      const {generatrix} = elm;
      let is_nearest = [];
      if(generatrix.getNearestPoint(b).is_nearest(b)){
        is_nearest.push(b);
      }
      if(generatrix.getNearestPoint(e).is_nearest(e)){
        is_nearest.push(e);
      }
      if(is_nearest.length < 2 && elm instanceof ProfileConnective){
        if(this.generatrix.getNearestPoint(elm.b).is_nearest(elm.b)){
          if(is_nearest.every((point) => !point.is_nearest(elm.b))){
            is_nearest.push(elm.b);
          }
        }
        if(this.generatrix.getNearestPoint(elm.e).is_nearest(elm.e)){
          if(is_nearest.every((point) => !point.is_nearest(elm.e))){
            is_nearest.push(elm.e);
          }
        }
      }

      if(is_nearest.length > 1){
        if(!ign_cnn){
          if(!_nearest_cnn){
            _nearest_cnn = project.connections.elm_cnn(this, elm);
          }
          _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, elm, $p.enm.cnn_types.acn.ii, _nearest_cnn, false, Math.abs(elm.angle_hor - this.angle_hor) > 60);
        }
        _attr._nearest = elm;
        return true;
      }

      _attr._nearest = null;
      _attr._nearest_cnn = null;
    };

    const find_nearest = (children) => children.some((elm) => {
      if(_nearest == elm || !elm.generatrix){
        return
      }
      if(check_nearest(elm)){
        return true
      }
      else{
        _attr._nearest = null
      }
    });

    if(layer && !check_nearest(_attr._nearest)){
      if(layer.parent){
        find_nearest(layer.parent.profiles)
      }else{
        find_nearest(project.l_connective.children)
      }
    }

    return _attr._nearest;
  }

  /**
   * Возвращает массив примыкающих ипостов
   */
  joined_imposts(check_only) {

    const {rays, generatrix, layer} = this;
    const tinner = [];
    const touter = [];

    // точки, в которых сходятся более 2 профилей
    const candidates = {b: [], e: []};

    const add_impost = (ip, curr, point) => {
      const res = {point: generatrix.getNearestPoint(point), profile: curr};
      if(this.cnn_side(curr, ip, rays) === $p.enm.cnn_sides.Снаружи){
        touter.push(res);
      }
      else{
        tinner.push(res);
      }
    }

    if(layer.profiles.some((curr) => {

        if(curr == this){
          return
        }

        const pb = curr.cnn_point("b");
        if(pb.profile == this && pb.cnn){

          if(pb.cnn.cnn_type == $p.enm.cnn_types.t){
            if(check_only){
              return true;
            }
            add_impost(curr.corns(1), curr, pb.point);
          }
          else{
            candidates.b.push(curr.corns(1))
          }
        }

        const pe = curr.cnn_point("e");
        if(pe.profile == this && pe.cnn){
          if(pe.cnn.cnn_type == $p.enm.cnn_types.t){
            if(check_only){
              return true;
            }
            add_impost(curr.corns(2), curr, pe.point);
          }
          else{
            candidates.e.push(curr.corns(2))
          }
        }

      })) {
      return true;
    }

    // если в точке примыкает более 1 профиля...
    ['b','e'].forEach((node) => {
      if(candidates[node].length > 1){
        candidates[node].some((ip) => {
          if(this.cnn_side(null, ip, rays) == $p.enm.cnn_sides.Снаружи){
            this.cnn_point(node).is_cut = true;
            return true;
          }
        })
      }
    })

    return check_only ? false : {inner: tinner, outer: touter};

  }

  /**
   * Возвращает массив примыкающих створочных элементов
   */
  joined_nearests() {
    const res = [];

    this.layer.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) == this){
          res.push(profile)
        }
      })
    })

    return res;
  }

  /**
   * ### Соединение конца профиля
   * С этой функции начинается пересчет и перерисовка профиля
   * Возвращает объект соединения конца профиля
   * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
   * - Попутно устанавливает признак `is_cut`, если в точке сходятся больше двух профилей
   * - Не делает подмену соединения, хотя могла бы
   * - Не делает подмену вставки, хотя могла бы
   *
   * @method cnn_point
   * @param node {String} - имя узла профиля: "b" или "e"
   * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
   * @return {CnnPoint} - объект {point, profile, cnn_types}
   */
  cnn_point(node, point) {
    const res = this.rays[node];
    const {cnn, profile, profile_point} = res;

    if(!point){
      point = this[node];
    }

    // Если привязка не нарушена, возвращаем предыдущее значение
    if(profile && profile.children.length){
      if(this.check_distance(profile, res, point, true) === false || res.distance < consts.epsilon){
        return res;
      }
    }

    // TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
    res.clear();
    if(this.parent){
      const {profiles} = this.parent;
      const {allow_open_cnn} = this.project._dp.sys;
      const ares = [];

      for(let i=0; i<profiles.length; i++){
        if(this.check_distance(profiles[i], res, point, false) === false || (res.distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l))){

          // для простых систем разрывы профиля не анализируем
          // if(!allow_open_cnn){
          //   if(res.profile == profile && res.profile_point == profile_point){
          //     if(cnn && !cnn.empty() && res.cnn != cnn){
          //       res.cnn = cnn;
          //     }
          //   }
          //   return res;
          // }

          ares.push({
            profile_point: res.profile_point,
            profile: res.profile,
            cnn_types: res.cnn_types,
            point: res.point});
        }
      }

      if(ares.length == 1){
        res._mixin(ares[0]);
      }
      // если в точке сходятся 3 и более профиля, ищем тот, который смотрит на нас под максимально прямым углом
      else if(ares.length >= 2){
        if(this.max_right_angle(ares)){
          res._mixin(ares[0]);
          // если установленное ранее соединение проходит по типу, нового не ищем
          if(cnn && res.cnn_types && res.cnn_types.indexOf(cnn.cnn_type) != -1 ){
            res.cnn = cnn;
          }
        }
        // и среди соединений нет углового диагонального, вероятно, мы находимся в разрыве - выбираем соединение с пустотой
        else{
          res.clear();
        }
        res.is_cut = true;
      }
    }

    return res;
  }

  /**
   * Вспомогательная функция обсервера, выполняет привязку узлов
   */
  do_bind(p, bcnn, ecnn, moved) {

    let moved_fact;

    if(p instanceof ProfileConnective){
      const {generatrix} = p;
      this._attr._rays.clear();
      this.b = generatrix.getNearestPoint(this.b);
      this.e = generatrix.getNearestPoint(this.e);
      moved_fact = true;
    }
    else{
      if(bcnn.cnn && bcnn.profile == p){
        // обрабатываем угол
        if($p.enm.cnn_types.acn.a.indexOf(bcnn.cnn.cnn_type)!=-1 ){
          if(!this.b.is_nearest(p.e, 0)){
            if(bcnn.is_t || bcnn.cnn.cnn_type == $p.enm.cnn_types.ad){
              if(paper.Key.isDown('control')){
                console.log('control');
              }else{
                if(this.b.getDistance(p.e, true) < consts.sticking2){
                  this.b = p.e;
                }
                moved_fact = true;
              }
            }
            // отрываем привязанный ранее профиль
            else{
              bcnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        // обрабатываем T
        else if($p.enm.cnn_types.acn.t.indexOf(bcnn.cnn.cnn_type)!=-1 ){
          // импосты в створках и все остальные импосты
          const mpoint = (p.nearest(true) ? p.rays.outer : p.generatrix).getNearestPoint(this.b);
          if(!mpoint.is_nearest(this.b, 0)){
            this.b = mpoint;
            moved_fact = true;
          }
        }

      }

      if(ecnn.cnn && ecnn.profile == p){
        // обрабатываем угол
        if($p.enm.cnn_types.acn.a.indexOf(ecnn.cnn.cnn_type)!=-1 ){
          if(!this.e.is_nearest(p.b, 0)){
            if(ecnn.is_t || ecnn.cnn.cnn_type == $p.enm.cnn_types.ad){
              if(paper.Key.isDown('control')){
                console.log('control');
              }else{
                if(this.e.getDistance(p.b, true) < consts.sticking2){
                  this.e = p.b;
                }
                moved_fact = true;
              }
            }
            else{
              // отрываем привязанный ранее профиль
              ecnn.clear();
              this._attr._rays.clear();
            }
          }
        }
        // обрабатываем T
        else if($p.enm.cnn_types.acn.t.indexOf(ecnn.cnn.cnn_type)!=-1 ){
          // импосты в створках и все остальные импосты
          const mpoint = (p.nearest(true) ? p.rays.outer : p.generatrix).getNearestPoint(this.e);
          if(!mpoint.is_nearest(this.e, 0)){
            this.e = mpoint;
            moved_fact = true;
          }
        }
      }
    }

    // если мы в обсервере и есть T и в массиве обработанных есть примыкающий T - пересчитываем
    if(moved && moved_fact){
      const imposts = this.joined_imposts();
      imposts.inner.concat(imposts.outer).forEach((impost) => {
        if(moved.profiles.indexOf(impost) == -1){
          impost.profile.observer(this);
        }
      })
    }
  }
}

Editor.Profile = Profile;
Editor.ProfileItem = ProfileItem;

/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 16.05.2016
 *
 * @module geometry
 * @submodule profile_addl
 */


/**
 * ### Дополнительный профиль
 * Класс описывает поведение доборного и расширительного профилей
 *
 * - похож в поведении на сегмент створки, но расположен в том же слое, что и ведущий элемент
 * - у дополнительного профиля есть координаты конца и начала, такие же, как у Profile
 * - в случае внутреннего добора, могут быть Т - соединения, как у импоста
 * - в случае внешнего, концы соединяются с пустотой
 * - имеет одно ii примыкающее соединение
 * - есть путь образующей - прямая или кривая линия, такая же, как у створки
 * - длина дополнительного профиля может отличаться от длины ведущего элемента
 *
 * @class ProfileAddl
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 * @menuorder 43
 * @tooltip Дополнительный профиль
 */
class ProfileAddl extends ProfileItem {

  constructor(attr) {

    super(attr);

    this._attr.generatrix.strokeWidth = 0;

    if(!attr.side && this._row.parent < 0){
      attr.side = "outer";
    }

    this._attr.side = attr.side || "inner";

    if(!this._row.parent){
      this._row.parent = this.parent.elm;
      if(this.outer){
        this._row.parent = -this._row.parent;
      }
    }

  }

  /**
   * Расстояние от узла до опорной линии, для соединителей и раскладок == 0
   * @property d0
   * @type Number
   */
  get d0() {
    this.nearest();
    return this._attr._nearest_cnn ? -this._attr._nearest_cnn.sz : 0;
  }

  /**
   * Возвращает истина, если соединение с наружной стороны
   */
  get outer() {
    return this._attr.side == "outer";
  }

  /**
   * Возвращает тип элемента (Добор)
   */
  get elm_type() {
    return $p.enm.elm_types.Добор;
  }

  /**
   * Примыкающий внешний элемент - имеет смысл для сегментов створок
   * @property nearest
   * @type Profile
   */
  nearest() {
    const {_attr, parent, project} = this;
    const _nearest_cnn = _attr._nearest_cnn || project.connections.elm_cnn(this, parent);
    _attr._nearest_cnn = $p.cat.cnns.elm_cnn(this, parent, $p.enm.cnn_types.acn.ii, _nearest_cnn, true);
    return parent;
  }

  /**
   * С этой функции начинается пересчет и перерисовка сегмента добора
   * Возвращает объект соединения конца профиля
   * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
   * - Не делает подмену соединения, хотя могла бы
   * - Не делает подмену вставки, хотя могла бы
   *
   * @method cnn_point
   * @for ProfileAddl
   * @param node {String} - имя узла профиля: "b" или "e"
   * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
   * @return {CnnPoint} - объект {point, profile, cnn_types}
   */
  cnn_point(node, point) {

    const res = this.rays[node];

    const check_distance = (elm, with_addl) => {

        if(elm == this || elm == this.parent){
          return;
        }

        const gp = elm.generatrix.getNearestPoint(point);
        let distance;

        if(gp && (distance = gp.getDistance(point)) < consts.sticking){
          if(distance <= res.distance){
            res.point = gp;
            res.distance = distance;
            res.profile = elm;
          }
        }

        if(with_addl){
          elm.getItems({class: ProfileAddl}).forEach((addl) => {
            check_distance(addl, with_addl);
          });
        }

      };

    if(!point){
      point = this[node];
    }

    // Если привязка не нарушена, возвращаем предыдущее значение
    if(res.profile && res.profile.children.length){
      check_distance(res.profile);
      if(res.distance < consts.sticking){
        return res;
      }
    }

    // TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
    res.clear();
    res.cnn_types = $p.enm.cnn_types.acn.t;

    this.layer.profiles.forEach((addl) => check_distance(addl, true));

    return res;
  }

  /**
   * Рассчитывает точки пути на пересечении текущего и указанного профилей
   * @method path_points
   * @param cnn_point {CnnPoint}
   */
  path_points(cnn_point, profile_point) {

    const {generatrix, rays} = this;
    const interior = generatrix.getPointAt(generatrix.length/2);

    const _profile = this;
    const _corns = this._attr._corns;

    if(!generatrix.curves.length){
      return cnn_point;
    }

    // ищет точку пересечения открытых путей
    // если указан индекс, заполняет точку в массиве _corns. иначе - возвращает расстояние от узла до пересечения
    function intersect_point(path1, path2, index){
      var intersections = path1.getIntersections(path2),
        delta = Infinity, tdelta, point, tpoint;

      if(intersections.length == 1)
        if(index)
          _corns[index] = intersections[0].point;
        else
          return intersections[0].point.getDistance(cnn_point.point, true);

      else if(intersections.length > 1){
        intersections.forEach((o) => {
          tdelta = o.point.getDistance(cnn_point.point, true);
          if(tdelta < delta){
            delta = tdelta;
            point = o.point;
          }
        });
        if(index)
          _corns[index] = point;
        else
          return delta;
      }
    }

    // если пересечение в узлах, используем лучи профиля
    const {profile} = cnn_point;
    if(profile){
      const prays = profile.rays;

      // добор всегда Т. сначала определяем, изнутри или снаружи находится наш профиль
      if(!profile.path.segments.length){
        profile.redraw();
      }

      if(profile_point == "b"){
        // в зависимости от стороны соединения
        if(profile.cnn_side(this, interior, prays) == $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 1);
          intersect_point(prays.outer, rays.inner, 4);
        }
        else{
          intersect_point(prays.inner, rays.outer, 1);
          intersect_point(prays.inner, rays.inner, 4);
        }
      }
      else if(profile_point == "e"){
        // в зависимости от стороны соединения
        if(profile.cnn_side(this, interior, prays) == $p.enm.cnn_sides.Снаружи){
          intersect_point(prays.outer, rays.outer, 2);
          intersect_point(prays.outer, rays.inner, 3);
        }
        else{
          intersect_point(prays.inner, rays.outer, 2);
          intersect_point(prays.inner, rays.inner, 3);
        }
      }
    }

    // если точка не рассчиталась - рассчитываем по умолчанию - как с пустотой
    if(profile_point == "b"){
      if(!_corns[1]){
        _corns[1] = this.b.add(generatrix.firstCurve.getNormalAt(0, true).normalize(this.d1));
      }
      if(!_corns[4]){
        _corns[4] = this.b.add(generatrix.firstCurve.getNormalAt(0, true).normalize(this.d2));
      }
    }
    else if(profile_point == "e"){
      if(!_corns[2]){
        _corns[2] = this.e.add(generatrix.lastCurve.getNormalAt(1, true).normalize(this.d1));
      }
      if(!_corns[3]){
        _corns[3] = this.e.add(generatrix.lastCurve.getNormalAt(1, true).normalize(this.d2));
      }
    }
    return cnn_point;
  }

  /**
   * Вспомогательная функция обсервера, выполняет привязку узлов добора
   */
  do_bind(p, bcnn, ecnn, moved) {

    let imposts, moved_fact;

    const bind_node = (node, cnn) => {

        if(!cnn.profile){
          return;
        }

        const gen = this.outer ? this.parent.rays.outer : this.parent.rays.inner;
        const mpoint = cnn.profile.generatrix.intersect_point(gen, cnn.point, "nearest");
        if(!mpoint.is_nearest(this[node])){
          this[node] = mpoint;
          moved_fact = true;
        }

      };

    // при смещениях родителя, даигаем образующую
    if(this.parent == p){
      bind_node("b", bcnn);
      bind_node("e", ecnn);
    }

    if(bcnn.cnn && bcnn.profile == p){

      bind_node("b", bcnn);

    }
    if(ecnn.cnn && ecnn.profile == p){

      bind_node("e", ecnn);

    }

    // если мы в обсервере и есть T и в массиве обработанных есть примыкающий T - пересчитываем
    if(moved && moved_fact){
      // imposts = this.joined_imposts();
      // imposts = imposts.inner.concat(imposts.outer);
      // for(var i in imposts){
      // 	if(moved.profiles.indexOf(imposts[i]) == -1){
      // 		imposts[i].profile.observer(this);
      // 	}
      // }
    }
  }

  glass_segment() {

  }

}

/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 16.05.2016
 *
 * @author	Evgeniy Malyarov
 * @module geometry
 * @submodule profile_connective
 */


/**
 * ### Соединительный профиль
 * Класс описывает поведение соединительного профиля
 *
 * - у соединительного профиля есть координаты конца и начала, такие же, как у Profile
 * - концы соединяются с пустотой
 * - имеет как минимум одно ii примыкающее соединение
 * - есть путь образующей - прямая или кривая линия, такая же, как у Profile
 * - слвиг и искривление пути передаются примыкающим профилям
 * - соединительный профиль живёт в слое одного из рамных контуров изделия, но может оказывать влияние на соединёные с ним контуры
 * - длина соединительного профиля может отличаться от длин профилей, к которым он примыкает
 *
 * @class ProfileConnective
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 */
class ProfileConnective extends ProfileItem {

  constructor(attr) {
    super(attr);
    this.parent = this.project.l_connective;
  }

  /**
   * Расстояние от узла до опорной линии, для соединителей и раскладок == 0
   * @property d0
   * @type Number
   */
  get d0() {
    return 0;
  }

  /**
   * Возвращает тип элемента (соединитель)
   */
  get elm_type() {
    return $p.enm.elm_types.Соединитель;
  }

  /**
   * С этой функции начинается пересчет и перерисовка соединительного профиля
   * т.к. концы соединителя висят в пустоте и не связаны с другими профилями, возвращаем голый cnn_point
   *
   * @method cnn_point
   * @for ProfileConnective
   * @param node {String} - имя узла профиля: "b" или "e"
   * @return {CnnPoint} - объект {point, profile, cnn_types}
   */
  cnn_point(node) {
    return this.rays[node];
  }

  /**
   * ### Двигает узлы
   * Обрабатывает смещение выделенных сегментов образующей профиля
   *
   * @method move_points
   * @for ProfileItem
   * @param delta {paper.Point} - куда и насколько смещать
   * @param [all_points] {Boolean} - указывает двигать все сегменты пути, а не только выделенные
   * @param [start_point] {paper.Point} - откуда началось движение
   */
  move_points(delta, all_points, start_point) {

    const nearests = this.joined_nearests();
    const moved = {profiles: []};

    super.move_points(delta, all_points, start_point);

    // двигаем примыкающие
    if(all_points !== false){
      nearests.forEach((np) => {
        np.do_bind(this, null, null, moved);
        // двигаем связанные с примыкающими
        ['b', 'e'].forEach((node) => {
          const cp = np.cnn_point(node);
          if(cp.profile){
            cp.profile.do_bind(np, cp.profile.cnn_point("b"), cp.profile.cnn_point("e"), moved);
          }
        });
      });
    }

    this.project.register_change();
  }

  /**
   * Возвращает массив примыкающих рам
   */
  joined_nearests() {

    const res = [];

    this.project.contours.forEach((contour) => {
      contour.profiles.forEach((profile) => {
        if(profile.nearest(true) == this){
          res.push(profile)
        }
      })
    })

    return res;

  }

  /**
   * Примыкающий внешний элемент - для соединителя всегда пусто
   * @property nearest
   */
  nearest() {
    return null;
  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   * @for ProfileConnective
   */
  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row, rays, project, generatrix} = this;
    const {cnns} = project.connections;

    // row_b = cnns.add({
    //   elm1: _row.elm,
    //   node1: "b",
    //   cnn: b.cnn ? b.cnn.ref : "",
    //   aperture_len: this.corns(1).getDistance(this.corns(4))
    // })

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.nom = this.nom;
    _row.path_data = generatrix.pathData;
    _row.parent = 0;

    // добавляем припуски соединений
    _row.len = this.length;

    // получаем углы между элементами и к горизонту
    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0){
      _row.alp1 = _row.alp1 + 360;
    }

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0){
      _row.alp2 = _row.alp2 + 360;
    }

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;

  }

  /**
   * ### Удаляет элемент из контура и иерархии проекта
   * Одновлеменно, инициирует обновление путей примыкающих элементов
   * @method remove
   */
  remove() {
    this.joined_nearests().forEach((np) => {
      const {_attr} = np;
      if(_attr._rays){
        _attr._rays.clear()
      }
      if(_attr._nearest){
        _attr._nearest = null
      }
      if(_attr._nearest_cnn){
        _attr._nearest_cnn = null
      }
    });
    super.remove()
  }

}


/**
 * ### Служебный слой соединительных профилей
 * Унаследован от [paper.Layer](http://paperjs.org/reference/layer/)
 *
 * @class ConnectiveLayer
 * @extends paper.Layer
 * @constructor
 */
class ConnectiveLayer extends paper.Layer {

  redraw() {
    this.children.forEach((elm) => elm.redraw())
  }

  save_coordinates() {
    this.children.forEach((elm) => elm.save_coordinates())
  }
}

/**
 * ### Раскладка
 * &copy; http://www.oknosoft.ru 2014-2015<br />
 * Created 16.05.2016
 *
 * @module geometry
 * @submodule profile_onlay
 *
 */

/**
 * ### Раскладка
 * Класс описывает поведение элемента раскладки
 *
 * - у раскладки есть координаты конца и начала
 * - есть путь образующей - прямая или кривая линия, такая же, как у {{#crossLink "Profile"}}{{/crossLink}}
 * - владелец типа {{#crossLink "Filling"}}{{/crossLink}}
 * - концы могут соединяться не только с пустотой или другими раскладками, но и с рёбрами заполнения
 *
 * @class Onlay
 * @param attr {Object} - объект со свойствами создаваемого элемента см. {{#crossLink "BuilderElement"}}параметр конструктора BuilderElement{{/crossLink}}
 * @constructor
 * @extends ProfileItem
 * @menuorder 44
 * @tooltip Раскладка
 */
class Onlay extends ProfileItem {

  /**
   * Расстояние от узла до опорной линии, для соединителей и раскладок == 0
   * @property d0
   * @type Number
   */
  get d0() {
    return 0;
  }

  /**
   * Возвращает тип элемента (раскладка)
   */
  get elm_type() {
    return $p.enm.elm_types.Раскладка;
  }

  /**
   * У раскладки не бывает ведущих элементов
   */
  nearest() {

  }

  /**
   * Вычисляемые поля в таблице координат
   * @method save_coordinates
   * @for Onlay
   */
  save_coordinates() {

    if(!this._attr.generatrix){
      return;
    }

    const {_row, project, rays, generatrix} = this;
    const {cnns} = project.connections;
    const {b, e} = rays;
    const row_b = cnns.add({
      elm1: _row.elm,
      node1: "b",
      cnn: b.cnn ? b.cnn.ref : "",
      aperture_len: this.corns(1).getDistance(this.corns(4))
    });
    const row_e = cnns.add({
      elm1: _row.elm,
      node1: "e",
      cnn: e.cnn ? e.cnn.ref : "",
      aperture_len: this.corns(2).getDistance(this.corns(3))
    });

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;
    _row.parent = this.parent.elm;


    // добавляем припуски соединений
    _row.len = this.length;

    // сохраняем информацию о соединениях
    if(b.profile){
      row_b.elm2 = b.profile.elm;
      if(b.profile instanceof Filling)
        row_b.node2 = "t";
      else if(b.profile.e.is_nearest(b.point))
        row_b.node2 = "e";
      else if(b.profile.b.is_nearest(b.point))
        row_b.node2 = "b";
      else
        row_b.node2 = "t";
    }
    if(e.profile){
      row_e.elm2 = e.profile.elm;
      if(e.profile instanceof Filling)
        row_e.node2 = "t";
      else if(e.profile.b.is_nearest(e.point))
        row_e.node2 = "b";
      else if(e.profile.e.is_nearest(e.point))
        row_e.node2 = "b";
      else
        row_e.node2 = "t";
    }

    // получаем углы между элементами и к горизонту
    _row.angle_hor = this.angle_hor;

    _row.alp1 = Math.round((this.corns(4).subtract(this.corns(1)).angle - generatrix.getTangentAt(0).angle) * 10) / 10;
    if(_row.alp1 < 0)
      _row.alp1 = _row.alp1 + 360;

    _row.alp2 = Math.round((generatrix.getTangentAt(generatrix.length).angle - this.corns(2).subtract(this.corns(3)).angle) * 10) / 10;
    if(_row.alp2 < 0)
      _row.alp2 = _row.alp2 + 360;

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;
  }

  /**
   * С этой функции начинается пересчет и перерисовка сегмента раскладки
   * Возвращает объект соединения конца профиля
   * - Попутно проверяет корректность соединения. Если соединение не корректно, сбрасывает его в пустое значение и обновляет ограничитель типов доступных для узла соединений
   * - Не делает подмену соединения, хотя могла бы
   * - Не делает подмену вставки, хотя могла бы
   *
   * @method cnn_point
   * @for Onlay
   * @param node {String} - имя узла профиля: "b" или "e"
   * @param [point] {paper.Point} - координаты точки, в окрестности которой искать
   * @return {CnnPoint} - объект {point, profile, cnn_types}
   */
  cnn_point(node, point) {

    const res = this.rays[node];

    if(!point){
      point = this[node];
    }

    // Если привязка не нарушена, возвращаем предыдущее значение
    if(res.profile && res.profile.children.length){

      if(res.profile instanceof Filling){
        const np = res.profile.path.getNearestPoint(point);
        if(np.getDistance(point) < consts.sticking_l){
          res.point = np;
          return res;
        }
      }
      else{
        if(this.check_distance(res.profile, res, point, true) === false || res.distance < consts.epsilon){
          return res;
        }
      }
    }

    // TODO вместо полного перебора профилей контура, реализовать анализ текущего соединения и успокоиться, если соединение корректно
    res.clear();
    if(this.parent){
      const res_bind = this.bind_node(point);
      if(res_bind.binded){
        res._mixin(res_bind, ["point","profile","cnn_types","profile_point"]);
      }
    }
    return res;
  }

  /**
   * Пытается привязать точку к рёбрам и раскладкам
   * @param point {paper.Point}
   * @param glasses {Array.<Filling>}
   * @return {Object}
   */
  bind_node(point, glasses) {

    if(!glasses){
      glasses = [this.parent];
    }

    let res = {distance: Infinity, is_l: true};

    // сначала, к образующим заполнений
    glasses.some((glass) => {
      const np = glass.path.getNearestPoint(point);
      let distance = np.getDistance(point);

      if(distance < res.distance){
        res.distance = distance;
        res.point = np;
        res.profile = glass;
        res.cnn_types = $p.enm.cnn_types.acn.t;
      }

      if(distance < consts.sticking_l){
        res.binded = true;
        return true;
      }

      // затем, если не привязалось - к сегментам раскладок текущего заполнения
      res.cnn_types = $p.enm.cnn_types.acn.t;
      const ares = [];
      for(let elm of glass.imposts){
        if (elm !== this && elm.project.check_distance(elm, null, res, point, "node_generatrix") === false ){
          ares.push({
            profile_point: res.profile_point,
            profile: res.profile,
            cnn_types: res.cnn_types,
            point: res.point});
        }
      }

      if(ares.length == 1){
        res._mixin(ares[0]);
      }
      // если в точке сходятся 3 и более профиля, ищем тот, который смотрит на нас под максимально прямым углом
      else if(ares.length >= 2){
        if(this.max_right_angle(ares)){
          res._mixin(ares[0]);
        }
        res.is_cut = true;
      }

    });

    if(!res.binded && res.point && res.distance < consts.sticking){
      res.binded = true;
    }

    return res;
  }

  move_nodes(from, to) {
    for(let elm of this.parent.imposts){
      if(elm == this){
        continue;
      }
      if(elm.b.is_nearest(from)){
        elm.b = to;
      }
      if(elm.e.is_nearest(from)){
        elm.e = to;
      }
    }
  }

}


/**
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule scheme
 */

/**
 * ### Изделие
 * - Расширение [paper.Project](http://paperjs.org/reference/project/)
 * - Стандартные слои (layers) - это контуры изделия, в них живут элементы
 * - Размерные линии, фурнитуру и визуализацию располагаем в отдельных слоях
 *
 * @class Scheme
 * @constructor
 * @extends paper.Project
 * @param _canvas {HTMLCanvasElement} - канвас, в котором будет размещено изделие
 * @menuorder 20
 * @tooltip Изделие
 */

class Scheme extends paper.Project {

  constructor(_canvas, _editor) {

    // создаём объект проекта paperjs
    super(_canvas);

    const _scheme = _editor.project = this;

    const _attr = this._attr = {
        _bounds: null,
        _calc_order_row: null,
        _update_timer: 0
      };

    // массив с моментами времени изменений изделия
    const _changes = this._ch = [];

    // наблюдатель за изменениями свойств изделия
    this._dp_observer = (changes) => {

        if(_attr._loading || _attr._snapshot){
          return;
        }

        const scheme_changed_names = ["clr","sys"];
        const row_changed_names = ["quantity","discount_percent","discount_percent_internal"];
        let evented

        changes.forEach((change) => {

          if(scheme_changed_names.indexOf(change.name) != -1){

            if(change.name == "clr"){
              _scheme.ox.clr = change.object.clr;
              _scheme.getItems({class: ProfileItem}).forEach((p) => {
                if(!(p instanceof Onlay)){
                  p.clr = change.object.clr;
                }
              })
            }

            if(change.name == "sys" && !change.object.sys.empty()){

              change.object.sys.refill_prm(_scheme.ox);

              // обновляем свойства изделия
              Object.getNotifier(change.object).notify({
                type: 'rows',
                tabular: 'extra_fields'
              });

              // обновляем свойства створки
              if(_scheme.activeLayer)
                Object.getNotifier(_scheme.activeLayer).notify({
                  type: 'rows',
                  tabular: 'params'
                });

              // информируем контуры о смене системы, чтобы пересчитать материал профилей и заполнений
              _scheme.contours.forEach((l) => l.on_sys_changed());


              if(change.object.sys != $p.wsql.get_user_param("editor_last_sys"))
                $p.wsql.set_user_param("editor_last_sys", change.object.sys.ref);

              if(_scheme.ox.clr.empty())
                _scheme.ox.clr = change.object.sys.default_clr;

              _scheme.register_change(true);
            }

            if(!evented){
              // информируем мир об изменениях
              $p.eve.callEvent("scheme_changed", [_scheme]);
              evented = true;
            }

          }
          else if(row_changed_names.indexOf(change.name) != -1){

            _attr._calc_order_row[change.name] = change.object[change.name];

            _scheme.register_change(true);

          }

        });
      };

    // наблюдатель за изменениями параметров створки
    this._papam_observer = (changes) => {
        if(_attr._loading || _attr._snapshot){
          return;
        }
        changes.some((change) => {
          if(change.tabular == "params"){
            _scheme.register_change();
            return true;
          }
        });
      };

    /**
     * За этим полем будут "следить" элементы контура и пересчитывать - перерисовывать себя при изменениях соседей
     */
    this._noti = {};

    /**
     * Объект обработки с табличными частями
     */
    this._dp = $p.dp.buyers_order.create();

    /**
     * Менеджер соединений изделия
     * Хранит информацию о соединениях элементов и предоставляет методы для поиска-манипуляции
     * @property connections
     * @type Connections
     */
    this.connections = {

      get cnns() {
        return _scheme.ox.cnn_elmnts;
      },

      elm_cnn(elm1, elm2) {
        let res;
        this.cnns.find_rows({
          elm1: elm1.elm,
          elm2: elm2.elm
        }, (row) => {
          res = row.cnn;
          return false;
        });
        return res;
      }

    };


    /**
     * Перерисовывает все контуры изделия. Не занимается биндингом.
     * Предполагается, что взаимное перемещение профилей уже обработано
     */
    this.redraw = () => {

      _attr._opened && typeof requestAnimationFrame == 'function' && requestAnimationFrame(_scheme.redraw);

      if(_attr._saving || !_changes.length){
        return;
      }

      _changes.length = 0;

      if(_scheme.contours.length){

        // перерисовываем все контуры
        for(let contour of _scheme.contours){
          contour.redraw();
          if(_changes.length && typeof requestAnimationFrame == 'function'){
            return;
          }
        }

        // пересчитываем параметры изделия и фурнитур, т.к. они могут зависеть от размеров

        // если перерисованы все контуры, перерисовываем их размерные линии
        _attr._bounds = null;
        _scheme.contours.forEach((l) => {
          l.contours.forEach((l) => {
            l.save_coordinates(true);
            l.refresh_links();
          });
          l.l_dimensions.redraw();
        });

        // перерисовываем габаритные размерные линии изделия
        _scheme.draw_sizes();

        // перерисовываем соединительные профили
        _scheme.l_connective.redraw();

        // обновляем изображение на эуране
        _scheme.view.update();

      }
      else{
        _scheme.draw_sizes();
      }

    }

    // начинаем следить за _dp, чтобы обработать изменения цвета и параметров
    Object.observe(this._dp, this._dp_observer, ["update"]);

  }

  /**
   * ХарактеристикаОбъект текущего изделия
   * @property ox
   * @type _cat.characteristics
   */
  get ox() {
    return this._dp.characteristic;
  }
  set ox(v) {
    const {_dp, _attr, _papam_observer} = this;
    let setted;

    // пытаемся отключить обсервер от табчасти
    Object.unobserve(_dp.characteristic, _papam_observer);

    // устанавливаем в _dp характеристику
    _dp.characteristic = v;

    const ox = _dp.characteristic;

    _dp.len = ox.x;
    _dp.height = ox.y;
    _dp.s = ox.s;

    // устанавливаем строку заказа
    _attr._calc_order_row = ox.calc_order_row;

    // устанавливаем в _dp свойства строки заказа
    if(_attr._calc_order_row){
      "quantity,price_internal,discount_percent_internal,discount_percent,price,amount,note".split(",").forEach((fld) => _dp[fld] = _attr._calc_order_row[fld]);
    }else{
      // TODO: установить режим только просмотр, если не найдена строка заказа
    }


    // устанавливаем в _dp систему профилей
    if(ox.empty()){
      _dp.sys = "";
    }
    // для пустой номенклатуры, ставим предыдущую выбранную систему
    else if(ox.owner.empty()){
      _dp.sys = $p.wsql.get_user_param("editor_last_sys");
      setted = !_dp.sys.empty();
    }
    // иначе, ищем первую подходящую систему
    else if(_dp.sys.empty()){
      $p.cat.production_params.find_rows({is_folder: false}, (o) => {
        if(setted){
          return false;
        }
        o.production.find_rows({nom: ox.owner}, () => {
          _dp.sys = o;
          setted = true;
          return false;
        });
      });
    }

    // пересчитываем параметры изделия при установке системы
    if(setted){
      _dp.sys.refill_prm(ox);
    }

    // устанавливаем в _dp цвет по умолчанию
    if(_dp.clr.empty()){
      _dp.clr = _dp.sys.default_clr;
    }

    // оповещаем о новых слоях и свойствах изделия
    Object.getNotifier(this._noti).notify({
      type: 'rows',
      tabular: 'constructions'
    });
    Object.getNotifier(_dp).notify({
      type: 'rows',
      tabular: 'extra_fields'
    });

    // начинаем следить за ox, чтобы обработать изменения параметров фурнитуры
    Object.observe(ox, _papam_observer, ["row", "rows"]);

  }

  /**
   * ### Читает изделие по ссылке или объекту продукции
   * Выполняет следующую последовательность действий:
   * - Если передана ссылка, получает объект из базы данных
   * - Удаляет все слои и элементы текущего графисеского контекста
   * - Рекурсивно создаёт контуры изделия по данным табличной части конструкций текущей продукции
   * - Рассчитывает габариты эскиза
   * - Згружает пользовательские размерные линии
   * - Делает начальный снапшот для {{#crossLink "UndoRedo"}}{{/crossLink}}
   * - Рисует автоматические размерные линии
   * - Активирует текущий слой в дереве слоёв
   * - Рисует дополнительные элементы визуализации
   *
   * @method load
   * @param id {String|CatObj} - идентификатор или объект продукции
   * @async
   */
  load(id) {
    const {_attr} = this;
    const _scheme = this;

    /**
     * Рекурсивно создаёт контуры изделия
     * @param [parent] {Contour}
     */
    function load_contour(parent) {
      // создаём семейство конструкций
      _scheme.ox.constructions.find_rows({parent: parent ? parent.cnstr : 0}, (row) => {
        // и вложенные створки
        load_contour(new Contour({parent: parent, row: row}));
      });
    }

    /**
     * Загружает пользовательские размерные линии
     * Этот код нельзя выполнить внутри load_contour, т.к. линия может ссылаться на элементы разных контуров
     */
    function load_dimension_lines() {
      _scheme.ox.coordinates.find_rows({elm_type: $p.enm.elm_types.Размер}, (row) => new DimensionLineCustom({
        parent: _scheme.getItem({cnstr: row.cnstr}).l_dimensions,
        row: row
      }));
    }

    function load_object(o){

      _scheme.ox = o;

      // включаем перерисовку
      _attr._opened = true;
      _attr._bounds = new paper.Rectangle({
        point: [0, 0],
        size: [o.x, o.y]
      });

      // первым делом создаём соединители
      o.coordinates.find_rows({cnstr: 0, elm_type: $p.enm.elm_types.Соединитель}, (row) => new ProfileConnective({row: row}));
      o = null;

      // создаём семейство конструкций
      load_contour(null);

      // перерисовываем каркас
      _scheme.redraw();

      // запускаем таймер, чтобы нарисовать размерные линии и визуализацию
      return new Promise((resolve, reject) => {

        _attr._bounds = null;

        // згружаем пользовательские размерные линии
        load_dimension_lines();

        setTimeout(() => {

          _attr._bounds = null;
          _scheme.zoom_fit();

          // виртуальное событие, чтобы UndoRedo сделал начальный снапшот
          !_attr._snapshot && $p.eve.callEvent("scheme_changed", [_scheme]);

          // регистрируем изменение, чтобы отрисовались размерные линии
          _scheme.register_change(true);

          // виртуальное событие, чтобы активировать слой в дереве слоёв
          if(_scheme.contours.length){
            $p.eve.callEvent("layer_activated", [_scheme.contours[0], true]);
          }

          delete _attr._loading;

          // виртуальное событие, чтобы нарисовать визуализацию или открыть шаблоны
          setTimeout(() => {
            if(_scheme.ox.coordinates.count()){
              if(_scheme.ox.specification.count()){
                _scheme.draw_visualization();
                $p.eve.callEvent("coordinates_calculated", [_scheme, {onload: true}]);
              }
              else{
                // если нет спецификации при заполненных координатах, скорее всего, прочитали типовой блок или снапшот - запускаем пересчет
                $p.eve.callEvent("save_coordinates", [_scheme, {}]);
              }
            }
            else{
              paper.load_stamp && paper.load_stamp();
            }
            delete _attr._snapshot;

            resolve();

          });

        });

      });

    }

    _attr._loading = true;
    if(id != this.ox){
      this.ox = null;
    }
    this.clear();

    if($p.utils.is_data_obj(id) && id.calc_order && !id.calc_order.is_new()){
      return load_object(id);
    }
    else if($p.utils.is_guid(id) || $p.utils.is_data_obj(id)){
      return $p.cat.characteristics.get(id, true, true)
        .then((ox) =>
          $p.doc.calc_order.get(ox.calc_order, true, true)
            .then(() => load_object(ox))
        );
    }
  }

  /**
   * ### Рисует фрагмент загруженного изделия
   * @param attr {Object}
   * @param [attr.elm] {Number} - Элемент или Контур
   *        = 0, формируется эскиз изделия,
   *        > 0, эскиз элемента (заполнения или палки)
   *        < 0, эскиз контура (рамы или створки)
   * @param [attr.width] {Number} - если указано, эскиз будет вписан в данную ширину (по умолчению - 600px)
   * @param [attr.height] {Number} - если указано, эскиз будет вписан в данную высоту (по умолчению - 600px)
   * @param [attr.sz_lines] {enm.ТипыРазмерныхЛиний} - правила формирования размерных линий (по умолчению - Обычные)
   * @param [attr.txt_cnstr] {Boolean} - выводить текст, привязанный к слоям изделия (по умолчению - Да)
   * @param [attr.txt_elm] {Boolean} - выводить текст, привязанный к элементам (например, формулы заполнений, по умолчению - Да)
   * @param [attr.visualisation] {Boolean} - выводить визуализацию (по умолчению - Да)
   * @param [attr.opening] {Boolean} - выводить направление открывания (по умолчению - Да)
   * @param [attr.select] {Number} - выделить на эскизе элемент по номеру (по умолчению - 0)
   * @param [attr.format] {String} - [svg, png, pdf] - (по умолчению - png)
   * @param [attr.children] {Boolean} - выводить вложенные контуры (по умолчению - Нет)
   */
  draw_fragment(attr) {

    const {l_dimensions, l_connective} = this;

    // скрываем все слои
    const contours = this.getItems({class: Contour});
    contours.forEach((l) => l.hidden = true);
    l_dimensions.visible = false;
    l_connective.visible = false;

    let elm;
    if(attr.elm > 0){
      elm = this.getItem({class: BuilderElement, elm: attr.elm});
      elm.draw_fragment && elm.draw_fragment();
    }
    else if(attr.elm < 0){
      const cnstr = -attr.elm;
      contours.some((l) => {
        if(l.cnstr == cnstr){
          l.hidden = false;
          l.hide_generatrix();
          l.l_dimensions.redraw(true);
          l.zoom_fit();
          return true;
        }
      })
    }
    this.view.update();
    return elm;
  }

  /**
   * информирует о наличии изменений
   */
  has_changes() {
    return this._ch.length > 0;
  }

  /**
   * Регистрирует необходимость обновить изображение
   */
  register_update() {
    const {_attr} = this;
    if(_attr._update_timer){
      clearTimeout(_attr._update_timer);
    }
    _attr._update_timer = setTimeout(() => {
      this.view && this.view.update();
      _attr._update_timer = 0;
    }, 100);
  }

  /**
   * Регистрирует факты изменения элемнтов
   */
  register_change(with_update) {

    const {_attr, _ch} = this;

    if(!_attr._loading){

      // сбрасываем габариты
      _attr._bounds = null;

      // сбрасываем d0 для всех профилей
      this.getItems({class: Profile}).forEach((p) => {
        delete p._attr.d0;
      });

      // регистрируем изменённость характеристики
      this.ox._data._modified = true;
      $p.eve.callEvent("scheme_changed", [this]);
    }
    _ch.push(Date.now());

    if(with_update){
      this.register_update();
    }
  }

  /**
   * Габариты изделия. Рассчитываются, как объединение габаритов всех слоёв типа Contour
   * @property bounds
   * @type Rectangle
   */
  get bounds() {
    const {_attr} = this;
    if(!_attr._bounds){
      this.contours.forEach((l) => {
        if(!_attr._bounds)
          _attr._bounds = l.bounds;
        else
          _attr._bounds = _attr._bounds.unite(l.bounds);
      });
    }
    return _attr._bounds;
  }

  /**
   * Габариты с учетом пользовательских размерных линий, чтобы рассчитать отступы автолиний
   */
  get dimension_bounds() {
    let {bounds} = this;
    this.getItems({class: DimensionLine}).forEach((dl) => {
      if(dl instanceof DimensionLineCustom || dl._attr.impost || dl._attr.contour){
        bounds = bounds.unite(dl.bounds);
      }
    });
    this.contours.forEach(({l_visualization}) => {
      const ib = l_visualization._by_insets.bounds;
      if(ib.height && ib.bottom > bounds.bottom){
        const delta = ib.bottom - bounds.bottom + 10;
        bounds = bounds.unite(
          new paper.Rectangle(bounds.bottomLeft, bounds.bottomRight.add([0, delta < 250 ? delta * 1.1 : delta * 1.2]))
        );
      }
    });
    return bounds;
  }

  /**
   * ### Габариты эскиза со всеми видимыми дополнениями
   * В свойстве `strokeBounds` учтены все видимые дополнения - размерные линии, визуализация и т.д.
   *
   * @property strokeBounds
   */
  get strokeBounds() {
    let bounds = new paper.Rectangle();
    this.contours.forEach((l) => bounds = bounds.unite(l.strokeBounds));
    return bounds;
  }

  /**
   * Строка табчасти продукция текущего заказа, соответствующая редактируемому изделию
   */
  get _calc_order_row() {
    const {_attr, ox} = this;
    if(!_attr._calc_order_row && !ox.empty()){
      _attr._calc_order_row = ox.calc_order_row;
    }
    return _attr._calc_order_row;
  }

  /**
   * Формирует оповещение для тех, кто следит за this._noti
   * @param obj
   */
  notify(obj) {
    Object.getNotifier(this._noti).notify(obj);
  }

  /**
   * Чистит изображение
   */
  clear() {
    const pnames = '_bounds,_update_timer,_loading,_snapshot';
    for(let fld in this._attr){
      if(!pnames.match(fld)){
        delete this._attr[fld];
      }
    }
    super.clear();
  }

  /**
   * Деструктор
   */
  unload() {
    const {_dp, _attr, _papam_observer, _dp_observer} = this;
    _attr._loading = true;
    this.clear();
    this.remove();
    Object.unobserve(_dp, _dp_observer);
    Object.unobserve(_dp.characteristic, _papam_observer);
    this._attr._calc_order_row = null;
  }

  /**
   * Двигает выделенные точки путей либо все точки выделенных элементов
   * @method move_points
   * @param delta {paper.Point}
   * @param [all_points] {Boolean}
   */
  move_points(delta, all_points) {
    const other = [];
    const layers = [];
    const profiles = [];

    this.selectedItems.forEach((item) => {

      const {parent, layer} = item;

      if(item instanceof paper.Path && parent instanceof GeneratrixElement){

        if(profiles.indexOf(parent) != -1){
          return;
        }

        profiles.push(parent);

        if(parent._hatching){
          parent._hatching.remove();
          parent._hatching = null;
        }

        if(layer instanceof ConnectiveLayer){
          // двигаем и накапливаем связанные
          other.push.apply(other, parent.move_points(delta, all_points));
        }
        else if(!parent.nearest || !parent.nearest()){

          let check_selected;
          item.segments.forEach((segm) => {
            if(segm.selected && other.indexOf(segm) != -1){
              check_selected = !(segm.selected = false);
            }
          });

          // если уже двигали и не осталось ни одного выделенного - выходим
          if(check_selected && !item.segments.some((segm) => segm.selected)){
            return;
          }

          // двигаем и накапливаем связанные
          other.push.apply(other, parent.move_points(delta, all_points));

          if(layers.indexOf(layer) == -1){
            layers.push(layer);
            layer.l_dimensions.clear();
          }
        }
      }
      else if(item instanceof Filling){
        item.purge_path();
      }
    });
    // TODO: возможно, здесь надо подвигать примыкающие контуры
  }

  /**
   * Сохраняет координаты и пути элементов в табличных частях характеристики
   * @method save_coordinates
   */
  save_coordinates(attr) {

    const {_attr, bounds, ox} = this;

    if(!bounds){
      return;
    }

    // переводим характеристику в тихий режим, чтобы она не создавала лишнего шума при изменениях
    ox._silent();

    _attr._saving = true;

    // устанавливаем размеры в характеристике
    ox.x = bounds.width.round(1);
    ox.y = bounds.height.round(1);
    ox.s = this.area;

    // чистим табчасти, которые будут перезаполнены
    ox.cnn_elmnts.clear();
    ox.glasses.clear();

    // смещаем слои, чтобы расположить изделие в начале координат
    //var bpoint = this.bounds.point;
    //if(bpoint.length > consts.sticking0){
    //	this.getItems({class: Contour}).forEach(function (contour) {
    //		contour.position = contour.position.subtract(bpoint);
    //	});
    //	this._attr._bounds = null;
    //};

    // вызываем метод save_coordinates в дочерних слоях
    this.contours.forEach((contour) => contour.save_coordinates());

    // вызываем метод save_coordinates в слое соединителей
    this.l_connective.save_coordinates();

    $p.eve.callEvent("save_coordinates", [this, attr]);
  }

  /**
   * ### Изменяет центр и масштаб, чтобы изделие вписалось в размер окна
   * Используется инструментом {{#crossLink "ZoomFit"}}{{/crossLink}}, вызывается при открытии изделия и после загрузки типового блока
   *
   * @method zoom_fit
   */
  zoom_fit(bounds) {

    if(!bounds){
      bounds = this.strokeBounds;
    }

    const height = (bounds.height < 1000 ? 1000 : bounds.height) + 320;
    const width = (bounds.width < 1000 ? 1000 : bounds.width) + 320;
    let shift;

    if(bounds){
      const {view} = this;
      view.zoom = Math.min((view.viewSize.height - 40) / height, (view.viewSize.width - 40) / width);
      shift = (view.viewSize.width - bounds.width * view.zoom) / 2;
      if(shift < 180){
        shift = 0;
      }
      view.center = bounds.center.add([shift, 60]);
    }
  }

  /**
   * ### Bозвращает строку svg эскиза изделия
   * Вызывается при записи изделия. Полученный эскиз сохраняется во вложении к характеристике
   *
   * @method get_svg
   * @param [attr] {Object} - указывает видимость слоёв и элементов, используется для формирования эскиза части изделия
   */
  get_svg(attr) {
    this.deselectAll();

    const svg = this.exportSVG();
    const bounds = this.strokeBounds.unite(this.l_dimensions.strokeBounds);

    svg.setAttribute("x", bounds.x);
    svg.setAttribute("y", bounds.y);
    svg.setAttribute("width", bounds.width);
    svg.setAttribute("height", bounds.height);
    svg.querySelector("g").removeAttribute("transform");
    //svg.querySelector("g").setAttribute("transform", "scale(1)");

    return svg.outerHTML;
  }

  /**
   * ### Перезаполняет изделие данными типового блока или снапшота
   * Вызывается, обычно, из формы выбора типового блока, но может быть вызван явно в скриптах тестирования или групповых обработках
   *
   * @method load_stamp
   * @param obx {String|CatObj|Object} - идентификатор или объект-основание (характеристика продукции либо снапшот)
   * @param is_snapshot {Boolean}
   */
  load_stamp(obx, is_snapshot) {

    const do_load = (obx) => {

      const {ox} = this;

      // сохраняем ссылку на типовой блок
      if(!is_snapshot){
        this._dp.base_block = obx;
      }

      // если отложить очитску на потом - получим лажу, т.к. будут стёрты новые хорошие строки
      this.clear();

      // переприсваиваем номенклатуру, цвет и размеры
      ox._mixin(obx, ["owner","sys","clr","x","y","s","s"]);

      // очищаем табчасти, перезаполняем контуры и координаты
      ox.constructions.load(obx.constructions);
      ox.coordinates.load(obx.coordinates);
      ox.params.load(obx.params);
      ox.cnn_elmnts.load(obx.cnn_elmnts);
      ox.inserts.load(obx.inserts);

      ox.specification.clear();
      ox.glass_specification.clear();
      ox.glasses.clear();

      this.load(ox);

    }

    this._attr._loading = true;

    if(is_snapshot){
      this._attr._snapshot = true;
      do_load(obx);
    }
    else{
      $p.cat.characteristics.get(obx, true, true).then(do_load);
    }
  }

  /**
   * ### Вписывает канвас в указанные размеры
   * Используется при создании проекта и при изменении размеров области редактирования
   *
   * @method resize_canvas
   * @param w {Number} - ширина, в которую будет вписан канвас
   * @param h {Number} - высота, в которую будет вписан канвас
   */
  resize_canvas(w, h){
    const {viewSize} = this.view;
    viewSize.width = w;
    viewSize.height = h;
  }

  /**
   * Возвращает массив РАМНЫХ контуров текущего изделия
   * @property contours
   * @type Array
   */
  get contours() {
    return this.layers.filter((l) => l instanceof Contour);
  }

  /**
   * ### Площадь изделия
   * TODO: переделать с учетом пустот, наклонов и криволинейностей
   *
   * @property area
   * @type Number
   * @final
   */
  get area() {
    return (this.bounds.width * this.bounds.height / 1000000).round(3);
  }

  /**
   * ### Цвет текущего изделия
   *
   * @property clr
   * @type _cat.clrs
   */
  get clr() {
    return this.ox.clr;
  }
  set clr(v) {
    this.ox.clr = v;
  }

  /**
   * ### Служебный слой размерных линий
   *
   * @property l_dimensions
   * @type DimensionLayer
   * @final
   */
  get l_dimensions() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_dimensions){
      _attr.l_dimensions = new DimensionLayer();
    }
    if(!_attr.l_dimensions.isInserted()){
      this.addLayer(_attr.l_dimensions);
    }
    if(activeLayer){
      this._activeLayer = activeLayer;
    }

    return _attr.l_dimensions;
  }

  /**
   * ### Служебный слой соединительных профилей
   *
   * @property l_connective
   * @type ConnectiveLayer
   * @final
   */
  get l_connective() {
    const {activeLayer, _attr} = this;

    if(!_attr.l_connective){
      _attr.l_connective = new ConnectiveLayer();
    }
    if(!_attr.l_connective.isInserted()){
      this.addLayer(_attr.l_connective);
    }
    if(activeLayer){
      this._activeLayer = activeLayer;
    }

    return _attr.l_connective;
  }

  /**
   * ### Создаёт и перерисовавает габаритные линии изделия
   * Отвечает только за габариты изделия.<br />
   * Авторазмерные линии контуров и пользовательские размерные линии, контуры рисуют самостоятельно
   *
   * @method draw_sizes
   */
  draw_sizes() {

    const {bounds, l_dimensions} = this;

    if(bounds){

      if(!l_dimensions.bottom)
        l_dimensions.bottom = new DimensionLine({
          pos: "bottom",
          parent: l_dimensions,
          offset: -120
        });
      else
        l_dimensions.bottom.offset = -120;

      if(!l_dimensions.right)
        l_dimensions.right = new DimensionLine({
          pos: "right",
          parent: l_dimensions,
          offset: -120
        });
      else
        l_dimensions.right.offset = -120;


      // если среди размеров, сформированных контурами есть габарит - второй раз не выводим

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == "right" && Math.abs(dl.size - bounds.height) < consts.sticking_l))){
        l_dimensions.right.visible = false;
      }
      else{
        l_dimensions.right.redraw();
      }

      if(this.contours.some((l) => l.l_dimensions.children.some((dl) =>
          dl.pos == "bottom" && Math.abs(dl.size - bounds.width) < consts.sticking_l))){
        l_dimensions.bottom.visible = false;
      }
      else{
        l_dimensions.bottom.redraw();
      }
    }
    else{
      if(l_dimensions.bottom)
        l_dimensions.bottom.visible = false;
      if(l_dimensions.right)
        l_dimensions.right.visible = false;
    }
  }

  /**
   * Перерисовавает визуализацию контуров изделия
   */
  draw_visualization() {
    for(let contour of this.contours){
      contour.draw_visualization()
    }
    this.view.update();
  }

  /**
   * ### Вставка по умолчанию
   * Возвращает вставку по умолчанию с учетом свойств системы и положения элемента
   *
   * @method default_inset
   * @param [attr] {Object}
   * @param [attr.pos] {_enm.positions} - положение элемента
   * @param [attr.elm_type] {_enm.elm_types} - тип элемента
   * @returns {Array.<ProfileItem>}
   */
  default_inset(attr) {

    let rows;

    if(!attr.pos){
      rows = this._dp.sys.inserts(attr.elm_type, true);
      // если доступна текущая, возвращаем её
      if(attr.inset && rows.some((row) => attr.inset == row)){
        return attr.inset;
      }
      return rows[0];
    }

    rows = this._dp.sys.inserts(attr.elm_type, "rows");

    // если без вариантов, возвращаем без вариантов
    if(rows.length == 1){
      return rows[0].nom;
    }

    const pos_array = Array.isArray(attr.pos);
    function check_pos(pos) {
      if(pos_array){
        return attr.pos.some((v) => v == pos);
      }
      return attr.pos == pos;
    }

    // если подходит текущая, возвращаем текущую
    if(attr.inset && rows.some((row) => attr.inset == row.nom && (check_pos(row.pos) || row.pos == $p.enm.positions.Любое))){
      return attr.inset;
    }

    let inset;
    // ищем по умолчанию + pos
    rows.some((row) => {
      if(check_pos(row.pos) && row.by_default)
        return inset = row.nom;
    });
    // ищем по pos без умолчания
    if(!inset){
      rows.some((row) => {
        if(check_pos(row.pos))
          return inset = row.nom;
      });
    }
    // ищем по умолчанию + любое
    if(!inset){
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое && row.by_default)
          return inset = row.nom;
      });
    }
    // ищем любое без умолчаний
    if(!inset){
      rows.some((row) => {
        if(row.pos == $p.enm.positions.Любое)
          return inset = row.nom;
      });
    }

    return inset;
  }

  /**
   * ### Контроль вставки
   * Проверяет, годится ли текущая вставка для данного типа элемента и положения
   */
  check_inset(attr) {
    const inset = attr.inset ? attr.inset : attr.elm.inset;
    const elm_type = attr.elm ? attr.elm.elm_type : attr.elm_type;
    const nom = inset.nom();
    const rows = [];

    // если номенклатура пустая, выходим без проверки
    if(!nom || nom.empty()){
      return inset;
    }

    // получаем список вставок с той же номенклатурой, что и наша
    this._dp.sys.elmnts.each(function(row){
      if((elm_type ? row.elm_type == elm_type : true) && row.nom.nom() == nom)
        rows.push(row);
    });

    // TODO: отфильтровать по положению attr.pos

    // если в списке есть наша, возвращаем её, иначе - первую из списка
    for(var i=0; i<rows.length; i++){
      if(rows[i].nom == inset)
        return inset;
    }

    if(rows.length)
      return rows[0].nom;
  }

  /**
   * Находит точку на примыкающем профиле и проверяет расстояние до неё от текущей точки
   * !! Изменяет res - CnnPoint
   * @param element {Profile} - профиль, расстояние до которого проверяем
   * @param profile {Profile|null} - текущий профиль - используется, чтобы не искать соединения с самим собой
   * TODO: возможно, имеет смысл разрешить змее кусать себя за хвост
   * @param res {CnnPoint} - описание соединения на конце текущего профиля
   * @param point {paper.Point} - точка, окрестность которой анализируем
   * @param check_only {Boolean|String} - указывает, выполнять только проверку или привязывать точку к узлам или профилю или к узлам и профилю
   * @returns {Boolean|undefined}
   */
  check_distance(element, profile, res, point, check_only) {
    const {allow_open_cnn} = this._dp.sys;

    let distance, gp, cnns, addls,
      bind_node = typeof check_only == "string" && check_only.indexOf("node") != -1,
      bind_generatrix = typeof check_only == "string" ? check_only.indexOf("generatrix") != -1 : check_only,
      node_distance;

    // Проверяет дистанцию в окрестности начала или конца соседнего элемента
    function check_node_distance(node) {

      if((distance = element[node].getDistance(point)) < (allow_open_cnn ? parseFloat(consts.sticking_l) : consts.sticking)){

        if(typeof res.distance == "number" && res.distance < distance)
          return 1;

        //if(profile && (!res.cnn || $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1)){
        if(profile && !res.cnn){

          // а есть ли подходящее?
          cnns = $p.cat.cnns.nom_cnn(element, profile, $p.enm.cnn_types.acn.a);
          if(!cnns.length){
            if(!element.is_collinear(profile)){
              cnns = $p.cat.cnns.nom_cnn(profile, element, $p.enm.cnn_types.acn.t);
            }
            if(!cnns.length){
              return 1;
            }
          }

          // если в точке сходятся 2 профиля текущего контура - ок

          // если сходятся > 2 и разрешены разрывы TODO: учесть не только параллельные

        }
        else if(res.cnn && $p.enm.cnn_types.acn.a.indexOf(res.cnn.cnn_type) == -1){
          return 1;
        }

        res.point = bind_node ? element[node] : point;
        res.distance = distance;
        res.profile = element;
        if(cnns && cnns.length && $p.enm.cnn_types.acn.t.indexOf(cnns[0].cnn_type) != -1){
          res.profile_point = '';
          res.cnn_types = $p.enm.cnn_types.acn.t;
          if(!res.cnn){
            res.cnn = cnns[0];
          }
        }
        else{
          res.profile_point = node;
          res.cnn_types = $p.enm.cnn_types.acn.a;
        }

        return 2;
      }

    }

    if(element === profile){
      if(profile.is_linear())
        return;
      else{
        // проверяем другой узел, затем - Т

      }
      return;

    }
    // если мы находимся в окрестности начала соседнего элемента
    else if((node_distance = check_node_distance("b")) || (node_distance = check_node_distance("e"))){
      return node_distance == 2 ? false : void(0);
    }

    // это соединение с пустотой или T
    res.profile_point = '';

    // // если возможна привязка к добору, используем её
    // element.addls.forEach(function (addl) {
    // 	gp = addl.generatrix.getNearestPoint(point);
    // 	distance = gp.getDistance(point);
    //
    // 	if(distance < res.distance){
    // 		res.point = addl.rays.outer.getNearestPoint(point);
    // 		res.distance = distance;
    // 		res.point = gp;
    // 		res.profile = addl;
    // 		res.cnn_types = $p.enm.cnn_types.acn.t;
    // 	}
    // });
    // if(res.distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){
    // 	return false;
    // }

    // если к доборам не привязались - проверяем профиль
    gp = element.generatrix.getNearestPoint(point);
    distance = gp.getDistance(point);

    if(distance < ((res.is_t || !res.is_l)  ? consts.sticking : consts.sticking_l)){

      if(distance < res.distance || bind_generatrix){
        if(element.d0 != 0 && element.rays.outer){
          // для вложенных створок и смещенных рам учтём смещение
          res.point = element.rays.outer.getNearestPoint(point);
          res.distance = 0;
        }
        else{
          res.point = gp;
          res.distance = distance;
        }
        res.profile = element;
        res.cnn_types = $p.enm.cnn_types.acn.t;
      }
      if(bind_generatrix){
        return false;
      }
    }
  }

  /**
   * ### Цвет по умолчанию
   * Возвращает цвет по умолчанию с учетом свойств системы и элемента
   *
   * @property default_clr
   * @final
   */
  default_clr(attr) {
    return this.ox.clr;
  }

  /**
   * ### Фурнитура по умолчанию
   * Возвращает фурнитуру текущего изделия по умолчанию с учетом свойств системы и контура
   *
   * @property default_furn
   * @final
   */
  get default_furn() {
    // ищем ранее выбранную фурнитуру для системы
    var sys = this._dp.sys,
      res;
    while (true){
      if(res = $p.job_prm.builder.base_furn[sys.ref])
        break;
      if(sys.empty())
        break;
      sys = sys.parent;
    }
    if(!res){
      res = $p.job_prm.builder.base_furn.null;
    }
    if(!res){
      $p.cat.furns.find_rows({is_folder: false, is_set: false, id: {not: ""}}, (row) => {
        res = row;
        return false;
      });
    }
    return res;
  }

  /**
   * ### Выделенные профили
   * Возвращает массив выделенных профилей. Выделенным считаем профиль, у которого выделены `b` и `e` или выделен сам профиль при невыделенных узлах
   *
   * @method selected_profiles
   * @param [all] {Boolean} - если true, возвращает все выделенные профили. Иначе, только те, которе можно двигать
   * @returns {Array.<ProfileItem>}
   */
  selected_profiles(all) {
    const res = [];
    const count = this.selectedItems.length;

    this.selectedItems.forEach((item) => {

      const p = item.parent;

      if(p instanceof ProfileItem){
        if(all || !item.layer.parent || !p.nearest || !p.nearest()){

          if(res.indexOf(p) != -1){
            return;
          }

          if(count < 2 || !(p._attr.generatrix.firstSegment.selected ^ p._attr.generatrix.lastSegment.selected)){
            res.push(p);
          }

        }
      }
    });

    return res;
  }

  /**
   * ### Выделенные заполнения
   *
   * @method selected_glasses
   * @returns {Array.<Filling>}
   */
  selected_glasses() {
    const res = [];

    this.selectedItems.forEach((item) => {

      if(item instanceof Filling && res.indexOf(item) == -1){
        res.push(item);
      }
      else if(item.parent instanceof Filling && res.indexOf(item.parent) == -1){
        res.push(item.parent);
      }
    });

    return res;
  }

  /**
   * ### Выделенный элемент
   * Возвращает первый из найденных выделенных элементов
   *
   * @property selected_elm
   * @returns {BuilderElement}
   */
  get selected_elm() {
    let res;
    this.selectedItems.some((item) => {
      if(item instanceof BuilderElement){
        return res = item;

      }else if(item.parent instanceof BuilderElement){
        return res = item.parent;
      }
    });
    return res;
  }

  /**
   * Ищет точки в выделенных элементах. Если не находит, то во всём проекте
   * @param point {paper.Point}
   * @returns {*}
   */
  hitPoints(point, tolerance, selected_first) {
    let item, hit;
    let dist = Infinity;

    function check_corns(elm) {
      const corn = elm.corns(point);
      if(corn.dist < dist){
        dist = corn.dist;
        if(corn.dist < consts.sticking){
          hit = {
            item: elm.generatrix,
            point: corn.point
          }
        }
      }
    }

    // отдаём предпочтение сегментам выделенных путей
    if(selected_first){
      this.selectedItems.some((item) => hit = item.hitTest(point, { segments: true, tolerance: tolerance || 8 }));
      // если нет в выделенных, ищем во всех
      if(!hit){
        hit = this.hitTest(point, { segments: true, tolerance: tolerance || 6 });
      }
    }
    else{
      for(let elm of this.activeLayer.profiles){
        check_corns(elm);
        for(let addl of elm.addls){
          check_corns(addl);
        }
      };
    }

    // if(!tolerance && hit && hit.item.layer && hit.item.layer.parent){
    //   item = hit.item;
    //   // если соединение T - портить hit не надо, иначе - ищем во внешнем контуре
    //   if((item.parent.b && item.parent.b.is_nearest(hit.point) && item.parent.rays.b &&
    //     (item.parent.rays.b.is_t || item.parent.rays.b.is_i))
    //     || (item.parent.e && item.parent.e.is_nearest(hit.point) && item.parent.rays.e &&
    //     (item.parent.rays.e.is_t || item.parent.rays.e.is_i))){
    //     return hit;
    //   }
    //
    //   item.layer.parent.profiles.some((item) => hit = item.hitTest(point, { segments: true, tolerance: tolerance || 6 }));
    //   //item.selected = false;
    // }
    return hit;
  }

  /**
   * Корневой слой для текущего слоя
   */
  rootLayer(layer) {
    if(!layer){
      layer = this.activeLayer
    }
    while (layer.parent){
      layer = layer.parent
    }
    return layer
  }

  /**
   * Снимает выделение со всех узлов всех путей
   * В отличии от deselectAll() сами пути могут оставаться выделенными
   * учитываются узлы всех путей, в том числе и не выделенных
   */
  deselect_all_points(with_items) {
    this.getItems({class: paper.Path}).forEach(function (item) {
      item.segments.forEach(function (s) {
        if (s.selected)
          s.selected = false;
      });
      if(with_items && item.selected)
        item.selected = false;
    });
  }

  /**
   * Массив с рёбрами периметра
   */
  get perimeter() {
    let res = [],
      contours = this.contours,
      tmp;

    // если в изделии один рамный контур - просто возвращаем его периметр
    if(contours.length == 1){
      return contours[0].perimeter;
    }

    // находим самый нижний правый контур

    // бежим по всем контурам, находим примыкания, исключаем их из результата

    return res;
  }

  /**
   * Возвращает массив заполнений изделия
   */
  get glasses() {
    return this.getItems({class: Filling});
  }

}

/**
 * ### Разрез
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * Created 24.07.2015
 *
 * @module geometry
 * @submodule sectional
 */

/**
 * Вид в разрезе. например, водоотливы
 * @param attr {Object} - объект со свойствами создаваемого элемента
 * @constructor
 * @extends BuilderElement
 */
class Sectional extends GeneratrixElement {

  /**
   * Вызывается из конструктора - создаёт пути и лучи
   * @method initialize
   * @private
   */
  initialize(attr) {

    const {project, _attr, _row} = this;
    const h = project.bounds.height + project.bounds.y;

    _attr._rays = {
      b: {},
      e: {},
      clear() {},
    };

    _attr.children = [];

    _attr.zoom = 5;
    _attr.radius = 40;

    if(attr.generatrix) {
      _attr.generatrix = attr.generatrix;
    }
    else {
      if(_row.path_data) {
        _attr.generatrix = new paper.Path(_row.path_data);
      }
      else{
        const first_point = new paper.Point([_row.x1, h - _row.y1]);
        _attr.generatrix = new paper.Path(first_point);
        if(_row.r){
          _attr.generatrix.arcTo(
            first_point.arc_point(_row.x1, h - _row.y1, _row.x2, h - _row.y2,
              _row.r + 0.001, _row.arc_ccw, false), [_row.x2, h - _row.y2]);
        }
        else{
          _attr.generatrix.lineTo([_row.x2, h - _row.y2]);
        }
      }
    }

    _attr.generatrix.strokeColor = 'black';
    _attr.generatrix.strokeWidth = 1;
    _attr.generatrix.strokeScaling = false;

    this.clr = _row.clr.empty() ? $p.job_prm.builder.base_clr : _row.clr;
    //_attr.path.fillColor = new paper.Color(0.96, 0.98, 0.94, 0.96);

    this.addChild(_attr.generatrix);

  }

  /**
   * ### Формирует путь разреза
   *
   * @method redraw
   * @return {Sectional}
   * @chainable
   */
  redraw() {
    const {layer, generatrix, _attr} = this;
    const {children, zoom, radius} = _attr;
    const {segments, curves} = generatrix;

    // чистим углы и длины
    for(let child of children){
      child.remove();
    }

    // рисуем углы
    for(let i = 1; i < segments.length - 1; i++){
      this.draw_angle(i, radius);
    }

    // рисуем длины
    for(let curve of curves){
      const loc = curve.getLocationAtTime(0.5);
      const normal = loc.normal.normalize(radius);
      children.push(new paper.PointText({
        point: loc.point.add(normal).add([0, normal.y < 0 ? 0 : normal.y / 2]),
        content: (curve.length / zoom).toFixed(0),
        fillColor: 'black',
        fontSize: radius,
        justification: 'center',
        guide: true,
        parent: layer,
      }));
    }


    return this;
  }

  /**
   * Рисует дуги и текст в углах
   * @param ind
   */
  draw_angle(ind) {
    const {layer, generatrix, _attr} = this;
    const {children, zoom, radius} = _attr;
    const {curves} = generatrix;
    const c1 = curves[ind - 1];
    const c2 = curves[ind];
    const loc1 = c1.getLocationAtTime(0.9);
    const loc2 = c2.getLocationAtTime(0.1);
    const center = c1.point2;
    let angle = loc2.tangent.angle - loc1.tangent.negate().angle;
    if(angle < 0){
      angle += 360;
    }
    if(angle > 180){
      angle = 360 - angle;
    }

    if (c1.length < radius || c2.length < radius || 180 - angle < 1){
      return;
    }

    const from = c1.getLocationAt(c1.length - radius).point;
    const to = c2.getLocationAt(radius).point;
    const end = center.subtract(from.add(to).divide(2)).normalize(radius).negate();
    children.push(new paper.Path.Arc({
      from,
      through: center.add(end),
      to,
      strokeColor: 'grey',
      guide: true,
      parent: layer,
    }));

    // Angle Label
    children.push(new paper.PointText({
      point: center.add(end.multiply(angle < 40 ? 3 : 2).add([0, -end.y / 2])),
      content: angle.toFixed(0) + '°',
      fillColor: 'black',
      fontSize: radius,
      justification: 'center',
      guide: true,
      parent: layer,
    }));

  }

  /**
   * ### Вычисляемые поля в таблице координат
   * @method save_coordinates
   */
  save_coordinates() {

    const {_row, generatrix} = this;

    if(!generatrix){
      return;
    }

    _row.x1 = this.x1;
    _row.y1 = this.y1;
    _row.x2 = this.x2;
    _row.y2 = this.y2;
    _row.path_data = generatrix.pathData;
    _row.nom = this.nom;


    // добавляем припуски соединений
    _row.len = this.length.round(1);

    // устанавливаем тип элемента
    _row.elm_type = this.elm_type;

  }

  /**
   * заглушка для совместимости с профилем
   */
  cnn_point() {

  }

  /**
   * Длина разреза
   * @return {number}
   */
  get length() {
    const {generatrix, zoom} = this._attr;
    return generatrix.length / zoom;
  }

  /**
   * Виртуальные лучи для совместимости с профилем
   * @return {{b: {}, e: {}, clear: (function())}|*|ProfileRays}
   */
  get rays() {
    return this._attr._rays;
  }

  /**
   * Возвращает тип элемента (Водоотлив)
   */
  get elm_type() {
    return $p.enm.elm_types.Водоотлив;
  }
}

/**
 * ### Движок графического построителя
 *
 * &copy; Evgeniy Malyarov http://www.oknosoft.ru 2014-2017
 *
 * @module geometry
 */

/**
 * Константы и параметры
 */
const consts = new function Settings(){

	this.tune_paper = function (settings) {

	  const builder = $p.job_prm.builder || {};

		/**
		 * Размер визуализации узла пути
		 * @property handleSize
		 * @type number
		 */
		settings.handleSize = builder.handle_size;

		/**
		 * Прилипание. На этом расстоянии узел пытается прилепиться к другому узлу или элементу
		 * @property sticking
		 * @type number
		 */
		this.sticking = builder.sticking || 90;
		this.sticking_l = builder.sticking_l || 9;
		this.sticking0 = this.sticking / 2;
		this.sticking2 = this.sticking * this.sticking;
		this.font_size = builder.font_size || 60;
    this.elm_font_size = builder.elm_font_size || 40;

		// в пределах этого угла, считаем элемент вертикальным или горизонтальным
		this.orientation_delta = builder.orientation_delta || 30;


	}.bind(this);


  this.epsilon = 0.01;
	this.move_points = 'move_points';
	this.move_handle = 'move_handle';
	this.move_shapes = 'move-shapes';

};


delete Contour.prototype.refresh_links;
Contour.prototype.refresh_links = function () {

}

delete Scheme.prototype.zoom_fit;
Scheme.prototype.zoom_fit = function () {
  Contour.prototype.zoom_fit.call(this);
}

// формирует json описания продукции с эскизами
async function prod(ctx, next) {

  const {project, view} = new Editor();

  const calc_order = await $p.doc.calc_order.get(ctx.params.ref, 'promise');

  const prod = await calc_order.load_production();

  const res = {number_doc: calc_order.number_doc};

  for(let ox of prod){

    await project.load(ox);

    // project.draw_fragment({elm: -1});
    // view.update();
    // ctx.type = 'image/png';
    // ctx.body = return view.element.toBuffer();

    const {_obj} = ox;
    const ref = '_' + ox.ref.replace(/-/g, '_');
    res[ref] = {
      imgs: {
        'l0': view.element.toBuffer().toString('base64')
      },
      constructions: _obj.constructions,
      coordinates: _obj.coordinates,
      specification: _obj.specification,
      glasses: _obj.glasses,
      params: _obj.params,
      clr: _obj.clr,
      sys: _obj.sys,
      x: _obj.x,
      y: _obj.y,
      z: _obj.z,
      s: _obj.s,
      weight: _obj.weight,
      origin: _obj.origin,
      leading_elm: _obj.leading_elm,
      leading_product: _obj.leading_product,
      product: _obj.product,
    };

    ox.constructions.forEach(({cnstr}) => {
      project.draw_fragment({elm: -cnstr});
      res[ref].imgs[`l${cnstr}`] = view.element.toBuffer().toString('base64');
    });

    ox.glasses.forEach((row) => {
      const glass = project.draw_fragment({elm: row.elm});
      // подтянем формулу стеклопакета
      res[ref].imgs[`g${row.elm}`] = view.element.toBuffer().toString('base64');
      if(glass){
        row.formula = glass.formula(true);
        glass.visible = false;
      }
    });
  }

  setTimeout(() => {
    calc_order.unload();
    project.unload();
    for(let ox of prod){
      ox.unload();
    }
  });

  //ctx.body = `Prefix: ${ctx.route.prefix}, path: ${ctx.route.path}`;
  ctx.body = res;
}

// формирует массив эскизов по параметрам запроса
async function array(ctx, next) {

// отсортировать по заказам и изделиям
  const grouped = $p.wsql.alasql('SELECT calc_order, product, elm FROM ? GROUP BY ROLLUP(calc_order, product, elm)', [JSON.parse(ctx.params.ref)]);
  const res = [];

  const {project, view} = new Editor();

  let calc_order, ox, fragmented;
  for(let img of grouped) {
    if(img.product == null){
      if(calc_order){
        calc_order.unload();
        calc_order = null;
      }
      if(img.calc_order){
        calc_order = await $p.doc.calc_order.get(img.calc_order, 'promise');
      }
      continue;
    }
    if(img.elm == null){
      if(ox){
        ox.unload();
        ox = null;
      }
      ox = await calc_order.production.get(img.product-1).characteristic.load();
      await project.load(ox);
      fragmented = false;
      continue;
    }

    if(img.elm == 0){
      if(fragmented){
        await project.load(ox);
      }
    }
    else{
      fragmented = true;
      project.draw_fragment({elm: img.elm});
    }

    res.push({
      calc_order: img.calc_order,
      product: img.product,
      elm: img.elm,
      img: view.element.toBuffer().toString('base64')
    })
  }

  calc_order && calc_order.unload();
  ox && ox.unload();

  ctx.body = res;

}

// формирует единичный эскиз по параметрам запроса
async function png(ctx, next) {

}

// формирует единичный эскиз по параметрам запроса
async function svg(ctx, next) {

}

module.exports = async (ctx, next) => {

  // если указано ограничение по ip - проверяем
  const {restrict_ips} = ctx.app;
  if(restrict_ips.length && restrict_ips.indexOf(ctx.ip) == -1){
    ctx.status = 500;
    ctx.body = 'ip restricted:' + ctx.ip;
    return;
  }

  try{
    switch (ctx.params.class){
      case 'doc.calc_order':
        return await prod(ctx, next);
      case 'array':
        return await array(ctx, next);
      case 'png':
        return await png(ctx, next);
      case 'svg':
        return await svg(ctx, next);
    }
  }
  catch(err){
    ctx.status = 500;
    ctx.body = err.stack;
    debug(err);
  }

};
