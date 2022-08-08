<template>
  <div id="app">
    <div class="container">
      <h1>Cifra builder</h1>

      <p>{{ $t("subtitle") }}</p>

      <!-- <p>{{ $t("message") }}</p> -->

      <div class="links">
        <img
          v-for="(language, index) in languages"
          :key="index"
          :src="language.icon"
          height="24px"
          :alt="language.alt"
          @click="changeLanguage(language.key)"
        />

        <a href="#help">{{ $t("help") }}</a>
      </div>

      <Menu />
      <router-view />

      <section id="help">
        <template v-for="(item, indexItem) in $t('details')">
          <h2 :key="keyGenerator(indexItem)">{{ item.title }}</h2>

          <template v-if="Array.isArray(item.description)">
            <ul :key="keyGenerator(indexItem)">
              <template v-for="(subitem, indexSubitem) in item.description">
                <li :key="keyGenerator(indexSubitem)">{{ subitem }}</li>
              </template>
            </ul>
          </template>
          <template v-else>
            <p :key="keyGenerator(indexItem)">{{ item.description }}</p>
          </template>
        </template>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      languages: [
        {
          icon: require("@/assets/flags/brazil.png"),
          alt: "Idioma em português",
          key: "ptBR",
        },
        {
          icon: require("@/assets/flags/united-states.png"),
          alt: "Idioma em inglês",
          key: "enUS",
        },
      ],
    };
  },

  methods: {
    changeLanguage(language) {
      localStorage.setItem("lang", language);

      document.location.reload();
    },

    keyGenerator(index) {
      return index + 1 + (Math.random() * 100).toFixed(0);
    },
  },
};
</script>

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

    > .links {
      position: absolute;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 100;
      top: 20px;
      right: 68px;

      @include tablet {
        margin: 0;
        right: 5px;
      }

      img {
        cursor: pointer;
      }

      a {
        display: block;
        text-align: center;
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
