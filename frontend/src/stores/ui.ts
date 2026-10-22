import { defineStore } from "pinia";

// AVISO RÁPIDO NO RODAPÉ (EX: "SALVO NO ACERVO"). message É CHAVE DO i18n
interface Flash {
  message: string;
  error: boolean;
  at: number;
}

// ESTADO DA INTERFACE QUE NÃO É A MÚSICA (NÃO É SALVO NEM DESFEITO)
export const useUiStore = defineStore("ui", {
  state: () => ({
    helpOpen: false,
    exportOpen: false,
    stageOpen: false,
    paletteOpen: false,
    loginOpen: false,
    libraryOpen: false,
    flash: null as Flash | null,
  }),

  actions: {
    setHelpOpen(open: boolean) {
      this.helpOpen = open;
    },

    setExportOpen(open: boolean) {
      this.exportOpen = open;
    },

    setStageOpen(open: boolean) {
      this.stageOpen = open;
    },

    setPaletteOpen(open: boolean) {
      this.paletteOpen = open;
    },

    setLoginOpen(open: boolean) {
      this.loginOpen = open;
    },

    setLibraryOpen(open: boolean) {
      this.libraryOpen = open;
    },

    showFlash(message: string | null, error = false) {
      this.flash = message ? { message, error, at: Date.now() } : null;
    },
  },
});
