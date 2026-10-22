<template>
  <Modal
    v-if="libraryOpen"
    :title="$t('components.library.title')"
    :showFooter="false"
    wide
    @close="setLibraryOpen(false)"
  >
    <TabsRoot v-model="tab" class="library">
      <TabsList class="library__tabs">
        <TabsTrigger value="ciphers" class="library__tab library__tab-ciphers">
          <Music :size="16" />
          {{ $t("components.library.ciphers") }}
        </TabsTrigger>
        <TabsTrigger
          value="playlists"
          class="library__tab library__tab-playlists"
        >
          <ListMusic :size="16" />
          {{ $t("components.library.playlists") }}
        </TabsTrigger>
      </TabsList>

      <p v-if="loading" class="library__status">
        {{ $t("components.library.loading") }}
      </p>
      <p v-else-if="loadFailed" class="library__status">
        {{ $t("components.library.loadFailed") }}
        <TheButton size="sm" variant="secondary" @click="fetchAll">
          {{ $t("components.library.retry") }}
        </TheButton>
      </p>

      <template v-else>
        <TabsContent value="ciphers" class="library__panel">
          <label v-if="ciphers.length" class="library__search">
            <SearchIcon :size="16" />
            <input
              v-model="query"
              type="search"
              :placeholder="$t('components.library.search')"
              :aria-label="$t('components.library.search')"
            />
          </label>

          <p v-if="!ciphers.length" class="library__status">
            {{ $t("components.library.empty") }}
          </p>
          <p v-else-if="!filtered.length" class="library__status">
            {{ $t("components.library.noResults") }}
          </p>

          <ul class="library__list">
            <li
              v-for="cipher in filtered"
              :key="cipher.id"
              class="library__item library__cipher"
              :class="{ 'library__item--current': cipher.id == cipherId }"
            >
              <div class="library__info">
                <strong>{{ titleOf(cipher) }}</strong>
                <span>{{ details(cipher) }}</span>
              </div>

              <span v-if="cipher.id == cipherId" class="library__badge">
                {{ $t("components.library.current") }}
              </span>

              <div class="library__actions">
                <TheButton
                  size="sm"
                  variant="secondary"
                  class="library__open"
                  @click="openCipher(cipher.id)"
                >
                  {{ $t("components.library.open") }}
                </TheButton>

                <DropdownMenuRoot>
                  <DropdownMenuTrigger
                    class="the-button the-button--ghost the-button--sm the-button--icon library__add"
                    :aria-label="$t('components.library.addToPlaylist')"
                    :title="$t('components.library.addToPlaylist')"
                  >
                    <ListPlus :size="16" />
                  </DropdownMenuTrigger>

                  <DropdownMenuPortal>
                    <DropdownMenuContent
                      class="dropdown library__menu"
                      align="end"
                      :sideOffset="4"
                    >
                      <DropdownMenuLabel class="library__menu-label">
                        {{ $t("components.library.addToPlaylist") }}
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        v-for="playlist in playlists"
                        :key="playlist.id"
                        class="dropdown__item library__add-item"
                        @select="addToPlaylist(playlist, cipher.id)"
                      >
                        <ListMusic :size="16" />
                        {{ playlist.name }}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        v-if="!playlists.length"
                        class="dropdown__item"
                        disabled
                      >
                        {{ $t("components.library.noPlaylists") }}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenuRoot>

                <TheButton
                  size="sm"
                  variant="ghost"
                  icon
                  class="library__delete"
                  :title="$t('components.library.delete')"
                  :aria-label="$t('components.library.delete')"
                  @click="remove(cipher.id)"
                >
                  <Trash2 :size="16" />
                </TheButton>
              </div>
            </li>
          </ul>
        </TabsContent>

        <TabsContent value="playlists" class="library__panel">
          <form class="library__create" @submit.prevent="create">
            <input
              v-model="newName"
              type="text"
              maxlength="200"
              :placeholder="$t('components.library.newPlaylist')"
              :aria-label="$t('components.library.newPlaylist')"
            />
            <TheButton type="submit" size="sm" :disabled="!newName.trim()">
              <Plus :size="16" />
              {{ $t("components.library.createPlaylist") }}
            </TheButton>
          </form>

          <p v-if="!playlists.length" class="library__status">
            {{ $t("components.library.playlistsEmpty") }}
          </p>

          <section
            v-for="playlist in playlists"
            :key="playlist.id"
            class="library__playlist"
          >
            <header class="library__playlist-header">
              <form
                v-if="editingId == playlist.id"
                class="library__rename"
                @submit.prevent="rename(playlist)"
              >
                <input
                  ref="renameInput"
                  v-model="editingName"
                  type="text"
                  maxlength="200"
                  :aria-label="$t('components.library.rename')"
                  @blur="rename(playlist)"
                  @keydown.esc.stop="editingId = null"
                />
              </form>
              <div v-else class="library__info">
                <strong>{{ playlist.name }}</strong>
                <span>
                  {{
                    $t("components.library.songs", playlist.cipherIds.length)
                  }}
                </span>
              </div>

              <div class="library__actions">
                <TheButton
                  size="sm"
                  variant="ghost"
                  icon
                  class="library__rename-button"
                  :title="$t('components.library.rename')"
                  :aria-label="$t('components.library.rename')"
                  @click="startRename(playlist)"
                >
                  <Pencil :size="16" />
                </TheButton>
                <TheButton
                  size="sm"
                  variant="ghost"
                  icon
                  class="library__delete-playlist"
                  :title="$t('components.library.deletePlaylist')"
                  :aria-label="$t('components.library.deletePlaylist')"
                  @click="deletePlaylist(playlist.id)"
                >
                  <Trash2 :size="16" />
                </TheButton>
              </div>
            </header>

            <p v-if="!playlist.cipherIds.length" class="library__hint">
              {{ $t("components.library.playlistEmpty") }}
            </p>

            <ol v-else class="library__list library__songs">
              <li
                v-for="(id, index) in playlist.cipherIds"
                :key="`${id}-${index}`"
                class="library__item library__song"
              >
                <span class="library__position">{{ index + 1 }}</span>
                <button class="library__song-title" @click="openCipher(id)">
                  {{ titleOf(cipherById(id)) }}
                </button>

                <div class="library__actions">
                  <TheButton
                    size="sm"
                    variant="ghost"
                    icon
                    :disabled="index == 0"
                    :title="$t('components.library.moveUp')"
                    :aria-label="$t('components.library.moveUp')"
                    @click="moveInPlaylist(playlist, index, -1)"
                  >
                    <ChevronUp :size="16" />
                  </TheButton>
                  <TheButton
                    size="sm"
                    variant="ghost"
                    icon
                    :disabled="index == playlist.cipherIds.length - 1"
                    :title="$t('components.library.moveDown')"
                    :aria-label="$t('components.library.moveDown')"
                    @click="moveInPlaylist(playlist, index, 1)"
                  >
                    <ChevronDown :size="16" />
                  </TheButton>
                  <TheButton
                    size="sm"
                    variant="ghost"
                    icon
                    class="library__remove-song"
                    :title="$t('components.library.removeFromPlaylist')"
                    :aria-label="$t('components.library.removeFromPlaylist')"
                    @click="removeFromPlaylist(playlist, index)"
                  >
                    <X :size="16" />
                  </TheButton>
                </div>
              </li>
            </ol>
          </section>
        </TabsContent>
      </template>
    </TabsRoot>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "reka-ui";
