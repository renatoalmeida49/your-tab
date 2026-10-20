<template>
  <header class="app-bar">
    <div class="app-bar__brand">
      <TheLogo class="app-bar__logo" />
      <div>
        <strong class="app-bar__name">Tab Builder</strong>
        <span class="app-bar__tagline">{{ $t("subtitle") }}</span>
      </div>
    </div>

    <div
      class="app-bar__add"
      role="group"
      :aria-label="$t('components.menu.add')"
    >
      <TheButton
        v-for="part in parts"
        :key="part.type"
        variant="ghost"
        :class="`app-bar__add-${part.type}`"
        @click="add(part.type)"
      >
        <component :is="part.icon" :size="16" />
        {{ $t(part.label) }}
      </TheButton>
    </div>

    <div class="app-bar__actions">
      <TheButton
        variant="ghost"
        icon
        class="app-bar__undo"
        :disabled="!canUndo"
        :title="$t('components.menu.undo')"
        :aria-label="$t('components.menu.undo')"
        @click="undo"
      >
        <Undo2 :size="18" />
      </TheButton>
      <TheButton
        variant="ghost"
        icon
        class="app-bar__redo"
        :disabled="!canRedo"
        :title="$t('components.menu.redo')"
        :aria-label="$t('components.menu.redo')"
        @click="redo"
      >
        <Redo2 :size="18" />
      </TheButton>

      <span class="app-bar__divider" />

      <LanguageMenu />

      <TheButton
        variant="ghost"
        icon
        class="app-bar__theme"
        :title="$t(`components.theme.${theme}`)"
        :aria-label="$t('components.theme.toggle')"
        @click="cycleTheme"
      >
        <component :is="themeIcon" :size="18" />
      </TheButton>

      <TheButton
        variant="ghost"
        icon
        class="app-bar__help"
        :title="$t('components.menu.help')"
        :aria-label="$t('components.menu.help')"
        @click="setHelpOpen(true)"
      >
        <CircleHelp :size="18" />
      </TheButton>

      <span class="app-bar__divider" />

      <TheButton
        variant="secondary"
        class="app-bar__new-song"
        @click="startNewSong"
      >
        <FilePlus2 :size="16" />
        <span class="app-bar__label">{{ $t("components.menu.newSong") }}</span>
      </TheButton>
      <TheButton class="app-bar__export" @click="generateReport">
        <Download :size="16" />
        <span class="app-bar__label">
          {{ $t("components.menu.downloadPdf") }}
        </span>
      </TheButton>
    </div>

    <!-- LAYOUT FORA DA TELA, COM A LARGURA FIXA USADA PARA GERAR O PDF -->
    <section class="app-bar__pdf-layout">
      <div class="app-bar__pdf-page" ref="pdfContent">
        <div id="pdf-content"></div>
      </div>
    </section>

    <transition name="app-bar__fade">
      <section class="app-bar__pdf-preview" v-if="pdfFile">
        <button :aria-label="$t('common.close')" @click="closePreview">
          <X :size="18" />
        </button>

        <iframe :src="pdfFile" width="100%" height="100%" />
      </section>
    </transition>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import {
  CircleHelp,
  Download,
  FilePlus2,
  Guitar,
  Monitor,
  Moon,
  Music,
  Redo2,
  Sun,
  Type,
  Undo2,
  X,
} from "lucide-vue-next";
import { useConfirmStore } from "@/stores/confirm";
import { useHistoryStore } from "@/stores/history";
import { useSongStore } from "@/stores/song";
import { useThemeStore, type Theme } from "@/stores/theme";
import { useUiStore } from "@/stores/ui";
import type { PartType } from "@/types/song";
import LanguageMenu from "./language-menu.vue";
import TheLogo from "./logo.vue";

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

