<template>
  <form @submit.prevent="submitTuning" class="bass">
    <div class="bass__form-group">
      <p>Afinação rápida:</p>

      <TheButton
        v-for="(preset, key) in presets"
        :key="key"
        @click="setTuning(key)"
      >
        {{ preset.label }}
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

    <TheButton type="submit">Confirmar</TheButton>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Bass",

  data() {
    return {
      tuningModel: [],
      presets: {
        defaultTuning: {
          label: "Padrão",
          notes: ["G", "D", "A", "E"],
        },
        halfTuning: {
          label: "Meio tom",
          notes: ["Gb", "Db", "Ab", "Eb"],
        },
        oneTune: {
          label: "1 tom",
          notes: ["F", "C", "G", "D"],
        },
      },
    };
  },

  mounted() {
    if (this.instrument == "bass") {
      this.$set(this, "tuningModel", Object.assign([], this.tuning));
    } else {
      this.tuningModel = [...this.presets.defaultTuning.notes];
    }
  },

  computed: {
    ...mapGetters("instrument", ["tuning", "instrument"]),
  },

  methods: {
    ...mapActions("instrument", ["newTuning", "newInstrument"]),

    submitTuning() {
      this.newInstrument("bass");
      this.newTuning(this.tuningModel);

      this.close();
    },

    setTuning(key) {
      this.tuningModel = [...this.presets[key].notes];
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
