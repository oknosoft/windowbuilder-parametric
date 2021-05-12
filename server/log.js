
module.exports = function prm_log($p, log) {

  const {utils} = $p;
  const sessions = {};

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
      })
      .catch(() => null);
  }

  return async (req, res, next) => {

    // request
    const {moment} = $p.utils;
    const start = moment();
    const suffix = req.user.branch.suffix || '0000';
    const _id = `_local/log.${suffix}.${start.format('YYYYMMDD')}`;
    const {remotePort, remoteAddress} = res.socket;

    // собираем объект лога
    const log_data = {
      start: start.format('HH:mm:ss'),
      url: req.url,
      method: req.method,
      ip: `${req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || remoteAddress}`,
      headers: Object.keys(req.headers).map((key) => [key, req.headers[key]]),
    };

    try {

      // проверяем и устанавливаем сессию
      if(sessions.hasOwnProperty(suffix) && Date.now() - sessions[suffix] < 6000) {
        await saveLog({_id, log: log_data, start, body: req.body});
        utils.end.end500({res, err: {status: 403, message: 'flood: concurrent requests'}, log});
      }
      else {
        sessions[suffix] = Date.now();

        // тело запроса анализируем только для авторизованных пользователей
        log_data.post_data = req.body;

        // передаём управление основной задаче
        await next(req, res);

        // по завершению, записываем лог
        await saveLog({_id, log: log_data, start, body: log_data.url.indexOf('prm/doc.calc_order') != -1 && req.body});

        // сбрасываем сессию
        sessions[suffix] = 0;
      }

    }
    catch (err) {
      // в случае ошибки записываем лог
      log_data.error = err.message;
      await saveLog({_id, log: log_data, start});
      throw err;
    }

  };
}

