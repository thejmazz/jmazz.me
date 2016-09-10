<template>
    <div>
      <my-header content="Post page"></my-header>
      <div class="post-content" v-html="postContent">
      </div>
      <my-footer />
    </div>
</template>

<style lang="sass">
@import "../scss/_hljs-theme.scss";

.post-content {
width: 700px;
margin: 0 auto;
}

/* img { width: 100%; } */
</style>

<script>
import Header from '../components/header.vue'
import Footer from '../components/footer.vue'

export default {
  name: 'Layout-Post',
  /* props: ['postContent'], */
  components: {
    'my-header': Header,
    'my-footer': Footer
  }
}
</script>

