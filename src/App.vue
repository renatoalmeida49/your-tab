<template>
  <div id="app">
    <div class="container">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  background: $gray;
  min-height: 100vh;

  .container {
    width: 100%;
    max-width: 1240px;
    padding: 0 40px;
    margin: auto;
  }
}
</style>
