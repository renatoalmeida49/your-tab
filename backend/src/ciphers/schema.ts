import { z } from "zod";

// ESPELHA src/types/song.ts DO FRONTEND: A CIFRA É SALVA NO MESMO FORMATO
// QUE O EDITOR USA, ENTÃO ABRIR E SALVAR NÃO PERDE NADA
const part = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("tab"),
    info: z.object({ text: z.string() }),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("verse"),
    info: z.object({ chords: z.string() }),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("textField"),
    info: z.object({ text: z.string() }),
  }),
]);

export const cipherSchema = z.object({
  title: z.string().trim().max(200).default(""),
  artist: z.string().trim().max(200).default(""),
  instrument: z.enum(["guitar", "bass", "ukulele"]),
  tuning: z.array(z.string().max(4)).min(1).max(12),
  tone: z.string().max(10).default(""),
  parts: z.array(part).max(1000),
});

export type CipherFields = z.infer<typeof cipherSchema>;
