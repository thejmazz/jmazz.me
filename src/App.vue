<template>
<div id="app">
    <navbar></navbar>
    <div id="bg">
        <img src="/static/topology-01.svg" />
    </div>
    <transition name="fade" mode="out-in">
        <div id="view">
        <router-view class="view"></router-view>
        </div>
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
