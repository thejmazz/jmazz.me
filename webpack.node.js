'use strict'

const base = require('./webpack.base.js')

module.exports = Object.assign({}, base, {
  output: {
    path: 'dist',
    filename: 'bundle-node.js',
    libraryTarget: 'commonjs2'
  },
  externals: Object.keys(require('./package.json').dependencies),
  target: 'node'
})
