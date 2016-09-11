'use strict'

import fs from 'fs'
import path from 'path'

import Promise from 'bluebird'
import Vue from 'vue'

import Post from '../layouts/post.vue'
import Home from '../layouts/home.vue'

import App from '../App.vue'

import { app, router } from '../app.js'

import marked from '../lib/marked.js'

export default (context) => new Promise((resolve, reject) => {
  // set the correct route
  if (context.url) router.push(context.url)

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
        global.window = {}
        global.window.__INITIAL_STATE__ = {
          posts
        }

        resolve(app)
        // resolve(new Vue(App))
      })
    })
  }
})
