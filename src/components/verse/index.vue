<template>
  <div class="verse" :key="render">
    <Draggable :list="info.chords">
      <span
        v-for="(dash, index) in info.chords"
        :key="index"
        @dblclick="changeContent(index)"
        :class="checkContent(dash)"
        >{{ dash }}</span
      >
    </Draggable>
    <pre>{{ info.verse }}</pre>
    <input class="verse-input" type="text" v-model="info.verse" />
  </div>
</template>

<script>
import Draggable from "vuedraggable";

export default {
  name: "Verse",

  components: {
    Draggable,
  },

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      render: 1,
    };
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
    checkContent(content) {
      return content != "-" ? "red" : "verse-dash";
    },

    changeContent(index) {
      this.info.chords[index] = prompt(this.info.chords[index]);

      this.emitChange();

      this.forceRender();
    },

    forceRender() {
      this.render++;
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
