import type { FastifyInstance } from "fastify";
import { MongoClient, type Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";
import { ensureIndexes } from "../src/db.js";

let mongo: MongoMemoryServer;
let client: MongoClient;
let db: Db;
let app: FastifyInstance;

// O "TOKEN" DO GOOGLE NOS TESTES É O PRÓPRIO googleId; "invalido" FALHA
async function verifyGoogleToken(credential: string) {
  if (credential === "invalido") throw new Error("token inválido");

  return {
    googleId: credential,
    email: `${credential}@exemplo.com`,
    name: credential,
  };
}

const SONG = {
  title: "Garota de Ipanema",
  artist: "Tom Jobim",
  instrument: "guitar",
  tuning: ["E", "B", "G", "D", "A", "E"],
  tone: "F",
  parts: [
    { id: "a", type: "textField", info: { text: "Intro" } },
    { id: "b", type: "verse", info: { chords: "Fmaj7   G7" } },
    { id: "c", type: "tab", info: { text: "e|--1--|" } },
  ],
};

async function login(googleId: string): Promise<string> {
  const response = await app.inject({
    method: "POST",
    url: "/api/auth/google",
    payload: { credential: googleId },
  });
  const session = response.cookies.find(({ name }) => name === "session");

  return `session=${session!.value}`;
}

function as(cookie: string) {
  return (
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    payload?: object
  ) => app.inject({ method, url, payload, headers: { cookie } });
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  client = await MongoClient.connect(mongo.getUri());
  db = client.db("test");
  await ensureIndexes(db);
  app = await buildApp({
    db,
    verifyGoogleToken,
    googleClientId: "client-id-de-teste",
    jwtSecret: "x".repeat(32),
    corsOrigin: "http://localhost:5173",
    secureCookie: false,
  });
});

afterAll(async () => {
  await app.close();
  await client.close();
  await mongo.stop();
});

beforeEach(async () => {
  await Promise.all(
    ["ciphers", "playlists"].map((name) => db.collection(name).deleteMany({}))
  );
});

describe("autenticação", () => {
  it("login com Google cria o usuário e abre a sessão", async () => {
    const api = as(await login("alice"));
    const me = await api("GET", "/api/auth/me");

    expect(me.statusCode).toBe(200);
    expect(me.json().user).toMatchObject({
      email: "alice@exemplo.com",
      name: "alice",
    });
  });

  it("logar de novo reaproveita o mesmo usuário", async () => {
    const first = (
      await as(await login("bruno"))("GET", "/api/auth/me")
    ).json();
    const second = (
      await as(await login("bruno"))("GET", "/api/auth/me")
    ).json();

    expect(second.user.id).toBe(first.user.id);
  });

  it("token do Google inválido responde 401", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/google",
      payload: { credential: "invalido" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("sem sessão, /me responde que não há usuário", async () => {
    for (const cookie of ["", "session=forjado"]) {
      const me = await as(cookie)("GET", "/api/auth/me");

      expect(me.statusCode).toBe(200);
      expect(me.json()).toEqual({ user: null });
    }
  });

  it("logout encerra a sessão", async () => {
    const response = await as(await login("alice"))("POST", "/api/auth/logout");
    const session = response.cookies.find(({ name }) => name === "session");

    expect(response.statusCode).toBe(204);
    expect(session?.value).toBe("");
  });

  it("entrega o client id do Google", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/auth/config",
    });

    expect(response.json()).toEqual({ googleClientId: "client-id-de-teste" });
  });

  it("rotas protegidas exigem sessão", async () => {
    for (const url of ["/api/ciphers", "/api/playlists"]) {
      expect((await app.inject({ method: "GET", url })).statusCode).toBe(401);
    }
    expect(
      (await as("session=forjado")("GET", "/api/ciphers")).statusCode
    ).toBe(401);
  });
});

