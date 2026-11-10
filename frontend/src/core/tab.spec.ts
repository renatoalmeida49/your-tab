import { describe, it, expect } from "vitest";
import {
  createTab,
  cursorToPosition,
  eraseBackward,
  eraseForward,
  eraseRange,
  insertColumn,
  notesLostByRetune,
  overwrite,
  pasteBlock,
  positionToCursor,
  removeColumn,
  retune,
  transposeTab,
} from "./tab";

// TAB CURTA PARA OS TESTES FICAREM LEGÍVEIS
const tab = ["e|-----", "B|-----", "G|-----"].join("\n");

describe("createTab", () => {
  it("cria uma corda por nota da afinação", () => {
    const rows = createTab(["G", "D", "A", "E"]).split("\n");

    expect(rows.map((row: string) => row.slice(0, 2))).toEqual([
      "G|",
      "D|",
      "A|",
      "E|",
    ]);
    expect(new Set(rows.map((row: string) => row.length)).size).toBe(1);
  });

  it("alinha rótulos de tamanhos diferentes", () => {
    const rows = createTab(["Eb", "A"]).split("\n");

    expect(rows[0].startsWith("Eb|")).toBe(true);
    expect(rows[1].startsWith("A |")).toBe(true);
  });
});

describe("cursor", () => {
  it("converte posição em linha/coluna e volta", () => {
    const position = cursorToPosition(tab, { line: 1, column: 3 });

    expect(position).toBe(11);
    expect(positionToCursor(tab, position)).toEqual({ line: 1, column: 3 });
  });
});

describe("overwrite", () => {
  it("troca o traço pela nota sem mudar o tamanho da corda", () => {
    const result = overwrite(tab, { line: 1, column: 3 }, "3");

    expect(result.text.split("\n")[1]).toBe("B|-3---");
    expect(result.cursor).toEqual({ line: 1, column: 4 });
  });

  it("escreve trastes de dois dígitos em duas colunas", () => {
    const result = overwrite(tab, { line: 0, column: 2 }, "12");

    expect(result.text.split("\n")[0]).toBe("e|12---");
  });

  it("não escreve no rótulo: pula para a primeira coluna", () => {
    const result = overwrite(tab, { line: 2, column: 0 }, "5");

    expect(result.text.split("\n")[2]).toBe("G|5----");
  });

  it("no fim da corda, estende todas as cordas juntas", () => {
    const result = overwrite(tab, { line: 0, column: 7 }, "7");

    expect(result.text).toBe(["e|-----7", "B|------", "G|------"].join("\n"));
  });
});

describe("apagar", () => {
  const withNotes = overwrite(tab, { line: 1, column: 2 }, "35").text;

  it("Backspace troca a nota anterior por traço", () => {
    const result = eraseBackward(withNotes, { line: 1, column: 4 });

    expect(result.text.split("\n")[1]).toBe("B|3----");
    expect(result.cursor).toEqual({ line: 1, column: 3 });
  });

  it("Backspace no início da corda não apaga o rótulo", () => {
    const result = eraseBackward(withNotes, { line: 1, column: 2 });

    expect(result.text).toBe(withNotes);
  });

  it("Delete troca a nota do cursor por traço", () => {
    const result = eraseForward(withNotes, { line: 1, column: 2 });

    expect(result.text.split("\n")[1]).toBe("B|-5---");
  });

  it("apagar uma seleção entre cordas preserva rótulos e quebras", () => {
    const full = ["e|12345", "B|12345"].join("\n");
    const start = cursorToPosition(full, { line: 0, column: 4 });
    const end = cursorToPosition(full, { line: 1, column: 4 });

    expect(eraseRange(full, start, end).text).toBe(
      ["e|12---", "B|--345"].join("\n")
    );
  });
});

describe("colunas", () => {
  const notes = ["e|-0-3-", "B|-1---", "G|-----"].join("\n");

  it("inserir abre um traço no cursor em todas as cordas", () => {
    const result = insertColumn(notes, { line: 1, column: 4 });

    expect(result.text).toBe(["e|-0--3-", "B|-1----", "G|------"].join("\n"));
    expect(result.cursor).toEqual({ line: 1, column: 4 });
  });

  it("inserir no rótulo abre a coluna logo depois dele", () => {
    const result = insertColumn(notes, { line: 0, column: 0 });

    expect(result.text.split("\n")[0]).toBe("e|--0-3-");
    expect(result.cursor).toEqual({ line: 0, column: 2 });
  });

  it("corda mais curta que o cursor é completada até a coluna nova", () => {
    const uneven = ["e|--", "B|-----"].join("\n");

    expect(insertColumn(uneven, { line: 1, column: 5 }).text).toBe(
      ["e|----", "B|------"].join("\n")
    );
  });

  it("remover tira a coluna vazia antes do cursor em todas as cordas", () => {
    const result = removeColumn(notes, { line: 2, column: 5 });

    expect(result.text).toBe(["e|-03-", "B|-1--", "G|----"].join("\n"));
    expect(result.cursor).toEqual({ line: 2, column: 4 });
  });

  it("remover não apaga nota, barra nem rótulo", () => {
    const bar = ["e|-|-", "B|-|-"].join("\n");

    expect(removeColumn(notes, { line: 2, column: 4 }).text).toBe(notes);
    expect(removeColumn(bar, { line: 0, column: 4 }).text).toBe(bar);
    expect(removeColumn(notes, { line: 0, column: 2 }).text).toBe(notes);
  });

  it("inserir e remover voltam ao original", () => {
    const inserted = insertColumn(notes, { line: 0, column: 3 });

    expect(removeColumn(inserted.text, { line: 0, column: 4 }).text).toBe(
      notes
    );
  });
});

