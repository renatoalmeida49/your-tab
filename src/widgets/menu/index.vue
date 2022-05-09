<template>
  <div class="menu">
    <div class="menu__buttons-song">
      <button @click="add('tab')">Tab</button>
      <button @click="add('textField')">Texto</button>
      <button @click="add('verse')">Verso</button>
    </div>
    <div class="menu__buttons-downloads">
      <button @click="download('tab.txt')">Download TXT</button>
      <button @click="generateReport">Download PDF</button>
    </div>

    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :enable-download="true"
      :preview-modal="false"
      filename="tab-pdf"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="800px"
      :paginate-elements-by-height="1100"
      :pdf-quality="2"
    >
      <section class="pdf-content" slot="pdf-content">
        <div id="pdf-content"></div>
      </section>
    </vue-html2pdf>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import VueHtml2pdf from "vue-html2pdf";
import TabHeader from "@/components/tab-header";
import Tab from "@/components/tab";
import Verse from "@/components/verse";
import TextField from "@/components/text-field";
import string from "@/config/string";

const componentList = {
  tabHeader: TabHeader,
  tab: Tab,
  verse: Verse,
  textField: TextField,
};

export default {
  name: "Menu",

  components: {
    VueHtml2pdf,
  },

  mounted() {
    this.addContent({
      component: componentList.tabHeader,
      info: {},
    });
  },

  computed: {
    ...mapGetters("instrument", ["instrument"]),
  },

  methods: {
    ...mapActions("songStructure", ["addContent"]),

    add(component) {
      this.addContent({
        component: componentList[component],
        info: this.getComponent(component),
      });
    },

    getComponent(component) {
      switch (component) {
        case "tab":
          return this.defaultTab();
        case "verse":
          return this.defaultVerse();
        case "textField":
          return this.defaultText();
      }
    },

    defaultTab() {
      return this.instrument.map((item) => {
        return {
          note: item,
          string: string(),
        };
      });
    },

    defaultVerse() {
      return {
        chords: string(),
        verse: "",
      };
    },

    defaultText() {
      return {
        text: "",
      };
    },

    generateReport() {
      const cifra = document.getElementById("song");
      const pdf = document.getElementById("pdf-content");

      pdf.innerHTML = cifra.innerHTML;

      const dashes = pdf.querySelectorAll(".verse-dash");
      const inputs = pdf.querySelectorAll(".verse-input");
      const buttons = pdf.querySelectorAll("button");
      const spans = pdf.querySelectorAll("span");

      dashes.forEach((item) => {
        item.style.visibility = "hidden";
      });

      inputs.forEach((item) => {
        item.style.display = "none";
      });

      buttons.forEach((item) => {
        item.style.display = "none";
      });

      spans.forEach((item) => {
        item.style.border = "none";
      });

      this.$refs.html2Pdf.generatePdf();
    },

    download(filename) {
      // let element = document.createElement("a");
      let content = document.getElementById("song");
      const teste = content.innerText.replaceAll("|\n", "|");

      const blob = new Blob([teste], { type: "text/txt" });

      const elem = window.document.createElement("a");

      elem.href = window.URL.createObjectURL(blob);

      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    },
  },
};
</script>

<style lang="scss">
#pdf-content {
  margin: 40px;
  font-family: monospace;
}

.menu {
  text-align: center;
  position: sticky;
  z-index: 100;
  top: 0px;

  &__buttons {
    text-align: center;

    &-song {
      button {
        cursor: pointer;
        font-size: 20px;
        width: 100%;
        max-width: 150px;
        border: none;
        background: $primary;
        color: $secondary;
        padding: 8px 20px;
        font-family: "title";
        box-shadow: 0px 1px 6px 0px rgb(0 0 0 / 50%);

        &:first-child {
          border-radius: 0 0 0 20px;
        }

        &:last-child {
          border-radius: 0 0 20px 0;
        }
      }
    }

    &-downloads {
      button {
        cursor: pointer;
        font-size: 14px;
        width: 100%;
        max-width: 100px;
        border: none;
        background: $secondary;
        color: $primary;
        padding: 8px 20px;
        font-family: "title";
        box-shadow: 0px 1px 6px 0px rgb(0 0 0 / 50%);

        &:first-child {
          border-radius: 0 0 0 20px;
        }

        &:last-child {
          border-radius: 0 0 20px 0;
        }
      }
    }
  }
}
</style>
