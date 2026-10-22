import type { FastifyPluginAsync } from "fastify";
import { ObjectId } from "mongodb";
import type { Collections, PlaylistDoc } from "../db.js";
import { parseId } from "../ids.js";
import { playlistSchema } from "./schema.js";

interface Options {
  db: Collections;
}

type IdParams = { Params: { id: string } };

function toPlaylist({
  _id,
  userId: _userId,
  cipherIds,
  ...fields
}: PlaylistDoc) {
  return {
    id: _id.toHexString(),
    ...fields,
    cipherIds: cipherIds.map((id) => id.toHexString()),
  };
}

export const playlistRoutes: FastifyPluginAsync<Options> = async (
  app,
  { db }
) => {
  // SÓ ACEITA CIFRAS DO PRÓPRIO ACERVO. A MESMA CIFRA PODE REPETIR NA LISTA
  async function ownCiphers(
    userId: ObjectId,
    ids: string[]
  ): Promise<ObjectId[] | null> {
    const unique = [...new Set(ids)].map((id) => new ObjectId(id));
    const found = await db.ciphers.countDocuments({
      _id: { $in: unique },
      userId,
    });

    return found === unique.length ? ids.map((id) => new ObjectId(id)) : null;
  }

  app.get("/", async (request) => {
    const playlists = await db.playlists
      .find({ userId: request.userId })
      .sort({ updatedAt: -1 })
      .toArray();

    return playlists.map(toPlaylist);
  });

  app.post("/", async (request, reply) => {
    const { name, cipherIds } = playlistSchema.parse(request.body);
    const ids = await ownCiphers(request.userId, cipherIds);

    if (!ids) return reply.code(400).send({ error: "Cifra não encontrada" });

    const now = new Date();
    const doc = {
      userId: request.userId,
      name,
      cipherIds: ids,
      createdAt: now,
      updatedAt: now,
    };
    const { insertedId } = await db.playlists.insertOne(doc as PlaylistDoc);

    return reply.code(201).send(toPlaylist({ ...doc, _id: insertedId }));
  });

  app.get<IdParams>("/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    const playlist =
      id && (await db.playlists.findOne({ _id: id, userId: request.userId }));

    if (!playlist) {
      return reply.code(404).send({ error: "Playlist não encontrada" });
    }

    return toPlaylist(playlist);
  });

  app.put<IdParams>("/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    const { name, cipherIds } = playlistSchema.parse(request.body);
    const ids = await ownCiphers(request.userId, cipherIds);

    if (!ids) return reply.code(400).send({ error: "Cifra não encontrada" });

    const playlist =
      id &&
      (await db.playlists.findOneAndUpdate(
        { _id: id, userId: request.userId },
        { $set: { name, cipherIds: ids, updatedAt: new Date() } },
        { returnDocument: "after" }
      ));

    if (!playlist) {
      return reply.code(404).send({ error: "Playlist não encontrada" });
    }

    return toPlaylist(playlist);
  });

  app.delete<IdParams>("/:id", async (request, reply) => {
    const id = parseId(request.params.id);
    const { deletedCount } = id
      ? await db.playlists.deleteOne({ _id: id, userId: request.userId })
      : { deletedCount: 0 };

    if (!id || !deletedCount) {
      return reply.code(404).send({ error: "Playlist não encontrada" });
    }

    return reply.code(204).send();
  });
};
