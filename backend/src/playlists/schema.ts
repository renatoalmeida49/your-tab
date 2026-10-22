import { z } from "zod";
import { objectIdString } from "../ids.js";

export const playlistSchema = z.object({
  name: z.string().trim().min(1).max(200),
  cipherIds: z.array(objectIdString).max(500).default([]),
});
