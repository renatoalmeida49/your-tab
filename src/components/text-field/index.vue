<template>
  <div class="text-field">
    <div
      class="text-field__input"
      :contentIndex="songIndex"
      ref="input"
      :id="idTag"
      @keydown="change"
      @blur="validate"
      role="textbox"
      contenteditable
    ></div>

    <div class="text-field__select" :class="{ show: showSelect }">
      <div class="text-field__option">Tab</div>
      <div class="text-field__option">Verso</div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "TextField",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      showSelect: false,
    };
  },

  mounted() {
    this.$refs.input.innerText = this.info.text;
    this.$refs.input.focus();
  },

  computed: {
    idTag() {
      return `input-${this.songIndex}`;
    },
  },

  methods: {
    ...mapActions("songStructure", ["removeContent", "focusTextFieldIndex"]),

    remove() {
      this.removeContent(this.songIndex);
    },

    change(event) {
      // MOSTRAR SELECT PARA ADICIONAR PARTE
      if (event.keyCode == 191) {
        this.showSelect = !this.showSelect;

        console.log("Show Select", this.showSelect);

        event.preventDefault();
      }

      // CHECA O ID DO EVENT E MOVE ELE PRA CIMA OU BAIXO
      if (event.keyCode == 38) {
        this.moveCursor("up", event.target.id);
      }

      if (event.keyCode == 40) {
        this.moveCursor("down", event.target.id);
      }

      // ADICIONA NOVO TEXT FIELD
      if (event.keyCode == 13) {
        this.$emit("newTextField", { index: this.songIndex });

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

    validate(event) {
      this.info.text = event.target.innerText;
    },
  },
};
</script>

<style lang="scss">
.text-field {
  width: 100%;
  position: relative;
  z-index: 1;

  &__input {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    padding: 3px;
    min-height: 30px;
    position: relative;
    z-index: 2;

    &:focus {
      outline: none;
      border: 1px solid $gray;
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
  }
}
</style>
