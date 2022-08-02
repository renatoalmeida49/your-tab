<template>
  <form @submit.prevent="submitTunning" class="bass">
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

    <div class="bass__form-group">
      <input
        type="text"
        required
        v-model="tuningModel[0]"
        placeholder="G"
        value="G"
      />
      <input
        type="text"
        required
        v-model="tuningModel[1]"
        placeholder="D"
        value="D"
      />
      <input
        type="text"
        required
        v-model="tuningModel[2]"
        placeholder="A"
        value="A"
      />
      <input
        type="text"
        required
        v-model="tuningModel[3]"
        placeholder="E"
        value="E"
      />
    </div>

    <TheButton type="submit" @click="submitTunning">Confirmar</TheButton>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Bass",

  data() {
    return {
      tuningModel: [],
      tunnings: {
        defaultTuning: {
          label: "Padrão",
          tunning: ["G", "D", "A", "E"],
        },
        halfTuning: {
          label: "Meio tom",
          tunning: ["Gb", "Db", "Ab", "Eb"],
        },
        oneTune: {
          label: "1 tom",
          tunning: ["F", "E", "G", "D"],
        },
        // dropDTuning: {
        //   label: "Drop D",
        //   tunning: ["G", "D", "A", "E"],
        // },
        // dropCTuning: {
        //   label: "Drop C",
        //   tunning: ["G", "D", "A", "E"],
        // },
      },
    };
  },

  mounted() {
    if (this.instrument == "bass") {
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
      this.newInstrument("bass");
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
.bass {
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
