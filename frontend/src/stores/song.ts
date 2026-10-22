import { defineStore } from "pinia";

import { transposeChord, transposeText } from "@/core/chords";
import { createTab, notesLostByRetune, retune } from "@/core/tab";
import type {
  Part,
  PartType,
  TabInfo,
  TextInfo,
  VerseInfo,
} from "@/types/song";
import { useHistoryStore } from "./history";
import { useInstrumentStore } from "./instrument";

export type SongField = "title" | "artist";
export type PartInfoUpdate = Partial<TabInfo & VerseInfo & TextInfo>;

let lastId = 0;

function createId(): string {
  lastId++;

  return `${Date.now().toString(36)}${lastId}`;
}

function cleanTab(text: string): string {
  return text.replace(/^\n+|\n+$/g, "");
}

function createPart(type: PartType, content = ""): Part {
  const id = createId();

  switch (type) {
    case "tab":
      return {
        id,
        type,
        info: { text: content || createTab(useInstrumentStore().tuning) },
      };
    case "verse":
      return { id, type, info: { chords: content } };
    case "textField":
      return { id, type, info: { text: content } };
  }
}

export const useSongStore = defineStore("song", {
  state: () => ({
    title: "",
    artist: "",
    parts: [] as Part[],
    // CAMPO DE TEXTO QUE ACABOU DE SER CRIADO E DEVE RECEBER O FOCO
    focusId: null as string | null,
  }),

  getters: {
    // ALGUMA TAB PERDERIA NOTAS SE A AFINAÇÃO PASSASSE A TER `strings` CORDAS?
    tabsLoseNotes: (state) => (strings: number) =>
      state.parts.some(
        (part) =>
          part.type == "tab" &&
          notesLostByRetune(cleanTab(part.info.text), strings)
      ),
  },

  actions: {
    newPart(type: PartType, content?: string): Part {
      const part = createPart(type, content);

      if (part.type == "textField") this.setFocusId(part.id);

      return part;
    },

    addContent(type: PartType) {
      this.parts.push(this.newPart(type));
    },

    addContentBetweenParts(payload: {
      component: PartType;
      index: number;
      content?: string;
    }) {
      this.parts.splice(
        payload.index,
        0,
        this.newPart(payload.component, payload.content)
      );
    },

    // PARTES COLADAS, EM ORDEM, A PARTIR DE `index`. replaceId: CAMPO VAZIO
    // ONDE SE COLOU, QUE DÁ LUGAR A ELAS
    insertParts(payload: {
      index: number;
      parts: { type: PartType; content: string }[];
      replaceId?: string;
    }) {
      const created = payload.parts.map((part) =>
        createPart(part.type, part.content)
      );
      const replaced = this.parts.findIndex(
        (part) => part.id == payload.replaceId
      );

      if (replaced >= 0) this.parts.splice(replaced, 1, ...created);
      else this.parts.splice(payload.index, 0, ...created);
    },

    removeContent(index: number) {
      this.parts.splice(index, 1);
    },

    // REMOÇÃO PELO "X": AVISA E OFERECE DESFAZER
    removePart(index: number) {
      this.removeContent(index);
      useHistoryStore().notify("components.toast.partRemoved");
    },

    // CÓPIA LOGO ABAIXO DA ORIGINAL, COM ID NOVO
    duplicatePart(index: number) {
      const part = this.parts[index];

      if (!part) return;

      this.parts.splice(index + 1, 0, {
        ...part,
        id: createId(),
        info: { ...part.info },
      } as Part);
    },

    // step -1 SOBE, 1 DESCE. NAS PONTAS NÃO FAZ NADA
    movePart(payload: { index: number; step: -1 | 1 }) {
      const target = payload.index + payload.step;

      if (target < 0 || target >= this.parts.length) return;

      const [part] = this.parts.splice(payload.index, 1);
      this.parts.splice(target, 0, part);
    },

    setSong(parts: Part[]) {
      this.parts = parts;
    },

    updatePart(payload: { id: string; info: PartInfoUpdate }) {
      const part = this.parts.find((item) => item.id == payload.id);

      // MESMO OBJETO: A PROP `info` DOS COMPONENTES JÁ ENXERGA O VALOR NOVO
      if (part) Object.assign(part.info, payload.info);
    },

    setSongInfo(payload: { field: SongField; value: string }) {
      this[payload.field] = payload.value;
    },

    setFocusId(id: string | null) {
      this.focusId = id;
    },

    retuneTabs(tuning: string[]) {
      for (const part of this.parts) {
        if (part.type == "tab") {
          part.info.text = retune(cleanTab(part.info.text), tuning);
        }
      }
    },

    // ACORDES DOS VERSOS E TOM. AS TABS FICAM: SÃO POSIÇÕES NO BRAÇO
    transpose(semitones: number) {
      const instrument = useInstrumentStore();

      for (const part of this.parts) {
        if (part.type == "verse") {
          part.info.chords = transposeText(part.info.chords, semitones);
        }
      }

      instrument.newTone(transposeChord(instrument.tone.trim(), semitones));
    },

    newSong() {
      this.parts = [];
      this.title = "";
      this.artist = "";
      this.focusId = null;
      useInstrumentStore().newTone("C");
    },
  },
});
