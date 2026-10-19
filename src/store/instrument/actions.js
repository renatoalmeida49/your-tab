const actions = {
  newTuning(context, payload) {
    context.commit("newTuning", payload);
  },

  newInstrument(context, payload) {
    context.commit("newInstrument", payload);
  },

  newTone(context, payload) {
    context.commit("newTone", payload);
  },
};

export default actions;
