const actions = {
  addContent(context, payload) {
    context.commit("addContent", payload);
  },

  removeContent(context, payload) {
    context.commit("removeContent", payload);
  },
};

export default actions;
