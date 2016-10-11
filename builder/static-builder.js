'use strict'

const sitemap = require('./sitemap.js')
const { download } = require('./utils.js')

const build = () =>
  sitemap.update()
  .then(() => sitemap.allPages())
  .then(pages => Promise.all(pages.map(page => download(page))))
  .then(() => console.log('All pages downloaded'))
  .catch(err => console.error(err))

build()
