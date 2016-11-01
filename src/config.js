'use strict'

const path = require('path')

const {
  output: {
    path: nodeBundlePath,
    filename: nodeBundleFilename
  }
} = require('../webpack/webpack.node.js')

module.exports = {
  postsDir: path.resolve(__dirname, '../_posts'),
  bundleLoc: path.resolve(nodeBundlePath, nodeBundleFilename),
  templateLoc: path.resolve(__dirname, './template.html')
}
