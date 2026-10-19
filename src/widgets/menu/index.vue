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
      <button class="menu__new-song" @click="startNewSong">
        {{ $t("components.menu.newSong") }}
      </button>
      <button @click="generateReport">
        <img
          src="@/assets/icons/download.png"
          :alt="$t('components.menu.downloadPdf')"
        />
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
    ...mapActions("songStructure", ["addContent", "newSong"]),

    startNewSong() {
      if (window.confirm(this.$t("components.menu.newSongConfirm"))) {
        this.newSong();
      }
    },

    add(component) {
      this.addContent(component);
    },

    generateReport() {
      const cifra = document.getElementById("song");
      const pdf = document.getElementById("pdf-content");

      pdf.innerHTML = cifra.innerHTML;

      const buttons = pdf.querySelectorAll("button");
      const spans = pdf.querySelectorAll("span");
      const tuningBtn = pdf.querySelector("#changeTuningBtn");

      buttons.forEach((item) => {
        item.style.display = "none";
      });

      spans.forEach((item) => {
        item.style.border = "none";
      });

      tuningBtn.style.display = "none";

      this.$refs.html2Pdf.generatePdf();
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
      display: flex;
      justify-content: center;
      gap: 10px;

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
      }
    }
  }
}
</style>
