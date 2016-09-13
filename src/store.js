'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

import fetch from 'isomorphic-fetch'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    homeposts: [],
    posts: { /* [id: string]: Post */ }
  },
  actions: {
    FETCH_HOME_POSTS: ({ commit }) => {
      return fetch('http://localhost:3001/api/allposts')
        .then(res => res.json())
        .then(body => commit('SET_POSTS', { posts: body }))
    },
    FETCH_POST: ({ commit }, { post }) => {
      // console.log('FETCH_POST was dispatched', post)
      return fetch(`http://localhost:3001/api/post/${post}`)
        .then(res => res.json())
        .then(body => commit('SET_POST', { post: body }))
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
