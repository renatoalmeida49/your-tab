import type { Instrument } from "@/types/song";

// AFINAÇÕES PRONTAS POR INSTRUMENTO E QUANTIDADE DE CORDAS, DA MAIS AGUDA PARA
// A MAIS GRAVE. A PRIMEIRA QUANTIDADE É A PADRÃO DO INSTRUMENTO E O PRIMEIRO
// PRESET (defaultTuning) É O QUE ENTRA AO ESCOLHER A QUANTIDADE.
// AS CHAVES DOS PRESETS SÃO TRADUZIDAS EM components.tuning.presets

export type PresetKey =
  | "defaultTuning"
  | "halfTuning"
  | "oneTune"
  | "dropDTuning"
  | "dropCTuning"
  | "dropATuning";

export type Presets = Partial<Record<PresetKey, string[]>> & {
  defaultTuning: string[];
};

export const TUNINGS: Record<Instrument, Record<number, Presets>> = {
  guitar: {
    6: {
      defaultTuning: ["e", "B", "G", "D", "A", "E"],
      halfTuning: ["eb", "Bb", "Gb", "Db", "Ab", "Eb"],
      oneTune: ["d", "A", "F", "C", "G", "D"],
      dropDTuning: ["e", "B", "G", "D", "A", "D"],
      dropCTuning: ["d", "A", "F", "C", "G", "C"],
    },
    7: {
      defaultTuning: ["e", "B", "G", "D", "A", "E", "B"],
      halfTuning: ["eb", "Bb", "Gb", "Db", "Ab", "Eb", "Bb"],
      oneTune: ["d", "A", "F", "C", "G", "D", "A"],
      dropATuning: ["e", "B", "G", "D", "A", "E", "A"],
    },
  },
  bass: {
    4: {
      defaultTuning: ["G", "D", "A", "E"],
      halfTuning: ["Gb", "Db", "Ab", "Eb"],
      oneTune: ["F", "C", "G", "D"],
      dropDTuning: ["G", "D", "A", "D"],
    },
    5: {
      defaultTuning: ["G", "D", "A", "E", "B"],
      halfTuning: ["Gb", "Db", "Ab", "Eb", "Bb"],
      oneTune: ["F", "C", "G", "D", "A"],
    },
    6: {
      defaultTuning: ["C", "G", "D", "A", "E", "B"],
      halfTuning: ["B", "Gb", "Db", "Ab", "Eb", "Bb"],
      oneTune: ["Bb", "F", "C", "G", "D", "A"],
    },
  },
  ukulele: {
    4: {
      defaultTuning: ["A", "E", "C", "G"],
    },
  },
};

export function stringCounts(instrument: Instrument): number[] {
  return Object.keys(TUNINGS[instrument]).map(Number);
}

export function defaultTuning(
  instrument: Instrument,
  strings?: number
): string[] {
  const presets =
    TUNINGS[instrument][strings ?? stringCounts(instrument)[0]] ??
    TUNINGS[instrument][stringCounts(instrument)[0]];

  return [...presets.defaultTuning];
}
