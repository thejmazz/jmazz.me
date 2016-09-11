<template>
    <header>
        <h1> {{ content }} </h1>
    </header>
</template>

<style lang="sass">
$headerBorderThickness: 2px;

header {
    border-bottom: $headerBorderThickness solid black;
}
</style>

<script>
  export default {
    props: ['content']
  }
</script>
