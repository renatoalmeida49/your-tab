import { retune } from "@/core/tab";

function cleanTab(text) {
  return text.replace(/^\n+|\n+$/g, "");
}

const mutations = {
  addContent(state, payload) {
    state.songStructure.push(payload);
  },

  removeContent(state, payload) {
    state.songStructure.splice(payload, 1);
  },

  setSong(state, payload) {
    state.songStructure = payload;
  },

  updatePart(state, payload) {
    const part = state.songStructure.find((item) => item.id == payload.id);

    // MESMO OBJETO: A PROP `info` DOS COMPONENTES JÁ ENXERGA O VALOR NOVO
    if (part) Object.assign(part.info, payload.info);
  },

  resetSong(state) {
    state.songStructure = [];
    state.title = "";
    state.artist = "";
    state.focusId = null;
  },

  retuneTabs(state, tuning) {
    state.songStructure
      .filter((part) => part.type == "tab")
      .forEach((part) => {
        part.info.text = retune(cleanTab(part.info.text), tuning);
      });
  },

  setSongInfo(state, payload) {
    state[payload.field] = payload.value;
  },

  setFocusId(state, payload) {
    state.focusId = payload;
  },

  addContentBetweenParts(state, payload) {
    state.songStructure.splice(payload.index, 0, payload.part);
  },
};

export default mutations;
