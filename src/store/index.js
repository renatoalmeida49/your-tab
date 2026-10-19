import { createStore } from "vuex";

import songStructure from "./song-structure";
import instrument from "./instrument";
import history from "./history";
import persistence from "./plugins/persistence";
import historyPlugin from "./plugins/history";

export default createStore({
  modules: {
    songStructure,
    instrument,
    history,
  },
  mutations: {
    // DESFAZER/REFAZER: VOLTA A MÚSICA PARA UMA FOTO DO HISTÓRICO
    restoreSnapshot(state, snapshot) {
      Object.assign(state.songStructure, snapshot.songStructure);
      Object.assign(state.instrument, snapshot.instrument);
    },
  },
  // persistence ANTES: O HISTÓRICO COMEÇA DA MÚSICA JÁ RESTAURADA
  plugins: [persistence, historyPlugin],
  strict: import.meta.env.DEV,
});
