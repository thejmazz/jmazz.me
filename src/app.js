'use strict'

import Vue from 'vue'
import Root from './root.vue'

const appContainer = document.createElement('div')
appContainer.id = 'app'
document.body.appendChild(appContainer)

Root.data = () => ({ postContent: 'wheeeee' })

console.log(Root)

new Vue({
  el: '#app',
  render: (createElement) => createElement(Root)
})
