// TEXTO COLADO DE OUTROS SITES (CIFRAS, TABS) VIRA PARTES DA MÚSICA: LINHAS
// DE TAB VIRAM UMA TAB, LINHAS SÓ DE ACORDES VIRAM UM VERSO E O RESTO, TEXTO

import type { Instrument, PartType } from "@/types/song";
import { isChord } from "./chords";

export interface PastedPart {
  type: PartType;
  // TEXTO DA PARTE. NA TAB, "<RÓTULO>|<CORPO>" POR CORDA (VER core/tab.ts)
  content: string;
}

export interface PastedSong {
  parts: PastedPart[];
  // AFINAÇÃO DA PRIMEIRA TAB COLADA (RÓTULOS DAS CORDAS), SE HOUVER
  tuning: string[] | null;
}

// "G|--5--3--|", "e |-0-", "Bb|--7h9--". O CORPO SÓ TEM TRAÇOS, CASAS,
// BARRAS E TÉCNICAS (h p b r s x t v ~ / \ ^ ...)
const TAB_LINE = /^\s*([A-Ga-g][#b]?)\s*\|(.*)$/;
const TAB_BODY = /^[-\d|hpbrsxtv~/\\^().*=<>\s]*$/;

// BLOCO MENOR QUE ISSO NÃO É TAB ("E|" SOZINHO PODE SER TEXTO)
const MIN_STRINGS = 2;

function tabLine(line: string): { label: string; body: string } | null {
  const match = line.match(TAB_LINE);

  if (!match || !TAB_BODY.test(match[2]) || !match[2].includes("-")) {
    return null;
  }

  return { label: match[1], body: match[2].trimEnd() };
}

// "Am   G   C/E" É ACORDE; "A vida" E "E" SOZINHO (PODE SER LETRA) NÃO
export function isChordLine(line: string): boolean {
  const tokens = line.trim().split(/\s+/).filter(Boolean);

  if (!tokens.length || !tokens.every(isChord)) return false;

  return tokens.length > 1 || tokens[0].length > 1;
}

function tabContent(rows: { label: string; body: string }[]): string {
  const width = Math.max(...rows.map((row) => row.body.length));

  return rows
    .map((row) => `${row.label}|${row.body.padEnd(width, "-")}`)
    .join("\n");
}

export function parsePaste(text: string): PastedSong {
  const lines = text.replace(/\r/g, "").split("\n");
  const parts: PastedPart[] = [];
  let tuning: string[] | null = null;
  let index = 0;

  while (index < lines.length) {
    const rows = [];

    while (index + rows.length < lines.length) {
      const row = tabLine(lines[index + rows.length]);

      if (!row) break;
      rows.push(row);
    }

    if (rows.length >= MIN_STRINGS) {
      parts.push({ type: "tab", content: tabContent(rows) });
      tuning ??= rows.map((row) => row.label);
      index += rows.length;
      continue;
    }

    const line = lines[index].trimEnd();

    parts.push(
      isChordLine(line)
        ? { type: "verse", content: line }
        : { type: "textField", content: line }
    );
    index++;
  }

  return { parts: tidyBlankLines(parts), tuning };
}

function isBlank(part: PastedPart | undefined): boolean {
  return part?.type == "textField" && part.content.trim() == "";
}

// LINHAS EM BRANCO: UMA SÓ ENTRE TEXTOS (ESPAÇO ENTRE SEÇÕES), NENHUMA NAS
// PONTAS NEM ENCOSTADA NUMA TAB (A TAB JÁ TEM MARGEM)
function tidyBlankLines(parts: PastedPart[]): PastedPart[] {
  const result: PastedPart[] = [];

  for (const part of parts) {
    const last = result[result.length - 1];

    if (isBlank(part)) {
      if (last && !isBlank(last) && last.type != "tab") result.push(part);
      continue;
    }

    if (part.type == "tab" && isBlank(last)) result.pop();
    result.push(part);
  }

  if (isBlank(result[result.length - 1])) result.pop();

  return result;
}

// MESMA AFINAÇÃO, IGNORANDO CAIXA: "E B G D A E" == "e B G D A E"
export function sameTuning(a: string[], b: string[]): boolean {
  return (
    a.length == b.length &&
    a.every((note, index) => note.toLowerCase() == b[index].toLowerCase())
  );
}

const UKULELE = ["a e c g", "g c e a"];

// INSTRUMENTO PELAS CORDAS: 4 OU 5 É BAIXO (OU UKULELE, PELAS NOTAS), 6+ VIOLÃO
export function guessInstrument(tuning: string[]): Instrument {
  if (UKULELE.includes(tuning.join(" ").toLowerCase())) return "ukulele";

  return tuning.length <= 5 ? "bass" : "guitar";
}
