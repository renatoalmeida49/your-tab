<template>
  <div class="tuning">
    <ul class="tuning__menu" role="tablist">
      <li
        v-for="tab in tabs"
        :key="tab.component"
        :class="{ active: selectedComponent == tab.component }"
      >
        <button
          type="button"
          role="tab"
          :aria-selected="selectedComponent == tab.component"
          @click="newTab(tab.component)"
        >
          {{ $t(tab.label) }}
        </button>
      </li>
    </ul>

    <section class="tuning__tabs">
      <component :is="selectedComponent" @close="close" />
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Bass from "./components/bass.vue";
import Guitar from "./components/guitar.vue";
import Ukulele from "./components/ukulele.vue";

type TuningTab = "Guitar" | "Ukulele" | "Bass";

const tabs: { component: TuningTab; label: string }[] = [
  { component: "Guitar", label: "components.tuning.guitar" },
  { component: "Ukulele", label: "components.tuning.ukulele" },
  { component: "Bass", label: "components.tuning.bass" },
];

export default defineComponent({
  name: "Tuning",

  emits: ["close"],

  components: {
    Bass,
    Guitar,
    Ukulele,
  },

  data() {
    return {
      selectedComponent: "Guitar" as TuningTab,
      tabs,
    };
  },

  methods: {
    newTab(component: TuningTab) {
      this.selectedComponent = component;
    },

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
