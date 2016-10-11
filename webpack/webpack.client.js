'use strict'

const isProd = process.env.NODE_ENV === 'production'
const isPrerender = process.env.NODE_ENV === 'prerender'

const path = require('path')

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const base = require('./webpack.base.js')

const config = Object.assign({}, base, {
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
      loader: 'url'
    }])
  },
  sassLoader: {
    includePaths: [path.resolve(__dirname, '../src/scss')]
  }
})

if (isProd || isPrerender) {
  config.vue = {
    loaders: {
      sass: ExtractTextPlugin.extract({
        loader: 'css!sass',
        fallbackLoader: 'vue-style'
      })
    }
  }
  config.plugins = [
    new ExtractTextPlugin('styles.css')
  ]
}

module.exports = config
