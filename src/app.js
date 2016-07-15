'use strict'

import Vue from 'vue'
import Title from './title.vue'

const appContainer = document.createElement('div')
appContainer.id = 'app'
document.body.appendChild(appContainer)

new Vue({
  el: '#app',
  render(createElement) {
    return createElement(Title)
  }
})


