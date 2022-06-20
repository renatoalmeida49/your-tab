const actions = {
  addContent(context, payload) {
    context.commit("addContent", payload);
  },

  removeContent(context, payload) {
    context.commit("removeContent", payload);
  },

  addTextFiled(context, payload) {
    context.commit("addTextField", payload);
  },

  focusTextFieldIndex(context, payload) {
    context.commit("focusTextFieldIndex", payload);
  },
};

export default actions;
