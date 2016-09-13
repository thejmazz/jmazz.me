<template>
<div class="post-content" :slug="post.slug" v-html="post.body"></div>
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
    fetchPost(this.$store, { post: this.$route.params.post })
  }
}
</script>

