import { defineStore } from "pinia";

// "system" SEGUE O prefers-color-scheme; OS OUTROS FIXAM O data-theme NO <html>
export type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";
const ORDER: Theme[] = ["system", "light", "dark"];

function isTheme(value: string | null): value is Theme {
  return value != null && (ORDER as string[]).includes(value);
}

function load(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return isTheme(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function apply(theme: Theme): void {
  if (theme == "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
}

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: load(),
  }),

  actions: {
    setTheme(theme: Theme) {
      this.theme = theme;
      apply(theme);

      try {
        localStorage.setItem(STORAGE_KEY, theme);
      } catch {
        // STORAGE BLOQUEADO: O TEMA VALE SÓ ATÉ RECARREGAR
      }
    },

    // SISTEMA -> CLARO -> ESCURO -> SISTEMA
    cycleTheme() {
      const next = (ORDER.indexOf(this.theme) + 1) % ORDER.length;

      this.setTheme(ORDER[next]);
    },
  },
});

export function setupTheme(): void {
  apply(useThemeStore().theme);
}
