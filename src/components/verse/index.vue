<template>
  <div class="verse" :key="render" :contentIndex="songIndex">
    <div class="verse__container">
      <Draggable :list="info.chords">
        <span
          v-for="(dash, index) in info.chords"
          :key="index"
          @dblclick="changeContent(index)"
          :class="checkContent(dash)"
          >{{ dash }}</span
        >
      </Draggable>
      <!-- <pre>{{ info.verse }}</pre> -->
      <span
        ref="input"
        class="verse__input"
        @blur="change"
        role="textbox"
        contenteditable
      ></span>
    </div>
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

  mounted() {
    this.$refs.input.innerHTML = this.info.verse;
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

    change(event) {
      this.info.verse = event.target.innerHTML;
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

  .red {
    color: $primary;
    font-family: "title";
  }

  &__container {
    width: 100%;
  }

  &__input {
    display: block;
    border: 1px solid $gray;
    padding: 3px;
    width: 100%;

    &:focus {
      outline: none;
    }
  }
}
</style>
