'use strict'

const path = require('path')
const fs = require('fs')

const code = fs.readFileSync(path.resolve(__dirname, '../../dist/bundle-node.js'), 'utf-8')

const bundleRenderer = require('vue-server-renderer').createBundleRenderer(code)

const rs = bundleRenderer.renderToStream({})

rs.on('error', (err) => console.log('ERROR: ', err))
rs.on('data', (chunk) => console.log('chunk: ' + chunk))
rs.on('end', () => console.log('END emitted'))
