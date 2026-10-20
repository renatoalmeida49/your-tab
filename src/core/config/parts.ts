import { markRaw, type Component } from "vue";
import { Guitar, Music, Type } from "lucide-vue-next";
import type { PartType } from "@/types/song";

export interface PartOption {
  type: PartType;
  // CHAVES DO i18n
  label: string;
  hint: string;
  icon: Component;
}

// AS PARTES QUE O USUÁRIO PODE INSERIR, NA ORDEM EM QUE APARECEM NOS MENUS.
// markRaw: COMPONENTES NÃO DEVEM VIRAR OBJETOS REATIVOS NO VUE 3
export const partOptions: PartOption[] = [
  {
    type: "textField",
    label: "components.menu.text",
    hint: "components.emptyState.textHint",
    icon: markRaw(Type),
  },
  {
    type: "verse",
    label: "components.menu.verse",
    hint: "components.emptyState.verseHint",
    icon: markRaw(Music),
  },
  {
    type: "tab",
    label: "components.menu.tab",
    hint: "components.emptyState.tabHint",
    icon: markRaw(Guitar),
  },
];
