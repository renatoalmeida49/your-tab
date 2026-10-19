<template>
  <form @submit.prevent="submitTuning" class="guitar">
    <div class="guitar__form-group">
      <p>{{ $t("components.tuning.quickTuning") }}:</p>

      <TheButton
        v-for="(preset, key) in presets"
        :key="key"
        @click="setTuning(key)"
      >
        {{ $t(`components.tuning.presets.${key}`) }}
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

    <TheButton type="submit">{{ $t("common.confirm") }}</TheButton>
  </form>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Guitar",

  emits: ["close"],

  data() {
    return {
      tuningModel: [],
      presets: {
        defaultTuning: {
          notes: ["e", "B", "G", "D", "A", "E"],
        },
        halfTuning: {
          notes: ["eb", "Bb", "Gb", "Db", "Ab", "Eb"],
        },
        oneTune: {
          notes: ["d", "A", "F", "C", "G", "D"],
        },
        dropDTuning: {
          notes: ["e", "B", "G", "D", "A", "D"],
        },
        dropCTuning: {
          notes: ["d", "A", "F", "C", "G", "C"],
        },
      },
    };
  },

  mounted() {
    if (this.instrument == "guitar") {
      this.tuningModel = [...this.tuning];
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
      this.newInstrument("guitar");
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
