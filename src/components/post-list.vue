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
                <li class="post-list-item" v-for="post in posts">
                    <post-preview :post="post" :fm="post.fm" :summary="post.summary"></post-preview>
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
    padding: 0;
    /* background-color: white; */
    /* box-shadow: $materialShadow; */
    /* border-radius: 2px; */
    /* padding: $paperPadding; */

    li.post-list-item {
        margin-bottom: 56px;

        &:last-child {
           margin-bottom: 0;
        }
    }
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
