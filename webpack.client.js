'use strict'

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const base = require('./webpack.base.js')

module.exports = Object.assign({}, base, {
  node: {
    fs: 'empty'
  },
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  vue: {
    loaders: {
      sass: ExtractTextPlugin.extract({
        loader: 'css!sass',
        fallbackLoader: 'vue-style'
      })
    }
  },
  plugins: [
    // new HtmlWebpackPlugin(),
    new ExtractTextPlugin('styles.css')
  ]
})
