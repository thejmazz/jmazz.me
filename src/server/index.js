'use strict'

const path = require('path')
const fs = require('fs')

const config = require('../config.js')
console.log('config.postsDir': config.postsDir)

const posts = fs.readdirSync(path.resolve(__dirname, '../../_posts'))

const code = fs.readFileSync(path.resolve(__dirname, '../../dist/bundle-node.js'), 'utf-8')

const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)

for (let post of posts) {
  const name = post.split('.md').join('')
  const filepath = path.resolve(__dirname, '../../_posts', post)

  const rs = bundleRenderer.renderToStream({
    post,
    filepath
  })

  const ws = fs.createWriteStream(name + '.html')
  ws.write(`
<doctype html>
<html>
  <head>
    <title>title</title>
    <style>
    /*

Orginal Style from ethanschoonover.com/solarized (c) Jeremy Hull <sourdrums@gmail.com>

*/

.hljs {
display: block;
overflow-x: auto;
padding: 0.5em;
background: #fdf6e3;
color: #657b83;
}

.hljs-comment,
.hljs-quote {
color: #93a1a1;
}

/* Solarized Green */
.hljs-keyword,
.hljs-selector-tag,
.hljs-addition {
color: #859900;
}

/* Solarized Cyan */
.hljs-number,
.hljs-string,
.hljs-meta .hljs-meta-string,
.hljs-literal,
.hljs-doctag,
.hljs-regexp {
color: #2aa198;
}

/* Solarized Blue */
.hljs-title,
.hljs-section,
.hljs-name,
.hljs-selector-id,
.hljs-selector-class {
color: #268bd2;
}

/* Solarized Yellow */
.hljs-attribute,
.hljs-attr,
.hljs-variable,
.hljs-template-variable,
.hljs-class .hljs-title,
.hljs-type {
color: #b58900;
}

/* Solarized Orange */
.hljs-symbol,
.hljs-bullet,
.hljs-subst,
.hljs-meta,
.hljs-meta .hljs-keyword,
.hljs-selector-attr,
.hljs-selector-pseudo,
.hljs-link {
color: #cb4b16;
}

/* Solarized Red */
.hljs-built_in,
.hljs-deletion {
color: #dc322f;
}

.hljs-formula {
background: #eee8d5;
}

.hljs-emphasis {
font-style: italic;
}

.hljs-strong {
font-weight: bold;
}
    </style>
  </head>
  <body>
`)

  rs.on('error', (err) => console.log('ERROR: ', err))
  rs.on('data', chunk => ws.write(chunk))

  ws.on('finish', () => console.log(`Writing for ${name} finished`))

  rs.on('end', () => ws.end(`
    </body>
</html>
`))
}
