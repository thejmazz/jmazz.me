'use strict'

import Vue from 'vue'
import Vuex from 'vuex'

import fetch from 'isomorphic-fetch'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    homeposts: []
  },
  actions: {
    FETCH_HOME_POSTS: ({ commit }) => {
      return fetch('http://localhost:3001/api/allposts')
        .then(res => res.json())
        .then(body => commit('SET_POSTS', { posts: body }))
    }
  },
  mutations: {
    SET_POSTS: (state, { posts }) => {
      state.homeposts = posts
    }
  }
})

export default store
