<template>
  <div id="app">
    <div class="container">
      <h1>Cifra builder</h1>

      <p>Um construtor de cifras, tablaturas e anotações.</p>

      <a href="#help">Saiba mais</a>

      <Menu />
      <router-view />

      <section id="help">
        <h2>Feito para iniciantes e avançados</h2>
        <p>
          O Cifra Builder pode ser utilizado por todos os níveis de
          guitarristas, baixistas ou qualquer outro instumento de corda que você
          toque.
        </p>

        <h2>Exporte em PDF</h2>
        <p>
          Com a exportação em PDF você pode salvar sua cifra e levá-la para
          qualquer lugar.
        </p>

        <h2>Futuras implementações</h2>
        <ul>
          <li>
            Funcionalidade de login, onde você poderá deixar suas tabs salvas e
            concluí-las em outra ocasião.
          </li>

          <li>Multiplos idiomas</li>

          <li>Baixos de guitarras com mais cordas</li>

          <li>Outros instrumentos de corda</li>

          <li>Melhoria do uso de atalhos</li>
        </ul>

        <h2>Fácil de usar</h2>
        <p>
          Com os alhos e a navegação, rapidamente é possível construir uma cifra
          completa.
        </p>
        <p>Clique em qualquer parte abaixo para iniciar suas anotações.</p>

        <h2>Fale conosco!</h2>
        <p>Viu algum bug? Tem alguma sugestão?</p>
      </section>
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
    position: relative;

    @include tablet {
      padding: 0;
    }

    > h1 {
      text-align: center;
      background: $white;
      padding: 20px 0;
      padding-bottom: 0;
      margin-bottom: 20px;
    }

    > p {
      text-align: center;
      margin: 20px 0;
    }

    > a {
      display: block;
      text-align: center;
      margin: 20px 0;
      position: absolute;
      z-index: 100;
      top: 0px;
      right: 68px;

      @include tablet {
        margin: 0;
        top: 20px;
        right: 16px;
      }
    }

    #help {
      // text-align: center;
      margin: 20px 0;

      p {
        margin: 15px 0;
      }

      ul {
        margin: 15px 0;
      }

      @include tablet {
        padding: 0 30px;
      }
    }
  }
}
</style>
