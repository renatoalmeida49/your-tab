<template>
  <form @submit.prevent="submitTuning" class="bass">
    <div class="bass__form-group">
      <p>{{ $t("components.tuning.quickTuning") }}:</p>

      <TheButton
        v-for="(preset, key) in presets"
        :key="key"
        @click="setTuning(key)"
      >
        {{ $t(`components.tuning.presets.${key}`) }}
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

    <TheButton type="submit">{{ $t("common.confirm") }}</TheButton>
  </form>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useSongStore } from "@/stores/song";

export default {
  name: "Bass",

  emits: ["close"],

  data() {
    return {
      tuningModel: [],
      presets: {
        defaultTuning: {
          notes: ["G", "D", "A", "E"],
        },
        halfTuning: {
          notes: ["Gb", "Db", "Ab", "Eb"],
        },
        oneTune: {
          notes: ["F", "C", "G", "D"],
        },
      },
    };
  },

  mounted() {
    if (this.instrument == "bass") {
      this.tuningModel = [...this.tuning];
    } else {
      this.tuningModel = [...this.presets.defaultTuning.notes];
    }
  },

  computed: {
    ...mapState(useInstrumentStore, ["tuning", "instrument"]),
    ...mapState(useSongStore, ["tabsLoseNotes"]),
  },

  methods: {
    ...mapActions(useInstrumentStore, ["applyTuning"]),

    submitTuning() {
      const confirmed =
        !this.tabsLoseNotes(this.tuningModel.length) ||
        window.confirm(this.$t("components.tuning.loseNotesConfirm"));

      if (!confirmed) return;

      this.applyTuning({ instrument: "bass", tuning: this.tuningModel });

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
