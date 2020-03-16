'use strict';

const Koa = require('koa');
const app = new Koa();

// Register the cors as Koa middleware
const cors = require('@koa/cors');
app.use(cors({credentials: true, maxAge: 600}));

// Register the logger as Koa middleware
const log = require('./log');
app.use(log);

// Register the router as Koa middleware
const router = require('./router');
app.use(router.middleware());

app.listen(process.env.PORT || 3000);
app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

module.exports = app;
