<template>
    <div class="post-preview">
        <h2><a href="/post">{{ title }}</a></h2>
        <div class="post-summary" v-html="summary"></div>
    </div>
</template>

<script>
export default {
  name: 'post-preview',
  props: [ 'title', 'summary' ]
}
</script>
