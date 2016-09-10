<template>
    <div>Helloooo {{ title }}!</div>
</template>

<style lang="sass">
 div {
    color: red;
 }
</style>

<script>
export default {
    name: 'Title',
    data: () => ({
        title: 'jmazz'
    })
}
</script>

