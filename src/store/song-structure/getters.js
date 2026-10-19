const getters = {
  song(state) {
    return state.songStructure;
  },

  title(state) {
    return state.title;
  },

  artist(state) {
    return state.artist;
  },

  focusId(state) {
    return state.focusId;
  },
};

export default getters;
