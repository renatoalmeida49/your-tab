import type { App } from "vue";

import SongContent from "./song-content/index.vue";
import TheAppBar from "./app-bar/index.vue";
import TheCommandPalette from "./command-palette/index.vue";
import TheConfirm from "./confirm/index.vue";
import TheExport from "./export/index.vue";
import TheHelp from "./help/index.vue";
import TheLibrary from "./library/index.vue";
import TheLogin from "./login/index.vue";
import Modal from "./modal/index.vue";
import TheStage from "./stage/index.vue";
import TheButton from "./the-button/index.vue";
import TheToast from "./toast/index.vue";

export default {
  install(app: App) {
    app.component("SongContent", SongContent);
    app.component("TheAppBar", TheAppBar);
    app.component("TheCommandPalette", TheCommandPalette);
    app.component("TheConfirm", TheConfirm);
    app.component("TheExport", TheExport);
    app.component("TheHelp", TheHelp);
    app.component("TheLibrary", TheLibrary);
    app.component("TheLogin", TheLogin);
    app.component("Modal", Modal);
    app.component("TheStage", TheStage);
    app.component("TheButton", TheButton);
    app.component("TheToast", TheToast);
  },
};
