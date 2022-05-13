<template>
  <div class="modal">
    <div class="modal__wrapper" @click="close">
      <div class="modal__container">
        <slot @close="close" />

        <footer>
          <button @click="close">Cancelar</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Modal",

  methods: {
    close(event) {
      if (event.target === event.currentTarget) this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.modal {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;

  &__wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  &__container {
    width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }
}
</style>
