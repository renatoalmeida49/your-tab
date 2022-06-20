const getters = {
  song(state) {
    return state.songStructure;
  },

  focusTextField(state) {
    return state.focusTextFieldIndex;
  },
};

export default getters;
