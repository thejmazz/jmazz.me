<template>
  <div>
    <post-layout :post-content="postContent"></post-layout>
  </div>
</template>

<script>
import PostLayout from './layouts/post.vue'

export default {
  name: 'root',
  components: {
    'post-layout': PostLayout
  }
}
</script>
