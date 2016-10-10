<template>
  <nav>
    <div class="links clearfix">
      <router-link to="/blog">Blog</router-link>
      <a class="external" href="https://twitter.com/thejmazz" target="_blank">@thejmazz</a>
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
