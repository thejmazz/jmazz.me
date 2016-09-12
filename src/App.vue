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

.fade-enter-active, .fade-leave-active {
    transition: all 0.2s ease;
}
.fade-enter, .fade-leave-active {
    opacity: 0;
}

#app {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}
</style>

<script>
import Footer from './components/footer.vue'

export default {
  components: {
    'my-footer': Footer
  }
}
</script>
