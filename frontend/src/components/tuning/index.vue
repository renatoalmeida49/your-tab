<template>
  <div class="tuning">
    <ul class="tuning__menu" role="tablist">
      <li
        v-for="tab in tabs"
        :key="tab.instrument"
        :class="{ active: selected == tab.instrument }"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="selected == tab.instrument"
          @click="selected = tab.instrument"
        >
          {{ $t(tab.label) }}
        </button>
      </li>
    </ul>

    <section class="tuning__tabs">
      <TuningForm :key="selected" :instrument="selected" @close="close" />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import TuningForm from "./components/form.vue";
import { useInstrumentStore } from "@/stores/instrument";
import type { Instrument } from "@/types/song";

const tabs: { instrument: Instrument; label: string }[] = [
  { instrument: "guitar", label: "components.tuning.guitar" },
  { instrument: "ukulele", label: "components.tuning.ukulele" },
  { instrument: "bass", label: "components.tuning.bass" },
];

export default defineComponent({
  name: "Tuning",

  emits: ["close"],

  components: {
    TuningForm,
  },

  // ABRE NA ABA DO INSTRUMENTO ATUAL
  data() {
    return {
      selected: useInstrumentStore().instrument,
      tabs,
    };
  },

  methods: {
    close() {
      this.$emit("close");
    },
  },
});
</script>

<style lang="scss">
.tuning {
  &__menu {
    list-style: none;
    display: flex;
    gap: var(--space-1);
    padding: 3px;
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);

    li {
      flex: 1;
      text-align: center;
    }

    button {
      width: 100%;
      height: 32px;
      border: none;
      border-radius: var(--radius-sm);
      background: none;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      font-weight: 600;
      cursor: pointer;
    }

    li.active button {
      background: var(--color-surface);
      color: var(--color-text);
      box-shadow: var(--shadow-sm);
    }
  }

  &__tabs {
    padding-top: var(--space-5);
  }

  &__caption {
    margin-bottom: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__presets {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-5);

    .tuning__caption {
      width: 100%;
      margin-bottom: 0;
    }
  }

  &__count {
    margin-bottom: var(--space-5);
  }

  &__count-options {
    display: inline-flex;
    gap: var(--space-1);
    padding: 3px;
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);

    button {
      min-width: 40px;
      height: 28px;
      border: none;
      border-radius: var(--radius-sm);
      background: none;
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      font-weight: 700;
      cursor: pointer;

      &.active {
        background: var(--color-surface);
        color: var(--color-text);
        box-shadow: var(--shadow-sm);
      }
    }
  }

  &__strings {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-5);

    input {
      width: 48px;
      height: 40px;
      text-align: center;
      background: var(--color-surface);
      border: 1px solid var(--color-border-strong);
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-weight: 700;

      &:focus {
        outline: none;
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px var(--color-accent-soft);
      }
    }
  }

  &__submit {
    width: 100%;
  }
}
</style>
