<template>
  <div class="home" :key="render">
    <div id="song" class="home__song">
      <Draggable :list="song">
        <template v-for="(part, index) in song">
          <SongContent :key="index" :contentIndex="index">
            <component
              :is="part.component"
              :info="part.info"
              :songIndex="index"
            ></component>
          </SongContent>
        </template>
      </Draggable>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import Draggable from "vuedraggable";

export default {
  name: "Home",

  components: {
    Draggable,
  },

  data() {
    return {
      render: 1,
      songStructure: [],
    };
  },

  computed: {
    ...mapGetters("songStructure", ["song"]),

    widthPDF() {
      return "800px";
    },
  },

  methods: {
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
  },
};
</script>

<style lang="scss">
#pdf-content {
  margin: 40px;
}
.home {
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
