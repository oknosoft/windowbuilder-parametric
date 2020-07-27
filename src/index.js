
// app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

module.exports = function reports($p, log) {

  const rget  = require('./get')($p, log);
  const rpost = require('./post')($p, log);
  const rlog  = require('./log')($p, log);

  return async function reportsHandler(req, res) {
    const {query, path, paths} = req.parsed;

    if (req.method === 'POST') {
      return rpost(req, res);
    }

  }
}

