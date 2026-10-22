import { createI18n } from "vue-i18n";

import { locale as enUS } from "@/core/config/i18n/enUS";
import { locale as ptBR, type MessageSchema } from "@/core/config/i18n/ptBR";

export type Language = "ptBR" | "enUS";

const htmlLang: Record<Language, string> = { ptBR: "pt-BR", enUS: "en-US" };

function isLanguage(value: string | null): value is Language {
  return value != null && Object.hasOwn(htmlLang, value);
}

const saved = localStorage.getItem("lang");
const lang: Language = isLanguage(saved) ? saved : "ptBR";

const i18n = createI18n<[MessageSchema], Language, false>({
  legacy: false,
  locale: lang,
  messages: { enUS, ptBR },
});

document.documentElement.lang = htmlLang[lang];

export function setLanguage(language: Language): void {
  localStorage.setItem("lang", language);

  i18n.global.locale.value = language;
  document.documentElement.lang = htmlLang[language];
}

// $t/$tm NOS TEMPLATES CONHECEM AS CHAVES DAS MENSAGENS
declare module "vue-i18n" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends MessageSchema {}
}

export default i18n;
