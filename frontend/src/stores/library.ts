import { defineStore } from "pinia";

import { api, ApiError } from "@/core/api";
import type {
  Cipher,
  CipherFields,
  CipherSummary,
  Playlist,
} from "@/types/library";
import type { SavedSong } from "@/types/song";
import { useAuthStore } from "./auth";
import { useConfirmStore } from "./confirm";
import { useHistoryStore } from "./history";
import { applySong, serializeSong } from "./snapshot";
import { useSongStore } from "./song";
import { useUiStore } from "./ui";

// QUAL CIFRA DO ACERVO ESTÁ NO EDITOR, PARA CONTINUAR APÓS RECARREGAR
const STORAGE_KEY = "tab-builder:cipher";

interface Link {
  cipherId: string | null;
  // A MÚSICA COMO FOI SALVA/ABERTA: DIFERENTE DA ATUAL = ALTERAÇÕES NÃO SALVAS
  savedSnapshot: string | null;
}

function loadLink(): Link {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");

    if (typeof saved?.cipherId == "string") return saved;
  } catch {
    // IGNORA DADO CORROMPIDO
  }

  return { cipherId: null, savedSnapshot: null };
}

function saveLink(link: Link): void {
  try {
    if (link.cipherId) localStorage.setItem(STORAGE_KEY, JSON.stringify(link));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // STORAGE BLOQUEADO: O VÍNCULO VALE SÓ ATÉ RECARREGAR
  }
}

export function songToCipher(song: SavedSong): CipherFields {
  return {
    title: song.songStructure.title,
    artist: song.songStructure.artist,
    instrument: song.instrument.instrument,
    tuning: song.instrument.tuning,
    tone: song.instrument.tone,
    parts: song.songStructure.songStructure,
  };
}

export function cipherToSong(cipher: CipherFields): SavedSong {
  return {
    songStructure: {
      title: cipher.title,
      artist: cipher.artist,
      songStructure: cipher.parts,
    },
    instrument: {
      instrument: cipher.instrument,
      tuning: cipher.tuning,
      tone: cipher.tone,
    },
  };
}

function summary(cipher: Cipher): CipherSummary {
  const { id, title, artist, instrument, tone, updatedAt } = cipher;

  return { id, title, artist, instrument, tone, updatedAt };
}

// MOSTRA O ERRO NO RODAPÉ. 401: A SESSÃO ACABOU, PEDE LOGIN DE NOVO
function fail(error: unknown): void {
  const ui = useUiStore();

  if (error instanceof ApiError && error.status == 401) {
    useAuthStore().expire();
    ui.showFlash("components.library.errors.session", true);
  } else if (error instanceof ApiError && error.status == 0) {
    ui.showFlash("components.library.errors.offline", true);
  } else {
    ui.showFlash("components.library.errors.generic", true);
  }
}

