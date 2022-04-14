<template>
  <div class="home" :key="render">
    <div class="home__buttons">
      <div class="home__buttons-song">
        <button @click="add('tab')">Tab</button>
        <button @click="add('text')">Texto</button>
        <button @click="add('verse')">Verso</button>
      </div>
      <div class="home__buttons-downloads">
        <button @click="download('tab.txt')">Download TXT</button>
        <button @click="generateReport">Download PDF</button>
      </div>
    </div>

    <div id="song" class="home__song">
      <Draggable :list="songStructure">
        <template v-for="(part, index) in songStructure">
          <SongContent
            :key="index"
            :contentIndex="index"
            @removeContent="removeContent"
          >
            <component
              :is="part.component"
              :info="part.info"
              :songIndex="index"
              @changeContent="updateContent"
            ></component>
          </SongContent>
        </template>
      </Draggable>
    </div>

    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :enable-download="true"
      :preview-modal="false"
      filename="tab-pdf"
      pdf-format="a4"
      pdf-orientation="portrait"
      :pdf-content-width="widthPDF"
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
import Draggable from "vuedraggable";
import VueHtml2pdf from "vue-html2pdf";
import Tab from "@/components/tab";
import Verse from "@/components/verse";
import Text from "@/components/text";

const componentList = {
  tab: Tab,
  verse: Verse,
  text: Text,
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
  name: "Home",

  components: {
    VueHtml2pdf,
    Draggable,
  },

  data() {
    return {
      render: 1,
      songStructure: [],
    };
  },

  computed: {
    widthPDF() {
      return "800px";
    },
  },

  methods: {
    add(component) {
      this.songStructure.push({
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
        case "text":
          return defaultText();
      }
    },

    removeContent(payload) {
      this.songStructure.splice(payload, 1);
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

    forceRender() {
      this.render++;
    },

    updateContent(payload) {
      this.songStructure[payload.index].info = payload.content;

      this.forceRender();
    },
  },
};
</script>

<style lang="scss">
#pdf-content {
  margin: 40px;
}
.home {
  background: $white;
  min-height: calc(100vh - 77px);
  padding: 0 60px;
  position: relative;

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
