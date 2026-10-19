import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import i18n from "./core/plugins/i18n";
import widgets from "./widgets";

import "./assets/scss/_fonts.scss";

createApp(App).use(router).use(store).use(i18n).use(widgets).mount("#app");
