'use strict'

const Vue = require('vue')
const renderer = require('vue-server-renderer').createRenderer()

const vm = new Vue({
  render: (h) => h('div', 'hello')
})

// renderer.renderToString(vm, (err, html) => {
//   console.log(html)
// })

const stream = renderer.renderToStream(vm)
stream.on('data', chunk => console.log('chunk: ' + chunk))
stream.on('end', () => console.log('END emitted'))
