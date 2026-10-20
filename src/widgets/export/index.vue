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
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { Download, LoaderCircle } from "lucide-vue-next";
import { pdfFileName, sheetToPdf } from "@/core/pdf";
import { useSongStore } from "@/stores/song";
import { useUiStore } from "@/stores/ui";

export default defineComponent({
  name: "TheExport",

  components: {
    Download,
    LoaderCircle,
  },

  data() {
    return {
      // URL blob: DO PDF GERADO, MOSTRADO NA PRÉ-VISUALIZAÇÃO E BAIXADO
      pdfUrl: null as string | null,
      failed: false,
      fileName: "",
    };
  },

  computed: {
    ...mapState(useUiStore, ["exportOpen"]),
    ...mapState(useSongStore, ["title", "artist"]),
  },

  watch: {
    exportOpen(open: boolean) {
      if (open) this.generate();
      else this.release();
    },
  },

  beforeUnmount() {
    this.release();
  },

  methods: {
    ...mapActions(useUiStore, ["setExportOpen"]),

    async generate() {
      const sheet = document.getElementById("song");

      this.fileName = pdfFileName(this.title, this.artist);
      this.failed = false;

      if (!sheet) return;

      try {
        const pdf = await sheetToPdf(sheet);

        // FECHOU ANTES DE TERMINAR: DESCARTA
        if (this.exportOpen) this.pdfUrl = URL.createObjectURL(pdf);
      } catch {
        this.failed = true;
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

  &__form {
    display: flex;
    align-items: flex-end;
    gap: var(--space-3);

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
