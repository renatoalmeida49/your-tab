// ARQUIVO DE MÚSICA (.json): LEVA MÚSICAS DE UM LUGAR PARA OUTRO (EX: DO
// ACERVO LOCAL PARA O DE PRODUÇÃO). MESMO FORMATO QUE A API GUARDA

import type { CipherFields } from "@/types/library";
import type { Instrument, Part } from "@/types/song";
import { pdfFileName } from "./pdf";

const APP = "tab-builder";
const VERSION = 1;

// OS MESMOS LIMITES DA API (backend/src/ciphers/schema.ts): O QUE O ARQUIVO
// ACEITA, O "SALVAR" TAMBÉM ACEITA
const MAX_TEXT = 200;
const MAX_TONE = 10;
const MAX_LABEL = 4;
const MAX_STRINGS = 12;
const MAX_PARTS = 1000;
const INSTRUMENTS: Instrument[] = ["guitar", "bass", "ukulele"];

export interface SongFile {
  app: typeof APP;
  version: number;
  exportedAt: string;
  songs: CipherFields[];
}

// reason É O FIM DA CHAVE DO i18n: components.songFile.errors.<reason>
export type SongFileErrorReason = "invalid" | "newer" | "empty";

export class SongFileError extends Error {
  constructor(public reason: SongFileErrorReason) {
    super(`Arquivo de música: ${reason}`);
  }
}

export function songFile(songs: CipherFields[], now = new Date()): string {
  const file: SongFile = {
    app: APP,
    version: VERSION,
    exportedAt: now.toISOString(),
    songs,
  };

  return JSON.stringify(file, null, 2);
}

// UMA MÚSICA: "Título - Artista.json". VÁRIAS: "tab-builder-2026-10-22.json"
export function songFileName(songs: CipherFields[], now = new Date()): string {
  if (songs.length == 1) {
    return `${pdfFileName(songs[0].title, songs[0].artist)}.json`;
  }

  return `${APP}-${now.toISOString().slice(0, 10)}.json`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value == "object" && value != null && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  if (value == null) return "";
  if (typeof value != "string") throw new SongFileError("invalid");

  const trimmed = value.trim();

  if (trimmed.length > max) throw new SongFileError("invalid");

  return trimmed;
}

function part(value: unknown): Part {
  if (!isObject(value) || !isObject(value.info)) {
    throw new SongFileError("invalid");
  }

  const { id, type, info } = value;

  if (typeof id != "string" || !id) throw new SongFileError("invalid");

  if (type == "verse" && typeof info.chords == "string") {
    return { id, type: "verse", info: { chords: info.chords } };
  }

  if (type == "tab" && typeof info.text == "string") {
    return { id, type: "tab", info: { text: info.text } };
  }

  if (type == "textField" && typeof info.text == "string") {
    return { id, type: "textField", info: { text: info.text } };
  }

  throw new SongFileError("invalid");
}

function song(value: unknown): CipherFields {
  if (!isObject(value)) throw new SongFileError("invalid");

  const { instrument, tuning, parts } = value;

  if (!INSTRUMENTS.includes(instrument as Instrument)) {
    throw new SongFileError("invalid");
  }

  const validTuning =
    Array.isArray(tuning) &&
    tuning.length >= 1 &&
    tuning.length <= MAX_STRINGS &&
    tuning.every((note) => typeof note == "string" && note.length <= MAX_LABEL);

  if (!validTuning || !Array.isArray(parts) || parts.length > MAX_PARTS) {
    throw new SongFileError("invalid");
  }

  return {
    title: text(value.title, MAX_TEXT),
    artist: text(value.artist, MAX_TEXT),
    instrument: instrument as Instrument,
    tuning: tuning as string[],
    tone: text(value.tone, MAX_TONE),
    parts: parts.map(part),
  };
}

// CONFERE TUDO ANTES DE USAR: O ARQUIVO PODE TER SIDO EDITADO À MÃO
export function parseSongFile(content: string): CipherFields[] {
  let file: unknown;

  try {
    file = JSON.parse(content);
  } catch {
    throw new SongFileError("invalid");
  }

  if (!isObject(file) || file.app != APP || typeof file.version != "number") {
    throw new SongFileError("invalid");
  }

  if (file.version > VERSION) throw new SongFileError("newer");
  if (!Array.isArray(file.songs)) throw new SongFileError("invalid");
  if (!file.songs.length) throw new SongFileError("empty");

  return file.songs.map(song);
}

// CHAVE DO i18n DO AVISO DE ERRO AO LER UM ARQUIVO
export function songFileMessage(error: unknown): string {
  return error instanceof SongFileError
    ? `components.songFile.errors.${error.reason}`
    : "components.songFile.errors.invalid";
}
