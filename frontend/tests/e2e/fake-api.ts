import type { Page, Route } from "@playwright/test";

// A API (backend/) EM MEMÓRIA, PARA OS E2E NÃO DEPENDEREM DO SERVIDOR NEM DO
// GOOGLE. COMEÇA SEM SESSÃO (VISITANTE); signIn() SIMULA UM LOGIN JÁ FEITO

interface Doc {
  id: string;
  createdAt: string;
  updatedAt: string;
  [field: string]: unknown;
}

const USER = {
  id: "u1",
  email: "ana@exemplo.com",
  name: "Ana",
  picture: null,
};

export class FakeApi {
  user: typeof USER | null = null;
  googleClientId = "";
  ciphers: Doc[] = [];
  playlists: Doc[] = [];
  // CORPO DE CADA ESCRITA, PARA OS TESTES CONFERIREM O QUE O APP ENVIOU
  writes: { method: string; path: string; body: unknown }[] = [];
  // RESPOSTAS DE ERRO QUE O TESTE ESPERA: O NAVEGADOR AS LOGA NO CONSOLE
  // ("Failed to load resource"), E O FIXTURE NÃO DEVE CONTAR COMO FALHA
  expectedStatuses: number[] = [];
  private lastId = 0;

  signIn(): this {
    this.user = USER;
    return this;
  }

  addCipher(fields: Record<string, unknown>): Doc {
    const doc = this.create(fields);

    this.ciphers.unshift(doc);
    return doc;
  }

  async install(page: Page): Promise<void> {
    await page.route("**/api/**", (route) => this.handle(route));
  }

  private create(fields: Record<string, unknown>): Doc {
    const now = new Date(
      Date.UTC(2026, 9, 21, 12, ++this.lastId)
    ).toISOString();

    return {
      ...fields,
      id: `id${this.lastId}`,
      createdAt: now,
      updatedAt: now,
    };
  }

  private async handle(route: Route): Promise<void> {
    const request = route.request();
    const method = request.method();
    const path = new URL(request.url()).pathname.replace(/^\/api/, "");
    const body = request.postDataJSON?.() ?? null;
    const json = (status: number, data?: unknown) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: data === undefined ? "" : JSON.stringify(data),
      });

    if (method != "GET") this.writes.push({ method, path, body });

    if (path == "/auth/config") {
      return json(200, { googleClientId: this.googleClientId });
    }
    if (path == "/auth/me") return json(200, { user: this.user });
    if (path == "/auth/logout") {
      this.user = null;
      return json(204);
    }

    if (!this.user) return json(401, { error: "Não autenticado" });

    const [, collection, id] = path.split("/");
    const list =
      collection == "ciphers"
        ? this.ciphers
        : collection == "playlists"
          ? this.playlists
          : null;

    if (!list) return json(404, { error: "Rota não encontrada" });

    const index = list.findIndex((doc) => doc.id == id);

    if (!id && method == "GET") {
      return json(
        200,
        collection == "ciphers"
          ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
            list.map(({ parts, tuning, ...summary }) => summary)
          : list
      );
    }
    if (!id && method == "POST") {
      const doc = this.create(body);

      list.unshift(doc);
      return json(201, doc);
    }
    if (index < 0) return json(404, { error: "Não encontrado" });

    if (method == "GET") return json(200, list[index]);
    if (method == "PUT") {
      list[index] = {
        ...list[index],
        ...body,
        updatedAt: new Date().toISOString(),
      };
      return json(200, list[index]);
    }
    if (method == "DELETE") {
      list.splice(index, 1);
      for (const playlist of this.playlists) {
        playlist.cipherIds = (playlist.cipherIds as string[]).filter(
          (item) => item != id
        );
      }
      return json(204);
    }

    return json(405, { error: "Método não suportado" });
  }
}
