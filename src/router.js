'use strict';

const debug = require('debug')('wb:router');
debug('start');

const Router = require('koa-better-router');
const router = Router({ prefix: '/prm' });

router.loadMethods()
  .get('/:class/:ref', require('./get'))
  .post('/:class/:ref', require('./post'));

module.exports = router;
