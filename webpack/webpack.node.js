'use strict'

const path = require('path')

const base = require('./webpack.base.js')
const pkg = require(path.resolve(__dirname, '../package.json'))

module.exports = Object.assign({}, base, {
  output: {
    path: 'dist',
    filename: 'bundle-node.js',
    libraryTarget: 'commonjs2'
  },
  externals: Object.keys(pkg.dependencies),
  target: 'node'
})
