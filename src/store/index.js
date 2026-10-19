import { createStore } from "vuex";

import songStructure from "./song-structure";
import instrument from "./instrument";
import persistence from "./plugins/persistence";

export default createStore({
  modules: {
    songStructure,
    instrument,
  },
  plugins: [persistence],
  strict: import.meta.env.DEV,
});
