<template>
  <DialogRoot :open="true" @update:open="onOpenChange">
    <DialogPortal>
      <DialogOverlay class="modal__overlay" />

      <DialogContent
        class="modal"
        :class="{ 'modal--wide': wide }"
        :aria-describedby="undefined"
      >
        <header class="modal__header">
          <DialogTitle class="modal__title">{{ title }}</DialogTitle>

          <DialogClose class="modal__close" :aria-label="$t('common.close')">
            <X :size="18" />
          </DialogClose>
        </header>

        <div class="modal__body">
          <slot />
        </div>

        <footer v-if="showFooter" class="modal__footer">
          <TheButton variant="ghost" @click="closeClick">
            {{ $t("common.cancel") }}
          </TheButton>
        </footer>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { X } from "lucide-vue-next";

// O PAI CONTROLA A EXISTÊNCIA (v-if); ESC, CLIQUE FORA E O "X" PEDEM @close
export default defineComponent({
  name: "Modal",

  components: {
    DialogClose,
    DialogContent,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    X,
  },

  emits: ["close"],

  props: {
    title: { type: String, required: true },
    showFooter: { type: Boolean, default: true },
    wide: { type: Boolean, default: false },
  },

  methods: {
    onOpenChange(open: boolean) {
      if (!open) this.$emit("close");
    },

    closeClick() {
      this.$emit("close");
    },
  },
});
</script>

<style lang="scss">
.modal__overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: var(--color-overlay);
  animation: modal-fade var(--duration-normal) ease-out;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 9999;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  width: calc(100vw - 2 * var(--space-4));
  max-width: 480px;
  max-height: calc(100vh - 2 * var(--space-6));
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: modal-in var(--duration-normal) ease-out;

  &--wide {
    max-width: 720px;
  }

  &:focus {
    outline: none;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--color-border);
  }

  &__title {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  &__close {
    display: inline-flex;
    padding: var(--space-1);
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-text-muted);
    cursor: pointer;

    &:hover {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  &__body {
    padding: var(--space-5);
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
    padding: var(--space-3) var(--space-5);
    border-top: 1px solid var(--color-border);
  }
}

@keyframes modal-fade {
  from {
    opacity: 0;
  }
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.98);
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal,
  .modal__overlay {
    animation: none;
  }
}
</style>
