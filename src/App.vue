<template>
<div id="app">
    <navbar></navbar>
    <transition name="fade" mode="out-in">
      <router-view class="view"></router-view>
    </transition>
    <my-footer></my-footer>
</div>
</template>

<style lang="sass">
@import "~highlight.js/styles/solarized-light.css";
@import "~flexboxgrid/dist/flexboxgrid.css";
@import "globals";
@import "transitions";
</style>

<script>
import Footer from './components/footer.vue'
import Navbar from './components/navbar.vue'

export default {
  components: {
    'my-footer': Footer,
    'navbar': Navbar
  }
}
</script>
