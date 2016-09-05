'use strict'

import fs from 'fs'
import path from 'path'

import Promise from 'bluebird'

import Vue from 'vue'
import marked from 'marked'
import hljs from 'highlight.js'

import Post from '../layouts/post.vue'
import Home from '../layouts/home.vue'

// === SET UP MARKED ===
import split from 'split2'
import through from 'through2'
import eos from 'end-of-stream'
import yaml from 'js-yaml'

const mdRenderer = new marked.Renderer()
mdRenderer.code = (code, lang) => {
  if (lang) {
    code = hljs.highlight(lang, code).value
  }

  return `<pre><code class="hljs lang-${lang}">${code}</code></pre>`
}

marked.setOptions({
  renderer: mdRenderer
})

const markdowned = (filePath) => new Promise((resolve, reject) => {
  let frontMatter = ''
  let markdown = ''

  let parsingFM = true
  let seenDashes = false

  const ms = fs.createReadStream(filePath)
    .pipe(split())
    .pipe(through(function (chunk, enc, next) {
      const line = chunk.toString()
      if (line === '---' && !seenDashes) {
        seenDashes = true
        return next()
      } else if (line === '---' && seenDashes) {
        parsingFM = false
        return next()
      }

      if (parsingFM) {
        frontMatter += line + '\n'
      } else {
        markdown += line + '\n'
      }

      next()
     }
    ))

  eos(ms, { readable: false }, (err) => {
    marked(markdown, (err, html) => {
      if (err) throw err

      resolve({
        attributes: yaml.safeLoad(frontMatter),
        body: html
      })
    })
  })
})

export default (context) => new Promise((resolve, reject) => {
  // do some async data fetching
  // use "context" passed from renderer as params (e.g. url)
  // resolve to app's root Vue instance

  console.log('context')
  console.log(context)

  if (context.post) {
    markdowned(context.filepath)
    .then((content) => {
      Post.data = () => ({
        postContent: content.body
      })

      resolve(new Vue(Post))
    })
  }

  if (context.type === 'home') {
    fs.readdir(context.postsDir, (err, files) => {
      Promise.map(files, (file) => new Promise((resolve, reject) => {
        const fullPost = fs.readFileSync(context.postsDir + '/' + file, 'utf-8')
        const preview = fullPost.split('\n').slice(0, 22).join('\n')

        marked(preview, (err, content) => {
          resolve({
            title: file.replace(/\.md$/, ''),
            summary: content
          })
        })
      })).then((posts) => {
        console.log('posts:', posts)

        Home.data = () => ({
          posts
        })

        resolve(new Vue(Home))
      })
    })
  }
})
