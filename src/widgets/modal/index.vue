<template>
  <div class="modal">
    <div class="modal__wrapper" @click="close">
      <div class="modal__container">
        <slot />

        <footer>
          <TheButton @click="closeClick">{{ $t("common.cancel") }}</TheButton>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Modal",

  emits: ["close"],

  methods: {
    close(event: MouseEvent) {
      if (event.target === event.currentTarget) this.$emit("close");
    },

    closeClick() {
      this.$emit("close");
    },
  },
});
</script>

<style lang="scss">
.modal {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-overlay);
  display: table;
  transition: opacity 0.3s ease;

  &__wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  &__container {
    max-width: 450px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: var(--color-surface);
    border-radius: 2px;
    box-shadow: var(--shadow-lg);
    transition: all 0.3s ease;
  }

  footer {
    padding-top: 20px;
    text-align: center;
  }
}
</style>
