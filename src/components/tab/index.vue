<template>
  <div class="tab" contenteditable @keydown="change" @blur="validate">
    <pre>{{ info.text.trim() }}</pre>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Tab",

  emits: ["newTextField"],

  props: {
    partId: { type: String, required: true },
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
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
      if (event.key == "Enter") {
        this.$emit("newTextField", { index: this.songIndex });

        event.preventDefault();
      }
    },
  },
};
</script>
