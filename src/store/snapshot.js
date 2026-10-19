// A PARTE DO ESTADO QUE É "A MÚSICA": O QUE É SALVO E O QUE É DESFEITO
export function pickSong(state) {
  const { title, artist, songStructure } = state.songStructure;

  return {
    songStructure: { title, artist, songStructure },
    instrument: state.instrument,
  };
}
