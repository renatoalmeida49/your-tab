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

<script>
import { mapActions } from "pinia";
import { useSongStore } from "@/stores/song";
import { focusAt, getSelectionOffsets } from "@/core/caret";

export default {
  name: "Verse",

  emits: ["newTextField", "moveCursor"],

  props: {
    partId: { type: String, required: true },
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      placeholder: "",
    };
  },

  mounted() {
    this.$refs.input.innerText = this.info.chords;
  },

  // CONTENTEDITABLE NÃO É REATIVO: ATUALIZA QUANDO O STORE MUDA POR FORA
  watch: {
    "info.chords"(chords) {
      if (chords != this.$refs.input.innerText) {
        this.$refs.input.innerText = chords;
      }
    },
  },

  methods: {
    ...mapActions(useSongStore, ["updatePart"]),

    sync() {
      if (!this.$refs.input) return;

      this.updatePart({
        id: this.partId,
        info: { chords: this.$refs.input.innerText.replace(/\n$/, "") },
      });
    },

    validate() {
      this.placeholder = "";
      this.sync();
    },

    focusAt({ column }) {
      const length = this.$refs.input.innerText.length;

      focusAt(this.$refs.input, Math.min(column, length));
    },

    changePlaceholder() {
      this.placeholder = "components.verse.placeholder";
    },

    change(event) {
      if (event.key == "Enter") {
        this.$emit("newTextField", { index: this.songIndex });

        event.preventDefault();
      }

      if (event.key == "ArrowUp" || event.key == "ArrowDown") {
        const offsets = getSelectionOffsets(this.$refs.input);

        this.$emit("moveCursor", {
          direction: event.key == "ArrowUp" ? "up" : "down",
          index: this.songIndex,
          column: offsets ? offsets.start : 0,
        });

        event.preventDefault();
      }
    },
  },
};
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
