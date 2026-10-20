import { notesLostByRetune } from "@/core/tab";

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

  // ALGUMA TAB PERDERIA NOTAS SE A AFINAÇÃO PASSASSE A TER `strings` CORDAS?
  tabsLoseNotes(state) {
    return (strings) =>
      state.songStructure.some(
        (part) =>
          part.type == "tab" &&
          notesLostByRetune(part.info.text.replace(/^\n+|\n+$/g, ""), strings)
      );
  },

  focusId(state) {
    return state.focusId;
  },
};

export default getters;
