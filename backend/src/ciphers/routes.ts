import type { FastifyPluginAsync } from "fastify";
import type { CipherDoc, Collections } from "../db.js";
import { parseId } from "../ids.js";
import { cipherSchema } from "./schema.js";

interface Options {
  db: Collections;
}

type IdParams = { Params: { id: string } };

function toCipher({ _id, userId: _userId, ...fields }: CipherDoc) {
  return { id: _id.toHexString(), ...fields };
}

export const cipherRoutes: FastifyPluginAsync<Options> = async (
  app,
  { db }
) => {
  // A LISTAGEM DO ACERVO NÃO TRAZ O CONTEÚDO (parts), SÓ O QUE APARECE NA LISTA
  app.get("/", async (request) => {
    const ciphers = await db.ciphers
      .find({ userId: request.userId }, { projection: { parts: 0, tuning: 0 } })
      .sort({ updatedAt: -1 })
      .toArray();

    return ciphers.map(
      ({ _id, title, artist, instrument, tone, updatedAt }) => ({
        id: _id.toHexString(),
        title,
        artist,
        instrument,
        tone,
        updatedAt,
      })
    );
  });

  app.post("/", async (request, reply) => {
    const fields = cipherSchema.parse(request.body);
    const now = new Date();
    const doc = {
      ...fields,
      userId: request.userId,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await db.ciphers.insertOne(doc as CipherDoc);

    return reply.code(201).send(toCipher({ ...doc, _id: insertedId }));
  });

  app.get<IdParams>("/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    const cipher =
      id && (await db.ciphers.findOne({ _id: id, userId: request.userId }));

    if (!cipher) return reply.code(404).send({ error: "Cifra não encontrada" });

    return toCipher(cipher);
  });

  app.put<IdParams>("/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    const fields = cipherSchema.parse(request.body);
    const cipher =
      id &&
      (await db.ciphers.findOneAndUpdate(
        { _id: id, userId: request.userId },
        { $set: { ...fields, updatedAt: new Date() } },
        { returnDocument: "after" }
      ));

    if (!cipher) return reply.code(404).send({ error: "Cifra não encontrada" });

    return toCipher(cipher);
  });

  app.delete<IdParams>("/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    const { deletedCount } = id
      ? await db.ciphers.deleteOne({ _id: id, userId: request.userId })
      : { deletedCount: 0 };

    if (!id || !deletedCount) {
      return reply.code(404).send({ error: "Cifra não encontrada" });
    }

    // A CIFRA SAI TAMBÉM DAS PLAYLISTS ONDE APARECIA
    await db.playlists.updateMany(
      { userId: request.userId, cipherIds: id },
      { $pull: { cipherIds: id }, $set: { updatedAt: new Date() } }
    );

    return reply.code(204).send();
  });
};