import {
  ChevronDown,
  ChevronUp,
  ListMusic,
  ListPlus,
  Music,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-vue-next";
import { useLibraryStore } from "@/stores/library";
import { useUiStore } from "@/stores/ui";
import type { CipherSummary, Playlist } from "@/types/library";

// SEM ACENTO E SEM CAIXA: "joao" ACHA "João"
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export default defineComponent({
  name: "TheLibrary",

  components: {
    ChevronDown,
    ChevronUp,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRoot,
    DropdownMenuTrigger,
    ListMusic,
    ListPlus,
    Music,
    Pencil,
    Plus,
    SearchIcon: Search,
    TabsContent,
    TabsList,
    TabsRoot,
    TabsTrigger,
    Trash2,
    X,
  },

  data() {
    return {
      tab: "ciphers",
      query: "",
      newName: "",
      editingId: null as string | null,
      editingName: "",
    };
  },

  computed: {
    ...mapState(useUiStore, ["libraryOpen"]),
    ...mapState(useLibraryStore, [
      "ciphers",
      "playlists",
      "cipherId",
      "loading",
      "loadFailed",
    ]),

    filtered(): CipherSummary[] {
      const words = normalize(this.query).split(/\s+/).filter(Boolean);

      return this.ciphers.filter((cipher) => {
        const text = normalize(`${cipher.title} ${cipher.artist}`);

        return words.every((word) => text.includes(word));
      });
    },
  },

  watch: {
    libraryOpen(open: boolean) {
      if (!open) return;

      this.query = "";
      this.editingId = null;
      this.fetchAll();
    },
  },

  methods: {
    ...mapActions(useUiStore, ["setLibraryOpen"]),
    ...mapActions(useLibraryStore, [
      "fetchAll",
      "open",
      "remove",
      "createPlaylist",
      "updatePlaylist",
      "addToPlaylist",
      "removeFromPlaylist",
      "moveInPlaylist",
      "deletePlaylist",
    ]),

    cipherById(id: string): CipherSummary | undefined {
      return this.ciphers.find((cipher) => cipher.id == id);
    },

    titleOf(cipher?: CipherSummary): string {
      return cipher?.title || this.$t("components.library.untitled");
    },

    // "Tom Jobim · Violão/Guitarra · F · Atualizada em 21/10/2026 11:30"
    details(cipher: CipherSummary): string {
      const date = new Date(cipher.updatedAt).toLocaleString(
        this.$i18n.locale == "enUS" ? "en-US" : "pt-BR",
        { dateStyle: "short", timeStyle: "short" }
      );

      return [
        cipher.artist,
        this.$t(`components.tuning.${cipher.instrument}`),
        cipher.tone,
        this.$t("components.library.updated", { date }),
      ]
        .filter(Boolean)
        .join(" · ");
    },

    async openCipher(id: string) {
      if (await this.open(id)) this.setLibraryOpen(false);
    },

    async create() {
      const name = this.newName.trim();

      if (!name) return;

      await this.createPlaylist(name);
      this.newName = "";
    },

    startRename(playlist: Playlist) {
      this.editingId = playlist.id;
      this.editingName = playlist.name;
      this.$nextTick(() => {
        const [input] = (this.$refs.renameInput as HTMLInputElement[]) ?? [];

        input?.select();
      });
    },

    // ENTER E SAIR DO CAMPO SALVAM; NOME VAZIO OU IGUAL NÃO CHAMA A API
    async rename(playlist: Playlist) {
      if (this.editingId != playlist.id) return;

      const name = this.editingName.trim();

      this.editingId = null;

      if (!name || name == playlist.name) return;

      await this.updatePlaylist(playlist.id, {
        name,
        cipherIds: playlist.cipherIds,
      });
    },
  },
});
</script>

<style lang="scss">
.library {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  min-height: 320px;

  &__tabs {
    display: flex;
    gap: var(--space-1);
    padding: 3px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
    align-self: flex-start;
  }

  &__tab {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    height: 30px;
    padding: 0 var(--space-3);
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-text-muted);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;

    &[data-state="active"] {
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: var(--shadow-sm);
    }
  }

  &__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);

    &:focus-visible {
      outline: none;
    }
  }

  &__status,
  &__hint {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  &__status {
    justify-content: center;
    padding: var(--space-6) 0;
    text-align: center;
  }

  &__search,
  &__create input,
  &__rename input {
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-sm);
    font-size: var(--text-sm);

    &:focus-within,
    &:focus {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px var(--color-accent-soft);
      outline: none;
    }
  }

  &__search {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text-muted);

    input {
      flex: 1;
      min-width: 0;
      border: none;
      background: none;
      color: var(--color-text);
      outline: none;
    }
  }

  &__create {
    display: flex;
    gap: var(--space-2);

    input {
      flex: 1;
      min-width: 0;
    }

    .the-button {
      height: 36px;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    list-style: none;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);

    &--current {
      border-color: var(--color-accent);
      background: var(--color-accent-soft);
    }
  }

  &__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    line-height: 1.3;

    strong,
    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    span {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
    }
  }

  &__badge {
    flex: none;
    padding: 2px var(--space-2);
    border-radius: var(--radius-full);
    background: var(--color-accent);
    color: var(--color-accent-contrast);
    font-size: var(--text-xs);
    font-weight: 600;

    @include tablet {
      display: none;
    }
  }

  &__actions {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  // DENTRO DO MODAL: O MENU PRECISA FICAR ACIMA DELE (.dropdown VEM DEPOIS
  // NO CSS, DAÍ A CLASSE DUPLA)
  &__menu.dropdown {
    z-index: 10000;
  }

  &__menu-label {
    padding: var(--space-1) var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  &__playlist {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface-muted);
  }

  &__playlist-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  &__rename {
    flex: 1;

    input {
      width: 100%;
    }
  }

  &__song {
    padding: var(--space-1) var(--space-2);
    background: var(--color-surface);
  }

  &__position {
    width: 20px;
    color: var(--color-text-subtle);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-align: right;
  }

  &__song-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    border: none;
    background: none;
    font-size: var(--text-sm);
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }
}
</style>