export const useLibraryStore = defineStore("library", {
  state: () => ({
    ...loadLink(),
    saving: false,
    // O "SALVAR" ABRIU O LOGIN: SALVA ASSIM QUE ENTRAR
    pendingSave: false,
    ciphers: [] as CipherSummary[],
    playlists: [] as Playlist[],
    loading: false,
    loadFailed: false,
  }),

  getters: {
    // LÊ OS STORES DA MÚSICA: RECALCULA A CADA ALTERAÇÃO
    dirty(state): boolean {
      return state.savedSnapshot != serializeSong();
    },
  },

  actions: {
    link(cipherId: string | null, savedSnapshot: string | null) {
      this.cipherId = cipherId;
      this.savedSnapshot = savedSnapshot;
      saveLink({ cipherId, savedSnapshot });
    },

    // A MÚSICA DO EDITOR PASSA A SER NOVA: O PRÓXIMO "SALVAR" CRIA OUTRA CIFRA
    unlink() {
      this.link(null, null);
    },

    reset() {
      this.unlink();
      this.ciphers = [];
      this.playlists = [];
      this.pendingSave = false;
    },

    // CRIA A CIFRA NA PRIMEIRA VEZ; DEPOIS ATUALIZA A MESMA
    async save() {
      if (!useAuthStore().user) {
        this.pendingSave = true;
        useUiStore().setLoginOpen(true);
        return;
      }

      if (this.saving) return;

      const snapshot = serializeSong();
      const fields = songToCipher(JSON.parse(snapshot));

      this.saving = true;

      try {
        let cipher: Cipher | null = null;

        if (this.cipherId) {
          cipher = await api.updateCipher(this.cipherId, fields).catch((e) => {
            // APAGADA EM OUTRO LUGAR (OU DE OUTRA CONTA): SALVA COMO NOVA
            if (e instanceof ApiError && e.status == 404) return null;
            throw e;
          });
        }

        cipher ??= await api.createCipher(fields);

        this.link(cipher.id, snapshot);
        this.ciphers = [
          summary(cipher),
          ...this.ciphers.filter((item) => item.id != cipher.id),
        ];
        useUiStore().showFlash("components.library.saved");
      } catch (error) {
        fail(error);
      } finally {
        this.saving = false;
      }
    },

    async fetchAll() {
      this.loading = true;
      this.loadFailed = false;

      try {
        [this.ciphers, this.playlists] = await Promise.all([
          api.listCiphers(),
          api.listPlaylists(),
        ]);
      } catch (error) {
        this.loadFailed = true;
        fail(error);
      } finally {
        this.loading = false;
      }
    },

    // DEVOLVE SE ABRIU. ALTERAÇÕES NÃO SALVAS NO EDITOR: PERGUNTA ANTES
    async open(id: string): Promise<boolean> {
      const song = useSongStore();
      const empty = !song.parts.length && !song.title && !song.artist;

      if (id == this.cipherId && !this.dirty) return true;

      if (this.dirty && !empty) {
        const confirmed = await useConfirmStore().ask({
          message: "components.library.openConfirm",
          confirmLabel: "components.library.openConfirmAction",
          danger: true,
        });

        if (!confirmed) return false;
      }

      try {
        applySong(cipherToSong(await api.getCipher(id)));
        useHistoryStore().reset();
        this.link(id, serializeSong());

        return true;
      } catch (error) {
        fail(error);

        return false;
      }
    },

    async remove(id: string) {
      const confirmed = await useConfirmStore().ask({
        message: "components.library.deleteConfirm",
        confirmLabel: "components.library.deleteConfirmAction",
        danger: true,
      });

      if (!confirmed) return;

      try {
        await api.deleteCipher(id);
      } catch (error) {
        return fail(error);
      }

      // A API JÁ TIROU A CIFRA DAS PLAYLISTS; AQUI SÓ ESPELHA
      this.ciphers = this.ciphers.filter((cipher) => cipher.id != id);
      for (const playlist of this.playlists) {
        playlist.cipherIds = playlist.cipherIds.filter((item) => item != id);
      }

      // O EDITOR FICA COM A MÚSICA, AGORA COMO NOVA
      if (id == this.cipherId) this.unlink();
    },

    async createPlaylist(name: string) {
      try {
        const playlist = await api.createPlaylist({ name, cipherIds: [] });

        this.playlists.unshift(playlist);
      } catch (error) {
        fail(error);
      }
    },

    // NOME E ORDEM DAS CIFRAS. A LISTA SÓ MUDA NA TELA DEPOIS DA API ACEITAR
    async updatePlaylist(
      id: string,
      fields: Pick<Playlist, "name" | "cipherIds">
    ) {
      try {
        const playlist = await api.updatePlaylist(id, fields);
        const index = this.playlists.findIndex((item) => item.id == id);

        if (index >= 0) this.playlists.splice(index, 1, playlist);
      } catch (error) {
        fail(error);
      }
    },

    addToPlaylist(playlist: Playlist, cipherId: string) {
      return this.updatePlaylist(playlist.id, {
        name: playlist.name,
        cipherIds: [...playlist.cipherIds, cipherId],
      });
    },

    removeFromPlaylist(playlist: Playlist, index: number) {
      return this.updatePlaylist(playlist.id, {
        name: playlist.name,
        cipherIds: playlist.cipherIds.filter((_, item) => item != index),
      });
    },

    // step -1 SOBE, 1 DESCE
    moveInPlaylist(playlist: Playlist, index: number, step: -1 | 1) {
      const target = index + step;
      const cipherIds = [...playlist.cipherIds];

      if (target < 0 || target >= cipherIds.length) return;

      [cipherIds[index], cipherIds[target]] = [
        cipherIds[target],
        cipherIds[index],
      ];

      return this.updatePlaylist(playlist.id, {
        name: playlist.name,
        cipherIds,
      });
    },

    async deletePlaylist(id: string) {
      const confirmed = await useConfirmStore().ask({
        message: "components.library.deletePlaylistConfirm",
        confirmLabel: "components.library.deleteConfirmAction",
        danger: true,
      });

      if (!confirmed) return;

      try {
        await api.deletePlaylist(id);
        this.playlists = this.playlists.filter((item) => item.id != id);
      } catch (error) {
        fail(error);
      }
    },
  },
});
