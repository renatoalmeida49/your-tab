<template>
  <div
    class="tab"
    :key="render"
    :contentIndex="songIndex"
    contenteditable
    @keydown="change"
    @blur="validate"
  >
    <pre>{{ info.text.trim() }}</pre>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Tab",

  props: {
    partId: { type: String, required: true },
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      render: 0,
    };
  },

  methods: {
    ...mapActions("songStructure", ["updatePart"]),

    validate(event) {
      this.updatePart({
        id: this.partId,
        info: { text: event.target.innerText },
      });
    },

    change(event) {
      if (event.keyCode == 13) {
        this.$emit("newTextField", { index: this.songIndex });

        event.preventDefault();
      }
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
