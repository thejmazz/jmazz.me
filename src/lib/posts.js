'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')

const { postsDir } = require('../config.js')
// TODO? fix __dirname related paths with render bundle in v8 context
console.log('postsDir: ', postsDir)
// const postsDir = '/Users/jmazz/Documents/repos/jmazz.me/_posts'

const marked = require('./marked.js')

exports.getAllPosts = () => new Promise((resolve, reject) => {
  // console.log('postsDir: ', postsDir)
  fs.readdir(postsDir, (err, files) => {
    if (err) console.error(err)

    files = files.filter(str => str.indexOf('.swp') === -1)

    console.log('files: ', files)
    Promise.map(files, (file) => new Promise((resolve, reject) => {
      const fullPost = fs.readFileSync(postsDir + '/' + file, 'utf-8')
      const preview = fullPost.split('\n').slice(0, 22).join('\n')

      marked({ file: postsDir + '/' + file, summary: true }).then((content) => {
        resolve({
          title: file.replace(/\.md$/, ''),
          fm: content.fm,
          summary: content.body
        })
      })
    }))
    .then((posts) => {
      // sort from latest to oldest
      const dated = {}
      const newPosts = []
      posts.forEach((post, i) => {
        dated[Date.parse(post.fm.date)] = i
      })
      Object.keys(dated).sort().reverse().forEach((key, i) => {
        newPosts[i] = posts[dated[key]]
      })

      return Promise.resolve(newPosts)
    })
    .then((posts) => {
      resolve(posts)
    })
  })
})

exports.getPost = ({ file }) => new Promise((resolve, reject) => {
  fs.statAsync(file)
    .then(() => marked({ file }))
    .then(resolve)
    .catch(reject)
})
