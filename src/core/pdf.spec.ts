import { describe, expect, it } from "vitest";
import { MIN_SCALE, pdfFileName, scaleSteps } from "./pdf";

describe("pdfFileName", () => {
  it("junta título e artista", () => {
    expect(pdfFileName("Zombie", "The Cranberries")).toBe(
      "Zombie - The Cranberries"
    );
  });

  it("ignora partes vazias", () => {
    expect(pdfFileName("Zombie", "  ")).toBe("Zombie");
    expect(pdfFileName("", "The Cranberries")).toBe("The Cranberries");
  });

  it("sem título nem artista usa 'tab'", () => {
    expect(pdfFileName("", "")).toBe("tab");
  });

  it("remove caracteres proibidos em nomes de arquivo", () => {
    expect(pdfFileName('AC/DC: "Back in Black"?', "")).toBe(
      "ACDC Back in Black"
    );
  });
});

describe("scaleSteps", () => {
  it("vai do tamanho escolhido até o mínimo, de 5 em 5%", () => {
    expect(scaleSteps(1)).toEqual([1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7]);
  });

  it("começa no tamanho escolhido, mesmo acima de 100%", () => {
    expect(scaleSteps(1.15)[0]).toBe(1.15);
    expect(scaleSteps(1.15).at(-1)).toBeGreaterThanOrEqual(MIN_SCALE);
  });

  it("no mínimo, só ele mesmo", () => {
    expect(scaleSteps(MIN_SCALE)).toEqual([MIN_SCALE]);
  });
});
