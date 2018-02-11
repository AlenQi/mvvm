var path = require('path');
var Webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.dev.conf.js');
var compiler = Webpack(webpackConfig);

var server = new WebpackDevServer(compiler, {
  contentBase: path.join(__dirname, '../example/'),
  compress: true,
  port: 9000,
  stats: {
    colors: true
  }
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Starting server on http://localhost:8080');
});
