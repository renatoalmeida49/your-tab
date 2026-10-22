import { defineStore } from "pinia";

export interface ConfirmRequest {
  // CHAVES DO i18n
  message: string;
  confirmLabel: string;
  // PADRÃO: "Cancelar"
  cancelLabel?: string;
  danger?: boolean;
}

// FORA DO STATE: FUNÇÃO NÃO PRECISA SER REATIVA
let resolver: ((confirmed: boolean) => void) | null = null;

// SUBSTITUI O window.confirm: QUEM PERGUNTA ESPERA A RESPOSTA (await ask(...))
// E O <TheConfirm> MOSTRA O DIÁLOGO
export const useConfirmStore = defineStore("confirm", {
  state: () => ({
    request: null as ConfirmRequest | null,
  }),

  actions: {
    ask(request: ConfirmRequest): Promise<boolean> {
      resolver?.(false);
      this.request = request;

      return new Promise((resolve) => {
        resolver = resolve;
      });
    },

    answer(confirmed: boolean) {
      resolver?.(confirmed);
      resolver = null;
      this.request = null;
    },
  },
});
