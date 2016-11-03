'use strict'

// TODO how else to manage prod vs dev
process.env.VUE_ENV = 'server'
const isProd = process.env.NODE_ENV === 'production'
if (isProd) console.log('Running in production mode')
const { SSR_HOST, SSR_PORT } = require('../config.js')

const path = require('path')
const fs = require('fs')

const express = require('express')
const cors = require('cors')

// Used: API requests and bundleRenderer
const { postsDir, bundleLoc, templateLoc } = require('./config.js')
// TODO organize markdown post API better
const { getPost, getAllPosts } = require('./lib/posts.js')

const { createBundleRenderer } = require('vue-server-renderer')

const html = (() => {
  const template = fs.readFileSync(templateLoc, 'utf8')
  const i = template.indexOf('{{ APP }}')

  const style = isProd ? '<link rel="stylesheet" href="/static/styles.css">' : ''

  const head = template.slice(0, i)
    .replace('{{ STYLE }}', style)
    .replace('{{ TITLE }}', 'jmazz.me')
  const tail = template.slice(i + '{{ APP }}'.length)

  return { head, tail }
})()

const app = express()
app.use(cors())

// TODO static hosting with caddy. actual perf of express.static? tying static
// hosting to app is easier to manage?
app.use('/static', express.static(path.resolve(__dirname, '../static')))
app.use('/slides', express.static(path.resolve(__dirname, '../_slides')))
app.use('/codevember', express.static(path.resolve(__dirname, '../_codevember')))
if (isProd) {
  app.use('/static', express.static(path.resolve(__dirname, '../dist')))
}

// Set up bundler for server and client, pass in app for hot reload, take client bundle updates
let renderer
if (isProd) {
  const code = fs.readFileSync(bundleLoc)
  renderer = createBundleRenderer(code)
} else {
  require('../webpack/bundler.js')(app, (bundle) => {
    console.log('Replacing bundle rendererer')
    renderer = createBundleRenderer(bundle)
  })
}

const initialState = {
  posts: []
}

const renderToStream = (context, outStream) => {
  const renderStream = renderer.renderToStream(context)

  let firstChunk = true
  outStream.write(html.head)

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

  renderStream.on('end', () => outStream.end(html.tail))

  return outStream
}

app.get('/api/allposts', (req, res) => {
  getAllPosts().then(posts => res.send(posts))
})
app.get('/api/post/:post', (req, res) => {
  getPost({ file: path.resolve(postsDir, req.params.post + '.md') })
    .then(post => {
      post = Object.assign(post, {
        slug: req.params.post
      })

      res.send(Object.assign(post, {
        slug: req.params.post,
      }))
    })
    .catch(err => {
      res.send({
        fm: {
          title: '404',
          date: new Date().toString()
        },
        body: `<p>The post "${req.params.post}" does not exist.</p>`,
        slug: req.params.post
      })
    })
})

// prefix source map requests with /static so webpack-dev-middleware serves it
app.get(/^((?!(static)).)*\.map$/, (req, res) => {
  // console.log('redirect to: ', '/static' + req.url)
  res.redirect('/static' + req.url)
})

// anything that does not begin with static gets send to vue renderer
app.get(/^((?!(static)).)*$/, (req, res) => {
  if (!renderer) res.end('Wait for renderer..')

  res.set('Content-Type', 'text/html')

  const context = { url: req.url }
  renderToStream(context, res)
})

const server = app.listen(SSR_PORT)

server.on('listening', () => console.log(`Listening on ${SSR_HOST}:${SSR_PORT}`))

