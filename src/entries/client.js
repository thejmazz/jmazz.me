'use strict'

import { app } from '../app.js'
window.app = app

// Mount to DOM
console.log('About to mount')
app.$mount('#app')
