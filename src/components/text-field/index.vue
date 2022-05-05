<template>
  <div class="text-field" :contentIndex="songIndex">
    <span
      ref="input"
      @blur="change"
      class="text-field__area"
      role="textbox"
      contenteditable
    ></span>
  </div>
</template>

<script>
export default {
  name: "TextField",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  mounted() {
    this.$refs.input.innerHTML = this.info.text;
  },

  methods: {
    change(event) {
      this.info.text = event.target.innerHTML;
    },
  },
};
</script>

<style lang="scss">
.text-field {
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
