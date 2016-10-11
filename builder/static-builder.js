'use strict'

process.env.NODE_ENV = 'prerender'
process.env.PRERENDER = true

// === Page downloader ===

const Promise = require('bluebird')

const sitemap = require('./sitemap.js')
const { download, stringify } = require('./utils.js')

const build = () =>
  sitemap.update()
  .then(() => sitemap.allPages({ format: true }))
  .then(pages => Promise.map(pages, page => download(page)))
  .then(() => console.log('All pages downloaded'))
  .catch(err => console.error(err))

// === Webpack ===

const path = require('path')

const webpack = require('webpack')

const { buildDir } = require('./config.js')

const clientConfig = require('../webpack/webpack.client.js')
const staticDest = path.resolve(buildDir, 'static')
clientConfig.output.path = staticDest

const doWebpack = () => new Promise((resolve, reject) => {
  webpack(clientConfig, (err, stats) => {
    if (err) {
      reject(err)
    } else {
      // console.log(stats.toJson())
      console.log('Webpack finished')
      resolve()
    }
  })
})

// === Copy static files in ===

const fs = require('fs-promise')
const staticSource = path.resolve(__dirname, '../static')

const copyStatics = () => fs.copy(staticSource, staticDest)

// === All together now ===

Promise.all([
  build(),
  doWebpack(),
  copyStatics()
]).then(() => console.log('Static site built'))
  .catch(err => console.error(err))


