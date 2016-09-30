<template>
<div id="bg">
    <img src="/static/topology-01.svg" />
</div>
</template>

<style lang="sass">
#bg {
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;

  background-color: rgba(255,255,255, 1);
  z-index: -9999;
}

#bg img {
  opacity: 0.1;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  min-width: 50%;
  min-height: 50%;
}
</style>
