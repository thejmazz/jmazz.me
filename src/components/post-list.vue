<template>
    <ul class="post-list">
        <li v-for="post in posts">
            <post-preview :title="post.title" :summary="post.summary"></post-preview>
        </li>
    </ul>
</template>

<style lang="sass">
@import "colors";

.post-list {
    list-style-type: none;
    width: 700px;
    margin: 0 auto;
    padding-left: 0;
    background-color: white;
    /* box-shadow: 0px 0px 44px 1px rgba(0,0,0,0.5); */
    box-shadow: 0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.2);
    border-radius: 2px;
    padding: 20px;
}
</style>

<script>
import PostPreview from '../components/post-preview.vue'

const fetchPosts = (store) => store.dispatch('FETCH_HOME_POSTS')

export default {
  computed: {
    posts() {
      return this.$store.state.homeposts
    }
  },
  preFetch: fetchPosts,
  beforeMount() {
    fetchPosts(this.$store)
  },
  components: {
    'post-preview': PostPreview
  }
}
</script>
