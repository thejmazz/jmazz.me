'use strict'

const path = require('path')
const fs = require('fs-promise')

const globby = require('globby')
const _ = require('lodash')

const { parseYaml, dumpYaml } = require('./utils.js')

const { sitemapLoc, postsDir } = require('./config.js')

// Need to ensure download follows this format
const urlToHtml = (url) => ({
  url,
  html: url + '/index.html'
})

const parseSitemapEntry = (entry, key = 'ROOT', prefix = '') => {
  let pages = []

  if (_.isPlainObject(entry) || _.isArray(entry)) {
    for (let k in entry) {
      if (k === 'INDEX') {
        pages = pages.concat([ key ])
      } else {
        if (_.isPlainObject(entry)) {
          prefix = k.match(/^\/:/) ? key : k
        }

        pages = pages.concat(parseSitemapEntry(entry[k], k, prefix))
      }
    }
  } else if (_.isString(entry)) {
    pages = pages.concat([ prefix + entry ])
  }

  // console.log(`With key ${key} and prefix ${prefix} pages is: `, pages)
  return pages
}

const parseSitemap = (sitemap) => parseSitemapEntry(sitemap)

const update = () =>
  globby([ path.resolve(postsDir, '**/*.md') ])
  .then(posts => posts.map(filename => filename.replace(postsDir, '').replace(/\.md$/, '')))
  .then(posts => Promise.all([
    Promise.resolve(posts),
    fs.readFile(sitemapLoc, 'utf8').then(str => parseYaml(str))
  ]))
  .then(([ posts, sitemap ]) => dumpYaml(Object.assign({}, sitemap, {
    '/blog': Object.assign({}, sitemap['/blog'], {
      '/:post': posts
    })
  })))
  .then(yaml => fs.writeFile(sitemapLoc, yaml))
  .catch(err => console.error(err))

const get = () =>
  fs.readFile(sitemapLoc, 'utf8')
  .then(str => parseYaml(str))
  .catch(err => console.error(err))

const allPages = ({ format = false, formatter = urlToHtml } = {}) =>
  get()
  .then(sitemap => parseSitemap(sitemap))
  .then(urls => format ? Promise.resolve(urls.map(formatter)) : Promise.resolve(urls))

module.exports = {
  get,
  update,
  allPages
}
