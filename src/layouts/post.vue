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
}

/* img { width: 100%; } */
</style>

<script>
import Header from '../components/header.vue'
import Footer from '../components/footer.vue'

function fetchPost(store) {
  return store.dispatch('FETCH_POST', { post: store.state.route.params.post })
}

export default {
  computed: {
    postContent() {
      return this.$store.state.posts[this.$route.params.post]
    }
  },
  /* data() { */
  /*   return { */
  /*     postContent: this.$store.state.posts[this.$route.params.post] */
  /*   } */
  /* }, */
  preFetch: fetchPost.bind(this),
  beforeMount() {
    console.log('doing Post beforeMount')
    /* this.$data.postContent = 'wheeeee' */
    fetchPost(this.$store, { post: this.$route.params.post })
    .then(() => {
      console.log('finished beforeMount fetch')
      console.log('state: ', this.$store.state)
    })
  },
  components: {
    'my-header': Header,
    'my-footer': Footer
  }
}
</script>

