import string from "@/core/config/string";

// UMA TAB É TEXTO: UMA LINHA POR CORDA, DA MAIS AGUDA PARA A MAIS GRAVE,
// NO FORMATO "<RÓTULO>|<TRAÇOS E NOTAS>".

export interface Cursor {
  line: number;
  column: number;
}

export interface Edit {
  text: string;
  cursor: Cursor;
}

const EMPTY = "-";

function labelWidth(tuning: string[]): number {
  return Math.max(...tuning.map((tune) => tune.length));
}

function label(tune: string, width: number): string {
  return `${tune.padEnd(width)}|`;
}

function lines(text: string): string[] {
  return text.split("\n");
}

function body(line: string): string {
  return line.slice(firstColumn(line));
}

function replaceAt(line: string, column: number, char: string): string {
  return line.slice(0, column) + char + line.slice(column + 1);
}

// GARANTE QUE TODAS AS CORDAS TENHAM PELO MENOS `width` COLUNAS
function ensureWidth(rows: string[], width: number): string[] {
  return rows.map((row) => row.padEnd(width, EMPTY));
}

export function createTab(tuning: string[]): string {
  const width = labelWidth(tuning);

  return tuning.map((tune) => label(tune, width) + string()).join("\n");
}

// PRIMEIRA COLUNA EDITÁVEL: LOGO DEPOIS DO "|" DO RÓTULO
export function firstColumn(line: string): number {
  return line.indexOf("|") + 1;
}

export function positionToCursor(text: string, position: number): Cursor {
  const before = text.slice(0, position).split("\n");

  return { line: before.length - 1, column: before[before.length - 1].length };
}

export function cursorToPosition(text: string, cursor: Cursor): number {
  const rows = lines(text);
  const line = Math.min(Math.max(cursor.line, 0), rows.length - 1);
  const column = Math.min(cursor.column, rows[line].length);

  return (
    rows.slice(0, line).reduce((total, row) => total + row.length + 1, 0) +
    column
  );
}

// ESCREVE POR CIMA DOS TRAÇOS. PASSANDO DO FIM, TODAS AS CORDAS CRESCEM JUNTAS
export function overwrite(text: string, cursor: Cursor, chars: string): Edit {
  let rows = lines(text);
  let column = Math.max(cursor.column, firstColumn(rows[cursor.line]));

  for (const char of chars) {
    rows = ensureWidth(rows, column + 1);
    rows[cursor.line] = replaceAt(rows[cursor.line], column, char);
    column++;
  }

  return { text: rows.join("\n"), cursor: { line: cursor.line, column } };
}

// COLAR VÁRIAS LINHAS: CADA LINHA VAI PARA A CORDA SEGUINTE, NA MESMA COLUNA
export function pasteBlock(text: string, cursor: Cursor, pasted: string): Edit {
  const block = pasted.replace(/\r/g, "").replace(/\n+$/, "").split("\n");
  let result: Edit = { text, cursor };

  block.forEach((row, index) => {
    const line = cursor.line + index;

    if (line >= lines(text).length) return;

    const written = overwrite(
      result.text,
      { line, column: cursor.column },
      row
    );

    result = {
      text: written.text,
      cursor: index == 0 ? written.cursor : result.cursor,
    };
  });

  return result;
}

// APAGAR TROCA A NOTA POR TRAÇO, SEM ENCURTAR A CORDA
export function eraseBackward(text: string, cursor: Cursor): Edit {
  const rows = lines(text);

  if (cursor.column <= firstColumn(rows[cursor.line])) return { text, cursor };

  const column = cursor.column - 1;
  rows[cursor.line] = replaceAt(rows[cursor.line], column, EMPTY);

  return { text: rows.join("\n"), cursor: { line: cursor.line, column } };
}

export function eraseForward(text: string, cursor: Cursor): Edit {
  const rows = lines(text);
  const row = rows[cursor.line];

  if (cursor.column < firstColumn(row) || cursor.column >= row.length) {
    return { text, cursor };
  }

  rows[cursor.line] = replaceAt(row, cursor.column, EMPTY);

  return { text: rows.join("\n"), cursor };
}

// APAGA UMA SELEÇÃO (EM POSIÇÕES DO TEXTO), PRESERVANDO RÓTULOS E QUEBRAS
export function eraseRange(text: string, start: number, end: number): Edit {
  let result = text;

  for (let position = start; position < end; position++) {
    const cursor = positionToCursor(result, position);
    const row = lines(result)[cursor.line];

    if (cursor.column >= firstColumn(row) && cursor.column < row.length) {
      result = eraseForward(result, cursor).text;
    }
  }

  return { text: result, cursor: positionToCursor(result, start) };
}

// ABRE UMA COLUNA DE TRAÇO NO CURSOR, EM TODAS AS CORDAS: O QUE VEM DEPOIS
// ANDA PARA A DIREITA SEM DESALINHAR. O CURSOR FICA NA COLUNA NOVA
export function insertColumn(text: string, cursor: Cursor): Edit {
  const column = Math.max(cursor.column, firstColumn(lines(text)[cursor.line]));
  const rows = ensureWidth(lines(text), column).map(
    (row) => row.slice(0, column) + EMPTY + row.slice(column)
  );

  return { text: rows.join("\n"), cursor: { line: cursor.line, column } };
}

