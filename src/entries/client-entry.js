'use strict'

require('es6-promise').polyfill()
require('isomorphic-fetch')

import { app } from '../app.js'
window.app = app

// Mount to DOM
// console.log('Skipping mount')
app.$mount('#app')
console.log('App mounted')
