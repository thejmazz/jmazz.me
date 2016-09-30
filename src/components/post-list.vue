<template>
<div>
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <navbar />
        </div>
    </div>
    <bg />
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
            <ul class="post-list">
                <li v-for="post in posts">
                <post-preview :title="post.title" :summary="post.summary"></post-preview>
                </li>
            </ul>
        </div>
    </div>
    <my-footer />
</div>
</template>

<style lang="sass">
@import "colors";
@import "variables";

.post-list {
    list-style-type: none;
    /* width: 700px; */
    margin: 0 auto;
    background-color: white;
    box-shadow: $materialShadow;
    border-radius: 2px;
    padding: $paperPadding;
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
