<template>
  <div class="ukulele">
    <input type="text" placeholder="A" value="A" />
    <input type="text" placeholder="E" value="E" />
    <input type="text" placeholder="C" value="C" />
    <input type="text" placeholder="G" value="G" />
  </div>
</template>

<script>
export default {
  name: "Ukelele",
};
</script>

<style lang="scss">
.ukulele {
  display: flex;
  justify-content: space-between;

  input {
    width: 5ch;
    text-align: center;
  }
}
</style>
