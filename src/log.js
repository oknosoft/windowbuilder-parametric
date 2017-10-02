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
      return {_id, rows: []};
    }
  })
    .then((rev) => {
    if(rev){
      log.response = body || '';
      log.duration = Date.now() - parseInt(start.format('x'), 10);
      if(rev.events){
        rev.rows = rev.events;
        delete rev.events;
      }
      rev.rows.push(log);
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
    url: ctx.originalUrl,
    method: ctx.method,
    ip: ctx.req.headers['x-real-ip'] || ctx.ip,
    headers: Object.keys(ctx.req.headers).map((key) => [key, ctx.req.headers[key]]),
  };

  if(ctx._auth) {
    try {
      // тело запроса анализируем только для авторизованных пользователей
      log.post_data = await getBody(ctx.req);
      ctx._query = log.post_data.length > 0 ? JSON.parse(log.post_data) : {};
      // передаём управление основной задаче
      await next();
      // по завершению, записываем лог
      saveLog({_id, log, start, body: log.url.indexOf('prm/doc.calc_order') != -1 && ctx.body});
    }
    catch (err) {
      // в случае ошибки, так же, записываем лог
      log.error = err.message;
      saveLog({_id, log, start});
      throw err;
    }
  }
  else{
    // для неавторизованных пользователей записываем лог
    log.error = 'unauthorized';
    saveLog({_id, log, start, body: ctx.body});
  }

};
