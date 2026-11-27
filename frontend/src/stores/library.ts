import { defineStore } from "pinia";

import { api, ApiError } from "@/core/api";
import { downloadText } from "@/core/files";
import {
  sameSong,
  songFile,
  songFileName,
  type SongFileContent,
} from "@/core/song-file";
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

// ÚLTIMO PEDIDO DE CADA PLAYLIST: RESPOSTA DE UM PEDIDO ANTERIOR (EX: ↑/↓
// APERTADOS RÁPIDO) NÃO DESFAZ O QUE VEIO DEPOIS
const playlistRequests: Record<string, number> = {};
// O MESMO PARA A ORDEM DO ACERVO
let cipherOrderRequest = 0;

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

function fieldsOf(cipher: Cipher): CipherFields {
  const { title, artist, instrument, tuning, tone, parts } = cipher;

  return { title, artist, instrument, tuning, tone, parts };
}

function summary(cipher: Cipher): CipherSummary {
  const { id, title, artist, instrument, tone, updatedAt } = cipher;

  return { id, title, artist, instrument, tone, updatedAt };
}

// MOSTRA O ERRO NO RODAPÉ. 401: A SESSÃO ACABOU, PEDE LOGIN DE NOVO
export function reportApiError(error: unknown): void {
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
    // IMPORTANDO OU EXPORTANDO ARQUIVO DE MÚSICAS
    transferring: false,
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

        // EDITADA FICA NO LUGAR; NOVA ENTRA NO TOPO (COMO NA API)
        const index = this.ciphers.findIndex((item) => item.id == cipher.id);

        if (index >= 0) this.ciphers.splice(index, 1, summary(cipher));
        else this.ciphers.unshift(summary(cipher));
        useUiStore().showFlash("components.library.saved");
      } catch (error) {
        reportApiError(error);
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
        reportApiError(error);
      } finally {
        this.loading = false;
      }
    },

    // SÓ AS PLAYLISTS, SEM AVISO DE ERRO: PARA A PALETA E O PALCO OFERECEREM
    // "TOCAR PLAYLIST" SEM PRECISAR ABRIR O ACERVO ANTES
    async loadPlaylists() {
      if (!useAuthStore().user) return;

      try {
        this.playlists = await api.listPlaylists();
      } catch (error) {
        if (error instanceof ApiError && error.status == 401) {
          useAuthStore().expire();
        }
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
        reportApiError(error);

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
        return reportApiError(error);
      }

      // A API JÁ TIROU A CIFRA DAS PLAYLISTS; AQUI SÓ ESPELHA
      this.ciphers = this.ciphers.filter((cipher) => cipher.id != id);
      for (const playlist of this.playlists) {
        playlist.cipherIds = playlist.cipherIds.filter((item) => item != id);
      }

      // O EDITOR FICA COM A MÚSICA, AGORA COMO NOVA
      if (id == this.cipherId) this.unlink();
    },

    // NOVA ORDEM DO ACERVO NA HORA (O ARRASTO NÃO PULA DE VOLTA ENQUANTO A
    // API RESPONDE). SE A API RECUSAR, VOLTA A ORDEM ANTERIOR, A MENOS QUE
    // OUTRA MUDANÇA JÁ TENHA VINDO DEPOIS. 409: O ACERVO MUDOU EM OUTRO LUGAR,
    // RECARREGA
    async reorderCiphers(ciphers: CipherSummary[]) {
      const previous = this.ciphers;
      const request = ++cipherOrderRequest;

      this.ciphers = ciphers;

      try {
        await api.reorderCiphers(ciphers.map((cipher) => cipher.id));
      } catch (error) {
        reportApiError(error);

        if (request != cipherOrderRequest) return;

        if (error instanceof ApiError && error.status == 409) {
          await this.fetchAll();
        } else {
          this.ciphers = previous;
        }
      }
    },

    // step -1 SOBE, 1 DESCE
    moveCipher(index: number, step: -1 | 1) {
      const target = index + step;
      const ciphers = [...this.ciphers];

      if (target < 0 || target >= ciphers.length) return;

      [ciphers[index], ciphers[target]] = [ciphers[target], ciphers[index]];

      return this.reorderCiphers(ciphers);
    },

    // AS CIFRAS NUM ARQUIVO SÓ, NA ORDEM DE ids (A LISTA NÃO TRAZ AS PARTES:
    // BUSCA CADA UMA). playlist: O ARQUIVO RECRIA A PLAYLIST AO IMPORTAR.
    // true SE BAIXOU
    async exportCiphers(ids: string[], playlist?: string): Promise<boolean> {
      if (this.transferring || !ids.length) return false;

      this.transferring = true;

      try {
        const ciphers = await Promise.all(ids.map((id) => api.getCipher(id)));
        const songs = ciphers.map(fieldsOf);
        const now = new Date();

        downloadText(
          songFile(songs, now, playlist),
          songFileName(songs, now, playlist)
        );

        return true;
      } catch (error) {
        reportApiError(error);

        return false;
      } finally {
        this.transferring = false;
      }
    },

    // TODO O ACERVO
    exportAll() {
      return this.exportCiphers(this.ciphers.map((cipher) => cipher.id));
    },

    // A MESMA CIFRA SÓ UMA VEZ, MESMO EM PLAYLIST ANTIGA COM REPETIDAS
    exportPlaylist(playlist: Playlist) {
      return this.exportCiphers(
        [...new Set(playlist.cipherIds)],
        playlist.name
      );
    },

    // id DA CIFRA DO ACERVO COM EXATAMENTE O MESMO CONTEÚDO DE song, OU null.
    // A LISTA NÃO TRAZ AS PARTES: SÓ BUSCA AS CANDIDATAS (MESMO TÍTULO,
    // ARTISTA, INSTRUMENTO E TOM). known GUARDA AS JÁ BUSCADAS
    async findSameCipher(
      song: CipherFields,
      known: Map<string, CipherFields>
    ): Promise<string | null> {
      const candidates = this.ciphers.filter(
        (cipher) =>
          cipher.title.trim() == song.title.trim() &&
          cipher.artist.trim() == song.artist.trim() &&
          cipher.instrument == song.instrument &&
          cipher.tone.trim() == song.tone.trim()
      );

      for (const candidate of candidates) {
        let fields = known.get(candidate.id);

        if (!fields) {
          const cipher = await api.getCipher(candidate.id).catch((error) => {
            // EXCLUÍDA NO MEIO DO CAMINHO: NÃO É CANDIDATA
            if (error instanceof ApiError && error.status == 404) return null;
            throw error;
          });

          if (!cipher) continue;

          fields = fieldsOf(cipher);
          known.set(candidate.id, fields);
        }

        if (sameSong(fields, song)) return candidate.id;
      }

      return null;
    },

    // AS MÚSICAS DOS ARQUIVOS ENTRAM NO ACERVO NA ORDEM DO ARQUIVO; ARQUIVO DE
    // PLAYLIST RECRIA A PLAYLIST COM ELAS. MÚSICA IDÊNTICA A UMA DO ACERVO NÃO
    // É DUPLICADA: A PLAYLIST USA A QUE JÁ EXISTE. SE A API FALHAR NO MEIO, AS
    // QUE JÁ ENTRARAM FICAM
    async importSongs(contents: SongFileContent[]) {
      if (this.transferring) return;

      this.transferring = true;

      try {
        const playlists: string[] = [];
        const known = new Map<string, CipherFields>();
        let reused = 0;

        for (const content of contents) {
          const ids: string[] = [];

          for (const song of content.songs) {
            const same = await this.findSameCipher(song, known);

            if (same) {
              reused++;
              ids.push(same);
              continue;
            }

            const cipher = await api.createCipher(song);

            this.ciphers = [summary(cipher), ...this.ciphers];
            // OUTRO ARQUIVO COM A MESMA MÚSICA REUSA A QUE ACABOU DE ENTRAR
            known.set(cipher.id, fieldsOf(cipher));
            ids.push(cipher.id);
          }

          if (content.playlist) {
            const playlist = await api.createPlaylist({
              name: content.playlist,
              cipherIds: ids,
            });

            this.playlists.unshift(playlist);
            playlists.push(playlist.name);
          }
        }

        const count = contents.reduce(
          (sum, item) => sum + item.songs.length,
          0
        );

        const suffix = reused ? "Reused" : "";

        if (playlists.length == 1) {
          useUiStore().showFlash(
            `components.songFile.importedPlaylist${suffix}`,
            false,
            { name: playlists[0], count, reused }
          );
        } else {
          useUiStore().showFlash(
            `components.songFile.imported${suffix}`,
            false,
            { count: count - reused, reused }
          );
        }
      } catch (error) {
        reportApiError(error);
      } finally {
        this.transferring = false;
      }
    },

    async createPlaylist(name: string) {
      try {
        const playlist = await api.createPlaylist({ name, cipherIds: [] });

        this.playlists.unshift(playlist);
      } catch (error) {
        reportApiError(error);
      }
    },

    // NOME E ORDEM DAS CIFRAS. A LISTA SÓ MUDA NA TELA DEPOIS DA API ACEITAR
    // true SE SALVOU
    async updatePlaylist(
      id: string,
      fields: Pick<Playlist, "name" | "cipherIds">
    ): Promise<boolean> {
      const request = (playlistRequests[id] ?? 0) + 1;

      playlistRequests[id] = request;

      try {
        const playlist = await api.updatePlaylist(id, fields);
        const index = this.playlists.findIndex((item) => item.id == id);

        if (index >= 0 && request == playlistRequests[id]) {
          this.playlists.splice(index, 1, playlist);
        }

        return true;
      } catch (error) {
        reportApiError(error);

        return false;
      }
    },

    // A MESMA CIFRA NÃO REPETE NA PLAYLIST
    async addToPlaylist(playlist: Playlist, cipherId: string) {
      if (playlist.cipherIds.includes(cipherId)) return;

      const saved = await this.updatePlaylist(playlist.id, {
        name: playlist.name,
        cipherIds: [...playlist.cipherIds, cipherId],
      });

      if (saved) {
        useUiStore().showFlash("components.library.addedToPlaylist", false, {
          name: playlist.name,
        });
      }
    },

    removeFromPlaylist(playlist: Playlist, index: number) {
      return this.updatePlaylist(playlist.id, {
        name: playlist.name,
        cipherIds: playlist.cipherIds.filter((_, item) => item != index),
      });
    },

    // NOVA ORDEM NA HORA (O ARRASTO NÃO PULA DE VOLTA ENQUANTO A API
    // RESPONDE). SE A API RECUSAR, VOLTA A ORDEM ANTERIOR, A MENOS QUE OUTRA
    // MUDANÇA JÁ TENHA VINDO DEPOIS
    async reorderPlaylist(playlist: Playlist, cipherIds: string[]) {
      const previous = playlist.cipherIds;

      playlist.cipherIds = cipherIds;

      // LIDO DE VOLTA: O STORE GUARDA A VERSÃO REATIVA DO ARRAY
      const applied = playlist.cipherIds;
      const saved = await this.updatePlaylist(playlist.id, {
        name: playlist.name,
        cipherIds,
      });
      const current = this.playlists.find((item) => item.id == playlist.id);

      if (!saved && current?.cipherIds == applied) {
        current.cipherIds = previous;
      }
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

      return this.reorderPlaylist(playlist, cipherIds);
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
        reportApiError(error);
      }
    },
  },
});
