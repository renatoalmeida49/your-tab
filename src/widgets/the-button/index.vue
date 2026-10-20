<template>
  <button
    class="the-button"
    :class="[
      `the-button--${variant}`,
      `the-button--${size}`,
      { 'the-button--icon': icon },
    ]"
    :type="type"
    @click="emitClick"
  >
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export default defineComponent({
  name: "TheButton",

  // SEM DECLARAR, O VUE 3 TAMBÉM REPASSA O @click NATIVO E DISPARA DUAS VEZES
  emits: ["click"],

  props: {
    type: {
      type: String as PropType<"button" | "submit" | "reset">,
      default: "button",
    },
    variant: {
      type: String as PropType<ButtonVariant>,
      default: "primary",
    },
    size: {
      type: String as PropType<"sm" | "md">,
      default: "md",
    },
    // SÓ ÍCONE: QUADRADO, SEM PADDING LATERAL (USE aria-label)
    icon: { type: Boolean, default: false },
  },

  methods: {
    emitClick() {
      this.$emit("click");
    },
  },
});
</script>

<style lang="scss">
.the-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--duration-fast),
    color var(--duration-fast),
    border-color var(--duration-fast);

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }

  &--md {
    height: 36px;
    padding: 0 var(--space-4);
    font-size: var(--text-sm);
  }

  &--sm {
    height: 28px;
    padding: 0 var(--space-3);
    font-size: var(--text-xs);
  }

  &--icon {
    padding: 0;
    aspect-ratio: 1;
  }

  &--primary {
    background: var(--color-accent);
    color: var(--color-accent-contrast);

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }
  }

  &--secondary {
    background: var(--color-surface);
    border-color: var(--color-border-strong);
    color: var(--color-text);

    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
    }
  }

  &--ghost {
    background: none;
    color: var(--color-text-muted);

    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  &--danger {
    background: var(--color-danger);
    color: var(--color-accent-contrast);

    &:hover:not(:disabled) {
      filter: brightness(0.92);
    }
  }
}
</style>
