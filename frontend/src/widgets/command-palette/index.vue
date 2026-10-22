<template>
  <DialogRoot :open="paletteOpen" @update:open="setPaletteOpen">
    <DialogPortal>
      <DialogOverlay class="modal__overlay" />

      <DialogContent class="palette" :aria-describedby="undefined">
        <DialogTitle class="palette__title">
          {{ $t("components.palette.title") }}
        </DialogTitle>

        <div class="palette__search">
          <SearchIcon :size="18" />
          <input
            ref="input"
            v-model="query"
            class="palette__input"
            type="text"
            role="combobox"
            aria-controls="palette-list"
            aria-expanded="true"
            :aria-activedescendant="active ? `palette-${active.id}` : undefined"
            :placeholder="$t('components.palette.placeholder')"
            @keydown="navigate"
          />
        </div>

        <ul id="palette-list" class="palette__list" role="listbox">
          <li
            v-for="(command, index) in filtered"
            :id="`palette-${command.id}`"
            :key="command.id"
            class="palette__item"
            :class="{ 'palette__item--active': index == selected }"
            role="option"
            :aria-selected="index == selected"
            :data-command="command.id"
            @mouseenter="selected = index"
            @click="run(command)"
          >
            <component :is="command.icon" :size="16" />
            <span class="palette__label">{{ command.label }}</span>
            <kbd v-if="command.shortcut">{{ command.shortcut }}</kbd>
          </li>

          <li v-if="!filtered.length" class="palette__empty">
            {{ $t("components.palette.empty") }}
          </li>
        </ul>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script lang="ts">
