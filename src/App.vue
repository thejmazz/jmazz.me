<template>
<div id="app">
    <router-link to="/blog">Blog</router-link>
    <transition name="fade" mode="out-in">
      <router-view class="view"></router-view>
    </transition>
    <my-footer></my-footer>
</div>
</template>

<style lang="sass">
@import "~highlight.js/styles/solarized-light.css";
@import "globals";
@import "transitions";
</style>

<script>
import Footer from './components/footer.vue'

export default {
  components: {
    'my-footer': Footer
  }
}
</script>
