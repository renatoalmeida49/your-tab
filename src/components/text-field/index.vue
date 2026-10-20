<template>
  <div class="text-field">
    <div
      class="text-field__input"
      ref="input"
      :id="idInputTag"
      spellcheck="false"
      @keydown="change"
      @input="sync"
      @blur="validate"
      @focus="changePlaceholder"
      role="textbox"
      contenteditable
      :placeholder="placeholder && $t(placeholder)"
    ></div>

    <div class="text-field__select" :class="{ show: showSelect }">
      <div
        v-for="(option, index) in options"
        :key="option.key"
        class="text-field__option"
        :class="{ show: index === selectedOption }"
      >
        {{ $t(option.label) }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import { focusAt, getSelectionOffsets } from "@/core/caret";

export default {
  name: "TextField",

  emits: ["newTextField", "moveCursor"],

  props: {
    partId: { type: String, required: true },
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      showSelect: false,
      selectedOption: 0,
      options: [
        { key: "tab", label: "components.textField.selectTab" },
        { key: "verse", label: "components.textField.selectVerse" },
      ],
      placeholder: "",
    };
  },

  mounted() {
    this.$refs.input.innerText = this.info.text;

    if (this.focusId == this.partId) this.$refs.input.focus();

    this.$refs.input.addEventListener("paste", (event) => {
      event.preventDefault();
      let paste = event.clipboardData.getData("text");

      let array = paste.split("\n");

      array.map((line, index) => {
        if (index == 0) {
          this.$refs.input.innerText = line;
          this.setText(line);
          return;
        }

        this.addContentBetweenParts({
          component: "textField",
          content: line,
          index: this.songIndex + index,
        });
      });
    });
  },

  // CONTENTEDITABLE NÃO É REATIVO: ATUALIZA QUANDO O STORE MUDA POR FORA
  watch: {
    "info.text"(text) {
      if (text != this.$refs.input.innerText) this.$refs.input.innerText = text;
    },
  },

  computed: {
    ...mapGetters("songStructure", ["focusId"]),

    idInputTag() {
      return `input-${this.partId}`;
    },
  },

  methods: {
    ...mapActions("songStructure", [
      "removeContent",
      "addContentBetweenParts",
      "updatePart",
    ]),

    setText(text) {
      this.updatePart({ id: this.partId, info: { text } });
    },

    sync() {
      if (!this.$refs.input) return;

      this.setText(this.$refs.input.innerText.replace(/\n$/, ""));
    },

    focusAt({ column }) {
      const length = this.$refs.input.innerText.length;

      focusAt(this.$refs.input, Math.min(column, length));
    },

    remove() {
      this.removeContent(this.songIndex);
    },

    change(event) {
      // MOSTRAR SELECT PARA ADICIONAR PARTE
      if (event.key == "/") {
        this.showSelect = true;
        this.selectedOption = 0;

        event.preventDefault();
      }

      // ESC FECHA O SELECT
      if (event.key == "Escape" && this.showSelect) {
        this.showSelect = false;

        event.preventDefault();
      }

      // NAVEGA NO SELECT OU MOVE O CURSOR PRA CIMA/BAIXO
      if (event.key == "ArrowUp") {
        if (this.showSelect) {
          this.moveSelection(-1);
        } else {
          this.moveCursor("up");
        }

        event.preventDefault();
      }

      if (event.key == "ArrowDown") {
        if (this.showSelect) {
          this.moveSelection(1);
        } else {
          this.moveCursor("down");
        }

        event.preventDefault();
      }

      // ADICIONA NOVO TEXT FIELD
      if (event.key == "Enter") {
        if (!this.showSelect) {
          this.$emit("newTextField", { index: this.songIndex });
        } else {
          const partToAdd = this.options[this.selectedOption].key;

          const index =
            partToAdd == "verse" ? this.songIndex : this.songIndex + 1;

          this.addContentBetweenParts({
            component: partToAdd,
            index: index,
          });

          this.showSelect = false;
        }

        event.preventDefault();
      }

      // BACKSPACE OU DELETE
      if (event.key == "Backspace" || event.key == "Delete") {
        this.checkRemove();
      }
    },

    moveSelection(step) {
      const total = this.options.length;

      this.selectedOption = (this.selectedOption + step + total) % total;
    },

    moveCursor(direction) {
      const offsets = getSelectionOffsets(this.$refs.input);

      this.$emit("moveCursor", {
        direction,
        index: this.songIndex,
        column: offsets ? offsets.start : 0,
      });
    },

    checkRemove() {
      if (this.info.text.length == 0) {
        this.remove();
      }
    },

    changePlaceholder() {
      this.placeholder = "components.textField.placeholder";
    },

    validate() {
      this.placeholder = "";
      this.showSelect = false;
      this.sync();
    },
  },
};
</script>

<style lang="scss">
.text-field {
  width: 100%;

  &__input {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    padding: 3px;
    min-height: 30px;
    border: 1px solid transparent;
    white-space: pre-wrap;

    // SÓ A COR MUDA NO FOCO: UMA BORDA NOVA EMPURRARIA O TEXTO 1px
    &:focus {
      outline: none;
      border-color: $gray;
    }

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $tertiary;
      opacity: 0.5;
    }
  }

  &__select {
    display: inline-flex;
    flex-direction: column;
    position: absolute;
    z-index: 3;
    visibility: hidden;

    &.show {
      visibility: inherit;
    }
  }

  &__option {
    background: #cacaca;
    padding: 5px 10px;

    &.show {
      background: #cf4c4c;
    }
  }
}
</style>
