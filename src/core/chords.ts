// TRANSPOSIÇÃO DE ACORDES. UMA LINHA DE VERSO É TEXTO LIVRE ("Em----C7M   G6"):
// SÓ O QUE PARECE ACORDE MUDA, E CADA ACORDE CONTINUA NA MESMA COLUNA (EM CIMA
// DA MESMA SÍLABA DA LETRA)

const SHARPS = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const NOTE = "[A-G](?:#|b)?";
// m, maj7, sus4, add9, dim, aug, º, ø, +, 7M, (9), (-9), (11) ... O "-" SÓ
// DENTRO DE PARÊNTESES: SOLTO, ELE SEPARA ACORDES ("Em----C7M")
const QUALITY = "(?:maj|min|dim|aug|sus|add|m|M|º|°|ø|\\+|\\d|\\([^)]*\\))*";
const CHORD = new RegExp(`(${NOTE})(${QUALITY})(?:/(${NOTE}))?`, "y");

// O QUE PODE VIR ANTES E DEPOIS DE UM ACORDE (SEPARADORES DA LINHA)
const BOUNDARY = /[\s\-|()[\]]/;

function noteIndex(note: string): number {
  const index = SHARPS.indexOf(note);

  return index >= 0 ? index : FLATS.indexOf(note);
}

export function transposeNote(note: string, semitones: number): string {
  const index = noteIndex(note);

  if (index < 0) return note;

  const scale = note.includes("b") ? FLATS : SHARPS;

  return scale[(((index + semitones) % 12) + 12) % 12];
}

function matchChordAt(line: string, start: number): RegExpExecArray | null {
  if (start > 0 && !BOUNDARY.test(line[start - 1])) return null;

  CHORD.lastIndex = start;
  const match = CHORD.exec(line);

  if (!match) return null;

  const end = start + match[0].length;

  // "Bridge" NÃO É ACORDE: DEPOIS DO ACORDE PRECISA VIR UM SEPARADOR
  if (end < line.length && !BOUNDARY.test(line[end])) return null;

  return match;
}

export function transposeChord(chord: string, semitones: number): string {
  const match = matchChordAt(chord, 0);

  if (!match || match[0].length != chord.length) return chord;

  const [, root, quality, bass] = match;
  const transposed = transposeNote(root, semitones) + quality;

  return bass ? `${transposed}/${transposeNote(bass, semitones)}` : transposed;
}

// O TRECHO ENTRE DOIS ACORDES ABSORVE A DIFERENÇA DE TAMANHO DO ACORDE
// ANTERIOR: delta > 0 REPETE O SEPARADOR, delta < 0 COME SEPARADORES DO
// INÍCIO, MAS SEMPRE SOBRA PELO MENOS UM ENTRE DOIS ACORDES
function adjust(segment: string, delta: number): string {
  // FIM DA LINHA LOGO DEPOIS DO ACORDE: NADA A COMPLETAR
  if (!segment) return segment;

  if (delta > 0) {
    const fill = BOUNDARY.test(segment[0] ?? "") ? segment[0] : " ";

    return fill.repeat(delta) + segment;
  }

  const separators = segment.match(/^[\s\-|]*/)![0].length;
  const removable = Math.min(-delta, Math.max(separators - 1, 0));

  return segment.slice(removable);
}

export function transposeLine(line: string, semitones: number): string {
  if (!semitones) return line;

  let result = "";
  // ONDE, NA LINHA ORIGINAL, COMEÇA O TRECHO AINDA NÃO COPIADO
  let cursor = 0;
  let index = 0;

  while (index < line.length) {
    const match = matchChordAt(line, index);

    if (!match) {
      index++;
      continue;
    }

    result += adjust(line.slice(cursor, index), cursor - result.length);
    result += transposeChord(match[0], semitones);
    index += match[0].length;
    cursor = index;
  }

  return result + adjust(line.slice(cursor), cursor - result.length);
}

export function transposeText(text: string, semitones: number): string {
  return text
    .split("\n")
    .map((line) => transposeLine(line, semitones))
    .join("\n");
}
