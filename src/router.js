'use strict'

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Home from './layouts/home.vue'
import Post from './layouts/post.vue'

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '/blog', component: Home },
    { path: '/blog/:post', component: Post },
    { path: '*', redirect: '/blog' }
  ]
})
