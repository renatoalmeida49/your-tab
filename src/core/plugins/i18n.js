import Vue from "vue";
import VueI18n from "vue-i18n";

import { locale as enUS } from "@/core/config/i18n/enUS";
import { locale as ptBR } from "@/core/config/i18n/ptBR";

Vue.use(VueI18n);

const lang = localStorage.getItem("lang") || "ptBR";

const i18n = new VueI18n({
  locale: lang,
  messages: { enUS, ptBR },
});

export default i18n;
