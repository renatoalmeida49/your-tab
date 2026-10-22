import { MongoClient, type Collection, type Db, type ObjectId } from "mongodb";
import type { CipherFields } from "./ciphers/schema.js";

export interface UserDoc {
  _id: ObjectId;
  googleId: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CipherDoc extends CipherFields {
  _id: ObjectId;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlaylistDoc {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  // ORDEM DA LISTA = ORDEM DO REPERTÓRIO
  cipherIds: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Collections {
  users: Collection<UserDoc>;
  ciphers: Collection<CipherDoc>;
  playlists: Collection<PlaylistDoc>;
}

export function collections(db: Db): Collections {
  return {
    users: db.collection<UserDoc>("users"),
    ciphers: db.collection<CipherDoc>("ciphers"),
    playlists: db.collection<PlaylistDoc>("playlists"),
  };
}

export async function ensureIndexes(db: Db): Promise<void> {
  const { users, ciphers, playlists } = collections(db);

  await Promise.all([
    users.createIndex({ googleId: 1 }, { unique: true }),
    ciphers.createIndex({ userId: 1, updatedAt: -1 }),
    playlists.createIndex({ userId: 1, updatedAt: -1 }),
    playlists.createIndex({ cipherIds: 1 }),
  ]);
}

export async function connect(
  url: string,
  dbName: string
): Promise<{ client: MongoClient; db: Db }> {
  const client = await MongoClient.connect(url);
  const db = client.db(dbName);

  await ensureIndexes(db);

  return { client, db };
}
