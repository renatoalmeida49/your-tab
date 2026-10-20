<template>
  <form @submit.prevent="submitTuning" class="ukulele">
    <div class="ukulele__form-group">
      <input type="text" required v-model="tuningModel[0]" placeholder="A" />
      <input type="text" required v-model="tuningModel[1]" placeholder="E" />
      <input type="text" required v-model="tuningModel[2]" placeholder="C" />
      <input type="text" required v-model="tuningModel[3]" placeholder="G" />
    </div>

    <TheButton type="submit">{{ $t("common.confirm") }}</TheButton>
  </form>
</template>

<script>
import { mapActions, mapState } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useSongStore } from "@/stores/song";

const defaultTuning = ["A", "E", "C", "G"];

export default {
  name: "Ukulele",

  emits: ["close"],

  data() {
    return {
      tuningModel: [],
    };
  },

  mounted() {
    if (this.instrument == "ukulele") {
      this.tuningModel = [...this.tuning];
    } else {
      this.tuningModel = [...defaultTuning];
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

      this.applyTuning({ instrument: "ukulele", tuning: this.tuningModel });

      this.close();
    },

    close() {
      this.$emit("close");
    },
  },
};
</script>

<style lang="scss">
.ukulele {
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
