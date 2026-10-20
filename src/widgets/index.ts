import type { App } from "vue";

import SongContent from "./song-content/index.vue";
import TheAppBar from "./app-bar/index.vue";
import TheConfirm from "./confirm/index.vue";
import TheHelp from "./help/index.vue";
import Modal from "./modal/index.vue";
import TheButton from "./the-button/index.vue";
import TheToast from "./toast/index.vue";

export default {
  install(app: App) {
    app.component("SongContent", SongContent);
    app.component("TheAppBar", TheAppBar);
    app.component("TheConfirm", TheConfirm);
    app.component("TheHelp", TheHelp);
    app.component("Modal", Modal);
    app.component("TheButton", TheButton);
    app.component("TheToast", TheToast);
  },
};
