'use strict'

import fs from 'fs'

import marked from 'marked'
import hljs from 'highlight.js'
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

export const markedAsync = (str) => new Promise((resolve, reject) => {
  marked(str, (err, html) => {
    if (err) return reject(err)

    resolve(html)
  })
})

export default ({ file, summary = false }) => new Promise((resolve, reject) => {
  let frontMatter = ''
  let markdown = ''

  let parsingFM = true
  let seenDashes = false

  console.log('file: ', file)
  const ms = fs.createReadStream(file)
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
    if (err) console.error(err)

    const attributes = yaml.safeLoad(frontMatter)

    if (summary) {
      if (!attributes.summaryLength) attributes.summaryLength = 5
      markdown = markdown.split('\n').slice(0, attributes.summaryLength).join('\n')
    }

    marked(markdown, (err, html) => {
      if (err) throw err

      resolve({
        attributes,
        body: html
      })
    })
  })
})
