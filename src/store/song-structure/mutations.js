const mutations = {
  addContent(state, payload) {
    state.songStructure.push(payload);
  },

  removeContent(state, payload) {
    state.songStructure.splice(payload, 1);
  },

  setSong(state, payload) {
    state.songStructure = payload;
  },

  setSongInfo(state, payload) {
    state[payload.field] = payload.value;
  },

  setFocusId(state, payload) {
    state.focusId = payload;
  },

  addContentBetweenParts(state, payload) {
    state.songStructure.splice(payload.index, 0, payload.part);
  },
};

export default mutations;
