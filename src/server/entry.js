'use strict'

import fs from 'fs'
import path from 'path'

import Vue from 'vue'
import marked from 'marked'
import hljs from 'highlight.js'

import Root from '../root.vue'

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

  const md = fs.readFile(context.filepath, { encoding: 'utf-8' }, (err, data) => {
    if (err) throw err

    marked(data, (err, content) => {
      if (err) throw err

      Root.data = () => ({
        postContent: content
      })

      const app = new Vue(Root)
      
      resolve(app)
    })
  })
})
