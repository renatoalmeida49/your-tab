import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { createStores, setupStores } from "./stores";
import i18n from "./core/plugins/i18n";
import widgets from "./widgets";

import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "./assets/scss/theme.scss";

const app = createApp(App)
  .use(router)
  .use(createStores())
  .use(i18n)
  .use(widgets);

setupStores();

app.mount("#app");
