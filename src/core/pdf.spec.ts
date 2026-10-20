import { describe, expect, it } from "vitest";
import { pdfFileName } from "./pdf";

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
