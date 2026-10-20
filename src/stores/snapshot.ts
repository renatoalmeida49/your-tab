import type { SavedSong } from "@/types/song";
import { useInstrumentStore } from "./instrument";
import { useSongStore } from "./song";

// A PARTE DO ESTADO QUE É "A MÚSICA": O QUE É SALVO E O QUE É DESFEITO
export function pickSong(): SavedSong {
  const song = useSongStore();
  const instrument = useInstrumentStore();

  return {
    songStructure: {
      title: song.title,
      artist: song.artist,
      songStructure: song.parts,
    },
    instrument: {
      tuning: instrument.tuning,
      instrument: instrument.instrument,
      tone: instrument.tone,
    },
  };
}

export function serializeSong(): string {
  return JSON.stringify(pickSong());
}

// ACEITA DADOS SALVOS PARCIAIS: CAMPOS AUSENTES MANTÊM O VALOR ATUAL
export function applySong(saved: Partial<SavedSong>): void {
  const song = useSongStore();
  const instrument = useInstrumentStore();
  const structure = saved.songStructure;

  song.$patch({
    ...(structure?.title != null && { title: structure.title }),
    ...(structure?.artist != null && { artist: structure.artist }),
    ...(structure?.songStructure && { parts: structure.songStructure }),
  });

  if (saved.instrument) instrument.$patch(saved.instrument);
}
