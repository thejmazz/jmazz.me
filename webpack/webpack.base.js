'use strict'

const path = require('path')

module.exports = {
  entry: './src/server/entry.js',
  devtool: '#source-map',
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