describe("pasteBlock", () => {
  it("cola cada linha na corda seguinte, na mesma coluna", () => {
    const result = pasteBlock(tab, { line: 0, column: 3 }, "1-\n-2\n3-");

    expect(result.text).toBe(["e|-1---", "B|--2--", "G|-3---"].join("\n"));
  });

  it("ignora linhas que passam da última corda", () => {
    const result = pasteBlock(tab, { line: 2, column: 2 }, "7\n8");

    expect(result.text.split("\n")).toEqual(["e|-----", "B|-----", "G|7----"]);
  });
});

describe("retune", () => {
  const guitar = createTab(["e", "B", "G", "D", "A", "E"]);

  it("mesma quantidade de cordas: só troca os rótulos", () => {
    const noted = overwrite(guitar, { line: 5, column: 2 }, "3").text;
    const result = retune(noted, ["e", "B", "G", "D", "A", "D"]).split("\n");

    expect(result[5]).toBe("D|3" + "-".repeat(40));
  });

  it("menos cordas: remove as do topo (agudas)", () => {
    const result = retune(guitar, ["G", "D", "A", "E"]).split("\n");

    expect(result.map((row: string) => row.slice(0, 2))).toEqual([
      "G|",
      "D|",
      "A|",
      "E|",
    ]);
  });

  it("mais cordas: adiciona no topo, com o mesmo tamanho", () => {
    const bass = createTab(["G", "D", "A", "E"]);
    const noted = overwrite(bass, { line: 3, column: 2 }, "5").text;
    const result = retune(noted, ["e", "B", "G", "D", "A", "E"]).split("\n");

    expect(result).toHaveLength(6);
    expect(result[0]).toBe("e|" + "-".repeat(41));
    expect(result[5].startsWith("E|5")).toBe(true);
  });

  it("avisa quando cordas removidas têm notas", () => {
    const highNote = overwrite(guitar, { line: 0, column: 2 }, "0").text;
    const lowNote = overwrite(guitar, { line: 5, column: 2 }, "0").text;

    expect(notesLostByRetune(highNote, 4)).toBe(true);
    expect(notesLostByRetune(lowNote, 4)).toBe(false);
    expect(notesLostByRetune(highNote, 6)).toBe(false);
  });
});

describe("transposeTab", () => {
  const rows = (...lines: string[]) => lines.join("\n");

  it("sobe e desce cada traste, mantendo o tamanho das cordas", () => {
    const text = rows("e|-----", "B|-3---", "E|-5-7-");

    expect(transposeTab(text, 1)).toBe(rows("e|-----", "B|-4---", "E|-6-8-"));
    expect(transposeTab(text, -2)).toBe(rows("e|-----", "B|-1---", "E|-3-5-"));
  });

  it("não mexe na tab quando não há transposição", () => {
    const text = rows("e|-9-", "B|---");

    expect(transposeTab(text, 0)).toBe(text);
  });

  it("abre uma coluna em todas as cordas quando o traste ganha um dígito", () => {
    const text = rows("e|-9---", "B|-7---", "G|-----");

    expect(transposeTab(text, 1)).toBe(
      rows("e|-10---", "B|-8----", "G|------")
    );
  });

  it("fecha a coluna quando todos os trastes do trecho perdem um dígito", () => {
    const text = rows("e|-10---", "B|-8----", "G|------");

    expect(transposeTab(text, -1)).toBe(rows("e|-9---", "B|-7---", "G|-----"));
  });

  it("mantém a coluna se outra corda ainda precisa dela", () => {
    const text = rows("e|-10-", "B|-12-");

    expect(transposeTab(text, -1)).toBe(rows("e|-9--", "B|-11-"));
  });

  it("sobe uma oitava o que ficaria abaixo da casa 0", () => {
    expect(transposeTab(rows("e|-0-2-"), -1)).toBe(rows("e|-11-1-"));
  });

  it("preserva técnicas e barras de compasso", () => {
    const text = rows("e|-5h7-|-7b9-|-12/14-", "B|------|-----|-------");

    expect(transposeTab(text, 2)).toBe(
      rows("e|-7h9-|-9b11-|-14/16-", "B|------|------|-------")
    );
  });

  it("não cola dois trastes que estavam separados por um traço", () => {
    const text = rows("e|-9-10-", "G|-11---");

    expect(transposeTab(text, 3)).toBe(rows("e|-12-13-", "G|-14----"));
  });

  it("ida e volta devolve a tab original", () => {
    const text = rows("e|-8---10--12-|", "B|-9---10--13-|", "G|---7----0---|");

    expect(transposeTab(transposeTab(text, 3), -3)).toBe(text);
    expect(transposeTab(transposeTab(text, 2), -2)).toBe(text);
  });
});
