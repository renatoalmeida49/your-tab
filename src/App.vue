<template>
  <div id="app">
    <TheAppBar />

    <main class="workspace">
      <router-view />
    </main>

    <TheToast />
    <TheConfirm />
    <TheHelp />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import { useHistoryStore } from "@/stores/history";
import { useUiStore } from "@/stores/ui";

function isEditable(target: HTMLElement): boolean {
  return (
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    target.isContentEditable
  );
}

export default defineComponent({
  name: "App",

  mounted() {
    window.addEventListener("keydown", this.handleShortcuts);
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleShortcuts);
  },

  methods: {
    ...mapActions(useHistoryStore, ["undo", "redo"]),
    ...mapActions(useUiStore, ["setHelpOpen"]),

    handleShortcuts(event: KeyboardEvent) {
      const target = event.target as HTMLElement;

      // "?" FORA DE UM CAMPO ABRE A AJUDA
      if (event.key == "?" && !isEditable(target)) {
        event.preventDefault();
        this.setHelpOpen(true);
        return;
      }

      this.handleHistory(event, target);
    },

    // Ctrl/Cmd+Z DESFAZ, Ctrl/Cmd+Shift+Z OU Ctrl+Y REFAZ, NA MÚSICA INTEIRA.
    // CAMPOS <input> (EX: AFINAÇÃO) MANTÊM O DESFAZER DO NAVEGADOR
    handleHistory(event: KeyboardEvent, target: HTMLElement) {
      if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

      if (["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      const key = event.key.toLowerCase();
      const redo = (key == "z" && event.shiftKey) || key == "y";

      if (key != "z" && !redo) return;

      event.preventDefault();
      if (redo) this.redo();
      else this.undo();
    },
  },
});
</script>

<style lang="scss">
#app {
  min-height: 100vh;
}

.workspace {
  padding: var(--space-6) var(--space-5) var(--space-8);

  @include tablet {
    padding: var(--space-4) var(--space-3) var(--space-7);
  }
}
</style>
