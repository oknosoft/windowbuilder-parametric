
// app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

module.exports = function reports($p, log, route = {}) {

  const rlog  = require('./log')($p, log);
  const rget  = require('./get')($p, log);
  const rpost = require('./post')($p, log);

  route.prm = function prmHandler(req, res) {
    return rlog(req, res, req.method === 'GET' ? rget : rpost);
  };

};

