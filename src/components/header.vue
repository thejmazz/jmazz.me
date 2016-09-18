<template>
    <header>
        <h1> {{ content }} </h1>
    </header>
</template>

<style lang="sass">
header {
    border-bottom: $headerBorderThickness solid black;
}
</style>

<script>
  export default {
    props: ['content']
  }
</script>
