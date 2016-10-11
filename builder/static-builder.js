'use strict'

const Promise = require('bluebird')

const sitemap = require('./sitemap.js')
const { download, stringify } = require('./utils.js')

const build = () =>
  sitemap.update()
  .then(() => sitemap.allPages({ format: true }))
  .then(pages => Promise.map(pages, page => download(page)))
  .then(() => console.log('All pages downloaded'))
  .catch(err => console.error(err))

build()
