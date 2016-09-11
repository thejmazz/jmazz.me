'use strict'

import fs from 'fs'
import path from 'path'

import Promise from 'bluebird'
import Vue from 'vue'

import Post from '../layouts/post.vue'
import Home from '../layouts/home.vue'

import App from '../App.vue'

import { app, router, store } from '../app.js'

import marked from '../lib/marked.js'
import { getAllPosts, getPost } from '../lib/posts.js'

export default (context) => new Promise((resolve, reject) => {
  // set the correct route
  router.push(context.url)

  // do some async data fetching
  // use "context" passed from renderer as params (e.g. url)
  // resolve to app's root Vue instance
  Promise.all(router.getMatchedComponents().map((component) => {
    if (component.preFetch) return component.preFetch(store)
  })).then(() => {
    // console.log('Produced state: ', store.state)
    console.log('Appending initialState to context')
    context.initialState = store.state

    resolve(app)
  })
})
