'use strict'

require('es6-promise').polyfill()
require('isomorphic-fetch')

import { app } from '../app.js'
window.app = app

// Mount to DOM
app.$mount('#app')
console.log('App mounted')
