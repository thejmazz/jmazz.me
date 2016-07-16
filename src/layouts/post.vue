<template>
    <div>
      <my-header content="Post page"></my-header>
      <div class="post-content" v-html="postContent">
      </div>
      <p>
        footer
      </p>
    </div>
</template>

<script>
import Header from '../components/header.vue'

export default {
  name: 'Layout-Post',
  props: ['postContent'],
  components: {
    'my-header': Header
  }
}
</script>

<style>
  .post-content {
    width: 600px;
    margin: 0 auto;
  }
</style>
