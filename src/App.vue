<template>
  <div id="app">
    <div class="container">
      <h1>Cifra builder</h1>
      <Menu />
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
  font-family: monospace;

  .container {
    width: 100%;
    max-width: 1240px;
    padding: 0 40px;
    margin: auto;
    background: $white;

    h1 {
      text-align: center;
      background: $white;
      padding: 20px 0;
    }
  }
}
</style>
