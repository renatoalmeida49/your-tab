<template>
  <Modal
    v-if="exportOpen"
    :title="$t('components.export.title')"
    :showFooter="false"
    wide
    @close="close"
  >
    <div class="export">
      <div class="export__preview">
        <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          :title="$t('components.export.preview')"
        />
        <p v-else-if="failed" class="export__status export__status--error">
          {{ $t("components.export.error") }}
        </p>
        <p v-else class="export__status">
          <LoaderCircle :size="20" class="export__spinner" />
          {{ $t("components.export.generating") }}
        </p>
      </div>

      <!-- MUDAM A FOLHA ANTES DE VIRAR PDF. AS FERRAMENTAS DA BARRA DO
           VISUALIZADOR (FONTE, DESENHO...) SÃO DO NAVEGADOR E SÓ ANOTAM -->
      <div class="export__options">
        <fieldset class="export__sizes">
          <legend>{{ $t("components.export.size") }}</legend>

          <label
            v-for="size in sizes"
            :key="size"
            class="export__size"
            :title="$t(`components.export.sizeNames.${size}`)"
          >
            <input
              v-model="options.size"
              type="radio"
              name="export-size"
              :value="size"
              :aria-label="$t(`components.export.sizeNames.${size}`)"
            />
            <span aria-hidden="true">
              {{ $t(`components.export.sizes.${size}`) }}
            </span>
          </label>
        </fieldset>

        <label class="export__fit">
          <input v-model="options.fitToPage" type="checkbox" />
          {{ $t("components.export.fitToPage") }}
        </label>
      </div>

      <p v-if="note" class="export__note">{{ note }}</p>

      <form class="export__form" @submit.prevent="download">
        <label class="export__field">
          <span>{{ $t("components.export.fileName") }}</span>
          <span class="export__input">
            <input v-model="fileName" type="text" required />
            <span>.pdf</span>
          </span>
        </label>

        <TheButton type="submit" class="export__download" :disabled="!pdfUrl">
          <Download :size="16" />
          {{ $t("components.export.download") }}
        </TheButton>
      </form>

      <div class="export__song-file">
        <p>{{ $t("components.songFile.downloadHint") }}</p>
        <TheButton
          variant="secondary"
          class="export__download-file"
          @click="downloadSongFile"
        >
          <FileJson :size="16" />
          {{ $t("components.songFile.downloadFile") }}
        </TheButton>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { Download, FileJson, LoaderCircle } from "lucide-vue-next";
import {
  MIN_SCALE,
  PDF_SIZES,
  pdfFileName,
  sheetToPdf,
  type PdfOptions,
  type PdfSize,
} from "@/core/pdf";
import { downloadSongFile } from "@/stores/commands";
import { useSongStore } from "@/stores/song";
import { useUiStore } from "@/stores/ui";

