import Vue from "vue";
import Vuex from "vuex";

import songStructure from "./song-structure";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    songStructure,
  },
});
