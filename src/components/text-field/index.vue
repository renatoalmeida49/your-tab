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
      :placeholder="placeholder"
    ></div>

    <div
      class="text-field__select"
      :id="idSelecTag"
      :class="{ show: showSelect }"
    >
      <div class="text-field__option" data-key="tab">Tab</div>
      <div class="text-field__option" data-key="verse">Verso</div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "TextField",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      showSelect: false,
      placeholder: "",
    };
  },

  mounted() {
    this.$refs.input.innerText = this.info.text;
    this.$refs.input.focus();
  },

  computed: {
    ...mapGetters("instrument", ["tuning"]),

    idInputTag() {
      return `input-${this.songIndex}`;
    },

    idSelecTag() {
      return `select-${this.songIndex}`;
    },
  },

  methods: {
    ...mapActions("songStructure", [
      "removeContent",
      "focusTextFieldIndex",
      "addContent",
      "addContentBetweenParts",
    ]),

    remove() {
      this.removeContent(this.songIndex);
    },

    addPart(part) {
      console.log(part);
    },

    change(event) {
      // MOSTRAR SELECT PARA ADICIONAR PARTE
      if (event.keyCode == 191) {
        this.showSelect = true;

        let i = 0; // iterate over children elements inside dropdown
        const dropdown = document.querySelector(`#${this.idSelecTag}`);
        dropdown.classList.toggle("show");
        const childs = dropdown.children; // get all dropdown elements

        // attach keyboard events
        window.addEventListener("keydown", (event) => {
          switch (event.code) {
            case "ArrowDown":
              for (let c of childs) c.classList.remove("show");
              childs[Math.abs(i) % childs.length].classList.add("show");
              i++;
              break;
            case "ArrowUp":
              for (let c of childs) c.classList.remove("show");
              childs[Math.abs(i) % childs.length].classList.add("show");
              i--;
              break;
          }
          if (event.isComposing || event.keyCode === 229) {
            return;
          }
        });

        event.preventDefault();
      }

      // CHECA O ID DO EVENT E MOVE ELE PRA CIMA OU BAIXO
      if (event.keyCode == 38) {
        if (!this.showSelect) {
          this.moveCursor("up", event.target.id);
        }

        event.preventDefault();
      }

      if (event.keyCode == 40) {
        if (!this.showSelect) {
          this.moveCursor("down", event.target.id);
        }

        event.preventDefault();
      }

      // ADICIONA NOVO TEXT FIELD
      if (event.keyCode == 13) {
        if (!this.showSelect) {
          this.$emit("newTextField", { index: this.songIndex });
        } else {
          const partToAdd = document.querySelector(".text-field__option.show")
            .dataset.key;

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

      this.info.text = event.target.innerText;

      // BACKSPACE OU DELETE
      if (event.keyCode == 8 || event.keyCode == 46) {
        this.checkRemove();
      }
    },

    moveCursor(direction, id) {
      this.$emit("moveCursor", { direction: direction, id: id });
    },

    checkRemove() {
      if (this.info.text.length == 0) {
        this.remove();
      }
    },

    changePlaceholder() {
      this.placeholder = "Pressione '/' para inserir uma tablatura ou verso";
    },

    validate(event) {
      this.placeholder = "";
      this.info.text = event.target.innerText;
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
