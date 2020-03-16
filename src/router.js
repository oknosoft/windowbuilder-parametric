'use strict';

const debug = require('debug')('wb:router');
debug('start');

require('./builder');

const Router = require('koa-better-router');
const router = Router({ prefix: '/prm' });

const get = require('./get');
const post = require('./post');

router.loadMethods()
  .get('/:class/:ref', get)
  .post('/:class/:ref', post);

module.exports = router;
