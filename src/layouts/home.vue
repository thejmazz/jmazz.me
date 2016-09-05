<template>
    <div>
      <my-header content="jmazz/blog"></my-header>
        <post-list :posts="posts"></post-list>
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
</style>

<script>
import Header from '../components/header.vue'
import PostList from './post-list.vue'

export default {
  name: 'Layout-Post',
  props: ['postContent'],
  components: {
    'my-header': Header,
    'post-list': PostList
  }
}
</script>

