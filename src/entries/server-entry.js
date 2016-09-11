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
import { getAllPosts, getPost } from '../lib/posts.js'

export default (context) => new Promise((resolve, reject) => {
  // set the correct route
  router.push(context.url)

  // shitty temp global store
  global.window = {}

  // do some async data fetching
  // use "context" passed from renderer as params (e.g. url)
  // resolve to app's root Vue instance

  // for now use properties of context to infer how to hydate "state"
  if (context.type === 'home') {
    getAllPosts().then((posts) => {
      window.__INITIAL_STATE__ = {
        posts
      }

      resolve(app)
    })
  } else if (context.post) {
    getPost({ file: context.filepath }).then((content) => {
      window.__INITIAL_STATE__ = {
        currentPost: content.body
      }

      console.log('initial state:', window.__INITIAL_STATE__)

      resolve(app)
    })
  }
})
