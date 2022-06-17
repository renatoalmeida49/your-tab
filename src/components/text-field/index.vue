<template>
  <div
    class="text-field"
    :contentIndex="songIndex"
    ref="input"
    @keypress="change"
    @blur="validate"
    role="textbox"
    contenteditable
  ></div>
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
    this.$refs.input.focus();
  },

  methods: {
    change(event) {
      if (event.keyCode != 13) {
        this.info.text = event.target.innerText;
        return;
      }

      this.$emit("addTextField");

      event.preventDefault();
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
  border: 1px solid $gray;
  padding: 3px;
  min-height: 30px;

  &:focus {
    outline: none;
  }
}
</style>
