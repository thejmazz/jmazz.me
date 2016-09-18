<template>
<nav>
    <div class="row">
        <div class="col-xs-12 col-lg-8 col-lg-offset-2">
            <div class="links">
                <router-link to="/blog">Blog</router-link>
                <a class="external" href="https://twitter.com/thejmazz">@thejmazz</a>
            </div>
        </div>
    </div>
</nav>
</template>

<style lang="sass">
nav {
    background-color: white;
    margin-bottom: 80px;

    .links {
        display: inline-block;
        float: right;
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
