'use strict'

const isProd = process.env.NODE_ENV === 'production'
const isPrerender = process.env.NODE_ENV === 'prerender'

const path = require('path')

const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const base = require('./webpack.base.js')
const vueConfig = require('./vue-loader.config')

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
  // sassLoader: {
  //   includePaths: [path.resolve(__dirname, '../src/scss')]
  // }
})

const sassPath = [ path.resolve(__dirname, '../src/scss') ]

if (isProd || isPrerender) {

  // Set sass loader to extract text
  vueConfig.loaders = {
    sass: ExtractTextPlugin.extract({
      loader: `css!sass?includePaths=${sassPath}`,
      fallbackLoader: 'vue-style'
    })
  }
  // and extract
  config.plugins = config.plugins.concat([
    new ExtractTextPlugin('styles.css')
  ])

  // Use file loader on prod
  config.module.rules = base.module.rules.concat([{
    test: /\.(eot|svg|ttf|woff|woff2)$/,
    loader: 'file?name=/fonts/[hash].[ext]'
  }])
} else {
  // Use url loader in dev (inline base64)
  config.module.rules = base.module.rules.concat([{
    test: /\.(eot|svg|ttf|woff|woff2)$/,
    loader: 'url'
  }])

  vueConfig.loaders = {
    sass: `vue-style!css!sass?includePaths=${sassPath}`
    // sass: {
    //   loader: `css!sass?includePaths=${sassPath}`,
    //   fallbackLoader: 'vue-style'
    // }
  }

  // config.plugins = config.plugins.concat(
  //   new webpack.LoaderOptionsPlugin({
  //     vue: vueConfig
  //   })
  // )
}

module.exports = config
