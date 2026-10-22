import { describe, expect, it } from "vitest";
import { guessInstrument, isChordLine, parsePaste, sameTuning } from "./paste";

const BASS_TAB = `G|--------------------------------------------|
D|-----------------------------5-3--3-3-3-3---|
A|-3-3--------3-3--------3-3----------------5-|
E|-----5--5-5-----5--5-5-----5----------------|`;

describe("parsePaste", () => {
  it("reconhece a tab e mantém as seções como texto", () => {
    const song = parsePaste(`Introdução

Parte 01

${BASS_TAB}

${BASS_TAB}

Primeira parte

Left a good job in the city
`);

    expect(song.parts.map((part) => part.type)).toEqual([
      "textField",
      "textField",
      "textField",
      "tab",
      "tab",
      "textField",
      "textField",
      "textField",
    ]);
    expect(song.parts.map((part) => part.content)).toEqual([
      "Introdução",
      "",
      "Parte 01",
      BASS_TAB,
      BASS_TAB,
      "Primeira parte",
      "",
      "Left a good job in the city",
    ]);
    expect(song.tuning).toEqual(["G", "D", "A", "E"]);
  });

  it("linha só de acordes vira verso, acima da letra", () => {
    const song = parsePaste("Am       G      C/E\nRolling on the river");

    expect(song.parts).toEqual([
      { type: "verse", content: "Am       G      C/E" },
      { type: "textField", content: "Rolling on the river" },
    ]);
    expect(song.tuning).toBeNull();
  });

  it("completa cordas de tamanhos diferentes com traços", () => {
    const song = parsePaste("e|-0-1-\nB|-1-");

    expect(song.parts).toEqual([{ type: "tab", content: "e|-0-1-\nB|-1---" }]);
  });

  it("aceita espaços e acidentes no rótulo", () => {
    const song = parsePaste("Eb |--3--\nBb |--5h7--");

    expect(song.tuning).toEqual(["Eb", "Bb"]);
  });

  it("uma linha solta com '|' não é tab", () => {
    const song = parsePaste("E|---- fim\nRefrão");

    expect(song.parts.every((part) => part.type == "textField")).toBe(true);
  });

  it("CRLF do Windows", () => {
    const song = parsePaste("Intro\r\nG|---|\r\nD|-5-|\r\n");

    expect(song.parts).toEqual([
      { type: "textField", content: "Intro" },
      { type: "tab", content: "G|---|\nD|-5-|" },
    ]);
  });

  it("ignora caracteres invisíveis no começo das linhas (Cifra Club)", () => {
    const song = parsePaste("\u200BIntro:\n\u200BG|-5-|\n\u200BD|-7-|\n");

    expect(song.parts).toEqual([
      { type: "textField", content: "Intro:" },
      { type: "tab", content: "G|-5-|\nD|-7-|" },
    ]);
  });
});

describe("isChordLine", () => {
  it("acordes com espaços", () => {
    expect(isChordLine("  Am7   D/F#  G  ")).toBe(true);
  });

  it("letra não é acorde", () => {
    expect(isChordLine("A vida é bela")).toBe(false);
    expect(isChordLine("Bridge")).toBe(false);
  });

  it("uma letra sozinha é ambígua: fica como texto", () => {
    expect(isChordLine("E")).toBe(false);
    expect(isChordLine("Em")).toBe(true);
  });
});

describe("afinação", () => {
  it("compara sem diferenciar maiúsculas", () => {
    expect(
      sameTuning(["E", "B", "G", "D", "A", "E"], ["e", "B", "G", "D", "A", "E"])
    ).toBe(true);
    expect(
      sameTuning(["G", "D", "A", "E"], ["e", "B", "G", "D", "A", "E"])
    ).toBe(false);
  });

  it("adivinha o instrumento pelas cordas", () => {
    expect(guessInstrument(["G", "D", "A", "E"])).toBe("bass");
    expect(guessInstrument(["A", "E", "C", "G"])).toBe("ukulele");
    expect(guessInstrument(["e", "B", "G", "D", "A", "E"])).toBe("guitar");
  });
});
