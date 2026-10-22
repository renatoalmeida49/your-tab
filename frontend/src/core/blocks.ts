// SELEÇÃO DE BLOCOS: PARTES INTEIRAS SELECIONADAS DE UMA VEZ (COMO NO NOTION)

import type { Part } from "@/types/song";

export interface VerticalSpan {
  top: number;
  bottom: number;
}

// O TEXTO DA PARTE, DO JEITO QUE APARECE NA TELA
export function partText(part: Part): string {
  switch (part.type) {
    case "tab":
      return part.info.text.replace(/^\n+|\n+$/g, "");
    case "verse":
      return part.info.chords;
    case "textField":
      return part.info.text;
  }
}

// BLOCOS COPIADOS VIRAM TEXTO DE CIFRA: COLADOS DE VOLTA, O parsePaste
// RECONHECE DE NOVO AS TABS, OS ACORDES E A LETRA
export function blocksToText(parts: Part[]): string {
  return parts.map(partText).join("\n");
}

// IDS DAS PARTES ENTRE from E to (EM QUALQUER ORDEM), INCLUSIVE
export function rangeIds(parts: Part[], from: number, to: number): string[] {
  const start = Math.max(Math.min(from, to), 0);
  const end = Math.max(from, to);

  return parts.slice(start, end + 1).map((part) => part.id);
}

// ÍNDICES DAS PARTES QUE O ARRASTO VERTICAL DE y1 ATÉ y2 TOCA
export function blocksInSpan(
  spans: VerticalSpan[],
  y1: number,
  y2: number
): number[] {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);

  return spans.flatMap((span, index) =>
    span.bottom >= top && span.top <= bottom ? [index] : []
  );
}

// ARRASTAR UM BLOCO SELECIONADO LEVA OS OUTROS JUNTO: ELES SAEM DE ONDE
// ESTAVAM E ENTRAM, NA ORDEM ORIGINAL, ONDE O BLOCO ARRASTADO CAIU
export function moveBlocks(
  original: Part[],
  reordered: Part[],
  movedId: string,
  selected: string[]
): Part[] {
  if (!selected.includes(movedId) || selected.length < 2) return reordered;

  const group = original.filter((part) => selected.includes(part.id));

  return reordered.flatMap((part) => {
    if (part.id == movedId) return group;

    return selected.includes(part.id) ? [] : [part];
  });
}
