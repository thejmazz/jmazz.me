'use strict'

const path = require('path')
const fs = require('fs')

const express = require('express')

const {
  postsDir,
  bundleLoc
} = require('./config.js')
const { getPost, getAllPosts } = require('./lib/posts.js')

// Generate bundleRender from webpack bundle code
const code = fs.readFileSync(bundleLoc)
const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)

const template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf-8')
const i = template.indexOf('{{ APP }}')
const head = template.slice(0, i)
const tail = template.slice(i + '{{ APP }}'.length)

const app = express()
app.use(express.static(path.resolve(__dirname, '../dist')))
app.use('/static', express.static(path.resolve(__dirname, '../static')))

const initialState = {
  posts: []
}

const posts = fs.readdirSync(postsDir)

const renderToStream = (context, outStream) => {
  const renderStream = bundleRenderer.renderToStream(context)

  let firstChunk = true
  outStream.write(head.replace('{{ STYLE }}', '<link rel="stylesheet" href="/styles.css">'))

  renderStream.on('data', (chunk) => {
    if (firstChunk && context.initialState) {
      // console.log('state in context: ', context.initialState)
      outStream.write(`
<!-- START: Server initialized state -->
<script>
window.__INITIAL_STATE__=${JSON.stringify(context.initialState)}
</script>
<!-- END: Server initialized state -->

`)
      firstChunk = false
    }
    outStream.write(chunk)
  })

  renderStream.on('error', (err) => console.log('ERROR: ', err))

  renderStream.on('end', () => outStream.end(tail))

  return outStream
}

app.get('/api/allposts', (req, res) => {
  getAllPosts().then(posts => res.send(posts))
})
app.get('/api/post/:post', (req, res) => {
  getPost({ file: path.resolve(postsDir, req.params.post + '.md') })
    .then(post => res.send(Object.assign(post, {
      slug: req.params.post
    })))
})

app.get('*', (req, res) => {
  res.set('Content-Type', 'text/html')

  const context = { url: req.url }
  renderToStream(context, res)
})

app.listen(3001)
console.log('Listening on 3001')

