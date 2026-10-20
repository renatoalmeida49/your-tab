<template>
  <form @submit.prevent="submitTuning" class="ukulele">
    <p class="tuning__caption">{{ $t("components.tuning.strings") }}</p>
    <div class="ukulele__form-group tuning__strings">
      <input type="text" required v-model="tuningModel[0]" placeholder="A" />
      <input type="text" required v-model="tuningModel[1]" placeholder="E" />
      <input type="text" required v-model="tuningModel[2]" placeholder="C" />
      <input type="text" required v-model="tuningModel[3]" placeholder="G" />
    </div>

    <TheButton type="submit" class="tuning__submit">{{
      $t("common.confirm")
    }}</TheButton>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useConfirmStore } from "@/stores/confirm";
import { useSongStore } from "@/stores/song";

const defaultTuning = ["A", "E", "C", "G"];

export default defineComponent({
  name: "Ukulele",

  emits: ["close"],

  data() {
    return {
      tuningModel: [] as string[],
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

    ...mapActions(useConfirmStore, ["ask"]),

    async submitTuning() {
      const confirmed =
        !this.tabsLoseNotes(this.tuningModel.length) ||
        (await this.ask({
          message: "components.tuning.loseNotesConfirm",
          confirmLabel: "components.tuning.loseNotesConfirmAction",
          danger: true,
        }));

      if (!confirmed) return;

      this.applyTuning({ instrument: "ukulele", tuning: this.tuningModel });

      this.close();
    },

    close() {
      this.$emit("close");
    },
  },
});
</script>
