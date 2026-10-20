import { pickSong } from "../snapshot";

// FOTOS DA MÚSICA EM JSON (STRINGS SÃO BARATAS PARA A REATIVIDADE)
const LIMIT = 100;

export default {
  namespaced: true,

  state: {
    past: [],
    future: [],
    notice: null,
  },

  getters: {
    notice(state) {
      return state.notice;
    },
  },

  mutations: {
    push(state, snapshot) {
      state.past.push(snapshot);
      if (state.past.length > LIMIT) state.past.shift();

      state.future = [];
      state.notice = null;
    },

    undo(state, current) {
      state.future.push(current);
      state.past.pop();
      state.notice = null;
    },

    redo(state, current) {
      state.past.push(current);
      state.future.pop();
      state.notice = null;
    },

    setNotice(state, message) {
      state.notice = message ? { message, at: Date.now() } : null;
    },
  },

  actions: {
    undo({ state, commit, rootState }) {
      const target = state.past[state.past.length - 1];

      if (!target) return;

      commit("undo", JSON.stringify(pickSong(rootState)));
      commit("restoreSnapshot", JSON.parse(target), { root: true });
    },

    redo({ state, commit, rootState }) {
      const target = state.future[state.future.length - 1];

      if (!target) return;

      commit("redo", JSON.stringify(pickSong(rootState)));
      commit("restoreSnapshot", JSON.parse(target), { root: true });
    },

    notify({ commit }, message) {
      commit("setNotice", message);
    },
  },
};
