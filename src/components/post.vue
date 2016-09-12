<template>
<div class="post-content" v-html="postContent"></div>
</template>

<style lang="sass">
.post-content {
    width: 700px;
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
    postContent() {
      return this.$store.state.posts[this.$route.params.post]
    }
  },
  preFetch: fetchPost.bind(this),
  beforeMount() {
    fetchPost(this.$store, { post: this.$route.params.post })
  }
}
</script>

