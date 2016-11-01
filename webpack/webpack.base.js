'use strict'

const path = require('path')

const webpack = require('webpack')
const vueConfig = require('./vue-loader.config')

const { SSR_HOST, SSR_PORT } = require('../config.js')

const definePlugin = new webpack.DefinePlugin({
  SSR_HOST: JSON.stringify(SSR_HOST),
  SSR_PORT: JSON.stringify(SSR_PORT)
})

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
  plugins: [
    definePlugin
  ]
}
