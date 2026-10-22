import { defineStore } from "pinia";

// AVISO RÁPIDO NO RODAPÉ (EX: "SALVO NO ACERVO"). message É CHAVE DO i18n
interface Flash {
  message: string;
  error: boolean;
  at: number;
  // VALORES DA MENSAGEM (EX: { count: 3 })
  params?: Record<string, unknown>;
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
    // IDS DAS PARTES SELECIONADAS COMO BLOCOS (ARRASTO, Esc, Shift+CLIQUE...)
    selectedParts: [] as string[],
  }),

  getters: {
    // ALGUMA JANELA POR CIMA DO EDITOR?
    overlayOpen: (state) =>
      state.helpOpen ||
      state.exportOpen ||
      state.stageOpen ||
      state.paletteOpen ||
      state.loginOpen ||
      state.libraryOpen,
  },

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

    selectParts(ids: string[]) {
      this.selectedParts = ids;
    },

    clearSelection() {
      if (this.selectedParts.length) this.selectedParts = [];
    },

    showFlash(
      message: string | null,
      error = false,
      params?: Record<string, unknown>
    ) {
      this.flash = message ? { message, error, at: Date.now(), params } : null;
    },
  },
});
