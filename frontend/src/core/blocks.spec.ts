import { describe, expect, it } from "vitest";
import type { Part } from "@/types/song";
import {
  blocksInSpan,
  blocksToText,
  moveBlocks,
  partText,
  rangeIds,
} from "./blocks";
import { parsePaste } from "./paste";

function text(id: string, value = id): Part {
  return { id, type: "textField", info: { text: value } };
}

const TAB = "e|--3--|\nB|--1--|\nG|--0--|";

const song: Part[] = [
  { id: "v", type: "verse", info: { chords: "Am   G" } },
  text("t", "A vida"),
  { id: "tab", type: "tab", info: { text: `\n${TAB}\n` } },
];

function ids(parts: Part[]): string[] {
  return parts.map((part) => part.id);
}

describe("partText", () => {
  it("devolve o texto de cada tipo de parte, sem as quebras da tab", () => {
    expect(song.map(partText)).toEqual(["Am   G", "A vida", TAB]);
  });
});

describe("blocksToText", () => {
  it("junta os blocos numa cifra que o colar reconhece de novo", () => {
    const pasted = parsePaste(blocksToText(song));

    expect(pasted.parts).toEqual([
      { type: "verse", content: "Am   G" },
      { type: "textField", content: "A vida" },
      { type: "tab", content: TAB },
    ]);
  });
});

describe("rangeIds", () => {
  const parts = ["a", "b", "c", "d"].map((id) => text(id));

  it("pega o intervalo inclusive, em qualquer direção", () => {
    expect(rangeIds(parts, 1, 2)).toEqual(["b", "c"]);
    expect(rangeIds(parts, 3, 1)).toEqual(["b", "c", "d"]);
    expect(rangeIds(parts, 2, 2)).toEqual(["c"]);
  });
});

describe("blocksInSpan", () => {
  const spans = [
    { top: 0, bottom: 30 },
    { top: 30, bottom: 60 },
    { top: 70, bottom: 200 },
  ];

  it("pega os blocos que o arrasto toca, de cima ou de baixo", () => {
    expect(blocksInSpan(spans, 10, 40)).toEqual([0, 1]);
    expect(blocksInSpan(spans, 100, 45)).toEqual([1, 2]);
  });

  it("vão entre blocos não seleciona nada", () => {
    expect(blocksInSpan(spans, 62, 68)).toEqual([]);
  });
});

describe("moveBlocks", () => {
  const original = ["a", "b", "c", "d", "e"].map((id) => text(id));

  // O SORTABLE SÓ MOVE O BLOCO ARRASTADO
  function drag(from: number, to: number): Part[] {
    const reordered = [...original];
    const [part] = reordered.splice(from, 1);

    reordered.splice(to, 0, part);
    return reordered;
  }

  it("leva os outros selecionados junto, na ordem original", () => {
    // "b" E "c" SELECIONADOS, "c" ARRASTADO PARA O FIM
    expect(ids(moveBlocks(original, drag(2, 4), "c", ["b", "c"]))).toEqual([
      "a",
      "d",
      "e",
      "b",
      "c",
    ]);

    // "b" E "d" SELECIONADOS, "b" ARRASTADO PARA O COMEÇO
    expect(ids(moveBlocks(original, drag(1, 0), "b", ["b", "d"]))).toEqual([
      "b",
      "d",
      "a",
      "c",
      "e",
    ]);
  });

  it("bloco fora da seleção move sozinho", () => {
    const reordered = drag(0, 3);

    expect(moveBlocks(original, reordered, "a", ["c", "d"])).toBe(reordered);
  });
});
