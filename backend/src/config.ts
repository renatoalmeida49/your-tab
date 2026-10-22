import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URL: z.string().min(1),
  MONGO_DB: z.string().min(1).default("tab-builder"),
  // VAZIO: A API SOBE, MAS O LOGIN FICA DESLIGADO (O FRONTEND AVISA)
  GOOGLE_CLIENT_ID: z.string().default(""),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().min(1),
  NODE_ENV: z.string().default("development"),
});

export type Config = z.infer<typeof envSchema>;

// FALHA NA SUBIDA SE FALTAR ALGUMA VARIÁVEL, EM VEZ DE QUEBRAR NA PRIMEIRA REQUISIÇÃO
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = envSchema.safeParse(env);

  if (!parsed.success) {
    const fields = parsed.error.issues.map((issue) => issue.path.join("."));
    throw new Error(`Variáveis de ambiente inválidas: ${fields.join(", ")}`);
  }

  return parsed.data;
}
