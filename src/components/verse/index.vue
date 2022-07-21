<template>
  <div class="verse" contenteditable @blur="validate">
    <span
      v-for="(dash, index) in info.chords.length"
      :key="index"
      :class="checkContent(info.chords.charAt(index))"
    >
      {{ info.chords.charAt(index) }}
    </span>
  </div>
</template>

<script>
export default {
  name: "Verse",

  props: {
    info: { type: Object, required: true },
  },

  data() {
    return {
      render: 1,
    };
  },

  methods: {
    checkContent(content) {
      return content != "-" ? "red" : "verse-dash";
    },

    validate(event) {
      this.info.chords = event.target.innerText;
    },
  },
};
</script>

<style lang="scss">
.verse {
  width: 100%;
  display: flex;
  align-items: center;

  .red {
    color: $primary;
    font-family: "title";
  }
}
</style>
