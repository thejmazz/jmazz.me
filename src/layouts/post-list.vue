<template>
    <ul class="post-list">
        <li v-for="post in posts">
            <post-preview :title="post.title" :summary="post.summary"></post-preview>
        </li>
    </ul>
</template>

<style>
.post-list {
    list-style-type: none;
}
</style>

<script>
import PostPreview from '../components/post-preview.vue'

export default {
  name: 'post-list',
  components: {
    'post-preview': PostPreview
  }
}
</script>
