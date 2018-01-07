const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const package_data = require('../package.json');
const RELEASE = true;

function getPlugins() {
  var pluginsBase = [
    new webpack.DefinePlugin({'process.env.NODE_ENV': '"production"', 'global': 'window'})
  ];

  // if (RELEASE) {
  //   pluginsBase.push(new webpack.optimize.AggressiveMergingPlugin());
  //   pluginsBase.push(new webpack.optimize.UglifyJsPlugin({
  //     include: /\.min\.js$/,
  //     compress: { warnings: false }
  //   }));
  // }
  return pluginsBase;
}

function getExternals() {
  const externals = {
    'debug': true,
    'moment': true,
    'moment/locale/ru': true,
    'alasql/dist/alasql.min': true,
    'clipboard/lib/clipboard-action': true,
    'metadata-redux': true,
  };
  for (const key in package_data.dependencies) {
    if(!externals[key]) {
      externals[key] = true;
    }
  }
  return externals;
}

const config = {
  entry: {
    'index': ['./src'],
  },
  output: {
    path: path.resolve('.'),
    filename: '[name].js',
    libraryTarget: 'commonjs2'
  },
  externals: [nodeExternals(), getExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['node8'],
            plugins: ['transform-class-properties', 'syntax-object-rest-spread'],
          }
        }
      }
    ]
  },
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    setImmediate: false
  },
  devtool: 'cheap-source-map',
  plugins: getPlugins(),
};


module.exports = config;

