<template>
  <div class="verse" contenteditable @blur="validate">
    <span
      v-for="(dash, index) in info.chords.length"
      :key="index"
      :class="checkContent(info.chords.charAt(index))"
    >
      {{ info.chords.charAt(index) }}
    </span>

    <!-- <Draggable :list="info.chords" :key="render">
      <span
        v-for="(dash, index) in info.chords"
        :key="index"
        @click="changeContent(index)"
        :class="checkContent(dash)"
        >{{ dash }}</span
      >
    </Draggable> -->
  </div>
</template>

<script>
// import Draggable from "vuedraggable";

export default {
  name: "Verse",

  components: {
    // Draggable,s
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

    validate(event) {
      // console.log(event.target.innerText);
      console.log(event.target.innerText);
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
