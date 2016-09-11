'use strict'

import Vue from 'vue'

import App from './App.vue'
import router from './router.js'

const appObj = Object.assign({}, { router })
Object.keys(App).forEach(key => appObj[key] = App[key])

const app = new Vue(appObj)

export { app, router }
