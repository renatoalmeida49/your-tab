<template>
  <div class="verse">
    <Draggable :list="info.chords" :key="render">
      <span
        v-for="(dash, index) in info.chords"
        :key="index"
        @click="changeContent(index)"
        :class="checkContent(dash)"
        >{{ dash }}</span
      >
    </Draggable>
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

    changeContent(index) {
      this.info.chords[index] =
        prompt("Novo valor", this.info.chords[index]) || "-";

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
  display: flex;
  align-items: center;

  .red {
    color: $primary;
    font-family: "title";
  }
}
</style>
