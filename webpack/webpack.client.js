'use strict'

const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const base = require('./webpack.base.js')

module.exports = Object.assign({}, base, {
  entry: [
    path.resolve(__dirname, '../src/entries/client-entry.js')
  ],
  node: {
    fs: 'empty'
  },
  output: Object.assign({}, base.output, {
    filename: 'bundle-client.js'
  }),
  module: {
    loaders: base.module.loaders.concat([{
      test: /\.(eot|svg|ttf|woff|woff2)$/,
      loader: 'file'
    }])
  },
  // vue: {
  //   loaders: {
  //     sass: ExtractTextPlugin.extract({
  //       loader: 'css!sass',
  //       fallbackLoader: 'vue-style'
  //     })
  //   }
  // },
  sassLoader: {
    includePaths: [path.resolve(__dirname, '../src/scss')]
  },
  plugins: [
    // new ExtractTextPlugin('styles.css')
  ]
})
