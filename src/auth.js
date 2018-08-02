
import request from 'request';

export default async (ctx, $p) => {

  // если указано ограничение по ip - проверяем
  const {restrict_ips} = ctx.app;
  const ip = ctx.req.headers['x-real-ip'] || ctx.ip;
  if(restrict_ips.length && restrict_ips.indexOf(ip) == -1){
    ctx.status = 403;
    ctx.body = 'ip restricted:' + ip;
    return;
  }

  // проверяем авторизацию
  let {authorization, suffix} = ctx.req.headers;
  if(!authorization || !suffix){
    ctx.status = 403;
    ctx.body = 'access denied';
    return;
  }

  const {couch_local, zone} = $p.job_prm;
  const _auth = {'username':''};
  const resp = await new Promise((resolve, reject) => {

    try{
      // получаем строку из заголовка авторизации
      const auth = new Buffer(authorization.substr(6), 'base64').toString();
      const sep = auth.indexOf(':');
      _auth.pass = auth.substr(sep + 1);
      _auth.username = auth.substr(0, sep);

      while (suffix.length < 4){
        suffix = '0' + suffix;
      }

      _auth.suffix = suffix;

      request({
        url: couch_local + zone + '_doc_' + suffix,
        auth: {'user':_auth.username, 'pass':_auth.pass, sendImmediately: true}
      }, (e, r, body) => {
        if(r && r.statusCode < 201){
          $p.wsql.set_user_param('user_name', _auth.username);
          resolve(true);
        }
        else{
          ctx.status = (r && r.statusCode) || 500;
          ctx.body = body || (e && e.message);
          resolve(false);
        }
      });
    }
    catch(e){
      ctx.status = 500;
      ctx.body = e.message;
      resolve(false);
    }
  });

  return resp && Object.assign(_auth, {user: $p.cat.users.by_id(_auth.username)});

};
