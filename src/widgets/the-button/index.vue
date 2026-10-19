<template>
  <button class="the-button" :type="type" @click="emitClick">
    <slot />
  </button>
</template>

<script>
export default {
  name: "TheButton",

  // SEM DECLARAR, O VUE 3 TAMBÉM REPASSA O @click NATIVO E DISPARA DUAS VEZES
  emits: ["click"],

  props: {
    type: { type: String, default: "button" },
  },

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
  border: none;
  font: inherit;
  padding: 5px 10px;
  color: $white;
  font-weight: 700;
  margin: 2px 5px;
  border-radius: 16px;
  cursor: pointer;
}
</style>
