'use strict'

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import PostList from './components/post-list.vue'
import Post from './components/post.vue'

export default new Router({
  mode: 'history',
  scrollBehavior: () => ({ y: 0 }),
  routes: [
    { path: '/blog', component: PostList },
    { path: '/blog/:post', component: Post },
    { path: '*', redirect: '/blog' }
  ]
})
