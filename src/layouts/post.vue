<template>
    <div>
      <my-header content="Post page"></my-header>
      <div class="post-content" v-html="postContent">
      </div>
      <my-footer />
    </div>
</template>

<style lang="sass">
.post-content {
    width: 700px;
    margin: 0 auto;
    flex-grow: 1;
}

/* img { width: 100%; } */
</style>

<script>
import Header from '../components/header.vue'
import Footer from '../components/footer.vue'

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
  },
  components: {
    'my-header': Header,
    'my-footer': Footer
  }
}
</script>

