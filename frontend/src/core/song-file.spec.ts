import { describe, expect, it } from "vitest";
import type { CipherFields } from "@/types/library";
import {
  parseSongFile,
  songFile,
  songFileName,
  SongFileError,
  type SongFileErrorReason,
} from "./song-file";

const NOW = new Date("2026-10-22T15:00:00Z");

const song: CipherFields = {
  title: "Segredos",
  artist: "Frejat",
  instrument: "guitar",
  tuning: ["e", "B", "G", "D", "A", "E"],
  tone: "G",
  parts: [
    { id: "1", type: "verse", info: { chords: "G      D" } },
    { id: "2", type: "textField", info: { text: "Eu procuro um amor" } },
    { id: "3", type: "tab", info: { text: "e|--3--|\nB|--0--|" } },
  ],
};

function file(overrides: object): string {
  return JSON.stringify({ ...JSON.parse(songFile([song], NOW)), ...overrides });
}

function reason(content: string): SongFileErrorReason | null {
  try {
    parseSongFile(content);
    return null;
  } catch (error) {
    if (error instanceof SongFileError) return error.reason;
    throw error;
  }
}

describe("songFile + parseSongFile", () => {
  it("ida e volta sem perder nada", () => {
    const other = { ...song, title: "Proud Mary", artist: "Creedence" };

    expect(parseSongFile(songFile([song, other], NOW))).toEqual([song, other]);
  });

  it("marca o app, a versão e a data", () => {
    expect(JSON.parse(songFile([song], NOW))).toMatchObject({
      app: "tab-builder",
      version: 1,
      exportedAt: "2026-10-22T15:00:00.000Z",
    });
  });

  it("título, artista e tom ausentes viram vazios; ignora campos extras", () => {
    const { instrument, tuning, parts } = song;
    const content = file({
      songs: [{ instrument, tuning, parts, _id: "x", userId: "y" }],
    });

    expect(parseSongFile(content)).toEqual([
      { instrument, tuning, parts, title: "", artist: "", tone: "" },
    ]);
  });
});

describe("parseSongFile: arquivos recusados", () => {
  it("não é JSON, ou é JSON de outra coisa", () => {
    expect(reason("Am G C")).toBe("invalid");
    expect(reason("[]")).toBe("invalid");
    expect(reason(file({ app: "outro-app" }))).toBe("invalid");
  });

  it("feito por uma versão mais nova do app", () => {
    expect(reason(file({ version: 2 }))).toBe("newer");
  });

  it("sem músicas", () => {
    expect(reason(file({ songs: [] }))).toBe("empty");
  });

  it("música com dados fora do formato", () => {
    const broken = [
      { ...song, instrument: "piano" },
      { ...song, tuning: [] },
      { ...song, tuning: ["E", 5] },
      { ...song, title: "x".repeat(201) },
      { ...song, parts: [{ id: "1", type: "verse", info: { text: "Am" } }] },
      { ...song, parts: [{ id: "", type: "tab", info: { text: "" } }] },
      { ...song, parts: [{ id: "1", type: "imagem", info: { text: "" } }] },
    ];

    for (const item of broken) {
      expect(reason(file({ songs: [item] }))).toBe("invalid");
    }
  });
});

describe("songFileName", () => {
  it("uma música leva título e artista; várias, a data", () => {
    expect(songFileName([song], NOW)).toBe("Segredos - Frejat.json");
    expect(songFileName([{ ...song, title: "", artist: "" }], NOW)).toBe(
      "tab.json"
    );
    expect(songFileName([song, song], NOW)).toBe("tab-builder-2026-10-22.json");
  });
});
