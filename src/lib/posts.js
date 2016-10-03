'use strict'

const fs = require('fs')
const path = require('path')
const Promise = require('bluebird')

// const { postsDir } = require('../config.js')
// const postsDir = path.resolve(__dirname, '../../_posts')A
// TODO fix __dirname related paths with render bundle in v8 context
const postsDir = '/Users/jmazz/Documents/repos/jmazz.me/_posts'
// console.log('postsDir: ', postsDir)

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
          attributes: content.attributes,
          summary: content.body
        })
      })
    }))
    .then((posts) => {
      // sort from latest to oldest
      const dated = {}
      const newPosts = []
      posts.forEach((post, i) => {
        dated[Date.parse(post.attributes.date)] = i
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

exports.getPost = ({ file }) => {
  return marked({ file })
}
