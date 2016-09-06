'use strict'

const path = require('path')
const fs = require('fs')

const express = require('express')

const {
  postsDir,
  bundleLoc
} = require('../config.js')

// Generate bundleRender from webpack bundle code
const code = fs.readFileSync(bundleLoc)
const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)

const template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf-8')
const i = template.indexOf('{{ APP }}')
const head = template.slice(0, i)
const tail = template.slice(i + '{{ APP }}'.length)

const app = express()

const posts = fs.readdirSync(postsDir)

const postToStream = (context, outStream) => {
  const renderStream = bundleRenderer.renderToStream(context)

  outStream.write(head.replace('{{ STYLE }}', `
      <style>
        ${fs.readFileSync(path.resolve(__dirname, '../css/hljs-theme.css'))}
        ${fs.readFileSync(path.resolve(__dirname, '../css/global.css'))}
        ${fs.readFileSync(path.resolve(__dirname, '../../dist/styles.css'))}
      </style>`))

  renderStream.on('error', (err) => console.log('ERROR: ', err))
  renderStream.on('data', chunk => outStream.write(chunk))

  renderStream.on('end', () => outStream.end(tail))

  return outStream
}

app.get('/blog', (req, res) => {
  res.set('Content-Type', 'text/html')
  postToStream({
    type: 'home',
    postsDir
  }, res)
})

app.get('/blog/:post', (req, res) => {
  res.set('Content-Type', 'text/html')
  postToStream({
    post: req.params.post + '.md',
    filepath: path.resolve(__dirname, '../../_posts', req.params.post + '.md')
  }, res)
})

app.listen(3001)
console.log('Listening on 3001')

