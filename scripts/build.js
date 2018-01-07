'use strict';

const fs = require('fs');
const webpack = require('webpack');
const path = require('path');
const package_data = require(path.resolve(__dirname, '../package.json'));

return webpack(require(path.resolve(__dirname, '../config/webpack.config.js')), (err, stats) => {
  if (err || stats.hasErrors()) {
    // Handle errors here
  }
  // Done processing
});

