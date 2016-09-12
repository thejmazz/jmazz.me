'use strict'

require('es6-promise').polyfill()
require('isomorphic-fetch')

import { app, store } from '../app.js'

// use server initialized state
store.replaceState(window.__INITIAL_STATE__)

// Mount to DOM
app.$mount('#app')
console.log('App mounted')
