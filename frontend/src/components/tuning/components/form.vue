<template>
  <form @submit.prevent="submitTuning" :class="instrument">
    <div v-if="counts.length > 1" class="tuning__count">
      <p class="tuning__caption">{{ $t("components.tuning.stringCount") }}</p>

      <div class="tuning__count-options" role="radiogroup">
        <button
          v-for="count in counts"
          :key="count"
          type="button"
          role="radio"
          :aria-checked="count == tuningModel.length"
          :class="{ active: count == tuningModel.length }"
          @click="setStrings(count)"
        >
          {{ count }}
        </button>
      </div>
    </div>

    <div v-if="presetKeys.length > 1" class="tuning__presets">
      <p class="tuning__caption">{{ $t("components.tuning.quickTuning") }}</p>

      <TheButton
        v-for="key in presetKeys"
        :key="key"
        variant="secondary"
        size="sm"
        @click="setTuning(key)"
      >
        {{ $t(`components.tuning.presets.${key}`) }}
      </TheButton>
    </div>

    <p class="tuning__caption">{{ $t("components.tuning.strings") }}</p>
    <div class="tuning__strings">
      <input
        v-for="(_, index) in tuningModel"
        :key="index"
        type="text"
        required
        v-model="tuningModel[index]"
        :placeholder="placeholders[index]"
      />
    </div>

    <TheButton type="submit" class="tuning__submit">{{
      $t("common.confirm")
    }}</TheButton>
  </form>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapActions, mapState } from "pinia";
import { useInstrumentStore } from "@/stores/instrument";
import { useConfirmStore } from "@/stores/confirm";
import { useSongStore } from "@/stores/song";
import {
  TUNINGS,
  defaultTuning,
  stringCounts,
  type PresetKey,
} from "@/core/config/tunings";
import type { Instrument } from "@/types/song";

export default defineComponent({
  name: "TuningForm",

  emits: ["close"],

  props: {
    instrument: {
      type: String as PropType<Instrument>,
      required: true,
    },
  },

  data() {
    return {
      tuningModel: [] as string[],
    };
  },

  // A AFINAÇÃO ATUAL ENTRA INTEIRA (TODAS AS CORDAS VISÍVEIS), SE FOR DESTE
  // INSTRUMENTO. SENÃO, A PADRÃO DELE
  created() {
    const store = useInstrumentStore();

    this.tuningModel =
      store.instrument == this.instrument
        ? [...store.tuning]
        : defaultTuning(this.instrument);
  },

  computed: {
    ...mapState(useSongStore, ["tabsLoseNotes"]),

    // INCLUI A QUANTIDADE ATUAL MESMO SEM PRESET (EX: COLADA COM 8 CORDAS)
    counts(): number[] {
      const counts = new Set([
        ...stringCounts(this.instrument),
        this.tuningModel.length,
      ]);

      return [...counts].sort((a, b) => a - b);
    },

    presetKeys(): PresetKey[] {
      const presets = TUNINGS[this.instrument][this.tuningModel.length];

      return presets ? (Object.keys(presets) as PresetKey[]) : [];
    },

    placeholders(): string[] {
      return defaultTuning(this.instrument, this.tuningModel.length);
    },
  },

  methods: {
    ...mapActions(useInstrumentStore, ["applyTuning"]),

    ...mapActions(useConfirmStore, ["ask"]),

    async submitTuning() {
      const confirmed =
        !this.tabsLoseNotes(this.tuningModel) ||
        (await this.ask({
          message: "components.tuning.loseNotesConfirm",
          confirmLabel: "components.tuning.loseNotesConfirmAction",
          danger: true,
        }));

      if (!confirmed) return;

      this.applyTuning({
        instrument: this.instrument,
        tuning: this.tuningModel,
      });

      this.close();
    },

    setStrings(count: number) {
      if (count == this.tuningModel.length) return;

      this.tuningModel = defaultTuning(this.instrument, count);
    },

    setTuning(key: PresetKey) {
      const notes = TUNINGS[this.instrument][this.tuningModel.length]?.[key];

      if (notes) this.tuningModel = [...notes];
    },

    close() {
      this.$emit("close");
    },
  },
});
</script>
