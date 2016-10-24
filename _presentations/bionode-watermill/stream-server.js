'use strict'

const http = require('http'), fs = require('fs'), through = require('through2')

http.createServer((req, res) => {
  const rs = fs.createReadStream('./alphabet.txt')

  const ts = through(function (chunk, enc, next) {
    this.push(chunk.toString().toUpperCase())
    next()
  })

  // Send uppercase file to response
  rs.pipe(ts).pipe(res)
}).listen(8080)
