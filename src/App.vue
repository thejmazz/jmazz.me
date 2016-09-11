<template>
<div id="app">
    <router-link to="/blog">Blog</router-link>
    <router-view class="view"></router-view>
</div>
</template>

<style lang="sass">
@import "~highlight.js/styles/solarized-light.css";
@import "globals";
</style>

<script>
import Home from './layouts/home.vue'

export default {
  components: {
    'home': Home
  }
}
</script>
