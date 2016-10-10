'use strict'

const path = require('path')
const http = require('http')
const fs = require('fs-promise')

const Promise = require('bluebird')
const globby = require('globby')
const eos = Promise.promisify(require('end-of-stream'))

const { postsDir } = require('../src/config.js')
const buildDir = path.resolve(__dirname, '../build')
const baseURL = 'http://localhost:3001'

const getPosts = () => globby([path.resolve(postsDir, '**/*.md')])

const getMappings = () => getPosts()
  .then(posts => posts.reduce((sum, curr) => Object.assign({}, sum, {
    [curr]: {
      req: curr.replace(postsDir, '/blog').replace(/\.md$/, ''),
      file: curr.replace(postsDir, '/blog').replace(/\.md$/, '/index.html')
    }
  }), {}))

getMappings()
  .then(pages => Promise.all(Object.keys(pages).map(key => download(pages[key]))))
  .then(() => console.log('All pages downloaded'))
  .catch(err => console.error(err))

const download = ({ req, file }) => {
  const dir = buildDir + path.dirname(file)
  req = baseURL + req
  file = buildDir + file

  return fs.mkdirp(dir)
    .then(() => {
      const ws = fs.createWriteStream(file)
      http.get(req, res => res.pipe(ws))

      ws.on('finish', () => console.log(`Downloaded ${req} to ${file}`))

      return eos(ws)
    })
}