// TIRA A COLUNA ANTES DO CURSOR, EM TODAS AS CORDAS. SÓ SE ELA ESTIVER VAZIA
// (TRAÇO OU ESPAÇO) EM TODAS: NÃO APAGA NOTA NEM BARRA DE COMPASSO
export function removeColumn(text: string, cursor: Cursor): Edit {
  const rows = lines(text);
  const column = cursor.column - 1;

  if (column < firstColumn(rows[cursor.line])) return { text, cursor };

  const empty = rows.every((row) =>
    [EMPTY, " ", undefined].includes(row[column])
  );

  if (!empty) return { text, cursor };

  return {
    text: rows
      .map((row) => row.slice(0, column) + row.slice(column + 1))
      .join("\n"),
    cursor: { line: cursor.line, column },
  };
}

export function hasNotes(line: string): boolean {
  return body(line).replace(/[-|\s]/g, "") !== "";
}

// AO TROCAR A AFINAÇÃO, AS CORDAS SÃO ALINHADAS PELA MAIS GRAVE (EMBAIXO):
// SAEM OU ENTRAM CORDAS NO TOPO. EX: VIOLÃO -> BAIXO MANTÉM D-A-E... -> G-D-A-E
export function notesLostByRetune(text: string, strings: number): boolean {
  const rows = lines(text);

  return rows.slice(0, Math.max(rows.length - strings, 0)).some(hasNotes);
}

export function retune(text: string, tuning: string[]): string {
  let rows = lines(text);
  const width = Math.max(...rows.map((row) => body(row).length));

  if (rows.length > tuning.length) {
    rows = rows.slice(rows.length - tuning.length);
  }

  while (rows.length < tuning.length) {
    rows.unshift(EMPTY.repeat(width));
  }

  const labels = labelWidth(tuning);

  return rows
    .map((row, index) => label(tuning[index], labels) + body(row))
    .join("\n");
}

// TRANSPOSIÇÃO: CADA TRASTE (SEQUÊNCIA DE DÍGITOS) SOBE OU DESCE `semitones`
// CASAS. LETRAS E SÍMBOLOS (h, p, b, /, |) FICAM. ABAIXO DA CASA 0, A NOTA
// SOBE UMA OITAVA (0 -1 -> 11)
function transposeFret(fret: string, semitones: number): string {
  let value = Number(fret) + semitones;

  while (value < 0) value += 12;

  return String(value);
}

interface Fret {
  start: number;
  end: number;
}

function frets(row: string): Fret[] {
  return [...row.matchAll(/\d+/g)].map((match) => ({
    start: match.index,
    end: match.index + match[0].length,
  }));
}

function isFiller(char: string): boolean {
  return char == EMPTY || char == " ";
}

// TRASTES SOBREPOSTOS ENTRE AS CORDAS (UM ACORDE, UM "10" SOBRE UM "8") FORMAM
// UM TRECHO. SE O NÚMERO DE DÍGITOS MUDA, O TRECHO GANHA OU PERDE COLUNAS EM
// TODAS AS CORDAS, PARA NADA DESALINHAR (COMO O insertColumn/removeColumn)
export function transposeTab(text: string, semitones: number): string {
  if (!semitones) return text;

  const rows = lines(text);
  const labels = rows.map((row) => row.slice(0, firstColumn(row)));
  const bodies = rows.map(body);
  const fretsByRow = bodies.map(frets);
  const width = Math.max(...bodies.map((row) => row.length));
  const result = bodies.map(() => "");

  let column = 0;

  while (column < width) {
    const startsHere = fretsByRow.some((list) =>
      list.some((fret) => fret.start == column)
    );

    if (!startsHere) {
      bodies.forEach((row, index) => {
        result[index] += row[column] ?? "";
      });
      column++;
      continue;
    }

    // O TRECHO CRESCE ENQUANTO HOUVER TRASTE COMEÇANDO DENTRO DELE
    let end = column;
    let grown = true;

    while (grown) {
      grown = false;

      for (const list of fretsByRow) {
        for (const fret of list) {
          if (fret.start >= column && fret.start <= end && fret.end > end) {
            end = fret.end;
            grown = true;
          }
        }
      }
    }

    const segments = bodies.map((row, index) => {
      let segment = "";
      let position = column;

      for (const fret of fretsByRow[index]) {
        if (fret.start < column || fret.start >= end) continue;

        segment += row.slice(position, fret.start);
        segment += transposeFret(row.slice(fret.start, fret.end), semitones);
        position = fret.end;
      }

      return segment + row.slice(position, end);
    });

    // LARGURA NOVA: O QUE NÃO É TRAÇO NO FIM DO TRECHO PRECISA CABER. SE
    // LOGO DEPOIS VEM OUTRO TRASTE, UM TRAÇO FICA PARA SEPARAR OS DOIS
    const needed = Math.max(
      ...segments.map((segment, index) => {
        let size = segment.length;

        while (size > 0 && isFiller(segment[size - 1])) size--;

        const separated = size < segment.length;
        const nextIsFret = /\d/.test(bodies[index][end] ?? "");

        return separated && nextIsFret ? size + 1 : size;
      })
    );

    segments.forEach((segment, index) => {
      // CORDA QUE TERMINA ANTES DO TRECHO CONTINUA TERMINANDO ANTES
      if (bodies[index].length <= column) return;

      result[index] +=
        segment.length > needed
          ? segment.slice(0, needed)
          : segment.padEnd(needed, EMPTY);
    });

    column = end;
  }

  return result.map((row, index) => labels[index] + row).join("\n");
}
