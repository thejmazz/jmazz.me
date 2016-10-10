'use strict'

const fs = require('fs')

const Promise = require('bluebird')
const marked = require('marked')
const hljs = require('highlight.js')
const split = require('split2')
const through = require('through2')
const eos = Promise.promisify(require('end-of-stream'))
const yaml = require('js-yaml')
const parseKatex = require('parse-katex')

const mdRenderer = new marked.Renderer()
mdRenderer.code = (code, lang) => {
  if (lang) {
    code = hljs.highlight(lang, code).value
  }

  return `<pre><code class="hljs lang-${lang}">${code}</code></pre>`
}
mdRenderer.paragraph = (text) => {
  return '<p>' + parseKatex.render(text) + '</p>\n'
}
mdRenderer.listitem = (text) => `<li>${parseKatex.render(text)}</li>\n`
mdRenderer.image = function(href, title, text) {
  const id = Math.floor(Math.random() * 10000)

  const out = `
  <figure id="img-wrapper-${id}" class="img-wrapper">
    <img id="img-${id}" class="post-image" src="${href}" alt="${text}" @click="imageClick" ${title ? `title="${title}"` : ''}>
    ${title ? `<figcaption id="img-caption-${id}">${title}</figcaption>`: ''}
  </figure>
  `.trim()

  return out
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
    .on('error', (err) => console.log('stream error: ', err))
    .pipe(split())
    .pipe(through(function (chunk, enc, next) {
      const line = chunk.toString()
      if (line === '---' && !seenDashes) {
        seenDashes = true
        return next()
      } else if (line === '---' && seenDashes) {
        if (parsingFM) {
          parsingFM = false
          return next()
        }
      }

      if (parsingFM) {
        frontMatter += line + '\n'
      } else {
        markdown += line + '\n'
      }

      next()
     }
    ))

  eos(ms, { readable: false })
    .then(() => {
      const fm = yaml.safeLoad(frontMatter)

      // Use front matter to dicate line length of summary
      if (summary) {
        if (!fm.summaryLength) fm.summaryLength = 5
        markdown = markdown.split('\n').slice(0, fm.summaryLength).join('\n')
      }

      marked(markdown, (err, html) => {
        if (err) throw err

        resolve({
          fm,
          body: html
        })
      })
    })
    .catch(err => {
      console.log('marked error: ', err)
    })
})
