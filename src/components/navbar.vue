<template>
  <nav>
    <div class="links">
      <router-link to="/blog">Blog</router-link>
      <a class="external" href="https://twitter.com/thejmazz" target="_blank">@thejmazz</a>
      <div style="clear: both;"></div>
    </div>
  </nav>
</template>

<style lang="sass">
@import "colors";
@import "variables";

nav {
  background-color: white;
  margin: 56px 0;
  box-shadow: $materialShadow;

  .links {
      /* display: inline-block; */
      /* float: right; */

      /* &:after { */
      /*     content: ''; */
      /*     clear: both; */
     /* } */
  }
}

nav a {
  text-transform: lowercase;
  float: left;
  padding: 15px;
  transition: all 200ms ease;

  &:hover {
    background-color: rgba($primary, 0.5);
      color: white;
  }

  &::before {
    content: '/';
  }

  &.external {
      &::before {
        content: '';
      }
  }
}
</style>
