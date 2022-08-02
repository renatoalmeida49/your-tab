<template>
  <form @submit.prevent="submitTunning" class="guitar">
    <div class="guitar__form-group">
      <p>Afinação rápida:</p>

      <TheButton
        v-for="(tunning, index) in tunnings"
        :key="index"
        @click="setTuning(index)"
      >
        {{ tunning.label }}
      </TheButton>
    </div>

    <div class="guitar__form-group">
      <input type="text" required v-model="tuningModel[0]" placeholder="e" />
      <input type="text" required v-model="tuningModel[1]" placeholder="B" />
      <input type="text" required v-model="tuningModel[2]" placeholder="G" />
      <input type="text" required v-model="tuningModel[3]" placeholder="D" />
      <input type="text" required v-model="tuningModel[4]" placeholder="A" />
      <input type="text" required v-model="tuningModel[5]" placeholder="E" />
    </div>

    <TheButton type="submit" @click="submitTunning">Confirmar</TheButton>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Guitar",

  data() {
    return {
      tuningModel: [],
      tunnings: {
        defaultTuning: {
          label: "Padrão",
          tunning: ["e", "B", "G", "D", "A", "E"],
        },
        halfTuning: {
          label: "Meio tom",
          tunning: ["eb", "Bb", "Gb", "Db", "Ab", "Eb"],
        },
        oneTune: {
          label: "1 tom",
          tunning: ["d", "A", "F", "C", "G", "D"],
        },
        dropDTuning: {
          label: "Drop D",
          tunning: ["e", "B", "G", "D", "A", "D"],
        },
        dropCTuning: {
          label: "Drop C",
          tunning: ["d", "A", "F", "C", "G", "C"],
        },
      },
    };
  },

  mounted() {
    if (this.instrument == "guitar") {
      this.$set(this, "tuningModel", Object.assign([], this.tuning));
    } else {
      this.tuningModel = this.tunnings.defaultTuning.tunning;
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
      this.tuningModel = this.tunnings[tunning].tunning;
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
