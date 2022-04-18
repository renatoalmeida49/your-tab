const mutations = {
  addContent(state, payload) {
    state.songStructure.push(payload);
  },

  removeContent(state, payload) {
    state.songStructure.splice(payload, 1);
  },
};

export default mutations;
