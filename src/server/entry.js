'use strict'

import fs from 'fs'
import path from 'path'

import Promise from 'bluebird'
import Vue from 'vue'

import Post from '../layouts/post.vue'
import Home from '../layouts/home.vue'

import marked from '../lib/marked.js'

export default (context) => new Promise((resolve, reject) => {
  // do some async data fetching
  // use "context" passed from renderer as params (e.g. url)
  // resolve to app's root Vue instance

  if (context.post) {
    marked({ file: context.filepath })
    .then((content) => {
      Post.data = () => ({
        postContent: content.body
      })

      resolve(new Vue(Post))
    })
  }

  if (context.type === 'home') {
    fs.readdir(context.postsDir, (err, files) => {
      Promise.map(files, (file) => new Promise((resolve, reject) => {
        const fullPost = fs.readFileSync(context.postsDir + '/' + file, 'utf-8')
        const preview = fullPost.split('\n').slice(0, 22).join('\n')

        marked({ file: context.postsDir + '/' + file, summary: true }).then((content) => {
          resolve({
            title: file.replace(/\.md$/, ''),
            summary: content.body
          })
        })
      })).then((posts) => {
        Home.data = () => ({
          posts
        })

        resolve(new Vue(Home))
      })
    })
  }
})
