import { defineStore } from "pinia";

import { api, ApiError } from "@/core/api";
import type { Cipher, Playlist } from "@/types/library";
import { reportApiError } from "./library";
import { useSongStore } from "./song";
import { useUiStore } from "./ui";

// ÚLTIMO PEDIDO DE PLAYLIST: ESCOLHER OUTRA ENQUANTO A PRIMEIRA CARREGA NÃO
// DEIXA A RESPOSTA ANTIGA SOBRESCREVER A NOVA
let playRequest = 0;

// O QUE O MODO PALCO ESTÁ TOCANDO. SEM PLAYLIST, MOSTRA A MÚSICA DO EDITOR
// (E O TOM MUDA NO EDITOR). COM PLAYLIST, AS CIFRAS JÁ VÊM TODAS BAIXADAS
// (TROCAR DE MÚSICA É INSTANTÂNEO E FUNCIONA SE A REDE CAIR NO MEIO DO SHOW)
// E O EDITOR NÃO É TOCADO: O TOM MUDA SÓ NO PALCO, ENQUANTO ELE ESTÁ ABERTO
export const useStageStore = defineStore("stage", {
  state: () => ({
    playlist: null as Pick<Playlist, "id" | "name"> | null,
    songs: [] as Cipher[],
    index: 0,
    // SEMITONS DE CADA MÚSICA DA PLAYLIST, SÓ NESTA SESSÃO DO PALCO
    shifts: [] as number[],
    loading: false,
  }),

  getters: {
    song: (state): Cipher | null => state.songs[state.index] ?? null,
    shift: (state): number => state.shifts[state.index] ?? 0,
    hasPrevious: (state): boolean => !!state.playlist && state.index > 0,
    hasNext: (state): boolean =>
      !!state.playlist && state.index < state.songs.length - 1,
  },

  actions: {
    // ABRE O PALCO NA MÚSICA start DA PLAYLIST. FALHOU: O PALCO VOLTA AO QUE
    // ESTAVA (OU FECHA, SE FOI ABERTO AGORA)
    async playPlaylist(playlist: Playlist, start = 0) {
      const ui = useUiStore();
      const wasOpen = ui.stageOpen;
      const request = ++playRequest;

      this.loading = true;
      ui.setStageOpen(true);

      try {
        // CIFRA EXCLUÍDA NO MEIO DO CAMINHO (404) SÓ SAI DA FILA; SEM REDE,
        // A PLAYLIST INTEIRA FALHA
        const found = await Promise.all(
          playlist.cipherIds.map((id) =>
            api.getCipher(id).catch((error) => {
              if (error instanceof ApiError && error.status == 404) return null;
              throw error;
            })
          )
        );

        if (request != playRequest) return;

        const songs = found.filter((cipher) => cipher !== null);

        if (!songs.length) {
          ui.showFlash("components.stage.playlistEmpty", true);
          if (!wasOpen) ui.setStageOpen(false);
          return;
        }

        // A MÚSICA ESCOLHIDA, CONTANDO AS QUE SUMIRAM ANTES DELA
        const before = found.slice(0, start).filter((cipher) => cipher).length;

        this.playlist = { id: playlist.id, name: playlist.name };
        this.songs = songs;
        this.shifts = songs.map(() => 0);
        this.index = Math.min(before, songs.length - 1);
      } catch (error) {
        if (request != playRequest) return;

        reportApiError(error);
        if (!wasOpen) ui.setStageOpen(false);
      } finally {
        if (request == playRequest) this.loading = false;
      }
    },

    go(index: number) {
      if (index < 0 || index >= this.songs.length) return;

      this.index = index;
    },

    next() {
      this.go(this.index + 1);
    },

    previous() {
      this.go(this.index - 1);
    },

    transpose(semitones: number) {
      if (!this.playlist) {
        useSongStore().transpose(semitones);
        return;
      }

      this.shifts[this.index] = this.shift + semitones;
    },

    // VOLTA A MOSTRAR A MÚSICA DO EDITOR (AO FECHAR O PALCO)
    reset() {
      playRequest++;
      this.$reset();
    },
  },
});
