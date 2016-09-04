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

const app = express()

const posts = fs.readdirSync(postsDir)

const postToStream = (post, outStream) => {
  const filepath = path.resolve(__dirname, '../../_posts', post)

  const renderStream = bundleRenderer.renderToStream({
    post,
    filepath
  })

  outStream.write(`
<doctype html>
<html>
  <head>
    <title>title</title>
    <style>
    ${fs.readFileSync(path.resolve(__dirname, '../hljs-theme.css'))}
    </style>
  </head>
  <body>
`)

  renderStream.on('error', (err) => console.log('ERROR: ', err))
  renderStream.on('data', chunk => outStream.write(chunk))

  renderStream.on('end', () => outStream.end(`
    </body>
</html>
`))

  return outStream
}

app.get('/blog', (req, res) => {
  res.set('Content-Type', 'text/html')
  res.write(`
<html>
<head><title>foo</title></head>
<body>
`)

  const renderStream = bundleRenderer.renderToStream({
    type: 'home',
    postsDir
  })

  renderStream.on('error', (err) => console.log('ERROR: ', err))
  renderStream.on('data', chunk => res.write(chunk))

  renderStream.on('end', () => res.end(`
    </body>
</html>
`))
})

app.get('/blog/:post', (req, res) => {
  res.set('Content-Type', 'text/html')
  postToStream(req.params.post + '.md', res)
})

app.listen(3001)
console.log('Listening on 3001')

