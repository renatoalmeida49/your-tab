import type { FastifyPluginAsync } from "fastify";
import { ObjectId } from "mongodb";
import { z } from "zod";
import type { Collections, UserDoc } from "../db.js";
import type { VerifyGoogleToken } from "./google.js";

export const SESSION_COOKIE = "session";
const SESSION_DAYS = 30;

interface Options {
  db: Collections;
  verifyGoogleToken: VerifyGoogleToken;
  googleClientId: string;
  secureCookie: boolean;
}

const loginSchema = z.object({ credential: z.string().min(1) });

export function toUser(user: UserDoc) {
  return {
    id: user._id.toHexString(),
    email: user.email,
    name: user.name,
    picture: user.picture ?? null,
  };
}

export const authRoutes: FastifyPluginAsync<Options> = async (
  app,
  { db, verifyGoogleToken, googleClientId, secureCookie }
) => {
  // O FRONTEND PRECISA DO CLIENT ID PARA DESENHAR O BOTÃO DO GOOGLE. FICA SÓ
  // NO .env DA API, SEM REPETIR NA CONFIGURAÇÃO DO FRONTEND
  app.get("/config", async () => ({ googleClientId }));

  // QUEM ESTÁ LOGADO. SEM SESSÃO RESPONDE { user: null } (E NÃO 401): É A
  // PRIMEIRA CHAMADA DO APP, E VISITANTE NÃO É ERRO
  app.get("/me", async (request) => {
    try {
      const { sub } = await request.jwtVerify<{ sub: string }>();
      const user = await db.users.findOne({ _id: new ObjectId(sub) });

      return { user: user && toUser(user) };
    } catch {
      return { user: null };
    }
  });

  app.post("/google", async (request, reply) => {
    const { credential } = loginSchema.parse(request.body);

    let profile;
    try {
      profile = await verifyGoogleToken(credential);
    } catch {
      return reply.code(401).send({ error: "Login do Google inválido" });
    }

    const now = new Date();
    const user = await db.users.findOneAndUpdate(
      { googleId: profile.googleId },
      {
        $set: {
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true, returnDocument: "after" }
    );

    if (!user) throw new Error("Falha ao salvar usuário");

    const token = await reply.jwtSign(
      { sub: user._id.toHexString() },
      { expiresIn: `${SESSION_DAYS}d` }
    );

    // httpOnly: O JAVASCRIPT DA PÁGINA NÃO LÊ O TOKEN.
    // sameSite lax: OUTROS SITES NÃO CONSEGUEM FAZER POST COM A SESSÃO
    return reply
      .setCookie(SESSION_COOKIE, token, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: secureCookie,
        maxAge: SESSION_DAYS * 24 * 60 * 60,
      })
      .send(toUser(user));
  });

  app.post("/logout", async (_request, reply) => {
    return reply.clearCookie(SESSION_COOKIE, { path: "/" }).code(204).send();
  });
};
