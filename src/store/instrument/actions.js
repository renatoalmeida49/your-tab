const actions = {
  newTuning(context, payload) {
    context.commit("newTuning", payload);
  },

  newInstrument(context, payload) {
    context.commit("newInstrument", payload);
  },

  // TROCA INSTRUMENTO E AFINAÇÃO E ATUALIZA AS TABS JÁ ESCRITAS
  applyTuning(context, payload) {
    context.commit("newInstrument", payload.instrument);
    context.commit("newTuning", payload.tuning);
    context.commit("songStructure/retuneTabs", payload.tuning, { root: true });
  },

  newTone(context, payload) {
    context.commit("newTone", payload);
  },
};

export default actions;
