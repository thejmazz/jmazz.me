'use strict'

const path = require('path')
const fs = require('fs')

const {
  postsDir,
  bundleLoc
} = require('../config.js')

// Generate bundleRender from webpack bundle code
const code = fs.readFileSync(bundleLoc)
const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)


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

for (let post of posts) {
  const postName = post.split('.md').join('')

  postToStream(post,
    fs.createWriteStream(postName + '.html')
      .on('finish', () => console.log(`Writing for /${postName}/ finished`))
  )
}

