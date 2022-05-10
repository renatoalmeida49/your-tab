<template>
  <div class="guitar">
    <input type="text" placeholder="e" value="e" />
    <input type="text" placeholder="B" value="B" />
    <input type="text" placeholder="G" value="G" />
    <input type="text" placeholder="D" value="D" />
    <input type="text" placeholder="A" value="A" />
    <input type="text" placeholder="E" value="E" />
  </div>
</template>

<script>
export default {
  name: "Guitar",
};
</script>

<style lang="scss">
.guitar {
  display: flex;
  justify-content: space-between;

  input {
    width: 5ch;
    text-align: center;
  }
}
</style>
