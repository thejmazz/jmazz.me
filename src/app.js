'use strict'

import Vue from 'vue'

import App from './App.vue'
import router from './router.js'
import store from './store.js'

const appObj = Object.assign({}, { router, store })
Object.keys(App).forEach(key => appObj[key] = App[key])

const app = new Vue(appObj)

export { app, router, store }
