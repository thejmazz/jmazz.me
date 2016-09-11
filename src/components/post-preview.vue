<template>
    <div class="post-preview">
        <h2>
            <router-link :to="'/blog/' + title">{{ title }}</router-link>
        </h2>
        <div class="post-summary" v-html="summary"></div>
    </div>
</template>

<script>
export default {
  props: [ 'title', 'summary' ]
}
</script>
