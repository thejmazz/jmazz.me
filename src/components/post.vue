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
      return moment.utc(date).format('MMMM Do YYYY')
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
      const baseClass = 'post-image'

      function handleArrows({ keyCode }) {
        switch (keyCode) {
          case 39:
            // Right arrow
            if (this.activeImage !== -1 && this.activeImage !== this.imageIDs.length-1) this.activeImage++
            break
          case 37:
            // Left arrow
            if (this.activeImage !== -1 && this.activeImage !== 0) this.activeImage--
            break
        }
      }

      const getImageTogglers = (id) => {
        const target = document.getElementById(`img-${id}`)
        const { width, height } = target

        const wrapper = document.getElementById(`img-wrapper-${id}`)
        const figcaption = document.getElementById(`img-caption-${id}`)

        let orientation
        if (width > height && window.innerHeight > height) {
          orientation = 'landscape'
        } else {
          orientation = 'portrait'
        }

        const activate = () => {
          startScroll = window.scrollY

          target.className = `active ${orientation}`
          if (figcaption) figcaption.className = 'active'
            disableScroll(window)
          wrapper.className = 'img-wrapper active'
        }

        const deactivate = () => {
          target.className = baseClass
          if (figcaption) figcaption.className = ''
            enableScroll(window)
          wrapper.className = 'img-wrapper'

          setTimeout(() => window.scrollTo(0, startScroll))
        }

        return { activate, deactivate }
      }

      const postApp = new window.RuntimeVue({
        el: `#${this.post.slug}`,
        data: {
          imageIDs: [].slice.call(document.getElementsByClassName('post-image')).map(img => img.id.split('-')[1]),
          activeImage: -1
        },
        methods: {
          handleArrows,
          imageClick: function({ target }) {
            const id = target.id.split('-')[1]
            this.activeImage = this.imageIDs.indexOf(id)

            const { activate, deactivate } = getImageTogglers(id)

            if (target.className === baseClass) {
              activate()
            } else if (target.className.indexOf('active') !== -1) {
              deactivate()
            }
          }
        },
        mounted() {
          document.onkeydown = this.handleArrows
        }
      })

      postApp.$watch('activeImage', function (newVal, oldVal) {
        if (oldVal === -1) {
          // Eject if it is the first time an image is focused
          return
        }

        const { activate } = getImageTogglers(this.imageIDs[newVal])
        const { deactivate } = getImageTogglers(this.imageIDs[oldVal])

        activate()
        deactivate()
      })
    }
  }
}
</script>

