const mutations = {
  addContent(state, payload) {
    state.songStructure.push(payload);
  },

  removeContent(state, payload) {
    state.songStructure.splice(payload, 1);
  },

  addTextField(state, payload) {
    state.songStructure.splice(payload.index, 0, payload.component);
  },
};

export default mutations;
