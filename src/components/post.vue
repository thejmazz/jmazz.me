<template>
    <transition name="fade" mode="out-in">
        <div class="post-content" :slug="post.slug" v-html="post.body"></div>
    </transition>
</template>

<style lang="sass">
.post-content {
    width: 700px;
    max-width: 100%;
    margin: 0 auto;
    flex-grow: 1;
}

img {
    max-width: 100%;
}
</style>

<script>
const fetchPost = (store) => store.dispatch('FETCH_POST', {
  post: store.state.route.params.post
})

export default {
  computed: {
    post() {
      return this.$store.state.posts[this.$route.params.post]
    }
  },
  preFetch: fetchPost.bind(this),
  beforeMount() {
    /* setTimeout(() => fetchPost(this.$store, { post: this.$route.params.post }), 1000) */
    fetchPost(this.$store, { post: this.$route.params.post })
  }
}
</script>

