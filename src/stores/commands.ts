import { guessInstrument, sameTuning, type PastedSong } from "@/core/paste";
import { hasNotes, retune } from "@/core/tab";
import { useConfirmStore } from "./confirm";
import { useInstrumentStore } from "./instrument";
import { useSongStore } from "./song";

// AÇÕES COM CONFIRMAÇÃO, USADAS PELA BARRA DO TOPO E PELA PALETA DE COMANDOS
export async function startNewSong(): Promise<void> {
  const confirmed = await useConfirmStore().ask({
    message: "components.menu.newSongConfirm",
    confirmLabel: "components.menu.newSongConfirmAction",
    danger: true,
  });

  if (confirmed) useSongStore().newSong();
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
