<template>
    <header>
        <h1> {{ content }} </h1>
    </header>
</template>

<style>
header {
    border-bottom: 2px solid black;
}
</style>

<script>
  export default {
    name: 'Header',
    props: ['content']
  }
</script>
