<template>
  <transition name="toast">
    <div
      v-if="toast"
      :key="toast.at"
      class="toast"
      :class="{ 'toast--error': toast.error }"
      role="status"
    >
      <span>{{ $t(toast.message, toast.params ?? {}) }}</span>

      <button v-if="toast.undo" class="toast__undo" @click="undo">
        {{ $t("components.toast.undo") }}
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useHistoryStore } from "@/stores/history";
import { useUiStore } from "@/stores/ui";

const DURATION = 6000;

interface Toast {
  message: string;
  at: number;
  undo: boolean;
  error: boolean;
  params?: Record<string, unknown>;
}

export default defineComponent({
  name: "TheToast",

  data() {
    return {
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },

  computed: {
    ...mapState(useHistoryStore, ["notice"]),
    ...mapState(useUiStore, ["flash"]),

    // UM AVISO POR VEZ: O MAIS RECENTE ENTRE "PARTE REMOVIDA" (COM DESFAZER)
    // E OS DO ACERVO ("SALVO", ERROS)
    toast(): Toast | null {
      const notice = this.notice && {
        ...this.notice,
        undo: true,
        error: false,
      };
      const flash = this.flash && { ...this.flash, undo: false };

      if (notice && flash) return notice.at >= flash.at ? notice : flash;

      return notice || flash;
    },
  },

  watch: {
    toast(toast: Toast | null) {
      clearTimeout(this.timer);

      if (toast) this.timer = setTimeout(this.dismiss, DURATION);
    },
  },

  beforeUnmount() {
    clearTimeout(this.timer);
  },

  methods: {
    ...mapActions(useHistoryStore, { historyUndo: "undo", notify: "notify" }),
    ...mapActions(useUiStore, ["showFlash"]),

    dismiss() {
      this.notify(null);
      this.showFlash(null);
    },

    undo() {
      this.historyUndo();
    },
  },
});
</script>

<style lang="scss">
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: 9000;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: var(--color-inverse);
  color: var(--color-inverse-text);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);

  &--error {
    background: var(--color-danger);
    color: var(--color-accent-contrast);
  }

  &__undo {
    background: none;
    border: none;
    color: var(--color-highlight);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>
