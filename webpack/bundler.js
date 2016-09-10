const webpack = require('webpack')

const nodeConfig = require('./webpack.node.js')
const clientConfig = require('./webpack.client.js')

const nodeCompiler = webpack(nodeConfig)
const clientCompiler = webpack(clientConfig)

console.log('Started client and node bundlers')

nodeCompiler.watch({}, (err, stats) => {
  if (err) console.error(err)

  console.log(stats.toString({
    chunks: false,
    colors: true
  }))
})

clientCompiler.watch({}, (err, stats) => {
  if (err) console.error(err)

  console.log(stats.toString({
    chunks: false,
    colors: true
  }))
})
