<template>
    <div class="nav-content-footer">
        <div class="row">
            <div class="col-md-8 col-md-offset-2">
                <navbar />
            </div>
        </div>
        <bg />
        <transition name="fade" mode="out-in">
            <div class="row" style="flex-grow: 2;">
                <div class="col-md-8 col-md-offset-2">
                    <div class="post-content" :slug="post.slug" v-html="post.body"></div>
                </div>
            </div>
        </transition>
        <my-footer></my-footer>
    </div>
</template>

<style lang="sass">
@import "variables";

.nav-content-footer {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.post-content {
    /* width: 700px; */
    max-width: 100%;
    margin: 0 auto;
    flex-grow: 1;
    box-shadow: $materialShadow;
    padding: $paperPadding;
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

