<template>
  <div class="verse" :key="render">
    <Draggable :list="chords">
      <span
        v-for="(dash, index) in chords"
        :key="index"
        @dblclick="changeContent(index)"
        :class="checkContent(dash)"
        >{{ dash }}</span
      >
    </Draggable>
    <pre>{{ verse }}</pre>
    <input class="verse-input" type="text" v-model="verse" />
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "Verse",

  components: {
    Draggable,
  },

  data() {
    const chordsLine = () => {
      return [
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
      ];
    };

    return {
      render: 1,
      chords: chordsLine(),
      verse: "",
    };
  },

  methods: {
    checkContent(content) {
      return content != "-" ? "red" : "verse-dash";
    },

    changeContent(index) {
      this.chords[index] = prompt(this.chords[index]);

      this.forceRender();
    },

    forceRender() {
      this.render++;
    },
  },
};
</script>

<style lang="scss">
.verse {
  width: 100%;
  font-family: monospace;
  margin-bottom: $margin-bottom;

  .red {
    color: $primary;
    font-family: "title";
  }
}
</style>
