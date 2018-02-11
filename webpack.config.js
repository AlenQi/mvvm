var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');
var baseConfig = require('./build/webpack.base.conf');

module.exports = merge(baseConfig, {
  entry: {
    mvvm: './src/core/index.js',
  },
  output: {
    filename: 'mvvm.js',
    library: 'MVVM',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': '"production"'
    })
  ]
});

if (process.env.NODE_ENV === 'production') {
  module.exports = merge(module.exports, {
    output: {
      filename: 'mvvm.min.js'
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        },
        sourceMap: true
      })
    ]
  })
}
