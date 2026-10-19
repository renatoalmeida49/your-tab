import { pickSong } from "../snapshot";

const IGNORED = /^(history\/|restoreSnapshot$|songStructure\/setFocusId$)/;

// DIGITAÇÃO SEGUIDA NO MESMO CAMPO VIRA UM PASSO SÓ ATÉ UMA PAUSA
const TYPING = [
  "songStructure/updatePart",
  "songStructure/setSongInfo",
  "instrument/newTone",
];
const TYPING_PAUSE = 1000;

export default (store) => {
  let current = JSON.stringify(pickSong(store.state));
  let typing = { key: null, time: 0 };
  let batching = false;

  store.subscribe((mutation, state) => {
    if (mutation.type == "restoreSnapshot") {
      current = JSON.stringify(pickSong(state));
      typing = { key: null, time: 0 };
      return;
    }

    if (IGNORED.test(mutation.type)) return;

    const next = JSON.stringify(pickSong(state));

    if (next == current) return;

    const payload = mutation.payload || {};
    const key = TYPING.includes(mutation.type)
      ? `${mutation.type}:${payload.id || payload.field || ""}`
      : null;
    const now = Date.now();
    const keepsTyping =
      key && key == typing.key && now - typing.time < TYPING_PAUSE;

    typing = { key, time: now };

    if (!batching && !keepsTyping) {
      store.commit("history/push", current);

      // MUTAÇÕES DA MESMA AÇÃO (MESMO TICK) VIRAM UM PASSO SÓ.
      // EX: TROCAR AFINAÇÃO, COLAR VÁRIAS LINHAS, NOVA MÚSICA
      batching = true;
      queueMicrotask(() => {
        batching = false;
      });
    }

    current = next;
  });
};
