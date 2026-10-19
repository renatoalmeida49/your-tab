const STORAGE_KEY = "your-tab:song";

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    return null;
  }
}

function save(state) {
  const { title, artist, songStructure } = state.songStructure;

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        songStructure: { title, artist, songStructure },
        instrument: state.instrument,
      })
    );
  } catch (e) {
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

  // DEEP WATCH: OS CAMPOS AINDA EDITAM `info` DIRETO, SEM MUTATION
  store.watch((state) => state, save, { deep: true });
};
