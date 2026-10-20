<template>
  <section class="empty-state">
    <h2 class="empty-state__title">{{ $t("components.emptyState.title") }}</h2>
    <p class="empty-state__description">
      {{ $t("components.emptyState.description") }}
    </p>

    <div class="empty-state__options">
      <button
        v-for="option in options"
        :key="option.type"
        class="empty-state__option"
        :class="`empty-state__option--${option.type}`"
        @click="$emit('add', option.type)"
      >
        <component :is="option.icon" :size="20" />
        <strong>{{ $t(option.label) }}</strong>
        <span>{{ $t(option.hint) }}</span>
      </button>
    </div>

    <p class="empty-state__tip">
      <kbd>/</kbd>
      {{ $t("components.emptyState.tip") }}
    </p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { partOptions } from "@/core/config/parts";
import type { PartType } from "@/types/song";

export default defineComponent({
  name: "EmptyState",

  emits: {
    add: (type: PartType) => !!type,
  },

  data() {
    return {
      options: partOptions,
    };
  },
});
</script>

<style lang="scss">
.empty-state {
  margin-top: var(--space-6);
  padding: var(--space-6) var(--space-5);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;

  &__title {
    font-size: var(--text-lg);
  }

  &__description {
    margin-top: var(--space-1);
    color: var(--color-text-muted);
  }

  &__options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
    margin-top: var(--space-5);

    @include tablet {
      grid-template-columns: 1fr;
    }
  }

  &__option {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-4);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition:
      border-color var(--duration-fast),
      background var(--duration-fast);

    svg {
      color: var(--color-accent);
    }

    span {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    &:hover {
      background: var(--color-accent-soft);
      border-color: var(--color-accent);
    }
  }

  &__tip {
    margin-top: var(--space-5);
    color: var(--color-text-muted);
    font-size: var(--text-sm);

    kbd {
      padding: 1px var(--space-2);
      border: 1px solid var(--color-border-strong);
      border-bottom-width: 2px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
    }
  }
}
</style>
