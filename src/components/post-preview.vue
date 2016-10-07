<template>
    <div class="post-preview">
        <h2>
            <router-link :to="'/blog/' + post.title">{{ fm.title }}</router-link>
        </h2>
        <em>{{ date }}</em>
        <div class="post-summary" v-html="summary"></div>
    </div>
</template>

<style lang="sass">
@import "variables";

.post-preview {
    background-color: white;
    box-shadow: $materialShadow;
    border-radius: 2px;
    padding: 56px;
}
</style>

<script>
import moment from 'moment'

export default {
  props: [ 'summary', 'fm', 'post' ],
  computed: {
    date() {
      return moment(this.fm.date).format('MMMM Do YYYY')
    }
  }
}
</script>
