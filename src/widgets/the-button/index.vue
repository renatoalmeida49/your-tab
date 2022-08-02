<template>
  <div class="the-button" @click="emitClick">
    <slot />
  </div>
</template>

<script>
export default {
  name: "TheButton",

  methods: {
    emitClick() {
      this.$emit("click");
    },
  },
};
</script>

<style lang="scss">
.the-button {
  background: $primary;
  display: inline-flex;
  padding: 5px 10px;
  color: $white;
  font-weight: 700;
  margin: 2px 5px;
  border-radius: 16px;
  cursor: pointer;
}
</style>
