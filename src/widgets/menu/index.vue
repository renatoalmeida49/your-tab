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

    <!-- LAYOUT FORA DA TELA, COM A LARGURA FIXA USADA PARA GERAR O PDF -->
    <section class="menu__pdf-layout">
      <div class="menu__pdf-page" ref="pdfContent">
        <div id="pdf-content"></div>
      </div>
    </section>

    <transition name="menu__fade">
      <section class="menu__pdf-preview" v-if="pdfFile">
        <button @click="closePreview">&times;</button>

        <iframe :src="pdfFile" width="100%" height="100%" />
      </section>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import { useSongStore } from "@/stores/song";
import type { PartType } from "@/types/song";

const pdfOptions = {
  margin: 0,
  filename: "tab-pdf.pdf",
  image: { type: "jpeg", quality: 0.98 },
  enableLinks: false,
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  // NÃO CORTA UMA PARTE DA MÚSICA ENTRE DUAS PÁGINAS
  pagebreak: { mode: ["avoid-all"] },
};

export default defineComponent({
  name: "TheMenu",

  data() {
    return {
      // URL blob: DO PDF GERADO, MOSTRADO NA PRÉ-VISUALIZAÇÃO
      pdfFile: null as string | null,
    };
  },

  methods: {
    ...mapActions(useSongStore, ["addContent", "newSong"]),

    startNewSong() {
      if (window.confirm(this.$t("components.menu.newSongConfirm"))) {
        this.newSong();
      }
    },

    add(component: PartType) {
      this.addContent(component);
    },

    async generateReport() {
      const cifra = document.getElementById("song");
      const pdf = document.getElementById("pdf-content");

      if (!cifra || !pdf) return;

      pdf.innerHTML = cifra.innerHTML;

      const buttons = pdf.querySelectorAll("button");
      const spans = pdf.querySelectorAll("span");

      buttons.forEach((item) => {
        item.style.display = "none";
      });

      spans.forEach((item) => {
        item.style.border = "none";
      });

      // CARREGA SÓ NO CLIQUE: html2pdf.js (html2canvas + jsPDF) É PESADO
      const { default: html2pdf } = await import("html2pdf.js");

      this.pdfFile = await html2pdf()
        .set(pdfOptions)
        .from(this.$refs.pdfContent as HTMLElement)
        .output("bloburl");
    },

    closePreview() {
      if (this.pdfFile) URL.revokeObjectURL(this.pdfFile);
      this.pdfFile = null;
    },
  },
});
</script>

<style lang="scss">
#pdf-content {
  margin: 40px;
  font-family: monospace;
}

.menu__pdf-layout {
  position: fixed;
  top: 0;
  left: -100vw;
  z-index: -9999;
}

.menu__pdf-page {
  width: 800px;
  background: $white;
}

.menu__pdf-preview {
  position: fixed;
  width: 65%;
  min-width: 600px;
  height: 80vh;
  top: 100px;
  left: 50%;
  z-index: 9999;
  transform: translateX(-50%);
  border-radius: 5px;
  box-shadow: 0px 0px 10px #00000048;

  @include tablet {
    width: 95%;
    min-width: 0;
  }

  button {
    position: absolute;
    top: -20px;
    left: -15px;
    width: 35px;
    height: 35px;
    background: #555;
    border: 0;
    box-shadow: 0px 0px 10px #00000048;
    border-radius: 50%;
    color: $white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
  }

  iframe {
    border: 0;
  }
}

.menu__fade-enter-active,
.menu__fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.menu__fade-enter-from,
.menu__fade-leave-to {
  opacity: 0;
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
