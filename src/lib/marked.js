'use strict'

const fs = require('fs')

const marked = require('marked')
const hljs = require('highlight.js')
const split = require('split2')
const through = require('through2')
const eos = require('end-of-stream')
const yaml = require('js-yaml')
const stringToStream = require('string-to-stream')
const replaceStream = require('replacestream')
const katex = require('katex')

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

  eos(ms, { readable: false }, (err) => {
    if (err) console.error(err)

    const attributes = yaml.safeLoad(frontMatter)
    const fm = attributes

    // Use front matter to dicate line length of summary
    if (summary) {
      if (!attributes.summaryLength) attributes.summaryLength = 5
      markdown = markdown.split('\n').slice(0, attributes.summaryLength).join('\n')
    }

    marked(markdown, (err, html) => {
      if (err) throw err

      const replaceWithKaTeX = (match, p1, p2, offset, string) => {
        match = match
          .replace(/^\$\$\s*/, '')
          .replace(/\s*\$\$$/, '')

        const html = katex.renderToString(match, { displayMode: true })

        return html
      }

      const replaceWithKaTeXInline = (match, p1, p2, offset, string) => {
        // Eject if we match ${, for example from ES6 template literals
        if (match.match(/\$\{/)) return match

        match = match
          .replace(/^\s*\$\s*/, '')
          .replace(/\s*\$$/, '')

        const html = '&nbsp;' + katex.renderToString(match)

        return html
      }

      if (fm.math) {
        let postBuffer = ''

        const ks = stringToStream(html)
          .pipe(replaceStream(/\$\$.+\$\$/g, replaceWithKaTeX))
          .pipe(replaceStream(/([^\\]\$)([^$]+)\$/g, replaceWithKaTeXInline))
          .pipe(replaceStream(/\\\$/g, '$'))
          .pipe(through(function (chunk, enc, next) {
            postBuffer += chunk.toString()
            next()
          }))

        eos(ks, { readable: false }, (err) => {
          if (err) console.error(err)

          resolve({
            fm: attributes,
            body: postBuffer
          })
        })
      } else {
        console.log('Skipping math')
        resolve({
          fm,
          body: html
        })
      }
    })
  })
})
