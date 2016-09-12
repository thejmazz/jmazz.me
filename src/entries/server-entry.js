'use strict'

import { app, router, store } from '../app.js'

export default (context) => new Promise((resolve, reject) => {
  // set the correct route using context passed from request handler
  router.push(context.url)

  // run each preFetch from every component in this route
  Promise.all(router.getMatchedComponents().map((component) => {
    if (component.preFetch) return component.preFetch(store)
  })).then(() => {
    // console.log('Produced state: ', store.state)
    // console.log('Appending initialState to context')
    // Request handler will inline serialized state into response
    context.initialState = store.state

    // resolve to app's root Vue instance
    resolve(app)
  })
})
