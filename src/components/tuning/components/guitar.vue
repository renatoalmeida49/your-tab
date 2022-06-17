<template>
  <form @submit.prevent="submitTunning" class="guitar">
    <div class="guitar__form-group">
      <p>Afinação rápida:</p>

      <button type="button" @click="setTuning('defaultTuning')">Padrão</button>
      <button type="button" @click="setTuning('halfTuning')">Meio tom</button>
      <button type="button" @click="setTuning('oneTune')">1 tom</button>
      <button type="button" @click="setTuning('dropDTuning')">Drop D</button>
      <button type="button" @click="setTuning('dropCTuning')">Drop C</button>
    </div>

    <div class="guitar__form-group">
      <input type="text" required v-model="tuningModel[0]" placeholder="e" />
      <input type="text" required v-model="tuningModel[1]" placeholder="B" />
      <input type="text" required v-model="tuningModel[2]" placeholder="G" />
      <input type="text" required v-model="tuningModel[3]" placeholder="D" />
      <input type="text" required v-model="tuningModel[4]" placeholder="A" />
      <input type="text" required v-model="tuningModel[5]" placeholder="E" />
    </div>

    <button type="submit">Confirmar</button>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

const tunnings = {
  defaultTuning: ["e", "B", "G", "D", "A", "E"],
  halfTuning: ["eb", "Bb", "Gb", "Db", "Ab", "Eb"],
  oneTune: ["d", "A", "F", "C", "G", "D"],
  dropDTuning: ["e", "B", "G", "D", "A", "D"],
  dropCTuning: ["d", "A", "F", "C", "G", "C"],
};

export default {
  name: "Guitar",

  data() {
    return {
      tuningModel: [],
    };
  },

  mounted() {
    if (this.instrument == "guitar") {
      this.$set(this, "tuningModel", Object.assign([], this.tuning));
    } else {
      this.tuningModel = tunnings.defaultTuning;
    }
  },

  computed: {
    ...mapGetters("instrument", ["tuning", "instrument"]),
  },

  methods: {
    ...mapActions("instrument", ["newTuning", "newInstrument"]),

    submitTunning() {
      this.newInstrument("guitar");
      this.newTuning(this.tuningModel);

      this.close();
    },

    setTuning(tunning) {
      this.tuningModel = tunnings[tunning];
    },

    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.guitar {
  text-align: center;

  input {
    width: 5ch;
    text-align: center;
    margin: 0 5px;
  }

  &__form-group {
    margin-bottom: 20px;
  }
}
</style>
