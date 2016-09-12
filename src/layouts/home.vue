<template>

<post-list :posts="posts"></post-list>

</template>

<script>
import Header from '../components/header.vue'
import Footer from '../components/footer.vue'
import PostList from './post-list.vue'

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
    'my-header': Header,
    'my-footer': Footer,
    'post-list': PostList
  }
}
</script>

