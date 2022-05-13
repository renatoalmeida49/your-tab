<template>
  <div class="song-content">
    <div class="song-content__buttons">
      <button
        class="song-content__remove"
        @click="remove"
        v-if="showCloseButton"
      >
        X
      </button>
      <button class="song-content__move">
        <div class="song-content__line"></div>
        <div class="song-content__line"></div>
        <div class="song-content__line"></div>
      </button>
    </div>

    <slot />
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "SongContent",

  props: {
    contentIndex: { type: Number, required: true },
    showCloseButton: { type: Boolean, default: true },
  },

  methods: {
    ...mapActions("songStructure", ["removeContent"]),

    remove() {
      this.removeContent(this.contentIndex);
    },
  },
};
</script>

<style lang="scss">
.song-content {
  display: flex;
  gap: 10px;
  margin-bottom: $margin-bottom;

  &__buttons {
    display: flex;
    flex-direction: column;
    width: 10px;
  }

  &__line {
    width: 80%;
    height: 2px;
    background: rgba(0, 0, 0, 0.5);
    margin: 3px 0;
    border-radius: 6px;
  }

  &__move {
    width: 100%;
    height: 100%;
    cursor: move;
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    padding: 1px;
    background: rgb(247, 243, 243);
  }

  &__remove {
    font-size: 0.7rem;
    background: none;
    border: none;
    cursor: pointer;
    color: red;
    transition: all 0.2s;

    &:hover {
      color: rgb(182, 77, 77);
    }
  }
}
</style>
