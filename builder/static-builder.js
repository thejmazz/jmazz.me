'use strict'

const path = require('path')
const http = require('http')
const fs = require('fs-promise')

const Promise = require('bluebird')
const globby = require('globby')
const yaml = require('js-yaml')
const eos = Promise.promisify(require('end-of-stream'))

const { postsDir } = require('../src/config.js')
const buildDir = path.resolve(__dirname, '../build')
const baseURL = 'http://localhost:3001'
const sitemapLoc = path.resolve(__dirname, './sitemap.yml')

const getPosts = () => globby([path.resolve(postsDir, '**/*.md')])

const getMappings = () => getPosts()
  .then((posts) => posts.map(post => ({
    req: post.replace(postsDir, '/blog').replace(/\.md$/, ''),
    dest: post.replace(postsDir, '/blog').replace(/\.md$/, '/index.html')
  })))

const download = ({ req, dest }) => {
  const dir = buildDir + path.dirname(dest)
  req = baseURL + req
  dest = buildDir + dest

  return fs.mkdirp(dir)
    .then(() => {
      const ws = fs.createWriteStream(dest)
      http.get(req, res => res.pipe(ws))

      ws.on('finish', () => console.log(`Downloaded ${req} to ${dest}`))

      return eos(ws)
    })
}

const parseYaml = (str) => new Promise((resolve, reject) => {
  try {
    resolve(yaml.safeLoad(str))
  } catch (err) {
    reject(err)
  }
})

const dumpYaml = (obj) => new Promise((resolve, reject) => {
  try {
    resolve(yaml.safeDump(obj))
  } catch (err) {
    reject(err)
  }
})

const getSitemap = () =>
  fs.readFile(sitemapLoc, 'utf8')
    .then(str => parseYaml(str))
    .catch(err => console.error(err))

const updateSitemap = getMappings()
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

const getAllPages = () =>
  getSitemap()
  .then(sitemap => [].concat(sitemap.pages).concat(sitemap.posts))
  .then(pages => pages.map(page => ({
    req: page.split(':')[0],
    dest: page.split(':')[1]
  })))

getAllPages()
  .then(pages => Promise.all(pages.map(page => download(page))))
  .then(() => console.log('All pages downloaded'))
  .catch(err => console.error(err))
