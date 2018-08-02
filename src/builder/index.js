'use strict';

import paper from 'paper/dist/paper-core';
import $p from '../metadata';

global.paper = paper;
const EditorInvisible = require('./src/builder/drawer');

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

export default EditorInvisible;
