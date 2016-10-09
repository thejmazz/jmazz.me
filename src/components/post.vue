<template>
  <div class="nav-content-footer">
    <div class="row">
      <div class="col-md-8 col-md-offset-2">
        <navbar />
      </div>
    </div>
    <bg />
    <transition name="fade" mode="out-in">
    <div class="row" style="flex-grow: 2;">
      <div class="col-md-8 col-md-offset-2">
        <div class="post-content" :id="post.slug">
          <h1>{{post.fm.title}}</h1>
          <em>{{date}}</em>
          <div v-html="post.body"></div>
        </div>
      </div>
    </div>
    </transition>
    <my-footer></my-footer>
  </div>
</template>

<style lang="sass">
@import "variables";

.nav-content-footer {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.post-content {
  max-width: 100%;
  margin: 0 auto;
  flex-grow: 1;
  box-shadow: $materialShadow;
  padding: $paperPadding;
  background-color: white;

  // ul, li {
  //   padding-left: 20px;
  // }
}
</style>

<script>
import moment from 'moment'
import { enableScroll, disableScroll } from '../lib/scroll.js'

const fetchPost = (store) => store.dispatch('FETCH_POST', {
  post: store.state.route.params.post
})

export default {
  computed: {
    post() {
      return this.$store.state.posts[this.$route.params.post]
    },
    date() {
      const date = this.$store.state.posts[this.$route.params.post].fm.date
      return moment(date).format('MMMM Do YYYY')
    }
  },
  preFetch: fetchPost.bind(this),
  beforeMount() {
    /* setTimeout(() => fetchPost(this.$store, { post: this.$route.params.post }), 1000) */
    fetchPost(this.$store, { post: this.$route.params.post })
  },
  updated() {
    if (window) {
      let startScroll
      const postApp = new window.RuntimeVue({
        el: `#${this.post.slug}`,
        methods: {
          imageClick: function({ target }) {
            const { width, height } = target

            const id = target.id.split('-')[1]
            const wrapper = document.getElementById(`img-wrapper-${id}`)

            let orientation
            if (width > height && window.innerHeight > height) {
              orientation = 'landscape'
            } else {
              orientation = 'portrait'
            }

            const activate = () => {
              startScroll = window.scrollY

              target.className = `active ${orientation}`
              disableScroll(window)
              wrapper.className = 'img-wrapper active'
            }

            const deactivate = () => {
              target.className = ''
              enableScroll(window)
              wrapper.className = 'img-wrapper'

              setTimeout(() => window.scrollTo(0, startScroll))
            }

            if (target.className === '') {
              activate()
            } else if (target.className.indexOf('active') !== -1) {
              deactivate()
            }
          }
        }
      })
    }
  }
}
</script>

