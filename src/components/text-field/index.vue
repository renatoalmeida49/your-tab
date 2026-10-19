<template>
  <div class="text-field">
    <div
      class="text-field__input"
      :contentIndex="songIndex"
      ref="input"
      :id="idInputTag"
      @keydown="change"
      @blur="validate"
      @focus="changePlaceholder"
      role="textbox"
      contenteditable
      :placeholder="$t(placeholder)"
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

export default {
  name: "TextField",

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

  computed: {
    ...mapGetters("songStructure", ["focusId"]),

    idInputTag() {
      return `input-${this.partId}`;
    },
  },

  methods: {
    ...mapActions("songStructure", [
      "removeContent",
      "addContent",
      "addContentBetweenParts",
      "updatePart",
    ]),

    setText(text) {
      this.updatePart({ id: this.partId, info: { text } });
    },

    remove() {
      this.removeContent(this.songIndex);
    },

    addPart(part) {
      console.log(part);
    },

    change(event) {
      // MOSTRAR SELECT PARA ADICIONAR PARTE
      // event.key: keyCode MUDA COM O LAYOUT (ABNT2, TECLADO NUMÉRICO)
      if (event.key == "/") {
        this.showSelect = true;
        this.selectedOption = 0;

        event.preventDefault();
      }

      // ESC FECHA O SELECT
      if (event.keyCode == 27 && this.showSelect) {
        this.showSelect = false;

        event.preventDefault();
      }

      // NAVEGA NO SELECT OU MOVE O CURSOR PRA CIMA/BAIXO
      if (event.keyCode == 38) {
        if (this.showSelect) {
          this.moveSelection(-1);
        } else {
          this.moveCursor("up");
        }

        event.preventDefault();
      }

      if (event.keyCode == 40) {
        if (this.showSelect) {
          this.moveSelection(1);
        } else {
          this.moveCursor("down");
        }

        event.preventDefault();
      }

      // ADICIONA NOVO TEXT FIELD
      if (event.keyCode == 13) {
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

      this.setText(event.target.innerText);

      // BACKSPACE OU DELETE
      if (event.keyCode == 8 || event.keyCode == 46) {
        this.checkRemove();
      }
    },

    moveSelection(step) {
      const total = this.options.length;

      this.selectedOption = (this.selectedOption + step + total) % total;
    },

    moveCursor(direction) {
      this.$emit("moveCursor", { direction: direction, index: this.songIndex });
    },

    checkRemove() {
      if (this.info.text.length == 0) {
        this.remove();
      }
    },

    changePlaceholder() {
      this.placeholder = "components.textField.placeholder";
    },

    validate(event) {
      this.placeholder = "";
      this.showSelect = false;
      this.setText(event.target.innerText);
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

    &:focus {
      outline: none;
      border: 1px solid $gray;
    }

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $terciary;
      opacity: 0.5;
    }
  }

  &__select {
    background: red;
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
