
module.exports = async (ctx, next) => {

  // если указано ограничение по ip - проверяем
  const {restrict_ips} = ctx.app;
  if(restrict_ips.length && restrict_ips.indexOf(ctx.ip) == -1){
    ctx.status = 500;
    ctx.body = 'ip restricted:' + ctx.ip;
    return;
  }

  return true;

};
