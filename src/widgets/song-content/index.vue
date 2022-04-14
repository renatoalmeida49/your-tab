<template>
  <div class="song-content">
    <div class="song-content__buttons">
      <button @click="removeContent">X</button>
      <button class="song-content__move"></button>
    </div>
    <slot />
  </div>
</template>

<script>
export default {
  name: "SongContent",

  props: {
    contentIndex: { type: Number, required: true },
  },

  methods: {
    removeContent() {
      this.$emit("removeContent", this.contentIndex);
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
  }

  &__move {
    width: 100%;
    height: 100%;
    cursor: move;
    border: 1px solid $black;
    border-radius: 4px;
  }
}
</style>
