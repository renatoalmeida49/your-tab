// O ACERVO NA NUVEM: O QUE A API (backend/) RECEBE E DEVOLVE

import type { Instrument, Part } from "./song";

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
}

// A MÚSICA COMO A API GUARDA: OS MESMOS DADOS DO SavedSong, SEM ANINHAR
export interface CipherFields {
  title: string;
  artist: string;
  instrument: Instrument;
  tuning: string[];
  tone: string;
  parts: Part[];
}

export interface Cipher extends CipherFields {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ITEM DA LISTA DO ACERVO (SEM AS PARTES)
export type CipherSummary = Pick<
  Cipher,
  "id" | "title" | "artist" | "instrument" | "tone" | "updatedAt"
>;

export interface Playlist {
  id: string;
  name: string;
  // EM ORDEM; A MESMA CIFRA PODE REPETIR
  cipherIds: string[];
  createdAt: string;
  updatedAt: string;
}
