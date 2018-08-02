'use strict';

import Koa from 'koa';
const app = new Koa();

// Register the cors as Koa middleware
import cors from '@koa/cors';
app.use(cors({credentials: true, maxAge: 600}));

// Register the logger as Koa middleware
import log from './log';
app.use(log);

// Register the router as Koa middleware
import router from './router';
app.use(router.middleware());

app.listen(process.env.PORT || 3000);
app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

export default app;