// FORA DO data(): COMPONENTES NÃO DEVEM VIRAR OBJETOS REATIVOS NO VUE 3
const parts: { type: PartType; label: string; icon: unknown }[] = [
  { type: "textField", label: "components.menu.text", icon: Type },
  { type: "verse", label: "components.menu.verse", icon: Music },
  { type: "tab", label: "components.menu.tab", icon: Guitar },
];

const themeIcons: Record<Theme, unknown> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export default defineComponent({
  name: "TheAppBar",

  components: {
    CircleHelp,
    Download,
    FilePlus2,
    LanguageMenu,
    Redo2,
    TheLogo,
    Undo2,
    X,
  },

  data() {
    return {
      parts,
      // URL blob: DO PDF GERADO, MOSTRADO NA PRÉ-VISUALIZAÇÃO
      pdfFile: null as string | null,
    };
  },

  computed: {
    ...mapState(useHistoryStore, {
      canUndo: (store) => store.past.length > 0,
      canRedo: (store) => store.future.length > 0,
    }),
    ...mapState(useThemeStore, ["theme"]),

    themeIcon() {
      return themeIcons[this.theme];
    },
  },

  methods: {
    ...mapActions(useSongStore, ["addContent", "newSong"]),
    ...mapActions(useHistoryStore, ["undo", "redo"]),
    ...mapActions(useThemeStore, ["cycleTheme"]),
    ...mapActions(useUiStore, ["setHelpOpen"]),
    ...mapActions(useConfirmStore, ["ask"]),

    async startNewSong() {
      const confirmed = await this.ask({
        message: "components.menu.newSongConfirm",
        confirmLabel: "components.menu.newSongConfirmAction",
        danger: true,
      });

      if (confirmed) this.newSong();
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
.app-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-4);
  padding: var(--space-2) var(--space-5);
  background: color-mix(in srgb, var(--color-surface) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);

  @include tablet {
    padding: var(--space-2) var(--space-3);
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-right: auto;
    line-height: 1.2;
  }

  &__logo {
    flex: none;
  }

  &__name {
    display: block;
    font-size: var(--text-md);
  }

  &__tagline {
    display: block;
    color: var(--color-text-muted);
    font-size: var(--text-xs);

    @media (max-width: 1100px) {
      display: none;
    }
  }

  &__add {
    display: flex;
    gap: var(--space-1);
    padding: 3px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);

    .the-button {
      height: 30px;
    }

    // NO CELULAR VAI PARA UMA LINHA PRÓPRIA, OCUPANDO A LARGURA
    @include tablet {
      order: 3;
      width: 100%;

      .the-button {
        flex: 1;
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  &__divider {
    width: 1px;
    height: 20px;
    margin: 0 var(--space-1);
    background: var(--color-border);
  }

  &__label {
    @include tablet {
      display: none;
    }
  }

  &__new-song,
  &__export {
    @include tablet {
      padding: 0;
      aspect-ratio: 1;
    }
  }
}

#pdf-content {
  margin: 40px;
}

.app-bar__pdf-layout {
  position: fixed;
  top: 0;
  left: -100vw;
  z-index: -9999;
}

.app-bar__pdf-page {
  width: 800px;
  background: var(--color-surface);
  color: var(--color-text);
}

.app-bar__pdf-preview {
  position: fixed;
  width: 65%;
  min-width: 600px;
  height: 80vh;
  top: 100px;
  left: 50%;
  z-index: 9999;
  transform: translateX(-50%);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);

  @include tablet {
    width: 95%;
    min-width: 0;
  }

  button {
    position: absolute;
    top: -16px;
    left: -16px;
    width: 34px;
    height: 34px;
    background: var(--color-inverse);
    border: 0;
    box-shadow: var(--shadow-md);
    border-radius: 50%;
    color: var(--color-inverse-text);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  iframe {
    border: 0;
    border-radius: var(--radius-md);
  }
}

.app-bar__fade-enter-active,
.app-bar__fade-leave-active {
  transition: opacity 0.3s ease-in;
}

.app-bar__fade-enter-from,
.app-bar__fade-leave-to {
  opacity: 0;
}
</style>
