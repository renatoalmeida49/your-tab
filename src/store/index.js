import Vue from "vue";
import Vuex from "vuex";

import songStructure from "./song-structure";
import instrument from "./instrument";
import persistence from "./plugins/persistence";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    songStructure,
    instrument,
  },
  plugins: [persistence],
  strict: process.env.NODE_ENV !== "production",
});
