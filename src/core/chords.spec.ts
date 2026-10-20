import { describe, expect, it } from "vitest";
import {
  transposeChord,
  transposeLine,
  transposeNote,
  transposeText,
} from "./chords";

describe("transposeNote", () => {
  it("sobe e desce em semitons, dando a volta na escala", () => {
    expect(transposeNote("C", 2)).toBe("D");
    expect(transposeNote("B", 1)).toBe("C");
    expect(transposeNote("C", -1)).toBe("B");
    expect(transposeNote("E", 14)).toBe("F#");
  });

  it("mantém bemóis quando a nota original é bemol", () => {
    expect(transposeNote("Bb", 1)).toBe("B");
    expect(transposeNote("Eb", -1)).toBe("D");
    expect(transposeNote("Ab", 1)).toBe("A");
    expect(transposeNote("Db", -2)).toBe("B");
    expect(transposeNote("Gb", 2)).toBe("Ab");
  });
});

describe("transposeChord", () => {
  it.each([
    ["Em", 2, "F#m"],
    ["C7M", 1, "C#7M"],
    ["D6(9)/F#", 2, "E6(9)/G#"],
    ["Am7(b5)", -2, "Gm7(b5)"],
    ["Gsus4", 5, "Csus4"],
    ["Bbmaj7", 2, "Cmaj7"],
    ["F#º", 1, "Gº"],
    ["A7(-9)", 3, "C7(-9)"],
  ])("%s %+d -> %s", (chord, semitones, expected) => {
    expect(transposeChord(chord, semitones)).toBe(expected);
  });

  it("não mexe no que não é acorde", () => {
    expect(transposeChord("Bridge", 2)).toBe("Bridge");
    expect(transposeChord("(4x)", 2)).toBe("(4x)");
  });
});

describe("transposeLine", () => {
  it("mantém cada acorde na mesma coluna", () => {
    const line = "Em      C7M     G6";
    const result = transposeLine(line, 2);

    expect(result).toBe("F#m     D7M     A6");
    expect(result.indexOf("D7M")).toBe(line.indexOf("C7M"));
    expect(result.indexOf("A6")).toBe(line.indexOf("G6"));
  });

  it("quando encolhe, completa com o separador original", () => {
    expect(transposeLine("F#m---C#", -1)).toBe("Fm----C");
  });

  it("acordes colados mantêm ao menos um separador", () => {
    expect(transposeLine("E A", 1)).toBe("F A#");
    expect(transposeLine("E A", 2)).toBe("F# B");
  });

  it("preserva textos e marcações que não são acordes", () => {
    expect(transposeLine("Em----C7M----(4x)", 2)).toBe("F#m---D7M----(4x)");
    expect(transposeLine("Intro: Am  G", 2)).toBe("Intro: Bm  A");
  });

  it("transpor 0 devolve a linha igual", () => {
    expect(transposeLine("Em  C", 0)).toBe("Em  C");
  });

  it("ida e volta devolve o original", () => {
    const line = "Am      G/B     C        D6(9)/F#";

    expect(transposeLine(transposeLine(line, 3), -3)).toBe(line);
  });
});

describe("transposeText", () => {
  it("transpõe cada linha", () => {
    expect(transposeText("Am  G\nC   D", 2)).toBe("Bm  A\nD   E");
  });
});
