'use strict'

const path = require('path')
const fs = require('fs')

const config = require('../config.js')
const { postsDir, bundleLoc } = config

const posts = fs.readdirSync(postsDir)
const code = fs.readFileSync(bundleLoc)

const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)

for (let post of posts) {
  const name = post.split('.md').join('')
  const filepath = path.resolve(__dirname, '../../_posts', post)

  const rs = bundleRenderer.renderToStream({
    post,
    filepath
  })

  const ws = fs.createWriteStream(name + '.html')
  ws.write(`
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

  rs.on('error', (err) => console.log('ERROR: ', err))
  rs.on('data', chunk => ws.write(chunk))

  ws.on('finish', () => console.log(`Writing for ${name} finished`))

  rs.on('end', () => ws.end(`
    </body>
</html>
`))
}
