'use strict'

const path = require('path')
const fs = require('fs')
const Promise = require('bluebird')

const express = require('express')

const {
  postsDir,
  bundleLoc
} = require('../config.js')
const marked = require('../lib/marked.js')

// Generate bundleRender from webpack bundle code
const code = fs.readFileSync(bundleLoc)
const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)

const template = fs.readFileSync(path.resolve(__dirname, './template.html'), 'utf-8')
const i = template.indexOf('{{ APP }}')
const head = template.slice(0, i)
const tail = template.slice(i + '{{ APP }}'.length)

const app = express()
app.use(express.static(path.resolve(__dirname, '../../dist')))

const posts = fs.readdirSync(postsDir)

const postToStream = (context, outStream) => {
  const renderStream = bundleRenderer.renderToStream(context)

  outStream.write(head.replace('{{ STYLE }}', `
      <style>
        ${fs.readFileSync(path.resolve(__dirname, '../css/global.css'))}
      </style>
      <link rel="stylesheet" href="/styles.css">`)
  )

  const posts = [{
    "title": "hello-world",
    "attributes": {
      "date": "2016-09-04T00:00:00.000Z",
      "title": "Hello World",
      "tags": null,
      "summaryLength": 5
    },
    "summary": "<p>Hello world (<em>finally</em>). This blog is rendered using Vue 2.</p>\n"
  }, {
    "title": "NGS-Workflows",
    "attributes": {
      "date": "2016-06-08T16:27:27.000Z",
      "title": "NGS Workflows",
      "summaryLength": 18,
      "tags": null
    },
    "summary": "<p><em>Next generation sequencing</em>. We all know that a fundamental practice in bioinformatics is the analysis of biological sequences. Similarities, functions, structures, associations, transcripts, proteins, RNA interference, regulation, interaction, DNA binding, the list goes on. Much can be hypothesized given some ATCGs (and some annotations).</p>\n<p>However, its <strong>not plug and play</strong>.  Various tools and algorithms exists for each step in NGS data pipelines. Each with their own advantages and disadvantages for a given set of data (e.g. bacterial vs. eukaryotic genomes). Their underlying algorithms can make assumptions which may not be true in all cases. New tools and methods are being developed and there are <strong>rarely adopted standards</strong>. Researchers today regularly construct hardcoded and unmaintanable scripts. I am not calling out these individuals on their coding practice, but rather positing that scripts without community maintained modular dependencies, with dependence on a specific environment configuration - let alone hardcoded absolute file references, are by their nature <strong>unfit for providing reproducible NGS workflows to the community at large</strong>. But hey, it <a href=\"https://github.com/nikku/works-on-my-machine\"><img src=\"https://cdn.rawgit.com/nikku/works-on-my-machine/v0.2.0/badge.svg\" alt=\"works badge\"></a> right?</p>\n<p>A well written <strong>bash script</strong> <em>can</em> be version controlled, and dependencies <em>can</em> be described, however the consumer <em>may</em> not be able to achieve an identical environment. At the very least, it will be a painful setup process.  Similarly, a <strong>python script</strong> is definitely more elegant and modular, but still suffers from issues such as pipeline reentrancy. One popular old tool is <strong>make</strong>, which can improve reentrancy by defining <em>rules</em> which have a <em>target</em> (output) and <em>input</em>s. However, the syntax is not newcomer friendly and file pattern matching can be confusing or limited.</p>\n<p>Not all hope is lost. There are have been many great efforts approaching this issue. One is <strong>snakemake</strong> which defines an elegant python-esque makefile with filename wildcarding, support for inline Python and R, and more. Another is <strong>nextflow</strong>, which goes a step further and describes pipelines through isolated (and containerizable) <em>process</em> blocks which communicate through channels. As well there are extras like galaxy, luigi, and bcbio.</p>\n<p>In this blog post, I will define a simple variant calling pipeline. Then walk through the implementation of this pipeline using these four technologies:</p>\n<ol>\n<li>bash</li>\n<li>make</li>\n<li>snakemake</li>\n<li>nextflow</li>\n</ol>\n<p>Then discuss other alternatives in brief. Finally I will propose where Bionode and JavaScript can fit into this ecosystem, and which specific issues can be addressed.</p>\n"
  }]

  outStream.write(`
    <script>window.__posts=${JSON.stringify(posts)}</script>
  `)

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

app.get('/api/allposts', (req, res) => {
  fs.readdir(postsDir, (err, files) => {
    Promise.map(files, (file) => new Promise((resolve, reject) => {
      const fullPost = fs.readFileSync(postsDir + '/' + file, 'utf-8')
      const preview = fullPost.split('\n').slice(0, 22).join('\n')

      marked({ file: postsDir + '/' + file, summary: true }).then((content) => {
        resolve({
          title: file.replace(/\.md$/, ''),
          attributes: content.attributes,
          summary: content.body
        })
      })
    }))
    .then((posts) => {
      // sort from latest to oldest
      const dated = {}
      const newPosts = []
      posts.forEach((post, i) => {
        dated[Date.parse(post.attributes.date)] = i
      })
      Object.keys(dated).sort().reverse().forEach((key, i) => {
        newPosts[i] = posts[dated[key]]
      })

      return Promise.resolve(newPosts)
    })
    .then((posts) => {
      res.send(posts)
      // Home.data = () => ({
      //   posts
      // })

      // resolve(new Vue(Home))
    })
  })
})

app.listen(3001)
console.log('Listening on 3001')

