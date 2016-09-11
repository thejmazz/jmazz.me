'use strict'

require('es6-promise').polyfill()
require('isomorphic-fetch')

import { app, store } from '../app.js'

store.replaceState(window.__INITIAL_STATE__)

// Mount to DOM
// console.log('Skipping mount')
app.$mount('#app')
console.log('App mounted')
