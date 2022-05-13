const mutations = {
  newTuning(state, payload) {
    state.tuning = payload;
  },

  newInstrument(state, payload) {
    state.instrument = payload;
  },
};

export default mutations;
