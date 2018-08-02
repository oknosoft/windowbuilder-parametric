'use strict';

const debug = require('debug')('wb:router');
debug('start');

import './builder';

import Router from 'koa-better-router';
const router = Router({ prefix: '/prm' });

import get from './get';
import post from './post';

router.loadMethods()
  .get('/:class/:ref', get)
  .post('/:class/:ref', post);

export default router;
