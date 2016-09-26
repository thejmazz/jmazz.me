<template>
<div id="app">
    <transition name="fade" mode="out-in">
        <div id="view">
            <router-view></router-view>
        </div>
    </transition>
</div>
</template>

<style lang="sass">
@import "~highlight.js/styles/solarized-light.css";
@import "~flexboxgrid/dist/flexboxgrid.css";
@import "globals";
@import "transitions";
</style>
