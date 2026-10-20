import { defineStore } from "pinia";

// ESTADO DA INTERFACE QUE NÃO É A MÚSICA (NÃO É SALVO NEM DESFEITO)
export const useUiStore = defineStore("ui", {
  state: () => ({
    helpOpen: false,
  }),

  actions: {
    setHelpOpen(open: boolean) {
      this.helpOpen = open;
    },
  },
});
