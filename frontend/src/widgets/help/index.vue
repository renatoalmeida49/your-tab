<template>
  <Modal
    v-if="helpOpen"
    :title="$t('components.help.title')"
    :showFooter="false"
    wide
    @close="setHelpOpen(false)"
  >
    <div class="help">
      <p class="help__subtitle">{{ $t("subtitle") }}</p>

      <h2 class="help__heading">{{ $t("components.help.shortcutsTitle") }}</h2>

      <dl class="help__shortcuts">
        <div
          v-for="(shortcut, index) in $tm('components.help.shortcuts')"
          :key="index"
          class="help__shortcut"
        >
          <dt>
            <!-- "Ctrl+Shift+Z" VIRA TRÊS TECLAS -->
            <kbd
              v-for="(key, indexKey) in $rt(shortcut.keys).split('+')"
              :key="indexKey"
            >
              {{ key }}
            </kbd>
          </dt>
          <dd>{{ $rt(shortcut.description) }}</dd>
        </div>
      </dl>

      <!-- $t NÃO DEVOLVE ARRAYS NO VUE-I18N 9+: $tm PEGA A ESTRUTURA, $rt RENDERIZA -->
      <section class="help__details">
        <div v-for="(item, indexItem) in $tm('details')" :key="indexItem">
          <h2 class="help__heading">{{ $rt(item.title) }}</h2>

          <ul v-if="Array.isArray(item.description)">
            <li
              v-for="(subitem, indexSubitem) in item.description"
              :key="indexSubitem"
            >
              {{ $rt(subitem) }}
            </li>
          </ul>
          <p v-else>
            {{ $rt(item.description) }}
          </p>
        </div>
      </section>
    </div>
  </Modal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useUiStore } from "@/stores/ui";

export default defineComponent({
  name: "TheHelp",

  computed: {
    ...mapState(useUiStore, ["helpOpen"]),
  },

  methods: {
    ...mapActions(useUiStore, ["setHelpOpen"]),
  },
});
</script>

<style lang="scss">
.help {
  &__subtitle {
    color: var(--color-text-muted);
  }

  &__heading {
    margin: var(--space-5) 0 var(--space-2);
    font-size: var(--text-md);
    font-weight: 700;
  }

  &__shortcuts {
    display: grid;
    gap: var(--space-2);
  }

  &__shortcut {
    display: grid;
    grid-template-columns: 180px 1fr;
    align-items: baseline;
    gap: var(--space-3);

    @include tablet {
      grid-template-columns: 1fr;
      gap: var(--space-1);
    }

    dt {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
    }

    dd {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }
  }

  kbd {
    min-width: 24px;
    padding: 2px var(--space-2);
    border: 1px solid var(--color-border-strong);
    border-bottom-width: 2px;
    border-radius: var(--radius-sm);
    background: var(--color-surface-muted);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-align: center;
  }

  &__details {
    p,
    li {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
    }

    ul {
      padding-left: var(--space-5);
    }
  }
}
</style>
