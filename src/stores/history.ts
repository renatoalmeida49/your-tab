import { defineStore } from "pinia";

import { applySong, serializeSong } from "./snapshot";
import { useInstrumentStore } from "./instrument";
import { useSongStore } from "./song";

// FOTOS DA MÚSICA EM JSON (STRINGS SÃO BARATAS PARA A REATIVIDADE)
const LIMIT = 100;

// AÇÕES QUE NÃO MUDAM A MÚSICA
const IGNORED = ["song/setFocusId"];

// DIGITAÇÃO SEGUIDA NO MESMO CAMPO VIRA UM PASSO SÓ ATÉ UMA PAUSA
const TYPING = ["song/updatePart", "song/setSongInfo", "instrument/newTone"];
const TYPING_PAUSE = 1000;

export type NoticeMessage = "components.toast.partRemoved";

interface Notice {
  message: NoticeMessage;
  at: number;
}

// ESTADO DO RASTREAMENTO (NÃO REATIVO): FOTO ATUAL, ÚLTIMA DIGITAÇÃO E SE
// ESTAMOS NO MEIO DE UMA AÇÃO QUE JÁ VIROU PASSO
let current = "";
let typing: { key: string | null; time: number } = { key: null, time: 0 };
let batching = false;

function restore(snapshot: string): void {
  applySong(JSON.parse(snapshot));
  current = serializeSong();
  typing = { key: null, time: 0 };
}

export const useHistoryStore = defineStore("history", {
  state: () => ({
    past: [] as string[],
    future: [] as string[],
    notice: null as Notice | null,
  }),

  actions: {
    record(action: string, payload: unknown) {
      if (IGNORED.includes(action)) return;

      const next = serializeSong();

      if (next == current) return;

      const { id, field } = (payload ?? {}) as { id?: string; field?: string };
      const key = TYPING.includes(action)
        ? `${action}:${id || field || ""}`
        : null;
      const now = Date.now();
      const keepsTyping =
        key != null && key == typing.key && now - typing.time < TYPING_PAUSE;

      typing = { key, time: now };

      if (!batching && !keepsTyping) {
        this.past.push(current);
        if (this.past.length > LIMIT) this.past.shift();

        this.future = [];
        this.notice = null;

        // AÇÕES DA MESMA OPERAÇÃO (MESMO TICK) VIRAM UM PASSO SÓ.
        // EX: TROCAR AFINAÇÃO, COLAR VÁRIAS LINHAS, NOVA MÚSICA
        batching = true;
        queueMicrotask(() => {
          batching = false;
        });
      }

      current = next;
    },

    undo() {
      const target = this.past.pop();

      if (!target) return;

      this.future.push(current);
      this.notice = null;
      restore(target);
    },

    redo() {
      const target = this.future.pop();

      if (!target) return;

      this.past.push(current);
      this.notice = null;
      restore(target);
    },

    notify(message: NoticeMessage | null) {
      this.notice = message ? { message, at: Date.now() } : null;
    },
  },
});

// REGISTRA NO HISTÓRICO CADA AÇÃO DOS STORES DA MÚSICA E DO INSTRUMENTO
export function trackHistory(): void {
  const history = useHistoryStore();

  current = serializeSong();

  for (const store of [useSongStore(), useInstrumentStore()]) {
    store.$onAction(({ name, args, after }) => {
      after(() => history.record(`${store.$id}/${name}`, args[0]));
    });
  }
}
