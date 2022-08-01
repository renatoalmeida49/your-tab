<template>
  <div id="app">
    <div class="container">
      <h1>Cifra builder</h1>

      <section>
        <p>Um construtor de cifras, tablaturas e anotações.</p>

        <p>Clique em qualquer parte abaixo para iniciar suas anotações.</p>

        <p>
          Em qualquer momento pressione '/' para ter acesso ao atalho da
          aplicação e adicionar rapidamente uma tablatura ou verso.
        </p>
      </section>

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
      padding-bottom: 0;
    }

    section {
      text-align: center;
      margin: 20px 0;

      p {
        margin-bottom: 15px;
      }
    }
  }
}
</style>
