'use strict'

const fs = require('fs')

const marked = require('marked')
const hljs = require('highlight.js')
const split = require('split2')
const through = require('through2')
const eos = require('end-of-stream')
const yaml = require('js-yaml')

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

module.exports = ({ file, summary = false }) => new Promise((resolve, reject) => {
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
