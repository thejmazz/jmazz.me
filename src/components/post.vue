<template>
    <div>
        <navbar></navbar>
        <transition name="fade" mode="out-in">
            <div class="post-content" :slug="post.slug" v-html="post.body"></div>
        </transition>
        <my-footer></my-footer>
    </div>
</template>

<style lang="sass">
.post-content {
    width: 700px;
    max-width: 100%;
    margin: 0 auto;
    flex-grow: 1;
    box-shadow: 0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12),0 2px 4px -1px rgba(0,0,0,.2);
    padding: 80px 56px;
    background-color: white;
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

