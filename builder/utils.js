'use strict'

const path = require('path')
const http = require('http')
const fs = require('fs-promise')

const Promise = require('bluebird')
const eos = Promise.promisify(require('end-of-stream'))
const yaml = require('js-yaml')

const { baseURL, buildDir } = require('./config.js')

exports.parseYaml = (str) => new Promise((resolve, reject) => {
  try {
    resolve(yaml.safeLoad(str))
  } catch (err) {
    reject(err)
  }
})

exports.dumpYaml = (obj) => new Promise((resolve, reject) => {
  try {
    resolve(yaml.safeDump(obj))
  } catch (err) {
    reject(err)
  }
})

exports.download = ({ req, dest }) => {
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

