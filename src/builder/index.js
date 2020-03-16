'use strict';

const paper = require('paper/dist/paper-core');
const $p = require('../metadata');

const drawer = require('windowbuilder/dist/drawer');
global.paper = paper;
// формируем в $p конструктор стандартной рисовалки
drawer({$p, paper});
const {EditorInvisible} = $p;

const debug = require('debug')('wb:paper');
debug('required, inited & modified');


/**
 * Невизуальный редактор
 */
class Editor extends EditorInvisible {

  constructor(format = 'png') {

    super();

    // создаём экземпляр проекта Scheme
    this.create_scheme(format);
  }


  /**
   * Создаёт проект с заданным типом канваса
   * @param format
   */
  create_scheme(format = 'png') {
    const _canvas = paper.createCanvas(480, 480, format); // собственно, канвас
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

module.exports = EditorInvisible;
