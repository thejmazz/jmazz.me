'use strict'

const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/app.js',
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
      css: ExtractTextPlugin.extract('css')
    }
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new ExtractTextPlugin('styles.css')
  ]
}
