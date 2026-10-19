import SongContent from "./song-content/index.vue";
import TheMenu from "./menu/index.vue";
import Modal from "./modal/index.vue";
import TheButton from "./the-button/index.vue";
import TheToast from "./toast/index.vue";

export default {
  install(app) {
    app.component("SongContent", SongContent);
    app.component("TheMenu", TheMenu);
    app.component("Modal", Modal);
    app.component("TheButton", TheButton);
    app.component("TheToast", TheToast);
  },
};
