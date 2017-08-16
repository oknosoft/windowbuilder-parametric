
const request = require('request');

module.exports = async (ctx, $p) => {

  // если указано ограничение по ip - проверяем
  const {restrict_ips} = ctx.app;
  if(restrict_ips.length && restrict_ips.indexOf(ctx.ip) == -1){
    ctx.status = 403;
    ctx.body = 'ip restricted:' + ctx.ip;
    return;
  }

  let {authorization, suffix} = ctx.req.headers;
  if(!authorization || !suffix){
    ctx.status = 403;
    ctx.body = 'access denied';
    return;
  }

  const {couch_local, zone} = $p.job_prm;
  let user;
  const resp = await new Promise((resolve, reject) => {

    const auth = new Buffer(authorization.substr(6), 'base64').toString();
    const sep = auth.indexOf(':');
    const pass = auth.substr(sep + 1);
    user = auth.substr(0, sep);

    while (suffix.length < 4){
      suffix = '0' + suffix;
    }

    request({
      url: couch_local + zone + '_doc_' + suffix,
      auth: {user, pass, sendImmediately: true
      }
    }, (e, r, body) => {
      if(r && r.statusCode < 201){
        $p.wsql.set_user_param("user_name", user);
        resolve(true);
      }
      else{
        ctx.status = (r && r.statusCode) || 500;
        ctx.body = body || (e && e.message);
        resolve(false);
      }
    });
  });

  return {user: $p.cat.users.by_id(user) , suffix, resp};

};
