import { createI18n } from "vue-i18n";

import { locale as enUS } from "@/core/config/i18n/enUS";
import { locale as ptBR } from "@/core/config/i18n/ptBR";

const htmlLang = { ptBR: "pt-BR", enUS: "en-US" };

const saved = localStorage.getItem("lang");
const lang = htmlLang[saved] ? saved : "ptBR";

const i18n = createI18n({
  legacy: false,
  locale: lang,
  messages: { enUS, ptBR },
});

document.documentElement.lang = htmlLang[lang];

export function setLanguage(language) {
  localStorage.setItem("lang", language);

  i18n.global.locale.value = language;
  document.documentElement.lang = htmlLang[language];
}

export default i18n;
