import { ObjectId } from "mongodb";
import { z } from "zod";

export const objectIdString = z
  .string()
  .refine((value) => ObjectId.isValid(value) && value.length === 24, {
    message: "id inválido",
  });

// ID MALFORMADO NA URL VIRA null, E A ROTA RESPONDE 404 COMO SE NÃO EXISTISSE
export function parseId(value: string): ObjectId | null {
  return objectIdString.safeParse(value).success ? new ObjectId(value) : null;
}
