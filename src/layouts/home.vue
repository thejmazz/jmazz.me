<template>
    <div id="app">
      <my-header content="jmazz/blog"></my-header>
        <post-list :posts="posts"></post-list>
      <my-footer />
    </div>
</template>

<style lang="sass">
  .post-content {
    width: 700px;
    margin: 0 auto;
  }
</style>

<script>
import Header from '../components/header.vue'
import Footer from '../components/footer.vue'
import PostList from './post-list.vue'

export default {
  /* props: ['posts'], */
  data: () => ({
    posts: window.__INITIAL_STATE__.posts
  }),
  components: {
    'my-header': Header,
    'my-footer': Footer,
    'post-list': PostList
  }
}
</script>

