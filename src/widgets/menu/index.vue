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
import { mapActions } from "vuex";
import VueHtml2pdf from "vue-html2pdf";
import Tab from "@/components/tab";
import Verse from "@/components/verse";
import TextField from "@/components/text-field";

const componentList = {
  tab: Tab,
  verse: Verse,
  textField: TextField,
};

const string = () => {
  return [
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
  ];
};

const defaultTab = () => {
  return {
    eString: {
      note: "e",
      string: string(),
    },
    BString: {
      note: "B",
      string: string(),
    },
    GString: {
      note: "G",
      string: string(),
    },
    DString: {
      note: "D",
      string: string(),
    },
    AString: {
      note: "A",
      string: string(),
    },
    EString: {
      note: "E",
      string: string(),
    },
  };
};

const chordsLine = () => {
  return [
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
    "-",
  ];
};

const defaultVerse = () => {
  return {
    chords: chordsLine(),
    verse: "",
  };
};

const defaultText = () => {
  return {
    text: "",
  };
};

export default {
  name: "Menu",

  components: {
    VueHtml2pdf,
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
          return defaultTab();
        case "verse":
          return defaultVerse();
        case "textField":
          return defaultText();
      }
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

  &__buttons {
    text-align: center;
    position: sticky;
    top: 0px;

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
