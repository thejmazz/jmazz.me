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
// import RuntimeVue from 'vue/dist/vue.js'

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
      const postApp = new window.RuntimeVue({
        el: `#${this.post.slug}`,
        methods: {
          imageClick: function({ target }) {
            // left: 37, up: 38, right: 39, down: 40,
            // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
            var keys = {37: 1, 38: 1, 39: 1, 40: 1};

            function preventDefault(e) {
              e = e || window.event;
              if (e.preventDefault)
                e.preventDefault();
              e.returnValue = false;
            }

            function preventDefaultForScrollKeys(e) {
              if (keys[e.keyCode]) {
                preventDefault(e);
                return false;
              }
            }

            function disableScroll() {
              if (window.addEventListener) // older FF
                window.addEventListener('DOMMouseScroll', preventDefault, false);
              window.onwheel = preventDefault; // modern standard
              window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
              window.ontouchmove  = preventDefault; // mobile
              document.onkeydown  = preventDefaultForScrollKeys;
            }

            function enableScroll() {
              if (window.removeEventListener)
                window.removeEventListener('DOMMouseScroll', preventDefault, false);
              window.onmousewheel = document.onmousewheel = null;
              window.onwheel = null;
              window.ontouchmove = null;
              document.onkeydown = null;
            }

            const id = target.id.split('-')[1]

            const wrapper = document.getElementById(`img-wrapper-${id}`)
            const activateWrapper = () => wrapper.className = 'img-wrapper active'
            const deactivateWrapper = () => wrapper.className = 'img-wrapper'

            const { width, height } = target
            // console.log(window.innerHeight, height)

            let orientation
            if (width > height && window.innerHeight > height) {
              orientation = 'landscape'
            } else {
              orientation = 'portrait'
            }

            if (target.className === '') {
              target.className = `active ${orientation}`
              disableScroll()
              activateWrapper()
            } else if (target.className === `active ${orientation}`) {
              target.className = ''
              enableScroll()
              deactivateWrapper()
            }
          }
        }
      })
    }
  }
}
</script>

