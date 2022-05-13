<template>
  <div class="bass">
    <input type="text" placeholder="G" value="G" />
    <input type="text" placeholder="D" value="D" />
    <input type="text" placeholder="A" value="A" />
    <input type="text" placeholder="E" value="E" />
  </div>
</template>

<script>
export default {
  name: "Bass",
};
</script>

<style lang="scss">
.bass {
  display: flex;
  justify-content: space-between;

  input {
    width: 5ch;
    text-align: center;
  }
}
</style>
