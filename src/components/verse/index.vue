<template>
  <div class="verse">
    <div class="verse__container">
      <Draggable :list="info.chords" :key="render">
        <span
          v-for="(dash, index) in info.chords"
          :key="index"
          @click="changeContent(index)"
          :class="checkContent(dash)"
          >{{ dash }}</span
        >
      </Draggable>

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
  },

  data() {
    return {
      render: 1,
    };
  },

  mounted() {
    this.$refs.input.innerHTML = this.info.verse;
    this.$refs.input.focus();
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

    change(event) {
      this.info.verse = event.target.innerHTML;
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
