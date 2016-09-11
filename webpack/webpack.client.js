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
  output: {
    path: 'dist',
    filename: 'bundle-client.js'
  },
  vue: {
    loaders: {
      sass: ExtractTextPlugin.extract({
        loader: 'css!sass',
        fallbackLoader: 'vue-style'
      })
    }
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, '../src/scss')]
  },
  plugins: [
    new ExtractTextPlugin('styles.css')
  ]
})
