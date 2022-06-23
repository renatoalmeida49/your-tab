<template>
  <div
    class="text-field"
    :contentIndex="songIndex"
    ref="input"
    :id="idTag"
    @keydown="change"
    @blur="validate"
    role="textbox"
    contenteditable
  ></div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "TextField",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
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
      // CHECA O ID DO EVENT E MOVE ELE PRA CIMA OU BAIXO
      if (event.keyCode == 38) {
        this.moveCursor("up", event.target.id);
      }

      if (event.keyCode == 40) {
        this.moveCursor("down", event.target.id);
      }

      if (event.keyCode == 13) {
        this.$emit("newTextField", { index: this.songIndex });

        event.preventDefault();
      }

      this.info.text = event.target.innerText;

      if (event.keyCode == 8 || event.keyCode == 46) {
        this.checkRemove();
      }
    },

    moveCursor(direction, id) {
      this.$emit("moveCursor", { direction: direction, id: id });
    },

    checkRemove() {
      if (this.info.text.length <= 1) {
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
}
</style>
