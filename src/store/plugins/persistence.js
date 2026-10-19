import { pickSong } from "../snapshot";

const STORAGE_KEY = "tab-builder:song";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pickSong(state)));
  } catch {
    // STORAGE CHEIO OU BLOQUEADO (EX: ABA ANÔNIMA). SEGUE SEM SALVAR
  }
}

export default (store) => {
  const saved = load();

  if (saved) {
    store.replaceState({
      ...store.state,
      songStructure: { ...store.state.songStructure, ...saved.songStructure },
      instrument: { ...store.state.instrument, ...saved.instrument },
    });
  }

  store.subscribe((mutation, state) => {
    if (/^(history\/|songStructure\/setFocusId$)/.test(mutation.type)) return;

    save(state);
  });
};
