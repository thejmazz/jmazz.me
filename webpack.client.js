'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/server/entry.js',
  node: {
    fs: 'empty'
  },
  output: {
    path: 'dist',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.vue$/,
      loader:  'vue'
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: [path.resolve(__dirname, './src')]
    }]
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
}
