'use strict'

const path = require('path')

module.exports = {
  sitemapLoc: path.resolve(__dirname, './sitemap.yml'),
  postsDir: require('../src/config.js').postsDir,
  buildDir: path.resolve(__dirname, '../build'),
  baseURL: 'http://localhost:3001'
}
