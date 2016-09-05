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

export default (context) => new Promise((resolve, reject) => {
  // do some async data fetching
  // use "context" passed from renderer as params (e.g. url)
  // resolve to app's root Vue instance

  console.log('context')
  console.log(context)

  if (context.post) {
    const md = fs.readFile(context.filepath, { encoding: 'utf-8' }, (err, data) => {
      if (err) throw err

        marked(data, (err, content) => {
          if (err) throw err

            Post.data = () => ({
              postContent: content
            })

            const app = new Vue(Post)

            resolve(app)
        })
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
