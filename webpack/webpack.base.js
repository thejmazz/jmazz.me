'use strict'

const path = require('path')

module.exports = {
  devtool: '#source-map',
  module: {
    loaders: [{
      test: /\.vue$/,
      loader:  'vue'
    }, {
      test: /\.js$/,
      include: [path.resolve(__dirname, './src')],
      loader: 'babel'
    }]
  }
}
