Playing with `vue@next`, maybe gonna make a Vue alternative to
[react-static-boilerplate](https://github.com/kriasoft/react-static-boilerplate).

Why? For a blog that can be rendered to static HTML (pipe readable stream to file, or into `res` in express), but also have nice interactive
tutorials, and for UI elements as components. React can do this, but is bigger 
(44kb vs 14) - which is not a huge deal. But Vue is simpler, can **choose between
templates or render functions** for components, there will [probably be a JSX
template option later](https://github.com/vuejs/vue/issues/2873#issuecomment-225384908) too (right now there is already pug (i.e. jade)).

## Links

- [Announcing Vue.js 2.0](https://vuejs.org/2016/04/27/announcing-2.0/)
- [Vue v2 features](https://github.com/vuejs/vue/issues/2873)
- [vue-server-renderer](https://github.com/vuejs/vue/tree/next/packages/vue-server-renderer)
- [v2 (incomplete) docs](https://github.com/vuejs/vuejs.org/issues/319)
- [Auth0: Create an App in VueJS 2](https://auth0.com/blog/2016/07/14/create-an-app-in-vuejs-2)

### SPA

To run an SPA with Vue:

```bash
npm start
```

Files of relevance:
- `app.js` (entry point to SPA, mounts app to root div)
- any component files (`.vue`)

### SSR

To run a streaming server render (with bundled app):

```bash
npm run render
```

Files of relevance:
- `src/server/entry.js` + `webpack.node.js` = makes a node safe bundle of the
  app. This file exports a function that takes `context` (which will be provided
  by `renderer`) and **returns a Promise that resolves to the root Vue instance**.
  Then it is actually quite simple to do your server side hydration, just do it
  using options from `context` (e.g. `url`), then resolve.
- `src/server/index.js` - gets contents of bundle as string, passes that in as `code`
  to the `bundleRenderer`, which calls a render, can pass in option `context` object,
  returns a readable stream of HTML ouput (can also do a callback)

### FAQ

**What is `src/server/simple`?**

Uses no webpack bundle, so templates need to be handwritten with [hyperscript](https://github.com/dominictarr/hyperscript).
