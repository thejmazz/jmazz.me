'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

import fetch from 'isomorphic-fetch'

// const baseURL = IS_PROD
//   // ? 'https://jmazz.me'
//   ? 'http://localhost:3001'
//   : SSR_HOST + ':' + SSR_PORT
const baseURL = __VUE_ENV__ === 'server'
  ? 'http://localhost:3001'
  : 'https://jmazz.me'
// const baseURL = 'https://api.jmazz.me'

console.log('baseURL:', baseURL)

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    homeposts: [],
    posts: { /* [id: string]: Post */ }
  },
  actions: {
    FETCH_HOME_POSTS: ({ commit }) => {
      return fetch(baseURL + '/api/allposts')
        .then(res => res.json())
        .then(body => commit('SET_POSTS', { posts: body }))
        .catch(err => console.error(err))
    },
    FETCH_POST: ({ commit }, { post }) => {
      // console.log('FETCH_POST was dispatched', post)
      return fetch(baseURL + `/api/post/${post}`)
        .then(res => res.json())
        .then(body => commit('SET_POST', { post: body }))
        .catch(err => console.error(err))
    }
  },
  mutations: {
    SET_POSTS: (state, { posts }) => state.homeposts = posts,
    SET_POST: (state, { post }) => {
      // console.log('SET_POST was called', post)
      // state.posts[post.slug] = post.body
      Vue.set(state.posts, post.slug, post)
    }
  }
})

export default store
