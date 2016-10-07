'use strict'

const path = require('path')

const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const MFS = require('memory-fs')

const nodeConfig = require('./webpack.node.js')
const clientConfig = require('./webpack.client.js')

const setupDevServer = (app, onUpdate) => {
  // Modify client config for development use
  clientConfig.entry = [ 'webpack-hot-middleware/client', clientConfig.entry[0] ]
  clientConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  )

  const clientCompiler = webpack(clientConfig)

  app.use(webpackDevMiddleware(clientCompiler, {
    publicPath: clientConfig.output.publicPath,
    stats: {
      colors: true,
      chunks: false
    }
  }))
  app.use(webpackHotMiddleware(clientCompiler))

  // Server bundle stored in memory and passed by cb into express server
  const serverCompiler = webpack(nodeConfig)
  const mfs = new MFS()
  const outputPath = path.join(nodeConfig.output.path, nodeConfig.output.filename)
  serverCompiler.outputFileSystem = mfs

  serverCompiler.watch({}, (err, stats) => {
    if (err) throw err

    stats = stats.toJson()
    stats.errors.forEach(err => console.error(err))
    stats.warnings.forEach(err => console.warn(err))

    console.log('server bundled')

    // Trigger bundle update in server
    onUpdate(mfs.readFileSync(outputPath, 'utf-8'))
  })
}

module.exports = setupDevServer
