<template>
  <div class="verse">
    <div
      class="verse__input"
      ref="input"
      role="textbox"
      contenteditable
      spellcheck="false"
      @input="sync"
      @blur="validate"
      @keydown="change"
      @focus="changePlaceholder"
      :placeholder="placeholder && $t(placeholder)"
    ></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapActions } from "pinia";
import { useSongStore } from "@/stores/song";
import { focusAt, getSelectionOffsets } from "@/core/caret";
import { partEmits, type FocusTarget } from "@/types/editor";
import type { VerseInfo } from "@/types/song";

export default defineComponent({
  name: "Verse",

  emits: partEmits,

  props: {
    partId: { type: String, required: true },
    // Readonly: A MÚSICA SÓ MUDA PELAS ACTIONS DO STORE
    info: { type: Object as PropType<Readonly<VerseInfo>>, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      placeholder: "",
    };
  },

  mounted() {
    this.input().innerText = this.info.chords;
  },

  // CONTENTEDITABLE NÃO É REATIVO: ATUALIZA QUANDO O STORE MUDA POR FORA
  watch: {
    "info.chords"(chords: string) {
      if (chords != this.input().innerText) {
        this.input().innerText = chords;
      }
    },
  },

  methods: {
    ...mapActions(useSongStore, ["updatePart"]),

    input(): HTMLElement {
      return this.$refs.input as HTMLElement;
    },

    sync() {
      if (!this.input()) return;

      this.updatePart({
        id: this.partId,
        info: { chords: this.input().innerText.replace(/\n$/, "") },
      });
    },

    validate() {
      this.placeholder = "";
      this.sync();
    },

    focusAt({ column }: FocusTarget) {
      const length = this.input().innerText.length;

      focusAt(this.input(), Math.min(column, length));
    },

    changePlaceholder() {
      this.placeholder = "components.verse.placeholder";
    },

    change(event: KeyboardEvent) {
      if (event.key == "Enter") {
        this.$emit("newTextField", { index: this.songIndex });

        event.preventDefault();
      }

      if (event.key == "ArrowUp" || event.key == "ArrowDown") {
        const offsets = getSelectionOffsets(this.input());

        this.$emit("moveCursor", {
          direction: event.key == "ArrowUp" ? "up" : "down",
          index: this.songIndex,
          column: offsets ? offsets.start : 0,
        });

        event.preventDefault();
      }
    },
  },
});
</script>

<style lang="scss">
.verse {
  width: 100%;
  display: flex;
  align-items: center;

  // MESMA FONTE MONOESPAÇADA E ESPAÇAMENTO DO TEXTO: CADA COLUNA DO ACORDE
  // CAI EXATAMENTE SOBRE A MESMA COLUNA DA LETRA
  &__input {
    width: 100%;
    color: $primary;
    font-family: monospace;
    font-weight: 700;
    padding: 3px;
    border: 1px solid transparent;
    white-space: pre-wrap;

    &:focus {
      outline: none;
      border-color: $gray;
    }

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $tertiary;
      opacity: 0.5;
      font-family: monospace;
    }
  }
}
</style>
