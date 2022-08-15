<template>
  <div class="verse">
    <div
      class="verse__input"
      ref="input"
      role="textbox"
      contenteditable
      @blur="validate"
      @keydown="change"
      @focus="changePlaceholder"
      :placeholder="$t(placeholder)"
    ></div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "Verse",

  props: {
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      placeholder: "",
    };
  },

  mounted() {
    this.$refs.input.innerText = this.info.chords;
  },

  methods: {
    ...mapActions("songStructure", ["addContentBetweenParts"]),

    validate(event) {
      this.placeholder = "";
      this.info.chords = event.target.innerText;
    },

    changePlaceholder() {
      this.placeholder = "components.verse.placeholder";
    },

    change(event) {
      if (event.keyCode == 13) {
        this.addContentBetweenParts({
          component: "textField",
          index: this.songIndex + 1,
        });

        event.preventDefault();
      }
    },
  },
};
</script>

<style lang="scss">
.verse {
  width: 100%;
  display: flex;
  align-items: center;

  &__input {
    width: 100%;
    color: $primary;
    font-family: "title";

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: $terciary;
      opacity: 0.5;
      font-family: monospace;
    }
  }

  .red {
    color: $primary;
    font-family: "title";
  }
}
</style>
