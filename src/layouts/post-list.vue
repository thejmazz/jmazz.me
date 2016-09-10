<template>
    <ul class="post-list">
        <li v-for="post in posts">
            <post-preview :title="post.title" :summary="post.summary"></post-preview>
        </li>
    </ul>
</template>

<style lang="sass">
.post-list {
    list-style-type: none;
    width: 700px;
    margin: 0 auto;
    padding-left: 0;
}
</style>

<script>
import PostPreview from '../components/post-preview.vue'

export default {
  name: 'post-list',
  props: [ 'posts' ],
  components: {
    'post-preview': PostPreview
  }
}
</script>
