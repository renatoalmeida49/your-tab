import type { FastifyPluginAsync } from "fastify";
import { ObjectId } from "mongodb";
import type { CipherDoc, Collections } from "../db.js";
import { parseId } from "../ids.js";
import { cipherOrderSchema, cipherSchema } from "./schema.js";

interface Options {
  db: Collections;
}

type IdParams = { Params: { id: string } };

function toCipher({
  _id,
  userId: _userId,
  position: _position,
  ...fields
}: CipherDoc) {
  return { id: _id.toHexString(), ...fields };
}

export const cipherRoutes: FastifyPluginAsync<Options> = async (
  app,
  { db }
) => {
  // CIFRAS DE ANTES DA ORDEM MANUAL NÃO TÊM position: GANHAM NA ORDEM QUE O
  // ACERVO MOSTRAVA (ÚLTIMA ATUALIZADA PRIMEIRO). RODA ANTES DE QUALQUER
  // ESCRITA DE position, ENTÃO NÃO SOBRA ACERVO MEIO A MEIO
  async function ensurePositions(userId: ObjectId): Promise<void> {
    const missing = await db.ciphers.countDocuments({
      userId,
      position: { $exists: false },
    });

    if (!missing) return;

    const ciphers = await db.ciphers
      .find({ userId }, { projection: { _id: 1 } })
      .sort({ position: 1, updatedAt: -1 })
      .toArray();

    await db.ciphers.bulkWrite(
      ciphers.map(({ _id }, position) => ({
        updateOne: { filter: { _id, userId }, update: { $set: { position } } },
      }))
    );
  }

  // A LISTAGEM DO ACERVO NÃO TRAZ O CONTEÚDO (parts), SÓ O QUE APARECE NA LISTA
  // NA ORDEM DO USUÁRIO
  app.get("/", async (request) => {
    await ensurePositions(request.userId);

    const ciphers = await db.ciphers
      .find({ userId: request.userId }, { projection: { parts: 0, tuning: 0 } })
      .sort({ position: 1, updatedAt: -1 })
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

  // A CIFRA NOVA ENTRA NO TOPO DO ACERVO
  app.post("/", async (request, reply) => {
    const fields = cipherSchema.parse(request.body);

    await ensurePositions(request.userId);

    const [first] = await db.ciphers
      .find({ userId: request.userId }, { projection: { position: 1 } })
      .sort({ position: 1 })
      .limit(1)
      .toArray();
    const now = new Date();
    const doc = {
      ...fields,
      userId: request.userId,
      position: (first?.position ?? 0) - 1,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await db.ciphers.insertOne(doc as CipherDoc);

    return reply.code(201).send(toCipher({ ...doc, _id: insertedId }));
  });

  // A NOVA ORDEM DO ACERVO INTEIRO. 409 SE A LISTA NÃO BATE COM AS CIFRAS
  // DO USUÁRIO (EX: OUTRA ABA CRIOU OU APAGOU UMA): O APP RECARREGA E TENTA
  // DE NOVO. NÃO MEXE EM updatedAt: REORDENAR NÃO É EDITAR A CIFRA
  app.put("/order", async (request, reply) => {
    const { ids } = cipherOrderSchema.parse(request.body);
    const total = await db.ciphers.countDocuments({ userId: request.userId });
    const found = await db.ciphers.countDocuments({
      userId: request.userId,
      _id: { $in: ids.map((id) => new ObjectId(id)) },
    });

    if (found !== ids.length || total !== ids.length) {
      return reply.code(409).send({ error: "O acervo mudou; recarregue" });
    }

    if (ids.length) {
      await db.ciphers.bulkWrite(
        ids.map((id, position) => ({
          updateOne: {
            filter: { _id: new ObjectId(id), userId: request.userId },
            update: { $set: { position } },
          },
        }))
      );
    }

    return reply.code(204).send();
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
