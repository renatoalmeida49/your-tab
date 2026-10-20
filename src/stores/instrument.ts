import { defineStore } from "pinia";

import type { Instrument, InstrumentState } from "@/types/song";
import { useSongStore } from "./song";

export const useInstrumentStore = defineStore("instrument", {
  state: (): InstrumentState => ({
    tuning: ["e", "B", "G", "D", "A", "E"],
    instrument: "guitar",
    tone: "C",
  }),

  actions: {
    newTone(tone: string) {
      this.tone = tone;
    },

    // TROCA INSTRUMENTO E AFINAÇÃO E ATUALIZA AS TABS JÁ ESCRITAS
    applyTuning(payload: { instrument: Instrument; tuning: string[] }) {
      this.instrument = payload.instrument;
      this.tuning = [...payload.tuning];
      useSongStore().retuneTabs(payload.tuning);
    },
  },
});
