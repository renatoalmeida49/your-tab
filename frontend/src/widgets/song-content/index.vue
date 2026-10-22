<template>
  <div
    class="song-content"
    :class="[`song-content--${type}`, { 'song-content--selected': selected }]"
  >
    <div class="song-content__gutter" data-pdf-hide>
      <DropdownMenuRoot>
        <DropdownMenuTrigger
          class="song-content__add"
          :aria-label="$t('components.songContent.insertBelow')"
          :title="$t('components.songContent.insertBelow')"
        >
          <Plus :size="16" />
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            class="dropdown song-content__menu"
            side="bottom"
            align="start"
          >
            <DropdownMenuItem
              v-for="option in partOptions"
              :key="option.type"
              class="dropdown__item"
              :class="`song-content__insert-${option.type}`"
              @select="insert(option.type)"
            >
              <component :is="option.icon" :size="16" />
              {{ $t(option.label) }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <!-- A ALÇA ARRASTA; UM CLIQUE SEM ARRASTAR ABRE AS AÇÕES (COM Shift,
           SELECIONA AS LINHAS, PELO Home). O GATILHO DO
           MENU É UM <span> SEM PONTEIRO SOBRE A ALÇA, PARA O pointerdown DO
           MENU NÃO DISPUTAR COM O DO ARRASTO -->
      <DropdownMenuRoot v-model:open="actionsOpen">
        <DropdownMenuTrigger as-child>
          <span class="song-content__anchor" aria-hidden="true"></span>
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent
            class="dropdown song-content__menu"
            side="bottom"
            align="start"
          >
            <DropdownMenuItem
              class="dropdown__item song-content__duplicate"
              @select="duplicatePart(contentIndex)"
            >
              <Copy :size="16" />
              {{ $t("components.songContent.duplicate") }}
            </DropdownMenuItem>
            <DropdownMenuItem
              class="dropdown__item song-content__move-up"
              :disabled="contentIndex == 0"
              @select="movePart({ index: contentIndex, step: -1 })"
            >
              <ArrowUp :size="16" />
              {{ $t("components.songContent.moveUp") }}
            </DropdownMenuItem>
            <DropdownMenuItem
              class="dropdown__item song-content__move-down"
              :disabled="isLast"
              @select="movePart({ index: contentIndex, step: 1 })"
            >
              <ArrowDown :size="16" />
              {{ $t("components.songContent.moveDown") }}
            </DropdownMenuItem>
            <DropdownMenuSeparator class="dropdown__separator" />
            <DropdownMenuItem
              class="dropdown__item dropdown__item--danger song-content__remove"
              @select="remove"
            >
              <Trash2 :size="16" />
              {{ $t("components.songContent.remove") }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenuRoot>

      <button
        class="song-content__move"
        :aria-label="$t('components.songContent.actions')"
        :title="$t('components.songContent.actions')"
        @click="actionsOpen = !$event.shiftKey"
      >
        <GripVertical :size="16" />
      </button>
    </div>

    <div class="song-content__body">
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-vue-next";
import { partOptions } from "@/core/config/parts";
import { useSongStore } from "@/stores/song";
import type { PartType } from "@/types/song";

export default defineComponent({
  name: "SongContent",

  components: {
    ArrowDown,
    ArrowUp,
    Copy,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuRoot,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    GripVertical,
    Plus,
    Trash2,
  },

  props: {
    contentIndex: { type: Number, required: true },
    isLast: { type: Boolean, default: false },
    type: { type: String, required: true },
    selected: { type: Boolean, default: false },
  },

  data() {
    return {
      actionsOpen: false,
      partOptions,
    };
  },

  methods: {
    ...mapActions(useSongStore, [
      "addContentBetweenParts",
      "duplicatePart",
      "movePart",
      "removePart",
    ]),

    insert(component: PartType) {
      this.addContentBetweenParts({ component, index: this.contentIndex + 1 });
    },

    remove() {
      this.removePart(this.contentIndex);
    },
  },
});
</script>

<style lang="scss">
.song-content {
  display: flex;
  border-radius: var(--radius-sm);

  &--tab {
    margin: var(--space-3) 0;
  }

  &__gutter {
    flex: none;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    gap: 2px;
    // NA MARGEM DA FOLHA (MARGEM NEGATIVA, --gutter VEM DO Home): O TEXTO DE
    // TODAS AS PARTES COMEÇA NA MESMA COLUNA, COMO NO PDF
    width: var(--gutter);
    margin-left: calc(-1 * var(--gutter));
    padding: 3px var(--space-2) 0 0;
    position: relative;
    opacity: 0;
    transition: opacity var(--duration-fast);

    .song-content:hover &,
    .song-content:focus-within & {
      opacity: 1;
    }

    // TOQUE NÃO TEM HOVER: BOTÕES SEMPRE À MOSTRA, DISCRETOS
    @media (hover: none) {
      opacity: 0.6;
    }
  }

  &__add,
  &__move {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: var(--color-text-subtle);
    cursor: pointer;

    &:hover,
    &[data-state="open"] {
      background: var(--color-surface-hover);
      color: var(--color-text);
    }
  }

  &__move {
    cursor: grab;
  }

  // NO CELULAR SÓ A ALÇA: INSERIR FICA NA BARRA DO TOPO
  &__add {
    @include tablet {
      display: none;
    }
  }

  &__anchor {
    position: absolute;
    right: var(--space-2);
    top: 3px;
    width: 22px;
    height: 24px;
    pointer-events: none;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &--tab &__body {
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: border-color var(--duration-fast);
  }

  &--tab:focus-within &__body {
    border-color: var(--color-accent);
  }

  // SELECIONADA COMO BLOCO: DEPOIS DO --tab PARA VENCER O FUNDO DA TAB
  &--selected,
  &--selected &__body {
    background: var(--color-accent-soft);
  }

  &--selected.song-content--tab &__body {
    border-color: var(--color-accent);
  }

  // VueDraggable: FANTASMA NO LUGAR ONDE A PARTE VAI CAIR
  &.sortable-ghost {
    opacity: 0.4;
    background: var(--color-accent-soft);
  }
}
</style>
