var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var baseConfig = require('./webpack.base.conf.js');

module.exports = merge({
  entry: './example/main.js',
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, '../docs/'),
    publicPath: '/'
  },
  devtool: '#cheap-module-eval-source-map',
  plugins:[
    new webpack.DefinePlugin({
      'process.env': '"development"'
    }),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      title: '【教学】解析vue 中 mvvm 原理',      
      filename: 'index.html',
      template: path.join(__dirname, '../example/index.html'),
      inject: 'body'
    })
  ]
}, baseConfig);
