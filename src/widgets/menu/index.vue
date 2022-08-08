<template>
  <div class="menu">
    <div class="menu__buttons-song">
      <button @click="add('tab')">{{ $t("components.menu.tab") }}</button>
      <button @click="add('textField')">
        {{ $t("components.menu.text") }}
      </button>
      <button @click="add('verse')">{{ $t("components.menu.verse") }}</button>
    </div>
    <div class="menu__buttons-downloads">
      <!-- <button @click="download('tab.txt')">Download TXT</button> -->
      <button @click="generateReport">
        <img src="@/assets/icons/download.png" alt="Mudar afinação" />
      </button>
    </div>

    <vue-html2pdf
      ref="html2Pdf"
      :show-layout="false"
      :enable-download="false"
      :preview-modal="true"
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

export default {
  name: "Menu",

  components: {
    VueHtml2pdf,
  },

  methods: {
    ...mapActions("songStructure", ["addContent"]),

    add(component) {
      this.addContent(component);
    },

    generateReport() {
      const cifra = document.getElementById("song");
      const pdf = document.getElementById("pdf-content");

      pdf.innerHTML = cifra.innerHTML;

      const dashes = pdf.querySelectorAll(".verse-dash");
      const inputs = pdf.querySelectorAll(".verse-input");
      const buttons = pdf.querySelectorAll("button");
      const spans = pdf.querySelectorAll("span");
      const tunningBtn = pdf.querySelector("#changeTuningBtn");

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

      tunningBtn.style.display = "none";

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
    &-song {
      display: flex;
      justify-content: center;

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
        max-width: 130px;
        border: none;
        background: $secondary;
        color: $primary;
        padding: 8px 20px;
        font-family: "title";
        box-shadow: 0px 1px 6px 0px rgb(0 0 0 / 50%);
        border-radius: 0 0 20px 20px;

        // &:first-child {
        //   border-radius: 0 0 0 20px;
        // }

        // &:last-child {
        //   border-radius: 0 0 20px 0;
        // }
      }
    }
  }
}
</style>
