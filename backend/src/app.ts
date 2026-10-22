import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify, { type FastifyInstance } from "fastify";
import { ObjectId, type Db } from "mongodb";
import { ZodError } from "zod";
import type { VerifyGoogleToken } from "./auth/google.js";
import { authRoutes, SESSION_COOKIE } from "./auth/routes.js";
import { cipherRoutes } from "./ciphers/routes.js";
import { collections } from "./db.js";
import { playlistRoutes } from "./playlists/routes.js";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string };
    user: { sub: string };
  }
}

declare module "fastify" {
  interface FastifyRequest {
    // DONO DA SESSÃO. SÓ EXISTE NAS ROTAS PROTEGIDAS
    userId: ObjectId;
  }
}

export interface AppOptions {
  db: Db;
  verifyGoogleToken: VerifyGoogleToken;
  googleClientId: string;
  jwtSecret: string;
  corsOrigin: string;
  secureCookie: boolean;
  logger?: boolean;
}

export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? false });
  const db = collections(options.db);

  await app.register(cors, { origin: options.corsOrigin, credentials: true });
  await app.register(cookie);
  await app.register(jwt, {
    secret: options.jwtSecret,
    cookie: { cookieName: SESSION_COOKIE, signed: false },
  });

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply
        .code(400)
        .send({ error: "Dados inválidos", issues: error.issues });
    }

    const status = (error as { statusCode?: number }).statusCode ?? 500;

    if (status >= 500) request.log.error(error);

    return reply.code(status).send({
      error: status >= 500 ? "Erro interno" : (error as Error).message,
    });
  });

  app.get("/api/health", async () => ({ ok: true }));

  await app.register(authRoutes, {
    prefix: "/api/auth",
    db,
    verifyGoogleToken: options.verifyGoogleToken,
    googleClientId: options.googleClientId,
    secureCookie: options.secureCookie,
  });

  // TUDO AQUI DENTRO EXIGE SESSÃO
  await app.register(async (protectedApp) => {
    protectedApp.decorateRequest("userId", null as unknown as ObjectId);

    protectedApp.addHook("onRequest", async (request, reply) => {
      try {
        const { sub } = await request.jwtVerify<{ sub: string }>();
        request.userId = new ObjectId(sub);
      } catch {
        return reply.code(401).send({ error: "Não autenticado" });
      }
    });

    await protectedApp.register(cipherRoutes, { prefix: "/api/ciphers", db });
    await protectedApp.register(playlistRoutes, {
      prefix: "/api/playlists",
      db,
    });
  });

  return app;
}
