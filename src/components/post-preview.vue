<template>
    <div class="post-preview">
        <h2><a :href="'/blog/' + title">{{ title }}</a></h2>
        <div class="post-summary" v-html="summary"></div>
    </div>
</template>

<script>
export default {
  props: [ 'title', 'summary' ]
}
</script>
