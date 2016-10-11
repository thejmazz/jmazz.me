'use strict'

const path = require('path')
const fs = require('fs-promise')
const globby = require('globby')

const { parseYaml, dumpYaml } = require('./utils.js')

const { sitemapLoc, postsDir } = require('./config.js')

// Mapping functions to convert filename or sitemap mapping to { req, dest }
// format for download
const postPathToReqDest = (path) => ({
  req: path.replace(postsDir, '/blog').replace(/\.md$/, ''),
  dest: path.replace(postsDir, '/blog').replace(/\.md$/, '/index.html')
})

const mappingToReqDest = (mapping) => ({
  req: mapping.split(':')[0],
  dest: mapping.split(':')[1]
})

const update = () =>
  globby([ path.resolve(postsDir, '**/*.md') ])
  .then(posts => posts.map(postPathToReqDest))
  .then(pages => pages.map(page => `${page.req}:${page.dest}`))
  .then(strs => Promise.all([
    Promise.resolve(strs),
    fs.readFile(sitemapLoc, 'utf8').then(str => parseYaml(str))
  ]))
  .then(function ([ strs, sitemap ]) {
    return dumpYaml(Object.assign({}, sitemap, { posts: strs }))
  })
  .then(yaml => fs.writeFile(sitemapLoc, yaml) )
  .catch(err => console.error(err))

const get = () =>
  fs.readFile(sitemapLoc, 'utf8')
  .then(str => parseYaml(str))
  .catch(err => console.error(err))

const allPages = () =>
  get()
  .then(sitemap => [].concat(sitemap.pages).concat(sitemap.posts))
  .then(pages => pages.map(mappingToReqDest))

module.exports = {
  get,
  update,
  allPages
}
