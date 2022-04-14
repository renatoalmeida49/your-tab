<template>
  <div class="text" :contentIndex="songIndex">
    <span
      ref="input"
      @blur="change"
      class="text__area"
      role="textbox"
      contenteditable
    ></span>
  </div>
</template>

<script>
export default {
  name: "Text",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  mounted() {
    this.$refs.input.innerHTML = this.info.text;
  },

  watch: {
    info: {
      handler() {
        this.emitChange();
      },
      deep: true,
    },
  },

  methods: {
    change(event) {
      this.info.text = event.target.innerHTML;
    },

    emitChange() {
      this.$emit("changeContent", {
        content: this.info,
        index: this.songIndex,
      });
    },
  },
};
</script>

<style lang="scss">
.text {
  width: 100%;

  &__area {
    display: block;
    width: 100%;
    height: auto;
    border: 1px solid $gray;
    padding: 3px;

    &:focus {
      outline: none;
    }
  }
}
</style>
