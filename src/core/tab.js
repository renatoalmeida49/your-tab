import string from "@/core/config/string";

// UMA TAB É TEXTO: UMA LINHA POR CORDA, DA MAIS AGUDA PARA A MAIS GRAVE,
// NO FORMATO "<RÓTULO>|<TRAÇOS E NOTAS>". O CURSOR É { line, column }.

const EMPTY = "-";

function labelWidth(tuning) {
  return Math.max(...tuning.map((tune) => tune.length));
}

function label(tune, width) {
  return `${tune.padEnd(width)}|`;
}

function lines(text) {
  return text.split("\n");
}

function body(line) {
  return line.slice(firstColumn(line));
}

function replaceAt(line, column, char) {
  return line.slice(0, column) + char + line.slice(column + 1);
}

// GARANTE QUE TODAS AS CORDAS TENHAM PELO MENOS `width` COLUNAS
function ensureWidth(rows, width) {
  return rows.map((row) => row.padEnd(width, EMPTY));
}

export function createTab(tuning) {
  const width = labelWidth(tuning);

  return tuning.map((tune) => label(tune, width) + string()).join("\n");
}

// PRIMEIRA COLUNA EDITÁVEL: LOGO DEPOIS DO "|" DO RÓTULO
export function firstColumn(line) {
  return line.indexOf("|") + 1;
}

export function positionToCursor(text, position) {
  const before = text.slice(0, position).split("\n");

  return { line: before.length - 1, column: before[before.length - 1].length };
}

export function cursorToPosition(text, cursor) {
  const rows = lines(text);
  const line = Math.min(Math.max(cursor.line, 0), rows.length - 1);
  const column = Math.min(cursor.column, rows[line].length);

  return (
    rows.slice(0, line).reduce((total, row) => total + row.length + 1, 0) +
    column
  );
}

// ESCREVE POR CIMA DOS TRAÇOS. PASSANDO DO FIM, TODAS AS CORDAS CRESCEM JUNTAS
export function overwrite(text, cursor, chars) {
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
export function pasteBlock(text, cursor, pasted) {
  const block = pasted.replace(/\r/g, "").replace(/\n+$/, "").split("\n");
  let result = { text, cursor };

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
export function eraseBackward(text, cursor) {
  const rows = lines(text);

  if (cursor.column <= firstColumn(rows[cursor.line])) return { text, cursor };

  const column = cursor.column - 1;
  rows[cursor.line] = replaceAt(rows[cursor.line], column, EMPTY);

  return { text: rows.join("\n"), cursor: { line: cursor.line, column } };
}

export function eraseForward(text, cursor) {
  const rows = lines(text);
  const row = rows[cursor.line];

  if (cursor.column < firstColumn(row) || cursor.column >= row.length) {
    return { text, cursor };
  }

  rows[cursor.line] = replaceAt(row, cursor.column, EMPTY);

  return { text: rows.join("\n"), cursor };
}

// APAGA UMA SELEÇÃO (EM POSIÇÕES DO TEXTO), PRESERVANDO RÓTULOS E QUEBRAS
export function eraseRange(text, start, end) {
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

export function hasNotes(line) {
  return body(line).replace(/[-|\s]/g, "") !== "";
}

// AO TROCAR A AFINAÇÃO, AS CORDAS SÃO ALINHADAS PELA MAIS GRAVE (EMBAIXO):
// SAEM OU ENTRAM CORDAS NO TOPO. EX: VIOLÃO -> BAIXO MANTÉM D-A-E... -> G-D-A-E
export function notesLostByRetune(text, strings) {
  const rows = lines(text);

  return rows.slice(0, Math.max(rows.length - strings, 0)).some(hasNotes);
}

export function retune(text, tuning) {
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
