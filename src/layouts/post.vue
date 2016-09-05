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

<style>
  .post-content {
    width: 700px;
    margin: 0 auto;
  }

  /* img { width: 100%; } */
</style>

<script>
import Header from '../components/header.vue'

export default {
  name: 'Layout-Post',
  /* props: ['postContent'], */
  components: {
    'my-header': Header
  }
}
</script>

