<template>
  <div id="app">
    <div class="container">
      <h1>Tab Builder</h1>

      <p>{{ $t("subtitle") }}</p>

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

      <TheMenu />
      <TheToast />
      <router-view />

      <section id="help">
        <!-- $t NÃO DEVOLVE ARRAYS NO VUE-I18N 9+: $tm PEGA A ESTRUTURA, $rt RENDERIZA -->
        <template v-for="(item, indexItem) in $tm('details')" :key="indexItem">
          <h2>{{ $rt(item.title) }}</h2>

          <ul v-if="Array.isArray(item.description)">
            <li
              v-for="(subitem, indexSubitem) in item.description"
              :key="indexSubitem"
            >
              {{ $rt(subitem) }}
            </li>
          </ul>
          <p v-else>
            {{ $rt(item.description) }}
          </p>
        </template>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import { setLanguage, type Language } from "@/core/plugins/i18n";
import { useHistoryStore } from "@/stores/history";
import brazilFlag from "@/assets/flags/brazil.png";
import unitedStatesFlag from "@/assets/flags/united-states.png";

export default defineComponent({
  name: "App",

  data() {
    return {
      languages: [
        {
          icon: brazilFlag,
          alt: "Português (Brasil)",
          key: "ptBR" as Language,
        },
        {
          icon: unitedStatesFlag,
          alt: "English",
          key: "enUS" as Language,
        },
      ],
    };
  },

  mounted() {
    window.addEventListener("keydown", this.handleShortcuts);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleShortcuts);
  },

  methods: {
    ...mapActions(useHistoryStore, ["undo", "redo"]),

    changeLanguage(language: Language) {
      setLanguage(language);
    },

    // Ctrl/Cmd+Z DESFAZ, Ctrl/Cmd+Shift+Z OU Ctrl+Y REFAZ, NA MÚSICA INTEIRA.
    // CAMPOS <input> (EX: AFINAÇÃO) MANTÊM O DESFAZER DO NAVEGADOR
    handleShortcuts(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
      const target = event.target as HTMLElement;

      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const key = event.key.toLowerCase();
      const redo = (key == "z" && event.shiftKey) || key == "y";

      if (key != "z" && !redo) return;

      event.preventDefault();
      if (redo) this.redo();
      else this.undo();
    },
  },
});
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
