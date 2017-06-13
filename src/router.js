'use strict';

const debug = require('debug')('wb:router');
debug('start');


const Router = require('koa-better-router');
const rep = Router({ prefix: '/prm' });

rep.loadMethods()
  .get('/:class/:ref', require('./get'))
  .post('/:class/:ref', require('./post'));

module.exports = rep;
