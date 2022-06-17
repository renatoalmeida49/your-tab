<template>
  <div class="tab-header">
    <span class="tab-header__title" ref="title" role="textbox" contenteditable>
      (Título)
    </span>
    <span class="tab-header__artist" role="textbox" contenteditable>
      (Artista)
    </span>
    <div>
      <span>Tom: </span>
      <span class="tab-header__tone" role="textbox" contenteditable>
        {{ tone }}
      </span>
    </div>
    <div>
      <!-- <div>
        <span>Instrumento: </span>
        <span class="tab-header__instrument">{{ instrument }}</span>
      </div> -->
      <div>
        <span>Afinação: </span>
        <span class="tab-header__tuning">
          {{ getTuning }}
        </span>
        <button @click="toggleModal('showModalTuning')">Mudar afinação</button>
      </div>
    </div>

    <Modal v-if="showModalTuning" @close="toggleModal('showModalTuning')">
      <div class="tab-header__modalTuning">
        <header>
          <h3>Mudar afinação</h3>
        </header>

        <Tuning />
      </div>
    </Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Tuning from "@/components/tuning";

export default {
  name: "TabHeader",

  components: {
    Tuning,
  },

  data() {
    return {
      showModalTuning: false,
      showModalTone: false,
    };
  },

  computed: {
    ...mapGetters("instrument", ["tuning", "instrument", "tone"]),

    getTuning() {
      return this.tuning.join(" - ");
    },
  },

  methods: {
    ...mapActions("instrument", ["newTuning"]),

    toggleModal(modal) {
      this[modal] = !this[modal];
    },
  },
};
</script>

<style lang="scss">
.tab-header {
  width: 100%;
  padding: 20px 0;

  &__title {
    display: block;
    color: $primary;
    font-size: 2rem;
    font-family: "title";
    cursor: text;
  }

  &__artist {
    display: block;
    color: $terciary;
    font-size: 1.5rem;
    cursor: text;
  }

  &__tone {
    display: inline-block;
    width: 100px;
    color: $primary;
    font-family: "title";
    margin-right: 10px;
  }

  &__instrument {
    color: $primary;
    font-family: "title";
    margin-right: 10px;
  }

  &__tuning {
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

  &__modalTuning {
    > header {
      margin-bottom: 30px;
    }
  }
}
</style>
