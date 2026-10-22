import type { SavedSong } from "@/types/song";
import { applySong, serializeSong } from "./snapshot";
import { useInstrumentStore } from "./instrument";
import { useSongStore } from "./song";

const STORAGE_KEY = "tab-builder:song";

function load(): Partial<SavedSong> | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
  } catch {
    return null;
  }
}

function save(): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializeSong());
  } catch {
    // STORAGE CHEIO OU BLOQUEADO (EX: ABA ANÔNIMA). SEGUE SEM SALVAR
  }
}

// RESTAURA A MÚSICA SALVA E SALVA DE NOVO A CADA MUDANÇA
export function persistSong(): void {
  const saved = load();

  if (saved) applySong(saved);

  for (const store of [useSongStore(), useInstrumentStore()]) {
    store.$subscribe(save, { detached: true, flush: "sync" });
  }
}