export default defineComponent({
  name: "TheExport",

  components: {
    Download,
    FileJson,
    LoaderCircle,
  },

  data() {
    return {
      // URL blob: DO PDF GERADO, MOSTRADO NA PRÉ-VISUALIZAÇÃO E BAIXADO
      pdfUrl: null as string | null,
      failed: false,
      fileName: "",
      // FICAM ENTRE UMA EXPORTAÇÃO E OUTRA
      options: { size: "medium", fitToPage: false } as PdfOptions,
      sizes: Object.keys(PDF_SIZES) as PdfSize[],
      // RESULTADO DA ÚLTIMA GERAÇÃO, PARA O AVISO ABAIXO DA PRÉVIA
      scale: 1,
      onePage: true,
      // SÓ A GERAÇÃO MAIS RECENTE VALE (AS OPÇÕES MUDAM NO MEIO DE OUTRA)
      generation: 0,
    };
  },

  computed: {
    ...mapState(useUiStore, ["exportOpen"]),
    ...mapState(useSongStore, ["title", "artist"]),

    note(): string {
      if (!this.pdfUrl) return "";

      const percent = Math.round(this.scale * 100);

      if (this.options.fitToPage && !this.onePage) {
        return this.$t("components.export.notFitted", {
          percent: Math.round(MIN_SCALE * 100),
        });
      }

      if (this.options.fitToPage && this.scale < PDF_SIZES[this.options.size]) {
        return this.$t("components.export.fitted", { percent });
      }

      if (!this.onePage) return this.$t("components.export.manyPages");

      return "";
    },
  },

  watch: {
    exportOpen(open: boolean) {
      if (open) {
        this.fileName = pdfFileName(this.title, this.artist);
        this.generate();
      } else {
        this.generation++;
        this.release();
      }
    },

    options: {
      deep: true,
      handler() {
        if (this.exportOpen) this.generate();
      },
    },
  },

  beforeUnmount() {
    this.release();
  },

  methods: {
    ...mapActions(useUiStore, ["setExportOpen"]),

    async generate() {
      const sheet = document.getElementById("song");
      const generation = ++this.generation;

      this.release();
      this.failed = false;

      if (!sheet) return;

      try {
        const result = await sheetToPdf(sheet, { ...this.options });

        // FECHOU OU MUDOU AS OPÇÕES ANTES DE TERMINAR: DESCARTA
        if (generation != this.generation) return;

        this.pdfUrl = URL.createObjectURL(result.pdf);
        this.scale = result.scale;
        this.onePage = result.onePage;
      } catch {
        if (generation == this.generation) this.failed = true;
      }
    },

    download() {
      if (!this.pdfUrl) return;

      const link = document.createElement("a");

      link.href = this.pdfUrl;
      link.download = `${this.fileName.trim() || "tab"}.pdf`;
      link.click();
    },

    release() {
      if (this.pdfUrl) URL.revokeObjectURL(this.pdfUrl);
      this.pdfUrl = null;
    },

    close() {
      this.setExportOpen(false);
    },

    downloadSongFile,
  },
});
</script>

<style lang="scss">
.export {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 60vh;
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    overflow: hidden;

    iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);

    &--error {
      color: var(--color-danger);
    }
  }

  &__spinner {
    animation: export-spin 0.9s linear infinite;
  }

  &__options {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-5);
    margin-bottom: calc(-1 * var(--space-2));
  }

  &__sizes {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    border: none;

    legend {
      float: left;
      margin-right: var(--space-1);
      color: var(--color-text-muted);
      font-size: var(--text-xs);
      font-weight: 600;
    }
  }

  // RÁDIOS COM CARA DE BOTÕES AGRUPADOS (P | M | G)
  &__size {
    position: relative;

    input {
      position: absolute;
      inset: 0;
      opacity: 0;
      margin: 0;
      cursor: pointer;
    }

    span {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 28px;
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      font-weight: 600;
    }

    input:checked + span {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: var(--color-accent-contrast);
    }

    input:focus-visible + span {
      box-shadow: 0 0 0 3px var(--color-accent-soft);
    }
  }

  &__fit {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    cursor: pointer;

    input {
      accent-color: var(--color-accent);
    }
  }

  &__note {
    margin: calc(-1 * var(--space-2)) 0 0;
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  &__form {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);

    @include tablet {
      flex-direction: column;
      align-items: stretch;
    }
  }

  // O ARQUIVO .json: OUTRA FORMA DE LEVAR A MÚSICA, SEPARADA DO PDF
  &__song-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    @include tablet {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  &__input {
    display: flex;
    align-items: center;
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);
    font-weight: 400;

    &:focus-within {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-soft);
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      color: var(--color-text);
      outline: none;
    }
  }
}

// A CÓPIA DA FOLHA QUE VIRA PDF (core/pdf.ts): FORA DA TELA, LARGURA FIXA DA
// PÁGINA E SEM A MOLDURA DE "PAPEL" DO EDITOR (MESMO NO CELULAR)
.pdf-export-host {
  position: fixed;
  top: 0;
  left: -10000px;
  width: 800px;
}

.home__song.pdf-export {
  width: 800px;
  max-width: none;
  min-height: 0;
  padding: var(--space-7) 64px;
  background: var(--color-surface);
  color: var(--color-text);
  border: none;
  border-radius: 0;
  box-shadow: none;
}

@keyframes export-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .export__spinner {
    animation: none;
  }
}
</style>
