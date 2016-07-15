'use strict'

import Vue from 'vue'
import Title from '../title.vue'

const app = new Vue(Title)

export default (context) => new Promise((resolve, reject) => {
  // do some async data fetching
  // use "context" passed from renderer as params (e.g. url)
  // resolve to app's root Vue instance
  resolve(app)
})
