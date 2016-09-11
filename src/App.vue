<template>
<div id="app">
    <home :posts="posts"></home>
</div>
</template>

<style lang="sass">
@import "~highlight.js/styles/solarized-light.css";
@import "globals";
</style>

<script>
import Home from './layouts/home.vue'

export default {
  data: () => ({
    posts: window.__INITIAL_STATE__.posts
  }),
  components: {
    'home': Home
  }
}
</script>
