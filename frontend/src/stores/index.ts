import { createPinia } from "pinia";

import { useAuthStore } from "./auth";
import { trackHistory } from "./history";
import { persistSong } from "./persistence";
import { setupTheme } from "./theme";

export function createStores() {
  return createPinia();
}

// DEPOIS DE app.use(pinia). A RESTAURAÇÃO VEM ANTES: O HISTÓRICO COMEÇA DA
// MÚSICA JÁ SALVA
export function setupStores(): void {
  setupTheme();
  persistSong();
  trackHistory();
  void useAuthStore().loadSession();
}
