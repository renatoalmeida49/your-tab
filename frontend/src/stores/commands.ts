import { downloadText, pickFiles } from "@/core/files";
import { guessInstrument, sameTuning, type PastedSong } from "@/core/paste";
import {
  parseSongFile,
  songFile,
  songFileMessage,
  songFileName,
} from "@/core/song-file";
import { hasNotes, retune } from "@/core/tab";
import type { CipherFields } from "@/types/library";
import { useConfirmStore } from "./confirm";
import { useHistoryStore } from "./history";
import { useInstrumentStore } from "./instrument";
import { cipherToSong, songToCipher, useLibraryStore } from "./library";
import { applySong, pickSong } from "./snapshot";
import { useSongStore } from "./song";
import { useUiStore } from "./ui";

export const SONG_FILE_ACCEPT = ".json,application/json";

// AÇÕES COM CONFIRMAÇÃO, USADAS PELA BARRA DO TOPO E PELA PALETA DE COMANDOS
export async function startNewSong(): Promise<void> {
  const library = useLibraryStore();
  const linked = !!library.cipherId;

  // JÁ SALVA NO ACERVO E SEM ALTERAÇÕES: NADA SE PERDE, NÃO PRECISA PERGUNTAR
  const confirmed =
    (linked && !library.dirty) ||
    (await useConfirmStore().ask({
      message: linked
        ? "components.menu.newSongUnsavedConfirm"
        : "components.menu.newSongConfirm",
      confirmLabel: "components.menu.newSongConfirmAction",
      danger: true,
    }));

  if (!confirmed) return;

  useSongStore().newSong();
  library.unlink();

  // O DESFAZER TRARIA DE VOLTA A CIFRA JÁ DESLIGADA DO ACERVO (E O "SALVAR"
  // CRIARIA UMA CÓPIA). ELA CONTINUA NO ACERVO: É SÓ ABRIR DE NOVO
  if (linked) useHistoryStore().reset();
}

// TAB COLADA COM OUTRA AFINAÇÃO: MÚSICA SEM NOTAS EM TAB ADOTA A AFINAÇÃO
// COLADA; COM NOTAS, PERGUNTA. RECUSANDO, A TAB COLADA VAI PARA A AFINAÇÃO
// ATUAL (ALINHADA PELAS CORDAS GRAVES, COMO AO TROCAR A AFINAÇÃO)
function askToRetune(pasted: string[]): Promise<boolean> {
  const loses = useSongStore().tabsLoseNotes(pasted.length);

  return useConfirmStore().ask({
    message: loses
      ? "components.paste.retuneLoseNotesConfirm"
      : "components.paste.retuneConfirm",
    confirmLabel: "components.paste.retuneConfirmAction",
    cancelLabel: "components.paste.keepTuning",
    danger: loses,
  });
}

// COLAGEM COM TAB OU ACORDES: CADA BLOCO VIRA SUA PARTE. AFINAÇÃO E PARTES
// MUDAM NO MESMO TICK (UM PASSO SÓ NO HISTÓRICO): O ÚNICO await É O DIÁLOGO
export async function pasteSong(payload: {
  pasted: PastedSong;
  index: number;
  replaceId?: string;
}): Promise<void> {
  const song = useSongStore();
  const instrument = useInstrumentStore();
  const { parts, tuning } = payload.pasted;

  const differs = !!tuning && !sameTuning(tuning, instrument.tuning);
  const written = song.parts.some(
    (part) => part.type == "tab" && part.info.text.split("\n").some(hasNotes)
  );
  const adopt = differs && (!written || (await askToRetune(tuning)));

  if (adopt) {
    instrument.applyTuning({ instrument: guessInstrument(tuning), tuning });
  }

  song.insertParts({
    index: payload.index,
    replaceId: payload.replaceId,
    parts: parts.map((part) =>
      part.type == "tab"
        ? { ...part, content: retune(part.content, instrument.tuning) }
        : part
    ),
  });
}

// A MÚSICA DO EDITOR VIRA UM ARQUIVO .json, QUE ABRE EM OUTRO LUGAR
export function downloadSongFile(): void {
  const song = songToCipher(pickSong());

  downloadText(songFile([song]), songFileName([song]));
}

// LÊ OS ARQUIVOS ESCOLHIDOS. ARQUIVO INVÁLIDO: AVISA E DEVOLVE null
export async function readSongFiles(
  files: File[]
): Promise<CipherFields[] | null> {
  try {
    const contents = await Promise.all(files.map((file) => file.text()));

    return contents.flatMap(parseSongFile);
  } catch (error) {
    useUiStore().showFlash(songFileMessage(error), true);
    return null;
  }
}

// ABRE UM ARQUIVO NO EDITOR COMO MÚSICA NOVA (FORA DO ACERVO). COM VÁRIAS
// MÚSICAS, ABRE A PRIMEIRA: TRAZER TODAS É COM O "IMPORTAR" DO ACERVO
export async function openSongFile(): Promise<void> {
  const files = await pickFiles({ accept: SONG_FILE_ACCEPT });
  const songs = files.length ? await readSongFiles(files) : null;

  if (!songs) return;

  const song = useSongStore();
  const library = useLibraryStore();
  const empty = !song.parts.length && !song.title && !song.artist;

  const confirmed =
    empty ||
    (!!library.cipherId && !library.dirty) ||
    (await useConfirmStore().ask({
      message: "components.songFile.openConfirm",
      confirmLabel: "components.songFile.openConfirmAction",
      danger: true,
    }));

  if (!confirmed) return;

  applySong(cipherToSong(songs[0]));
  useHistoryStore().reset();
  library.unlink();

  useUiStore().showFlash(
    songs.length > 1
      ? "components.songFile.openedFirst"
      : "components.songFile.opened",
    false,
    { count: songs.length }
  );
}
