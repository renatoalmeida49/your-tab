<template>
  <div class="song-content" :style="propStyle">
    <div class="song-content__buttons">
      <button
        class="song-content__remove"
        @click="remove"
        v-if="showCloseButton"
      >
        X
      </button>
      <button class="song-content__move">
        <div class="song-content__line"></div>
        <div class="song-content__line"></div>
        <div class="song-content__line"></div>
      </button>
    </div>

    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions } from "pinia";
import { useSongStore } from "@/stores/song";

export default defineComponent({
  name: "SongContent",

  props: {
    contentIndex: { type: Number, required: true },
    showCloseButton: { type: Boolean, default: true },
    type: { type: String, required: true },
  },

  computed: {
    propStyle() {
      return {
        marginBottom: this.type == "tab" ? "15px" : "",
        marginTop: this.type == "tab" ? "15px" : "",
      };
    },
  },

  methods: {
    ...mapActions(useSongStore, ["removePart"]),

    remove() {
      this.removePart(this.contentIndex);
    },
  },
});
</script>

<style lang="scss">
.song-content {
  display: flex;
  position: relative;

  &__buttons {
    // NÃO ENCOLHE: O TEXTO DE TODAS AS PARTES COMEÇA NA MESMA COLUNA
    flex: none;
    display: flex;
    justify-content: flex-end;
    gap: 2px;
    width: 20px;
    margin-right: 7px;

    // SÓ APARECEM COM O MOUSE OU O FOCO NA PARTE
    visibility: hidden;

    .song-content:hover &,
    .song-content:focus-within & {
      visibility: visible;
    }
  }

  &__line {
    width: 80%;
    height: 2px;
    background: var(--color-text-subtle);
    margin: 3px 0;
    border-radius: 6px;
  }

  &__move {
    height: 100%;
    width: 10px;
    cursor: move;
    border: 1px solid var(--color-border-strong);
    border-radius: 6px;
    padding: 1px;
    background: var(--color-surface-muted);
  }

  &__remove {
    font-size: 0.7rem;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-danger);
    transition: all 0.2s;

    &:hover {
      color: var(--color-accent-hover);
    }
  }
}
</style>
