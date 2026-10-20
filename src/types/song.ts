// O FORMATO DA MÚSICA: O QUE O EDITOR MOSTRA, O QUE É SALVO E O QUE É DESFEITO

export type PartType = "tab" | "verse" | "textField";

export interface TabInfo {
  // UMA LINHA POR CORDA: "<RÓTULO>|<TRAÇOS E NOTAS>" (VER core/tab.ts)
  text: string;
}

export interface VerseInfo {
  chords: string;
}

export interface TextInfo {
  text: string;
}

interface PartOf<Type extends PartType, Info> {
  id: string;
  type: Type;
  info: Info;
}

export type TabPart = PartOf<"tab", TabInfo>;
export type VersePart = PartOf<"verse", VerseInfo>;
export type TextPart = PartOf<"textField", TextInfo>;
export type Part = TabPart | VersePart | TextPart;

export type Instrument = "guitar" | "bass" | "ukulele";

export interface InstrumentState {
  tuning: string[];
  instrument: Instrument;
  tone: string;
}

// FORMATO DO localStorage (MANTIDO DESDE A VERSÃO EM VUEX PARA NÃO PERDER
// MÚSICAS JÁ SALVAS)
export interface SavedSong {
  songStructure: {
    title: string;
    artist: string;
    songStructure: Part[];
  };
  instrument: InstrumentState;
}
