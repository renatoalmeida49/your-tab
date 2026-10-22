import type {
  Cipher,
  CipherFields,
  CipherSummary,
  Playlist,
  User,
} from "@/types/library";

// status 0: SEM RESPOSTA (API FORA DO AR OU SEM REDE)
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE";

// MESMA ORIGEM (PROXY DO VITE NO DEV, NGINX EM PRODUÇÃO): O COOKIE DE SESSÃO
// VAI SOZINHO EM CADA REQUISIÇÃO
async function request<T>(method: Method, path: string, body?: unknown) {
  let response: Response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Sem conexão com a API");
  }

  if (response.status == 204) return undefined as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? response.statusText);
  }

  return data as T;
}

type PlaylistFields = Pick<Playlist, "name" | "cipherIds">;

export const api = {
  config: () => request<{ googleClientId: string }>("GET", "/auth/config"),
  me: () => request<{ user: User | null }>("GET", "/auth/me"),
  login: (credential: string) =>
    request<User>("POST", "/auth/google", { credential }),
  logout: () => request<void>("POST", "/auth/logout"),

  listCiphers: () => request<CipherSummary[]>("GET", "/ciphers"),
  getCipher: (id: string) => request<Cipher>("GET", `/ciphers/${id}`),
  createCipher: (fields: CipherFields) =>
    request<Cipher>("POST", "/ciphers", fields),
  updateCipher: (id: string, fields: CipherFields) =>
    request<Cipher>("PUT", `/ciphers/${id}`, fields),
  deleteCipher: (id: string) => request<void>("DELETE", `/ciphers/${id}`),

  listPlaylists: () => request<Playlist[]>("GET", "/playlists"),
  createPlaylist: (fields: PlaylistFields) =>
    request<Playlist>("POST", "/playlists", fields),
  updatePlaylist: (id: string, fields: PlaylistFields) =>
    request<Playlist>("PUT", `/playlists/${id}`, fields),
  deletePlaylist: (id: string) => request<void>("DELETE", `/playlists/${id}`),
};
