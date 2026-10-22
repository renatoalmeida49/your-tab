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
        class="app-bar__palette"
        :title="$t('components.menu.palette')"
        :aria-label="$t('components.menu.palette')"
        @click="setPaletteOpen(true)"
      >
        <Command :size="18" />
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
      <TheButton
        variant="secondary"
        class="app-bar__stage"
        :title="$t('components.menu.stage')"
        @click="setStageOpen(true)"
      >
        <MonitorPlay :size="16" />
        <span class="app-bar__label">{{ $t("components.menu.stage") }}</span>
      </TheButton>
      <TheButton
        variant="secondary"
        class="app-bar__save"
        :class="{ 'app-bar__save--saved': saveState == 'saved' }"
        :disabled="saveState == 'saving'"
        :title="$t('components.menu.saveHint')"
        @click="save"
      >
        <component
          :is="saveIcons[saveState]"
          :size="16"
          :class="{ 'app-bar__spinner': saveState == 'saving' }"
        />
        <span class="app-bar__label">
          {{ $t(`components.menu.${saveState}`) }}
        </span>
      </TheButton>
      <TheButton class="app-bar__export" @click="setExportOpen(true)">
        <Download :size="16" />
        <span class="app-bar__label">
          {{ $t("components.menu.export") }}
        </span>
      </TheButton>

      <AccountMenu />
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import {
  CircleHelp,
  CloudCheck,
  CloudUpload,
  Command,
  Download,
  LoaderCircle,
  FilePlus2,
  Monitor,
  MonitorPlay,
  Moon,
  Redo2,
  Sun,
  Undo2,
} from "lucide-vue-next";
import { partOptions } from "@/core/config/parts";
import { startNewSong } from "@/stores/commands";
import { useHistoryStore } from "@/stores/history";
import { useLibraryStore } from "@/stores/library";
import { useSongStore } from "@/stores/song";
import { useThemeStore, type Theme } from "@/stores/theme";
import { useUiStore } from "@/stores/ui";
import type { PartType } from "@/types/song";
import AccountMenu from "./account-menu.vue";
import LanguageMenu from "./language-menu.vue";
import TheLogo from "./logo.vue";

const themeIcons: Record<Theme, unknown> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

type SaveState = "save" | "saving" | "saved";

const saveIcons: Record<SaveState, unknown> = {
  save: CloudUpload,
  saving: LoaderCircle,
  saved: CloudCheck,
};

export default defineComponent({
  name: "TheAppBar",

  components: {
    AccountMenu,
    CircleHelp,
    Command,
    Download,
    FilePlus2,
    LanguageMenu,
    MonitorPlay,
    Redo2,
    TheLogo,
    Undo2,
  },

  data() {
    return {
      parts: partOptions,
      saveIcons,
    };
  },

  computed: {
    ...mapState(useHistoryStore, {
      canUndo: (store) => store.past.length > 0,
      canRedo: (store) => store.future.length > 0,
    }),
    ...mapState(useThemeStore, ["theme"]),
    ...mapState(useLibraryStore, ["saving", "cipherId", "dirty"]),

    // "SALVO" SÓ QUANDO A MÚSICA DO EDITOR É IGUAL À DO ACERVO
    saveState(): SaveState {
      if (this.saving) return "saving";

      return this.cipherId && !this.dirty ? "saved" : "save";
    },

    themeIcon() {
      return themeIcons[this.theme];
    },
  },

  methods: {
    ...mapActions(useSongStore, ["addContent"]),
    ...mapActions(useLibraryStore, ["save"]),
    ...mapActions(useHistoryStore, ["undo", "redo"]),
    ...mapActions(useThemeStore, ["cycleTheme"]),
    ...mapActions(useUiStore, [
      "setHelpOpen",
      "setExportOpen",
      "setStageOpen",
      "setPaletteOpen",
    ]),
    startNewSong,

    add(component: PartType) {
      this.addContent(component);
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

    @media (max-width: 1400px) {
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

  // NO CELULAR CABEM SÓ OS ÍCONES ESSENCIAIS (A PALETA É DE TECLADO)
  &__divider,
  &__palette.the-button {
    @include tablet {
      display: none;
    }
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

  // TELAS MÉDIAS: "NOVA MÚSICA" E "MODO PALCO" SÓ COM ÍCONE (TÊM title)
  &__new-song.the-button,
  &__stage.the-button {
    @media (max-width: 1400px) {
      padding: 0;
      aspect-ratio: 1;

      .app-bar__label {
        display: none;
      }
    }
  }

  &__save--saved.the-button {
    color: var(--color-text-muted);
  }

  &__spinner {
    animation: export-spin 0.9s linear infinite;
  }

  &__new-song.the-button,
  &__stage.the-button,
  &__save.the-button,
  &__export.the-button {
    @include tablet {
      padding: 0;
      aspect-ratio: 1;
    }
  }
}
</style>
