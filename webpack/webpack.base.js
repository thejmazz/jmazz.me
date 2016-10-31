'use strict'

const path = require('path')

const vueConfig = require('./vue-loader.config.js')

module.exports = {
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../dist'),
    publicPath: '/static'
  },
  module: {
    rules: [{
      test: /\.vue$/,
      loader:  'vue',
      options: vueConfig
    }, {
      test: /\.js$/,
      include: [path.resolve(__dirname, './src')],
      loader: 'babel'
    }]
  },
  plugins: []
}
