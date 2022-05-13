const actions = {
  newTuning(context, payload) {
    context.commit("newTuning", payload);
  },

  newInstrument(context, payload) {
    context.commit("newInstrument", payload);
  },
};

export default actions;
