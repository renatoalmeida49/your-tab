<template>
  <div class="tab-header">
    <span class="tab-header__title" role="textbox" contenteditable>
      Título da música
    </span>
    <div>
      <span>Tom: </span>
      <span class="tab-header__tone" role="textbox" contenteditable>
        (Tom)
      </span>
    </div>
    <div>
      <div>
        <span>Instrumento: </span>
        <span class="tab-header__tone">{{ instrument }}</span>
      </div>
      <div>
        <span>Afinação: </span>
        <span class="tab-header__tone">
          {{ getTuning }}
        </span>
        <button @click="toggleModal">Mudar afinação</button>
      </div>
    </div>

    <Modal v-if="showModal" @close="toggleModal">
      <div class="tab-header__modal">
        <header>
          <h3>Mudar afinação</h3>
        </header>
        <p>Content</p>
        <footer>
          <button>Confirmar</button>
          <button @click="toggleModal">Cancelar</button>
        </footer>
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  name: "TabHeader",

  data() {
    return {
      showModal: false,
    };
  },

  computed: {
    ...mapGetters("instrument", ["tuning", "instrument"]),

    getTuning() {
      return this.tuning.join(" - ");
    },
  },

  methods: {
    ...mapActions("instrument", ["newTuning"]),

    toggleModal() {
      this.showModal = !this.showModal;
    },
  },
};
</script>

<style lang="scss">
.tab-header {
  &__title {
    display: block;
    color: $primary;
    font-size: 2rem;
    font-family: "title";
  }

  &__tone {
    color: $primary;
    font-family: "title";
    margin-right: 10px;
  }

  &__modal {
    footer {
      display: flex;
      justify-content: center;
      gap: 20px;
    }
  }
}
</style>
