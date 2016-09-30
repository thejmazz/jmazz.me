<template>
<nav>
    <div class="links">
        <router-link to="/blog">Blog</router-link>
        <a class="external" href="https://twitter.com/thejmazz" target="_blank">@thejmazz</a>
    </div>
</nav>
</template>

<style lang="sass">
@import "variables";

nav {
    background-color: white;
    margin-top: 40px;
    /* height: 100%; */
    box-shadow: $materialShadow;

    .links {
        display: inline-block;
        float: right;

        /* &:after { */
        /*     content: ''; */
        /*     clear: both; */
       /* } */
    }
}
nav a {
    text-transform: lowercase;
    float: left;
    margin: 15px;

    /* &:hover { */
    /*     text-decoration: underline; */
    /* } */

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
