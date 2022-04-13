<template>
  <div class="song-content">
    <button class="song-content__move">Teste</button>
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
}
</style>