describe("cifras", () => {
  it("cria, lê, lista, edita e apaga", async () => {
    const api = as(await login("alice"));

    const created = await api("POST", "/api/ciphers", SONG);
    expect(created.statusCode).toBe(201);
    const { id } = created.json();

    expect((await api("GET", `/api/ciphers/${id}`)).json()).toMatchObject(SONG);

    const list = (await api("GET", "/api/ciphers")).json();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ id, title: SONG.title, tone: "F" });
    expect(list[0]).not.toHaveProperty("parts");

    const edited = await api("PUT", `/api/ciphers/${id}`, {
      ...SONG,
      tone: "G",
    });
    expect(edited.json().tone).toBe("G");

    expect((await api("DELETE", `/api/ciphers/${id}`)).statusCode).toBe(204);
    expect((await api("GET", `/api/ciphers/${id}`)).statusCode).toBe(404);
  });

  it("rejeita cifra com formato inválido", async () => {
    const api = as(await login("alice"));
    const response = await api("POST", "/api/ciphers", {
      ...SONG,
      parts: [{ id: "a", type: "solo", info: {} }],
    });

    expect(response.statusCode).toBe(400);
  });

  it("um usuário não vê nem altera cifras de outro", async () => {
    const alice = as(await login("alice"));
    const bruno = as(await login("bruno"));
    const { id } = (await alice("POST", "/api/ciphers", SONG)).json();

    expect((await bruno("GET", "/api/ciphers")).json()).toEqual([]);
    expect((await bruno("GET", `/api/ciphers/${id}`)).statusCode).toBe(404);
    expect((await bruno("PUT", `/api/ciphers/${id}`, SONG)).statusCode).toBe(
      404
    );
    expect((await bruno("DELETE", `/api/ciphers/${id}`)).statusCode).toBe(404);
    expect((await alice("GET", `/api/ciphers/${id}`)).statusCode).toBe(200);
  });

  it("id malformado responde 404", async () => {
    const api = as(await login("alice"));

    expect((await api("GET", "/api/ciphers/nao-e-um-id")).statusCode).toBe(404);
  });
});

describe("playlists", () => {
  it("guarda as cifras na ordem enviada", async () => {
    const api = as(await login("alice"));
    const a = (await api("POST", "/api/ciphers", SONG)).json().id;
    const b = (await api("POST", "/api/ciphers", SONG)).json().id;

    const created = await api("POST", "/api/playlists", {
      name: "Repertório Luau",
      cipherIds: [b, a, b],
    });
    expect(created.statusCode).toBe(201);

    const { id } = created.json();
    const reordered = await api("PUT", `/api/playlists/${id}`, {
      name: "Luau",
      cipherIds: [a, b],
    });
    expect(reordered.json()).toMatchObject({ name: "Luau", cipherIds: [a, b] });
    expect((await api("GET", "/api/playlists")).json()).toHaveLength(1);
  });

  it("não aceita cifra de outro usuário", async () => {
    const alice = as(await login("alice"));
    const bruno = as(await login("bruno"));
    const { id } = (await alice("POST", "/api/ciphers", SONG)).json();

    const response = await bruno("POST", "/api/playlists", {
      name: "Roubada",
      cipherIds: [id],
    });

    expect(response.statusCode).toBe(400);
  });

  it("apagar a cifra tira ela das playlists", async () => {
    const api = as(await login("alice"));
    const a = (await api("POST", "/api/ciphers", SONG)).json().id;
    const b = (await api("POST", "/api/ciphers", SONG)).json().id;
    const { id } = (
      await api("POST", "/api/playlists", {
        name: "Luau",
        cipherIds: [a, b, a],
      })
    ).json();

    await api("DELETE", `/api/ciphers/${a}`);

    expect((await api("GET", `/api/playlists/${id}`)).json().cipherIds).toEqual(
      [b]
    );
  });

  it("apaga a playlist sem apagar as cifras", async () => {
    const api = as(await login("alice"));
    const a = (await api("POST", "/api/ciphers", SONG)).json().id;
    const { id } = (
      await api("POST", "/api/playlists", { name: "Luau", cipherIds: [a] })
    ).json();

    expect((await api("DELETE", `/api/playlists/${id}`)).statusCode).toBe(204);
    expect((await api("GET", `/api/playlists/${id}`)).statusCode).toBe(404);
    expect((await api("GET", `/api/ciphers/${a}`)).statusCode).toBe(200);
  });
});
