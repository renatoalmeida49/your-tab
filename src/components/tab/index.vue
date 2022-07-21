<template>
  <div
    class="tab"
    :key="render"
    :contentIndex="songIndex"
    contenteditable
    @blur="validate"
  >
    <pre>  {{ info.text.trim() }}</pre>
  </div>
</template>

<script>
export default {
  name: "Tab",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      render: 0,
    };
  },

  methods: {
    validate(event) {
      this.info.text = event.target.innerText;
    },
  },
};
</script>

<style lang="scss">
.tab {
  &__string {
    display: flex;

    span {
      cursor: pointer;
    }
  }
}
</style>
