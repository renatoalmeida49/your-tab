const mutations = {
  newTuning(state, payload) {
    state.tuning = [...payload];
  },

  newInstrument(state, payload) {
    state.instrument = payload;
  },

  newTone(state, payload) {
    state.tone = payload;
  },
};

export default mutations;
