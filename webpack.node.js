'use strict'

const path = require('path')

module.exports = {
  entry: './src/server/entry.js',
  output: {
    path: 'dist',
    filename: 'bundle-node.js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  module: {
    loaders: [{
      test: /\.vue$/,
      loader:  'vue'
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: [path.resolve(__dirname, './src')]
    }]
  }
}
