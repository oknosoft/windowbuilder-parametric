/**
 *
 *
 * @module log
 *
 * Created by Evgeniy Malyarov on 23.09.2017.
 */

const $p = require('./metadata');
const auth = require('./auth');

function getBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => data += chunk);
    req.on('end', (chunk) => {
      if(data.length > 0 && data.charCodeAt(0) == 65279) {
        data = data.substr(1);
      }
      resolve(data);
    });
  });
}

async function saveLog({_id, log, start, body}) {
  const {doc} = $p.adapters.pouch.remote;
  return doc.get(_id)
    .catch((err) => {
    if(err.status == 404) {
      return {_id, events: []};
    }
  })
    .then((rev) => {
    if(rev){
      log.duration = Date.now() - parseInt(start.format('x'), 10);
      if(body){
        log.response = body;
      }
      rev.events.push(log);
      return doc.put(rev);
    }
  });
}

module.exports = async (ctx, next) => {

  // request
  const {moment} = $p.utils;
  const start = moment();

  // проверяем ограничение по ip и авторизацию
  ctx._auth = await auth(ctx, $p);
  const _id = `_local/log.${(ctx._auth && ctx._auth.suffix) || '0000'}.${start.format('YYYYMMDD')}`;

  // собираем объект лога
  const log = {
    start: start.format('HH:mm:ss'),
    method: ctx.method,
    headers: ctx.req.headers,
    url: ctx.originalUrl,
    post_data: await getBody(ctx.req),
    ip: ctx.ip,
  };

  if(ctx._auth) {
    try {
      ctx._query = log.post_data.length > 0 ? JSON.parse(log.post_data) : {};
      await next();
      saveLog({_id, log, start, body: log.url.indexOf('prm/doc.calc_order') != -1 && ctx.body});
    } catch (err) {
      // log uncaught downstream errors
      log.error = err.message;
      saveLog({_id, log, start});
      throw err;
    }
  }
  else{
    log.error = 'unauthorized';
    saveLog({_id, log, start, body: ctx.body});
  }

};