import { defineComponent, markRaw, type Component } from "vue";
import { mapActions, mapState } from "pinia";
import {
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import {
  CircleHelp,
  CloudUpload,
  Download,
  FileJson,
  FolderOpen,
  FilePlus2,
  Languages,
  LibraryBig,
  LogIn,
  LogOut,
  Minus,
  MonitorPlay,
  Plus,
  Redo2,
  Search,
  SunMoon,
  Undo2,
} from "lucide-vue-next";
import { partOptions } from "@/core/config/parts";
import { setLanguage } from "@/core/plugins/i18n";
import { useAuthStore } from "@/stores/auth";
import {
  downloadSongFile,
  openSongFile,
  startNewSong,
} from "@/stores/commands";
import { useHistoryStore } from "@/stores/history";
import { useLibraryStore } from "@/stores/library";
import { useSongStore } from "@/stores/song";
import { useThemeStore } from "@/stores/theme";
import { useUiStore } from "@/stores/ui";

interface Command {
  id: string;
  label: string;
  icon: Component;
  shortcut?: string;
  run: () => void;
}

// SEM ACENTO E SEM CAIXA: "musica" ACHA "Nova música"
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default defineComponent({
  name: "TheCommandPalette",

  components: {
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    SearchIcon: Search,
  },

  data() {
    return {
      query: "",
      selected: 0,
    };
  },

  computed: {
    ...mapState(useUiStore, ["paletteOpen"]),

    commands(): Command[] {
      const t = (key: string) => this.$t(key);
      const ui = useUiStore();
      const song = useSongStore();
      const history = useHistoryStore();
      const auth = useAuthStore();
      const library = useLibraryStore();

      // ACERVO PARA QUEM ESTÁ LOGADO; "ENTRAR" PARA VISITANTE
      const account: Command[] = auth.user
        ? [
            {
              id: "library",
              label: t("components.palette.library"),
              icon: markRaw(LibraryBig),
              run: () => ui.setLibraryOpen(true),
            },
            {
              id: "logout",
              label: t("components.palette.logout"),
              icon: markRaw(LogOut),
              run: () => auth.logout(),
            },
          ]
        : [
            {
              id: "login",
              label: t("components.palette.login"),
              icon: markRaw(LogIn),
              run: () => ui.setLoginOpen(true),
            },
          ];

      return [
        ...partOptions.map((option) => ({
          id: `add-${option.type}`,
          label: `${t("components.palette.add")}: ${t(option.label)}`,
          icon: option.icon,
          run: () => song.addContent(option.type),
        })),
        {
          id: "transpose-up",
          label: t("components.tabHeader.transposeUp"),
          icon: markRaw(Plus),
          run: () => song.transpose(1),
        },
        {
          id: "transpose-down",
          label: t("components.tabHeader.transposeDown"),
          icon: markRaw(Minus),
          run: () => song.transpose(-1),
        },
        {
          id: "stage",
          label: t("components.menu.stage"),
          icon: markRaw(MonitorPlay),
          run: () => ui.setStageOpen(true),
        },
        {
          id: "export",
          label: t("components.palette.export"),
          icon: markRaw(Download),
          run: () => ui.setExportOpen(true),
        },
        {
          id: "download-song-file",
          label: t("components.songFile.downloadFile"),
          icon: markRaw(FileJson),
          run: downloadSongFile,
        },
        {
          id: "open-song-file",
          label: t("components.songFile.openFile"),
          icon: markRaw(FolderOpen),
          run: openSongFile,
        },
        {
          id: "save",
          label: t("components.palette.save"),
          icon: markRaw(CloudUpload),
          shortcut: "Ctrl+S",
          run: () => library.save(),
        },
        ...account,
        {
          id: "new-song",
          label: t("components.menu.newSong"),
          icon: markRaw(FilePlus2),
          run: startNewSong,
        },
        {
          id: "undo",
          label: t("components.palette.undo"),
          icon: markRaw(Undo2),
          shortcut: "Ctrl+Z",
          run: () => history.undo(),
        },
        {
          id: "redo",
          label: t("components.palette.redo"),
          icon: markRaw(Redo2),
          shortcut: "Ctrl+Shift+Z",
          run: () => history.redo(),
        },
        {
          id: "theme",
          label: t("components.theme.toggle"),
          icon: markRaw(SunMoon),
          run: () => useThemeStore().cycleTheme(),
        },
        {
          id: "language-ptBR",
          label: `${t("components.menu.language")}: Português (Brasil)`,
          icon: markRaw(Languages),
          run: () => setLanguage("ptBR"),
        },
        {
          id: "language-enUS",
          label: `${t("components.menu.language")}: English`,
          icon: markRaw(Languages),
          run: () => setLanguage("enUS"),
        },
        {
          id: "help",
          label: t("components.help.title"),
          icon: markRaw(CircleHelp),
          shortcut: "?",
          run: () => ui.setHelpOpen(true),
        },
      ];
    },

    filtered(): Command[] {
      const words = normalize(this.query).split(/\s+/).filter(Boolean);

      return this.commands.filter((command) => {
        const label = normalize(command.label);

        return words.every((word) => label.includes(word));
      });
    },

    active(): Command | undefined {
      return this.filtered[this.selected];
    },
  },

  watch: {
    paletteOpen(open: boolean) {
      if (!open) return;

      this.query = "";
      this.selected = 0;
    },

    query() {
      this.selected = 0;
    },
  },

  methods: {
    ...mapActions(useUiStore, ["setPaletteOpen"]),

    navigate(event: KeyboardEvent) {
      const total = this.filtered.length;

      if (event.key == "ArrowDown" || event.key == "ArrowUp") {
        event.preventDefault();
        if (!total) return;

        const step = event.key == "ArrowDown" ? 1 : -1;
        this.selected = (this.selected + step + total) % total;
        this.scrollToActive();
      }

      if (event.key == "Enter" && this.active) {
        event.preventDefault();
        this.run(this.active);
      }
    },

    scrollToActive() {
      this.$nextTick(() => {
        const id = this.active && `palette-${this.active.id}`;

        if (id)
          document.getElementById(id)?.scrollIntoView({ block: "nearest" });
      });
    },

    // FECHA ANTES DE RODAR: O COMANDO PODE ABRIR OUTRO DIÁLOGO
    run(command: Command) {
      this.setPaletteOpen(false);
      command.run();
    },
  },
});
</script>

<style lang="scss">
.palette {
  position: fixed;
  top: 15vh;
  left: 50%;
  z-index: 9999;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  width: calc(100vw - 2 * var(--space-4));
  max-width: 560px;
  max-height: 60vh;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: dropdown-in var(--duration-normal) ease-out;

  &:focus {
    outline: none;
  }

  // SÓ PARA LEITORES DE TELA
  &__title {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  &__search {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 0 var(--space-4);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
  }

  &__input {
    flex: 1;
    height: 52px;
    border: none;
    background: none;
    color: var(--color-text);
    font-size: var(--text-md);
    outline: none;

    &:focus-visible {
      outline: none;
    }
  }

  &__list {
    list-style: none;
    padding: var(--space-1);
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: 40px;
    padding: 0 var(--space-3);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    cursor: pointer;

    &--active {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }

    kbd {
      padding: 1px var(--space-2);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
    }
  }

  &__label {
    flex: 1;
  }

  &__empty {
    padding: var(--space-4);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    text-align: center;
  }
}
</style>
