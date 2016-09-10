<template>
    <header>
        <h1> {{ content }} </h1>
    </header>
</template>

<style lang="sass">
$headerBorderThickness: 4px;

header {
    border-bottom: $headerBorderThickness solid black;
}
</style>

<script>
  export default {
    name: 'Header',
    props: ['content']
  }
</script>
