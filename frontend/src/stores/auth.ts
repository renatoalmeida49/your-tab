import { defineStore } from "pinia";

import { api } from "@/core/api";
import type { User } from "@/types/library";
import { useLibraryStore } from "./library";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    // JÁ SABEMOS SE HÁ SESSÃO? ANTES DISSO A BARRA NÃO MOSTRA "ENTRAR"
    ready: false,
  }),

  actions: {
    // API FORA DO AR CONTA COMO VISITANTE: O EDITOR FUNCIONA SEM ELA
    async loadSession() {
      try {
        this.user = (await api.me()).user;
      } catch {
        this.user = null;
      } finally {
        this.ready = true;
      }
    },

    async login(credential: string) {
      this.user = await api.login(credential);
    },

    // A MÚSICA FICA NO EDITOR, MAS DESLIGADA DO ACERVO
    async logout() {
      try {
        await api.logout();
      } finally {
        this.user = null;
        useLibraryStore().reset();
      }
    },

    // SESSÃO EXPIROU NO MEIO DO USO (A API RESPONDEU 401)
    expire() {
      this.user = null;
    },
  },
});
