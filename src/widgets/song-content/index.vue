<template>
  <div class="song-content">
    <button class="song-content__move"></button>
    <slot />
  </div>
</template>

<script>
export default {
  name: "SongContent",
};
</script>

<style lang="scss">
.song-content {
  display: flex;
  gap: 10px;
  margin-bottom: $margin-bottom;

  &__move {
    width: 10px;
    cursor: move;
    border: 1px solid $black;
    border-radius: 4px;
  }
}
</style>
