<template>
<div id="app">
    <home :posts="posts"></home>
</div>
</template>

<script>
import Home from './layouts/home.vue'

export default {
  name: 'App',
  data: () => ({
    posts: window.__posts
  }),
  components: {
    'home': Home
  }
}
</script>
