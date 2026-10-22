import { test, expect, addFromMenu, answerConfirm, songParts } from "./helpers";
import type { Page } from "@playwright/test";

const SONG = {
  title: "Garota de Ipanema",
  artist: "Tom Jobim",
  instrument: "guitar",
  tuning: ["e", "B", "G", "D", "A", "E"],
  tone: "F",
  parts: [{ id: "p1", type: "textField", info: { text: "Olha que coisa" } }],
};

async function typeTitle(page: Page, title: string): Promise<void> {
  await page.locator(".tab-header__title").click();
  await page.keyboard.type(title);
}

async function openLibrary(page: Page): Promise<void> {
  await page.locator(".account-menu__trigger").click();
  await page.locator(".account-menu__library").click();
}

test.describe("visitante", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("mostra 'Entrar' e o salvar pede login", async ({ page }) => {
    await expect(page.locator(".account-menu__login")).toBeVisible();

    await page.locator(".app-bar__save").click();

    await expect(page.locator(".login")).toBeVisible();
  });

  test("login sem GOOGLE_CLIENT_ID avisa que não está configurado", async ({
    page,
  }) => {
    await page.locator(".account-menu__login").click();

    await expect(page.locator(".google-button__status")).toContainText(
      "GOOGLE_CLIENT_ID"
    );
  });
});

test.describe("logado", () => {
  test.beforeEach(async ({ page, api }) => {
    api.signIn();
    await page.goto("/");
  });

  test("salvar cria a cifra; salvar de novo atualiza a mesma", async ({
    page,
    api,
  }) => {
    const save = page.locator(".app-bar__save");

    await typeTitle(page, "Minha Música");
    await addFromMenu(page, "verse");
    await save.click();

    await expect(save).toHaveText("Salvo");
    expect(api.writes[0]).toMatchObject({
      method: "POST",
      path: "/ciphers",
      body: { title: "Minha Música", instrument: "guitar", tone: "C" },
    });
    expect((api.writes[0].body as typeof SONG).parts[0].type).toBe("verse");

    await typeTitle(page, " 2");
    await expect(save).toHaveText("Salvar");

    await page.keyboard.press("Control+s");

    await expect(save).toHaveText("Salvo");
    expect(api.writes[1]).toMatchObject({
      method: "PUT",
      path: `/ciphers/${api.ciphers[0].id}`,
      body: { title: "Minha Música 2" },
    });
    expect(api.ciphers).toHaveLength(1);
  });

  test("abrir do acervo carrega a música no editor", async ({ page, api }) => {
    api.addCipher(SONG);

    await openLibrary(page);
    await expect(page.locator(".library__cipher")).toContainText(
      "Tom Jobim · Violão/Guitarra · F"
    );
    await page.locator(".library__open").click();

    await expect(page.locator(".library")).toHaveCount(0);
    await expect(page.locator(".tab-header__title")).toHaveText(SONG.title);
    expect(await songParts(page)).toEqual(["text:Olha que coisa"]);
    await expect(page.locator(".app-bar__save")).toHaveText("Salvo");

    // A MÚSICA ABERTA NÃO DESFAZ PARA A ANTERIOR
    await expect(page.locator(".app-bar__undo")).toBeDisabled();
  });

  test("abrir com alterações não salvas pergunta antes", async ({
    page,
    api,
  }) => {
    api.addCipher(SONG);
    await typeTitle(page, "Rascunho");

    await openLibrary(page);
    await page.locator(".library__open").click();
    await answerConfirm(page, false);

    await expect(page.locator(".tab-header__title")).toHaveText("Rascunho");

    await page.locator(".library__open").click();
    await answerConfirm(page, true);

    await expect(page.locator(".tab-header__title")).toHaveText(SONG.title);
  });

  test("o vínculo com a cifra sobrevive ao reload", async ({ page, api }) => {
    api.addCipher(SONG);
    await openLibrary(page);
    await page.locator(".library__open").click();

    await page.reload();

    await expect(page.locator(".app-bar__save")).toHaveText("Salvo");
    await typeTitle(page, "!");
    await page.locator(".app-bar__save").click();

    await expect(page.locator(".app-bar__save")).toHaveText("Salvo");
    expect(api.writes.at(-1)).toMatchObject({
      method: "PUT",
      path: `/ciphers/${api.ciphers[0].id}`,
    });
  });

  test("excluir a cifra aberta deixa a música no editor como nova", async ({
    page,
    api,
  }) => {
    api.addCipher(SONG);
    await openLibrary(page);
    await page.locator(".library__open").click();

    await openLibrary(page);
    await page.locator(".library__delete").click();
    await answerConfirm(page, true);

    await expect(page.locator(".library__cipher")).toHaveCount(0);
    await page.keyboard.press("Escape");
    await expect(page.locator(".tab-header__title")).toHaveText(SONG.title);
    await expect(page.locator(".app-bar__save")).toHaveText("Salvar");
  });

  test("nova música a partir de uma cifra salva não pergunta", async ({
    page,
    api,
  }) => {
    api.addCipher(SONG);
    await openLibrary(page);
    await page.locator(".library__open").click();

    await page.locator(".app-bar__new-song").click();

    await expect(page.locator(".confirm")).toHaveCount(0);
    expect(await songParts(page)).toEqual([]);
    await expect(page.locator(".app-bar__save")).toHaveText("Salvar");
  });

  test("playlist: criar, adicionar, reordenar e tirar cifras", async ({
    page,
    api,
  }) => {
    api.addCipher({ ...SONG, title: "Primeira" });
    api.addCipher({ ...SONG, title: "Segunda" });
    const songs = page.locator(".library__song-title");

    await openLibrary(page);
    await page.locator(".library__tab-playlists").click();
    await page.getByPlaceholder("Nome da nova playlist").fill("Luau");
    await page.keyboard.press("Enter");
    await expect(page.locator(".library__playlist")).toContainText("Luau");

    await page.locator(".library__tab-ciphers").click();
    for (const index of [0, 1]) {
      await page.locator(".library__add").nth(index).click();
      await page.locator(".library__add-item", { hasText: "Luau" }).click();
      await expect(page.locator(".library__menu")).toHaveCount(0);
    }

    await page.locator(".library__tab-playlists").click();
    await expect(songs).toHaveText(["Segunda", "Primeira"]);

    await page.getByLabel("Mover para baixo").first().click();
    await expect(songs).toHaveText(["Primeira", "Segunda"]);

    await page.locator(".library__remove-song").first().click();
    await expect(songs).toHaveText(["Segunda"]);
    expect(api.playlists[0]).toMatchObject({
      name: "Luau",
      cipherIds: [api.ciphers[0].id],
    });
  });

  test("sair volta para visitante e mantém a música", async ({ page }) => {
    await typeTitle(page, "Fica");

    await page.locator(".account-menu__trigger").click();
    await page.locator(".account-menu__logout").click();

    await expect(page.locator(".account-menu__login")).toBeVisible();
    await expect(page.locator(".tab-header__title")).toHaveText("Fica");
  });

  test("sessão expirada avisa ao salvar", async ({ page, api }) => {
    api.user = null;
    api.expectedStatuses.push(401);

    await page.locator(".app-bar__save").click();

    await expect(page.locator(".toast--error")).toContainText(
      "Sua sessão expirou"
    );
    await expect(page.locator(".account-menu__login")).toBeVisible();
  });
});
