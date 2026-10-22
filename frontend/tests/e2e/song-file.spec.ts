import { readFile } from "node:fs/promises";
import type { Download, Page } from "@playwright/test";
import {
  test,
  expect,
  addFromMenu,
  answerConfirm,
  songParts,
  textFields,
} from "./helpers";

const SONG = {
  title: "Segredos",
  artist: "Frejat",
  instrument: "guitar",
  tuning: ["e", "B", "G", "D", "A", "E"],
  tone: "G",
  parts: [
    { id: "p1", type: "verse", info: { chords: "G      D" } },
    { id: "p2", type: "textField", info: { text: "Eu procuro um amor" } },
  ],
};

const OTHER = { ...SONG, title: "Proud Mary", artist: "Creedence", tone: "D" };

function fileOf(...songs: object[]): string {
  return JSON.stringify({
    app: "tab-builder",
    version: 1,
    exportedAt: "2026-10-22T15:00:00.000Z",
    songs,
  });
}

async function contentOf(download: Download) {
  return JSON.parse(await readFile(await download.path(), "utf8"));
}

// ESCOLHE O ARQUIVO NO SELETOR QUE A AÇÃO ABRE
async function chooseFile(
  page: Page,
  action: () => Promise<void>,
  ...contents: string[]
) {
  const chooser = page.waitForEvent("filechooser");

  await action();
  await (
    await chooser
  ).setFiles(
    contents.map((content, index) => ({
      name: `musica-${index}.json`,
      mimeType: "application/json",
      buffer: Buffer.from(content),
    }))
  );
}

async function runCommand(page: Page, label: string) {
  await page.keyboard.press("ControlOrMeta+k");
  await page.locator(".palette__input").fill(label);
  await page.keyboard.press("Enter");
}

function openFromPalette(page: Page) {
  return () => runCommand(page, "Abrir arquivo de música");
}

test.describe("arquivo de música no editor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("baixa a música atual como .json pela janela de download", async ({
    page,
  }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Minha Música");
    await addFromMenu(page, "textField");
    await page.keyboard.type("primeira linha");

    await page.locator(".app-bar__export").click();
    const downloading = page.waitForEvent("download");
    await page.locator(".export__download-file").click();
    const download = await downloading;

    expect(download.suggestedFilename()).toBe("Minha Música.json");

    const file = await contentOf(download);
    expect(file).toMatchObject({ app: "tab-builder", version: 1 });
    expect(file.songs).toHaveLength(1);
    expect(file.songs[0]).toMatchObject({
      title: "Minha Música",
      instrument: "guitar",
      parts: [{ type: "textField", info: { text: "primeira linha" } }],
    });
  });

  test("abre um arquivo pela paleta, com título, tom e partes", async ({
    page,
  }) => {
    await chooseFile(page, openFromPalette(page), fileOf(SONG));

    await expect(page.locator(".tab-header__title")).toHaveText("Segredos");
    await expect(page.locator(".tab-header__artist")).toHaveText("Frejat");
    await expect(page.locator(".tab-header__tone")).toHaveText("G");
    expect(await songParts(page)).toEqual(["verse", "text:Eu procuro um amor"]);
    await expect(page.locator(".toast")).toContainText(
      "Música aberta do arquivo"
    );

    // ABERTA COMO MÚSICA NOVA: O DESFAZER NÃO VOLTA PARA A ANTERIOR
    await expect(page.locator(".app-bar__undo")).toBeDisabled();
  });

  test("baixar e abrir de volta devolve a mesma música", async ({ page }) => {
    await chooseFile(page, openFromPalette(page), fileOf(SONG));

    const downloading = page.waitForEvent("download");
    await runCommand(page, "Baixar arquivo da música");
    const file = await contentOf(await downloading);

    expect(file.songs).toEqual([SONG]);
  });

  test("com música não salva no editor, pergunta antes de abrir", async ({
    page,
  }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("rascunho");

    await chooseFile(page, openFromPalette(page), fileOf(SONG));
    await answerConfirm(page, false);
    expect(await songParts(page)).toEqual(["text:rascunho"]);

    await chooseFile(page, openFromPalette(page), fileOf(SONG));
    await answerConfirm(page, true);
    await expect(page.locator(".tab-header__title")).toHaveText("Segredos");
  });

  test("arquivo com várias músicas abre a primeira e avisa", async ({
    page,
  }) => {
    await chooseFile(page, openFromPalette(page), fileOf(SONG, OTHER));

    await expect(page.locator(".tab-header__title")).toHaveText("Segredos");
    await expect(page.locator(".toast")).toContainText("2 músicas");
  });

  test("arquivo inválido avisa e não muda a música", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("fica");

    await chooseFile(page, openFromPalette(page), "Am G C F");

    await expect(page.locator(".toast--error")).toContainText(
      "Arquivo inválido"
    );
    expect(await songParts(page)).toEqual(["text:fica"]);
    await expect(textFields(page)).toHaveCount(1);
  });
});

test.describe("arquivo de músicas no acervo", () => {
  test.beforeEach(async ({ page, api }) => {
    api.signIn();
    await page.goto("/");
  });

  async function openLibrary(page: Page) {
    await page.locator(".account-menu__trigger").click();
    await page.locator(".account-menu__library").click();
  }

  test("exportar tudo baixa todas as cifras num arquivo", async ({
    page,
    api,
  }) => {
    api.addCipher(SONG);
    api.addCipher(OTHER);
    await openLibrary(page);
    await expect(page.locator(".library__cipher")).toHaveCount(2);

    const downloading = page.waitForEvent("download");
    await page.locator(".library__export").click();
    const download = await downloading;

    expect(download.suggestedFilename()).toMatch(
      /^tab-builder-\d{4}-\d{2}-\d{2}\.json$/
    );
    const file = await contentOf(download);
    expect(file.songs).toEqual(expect.arrayContaining([SONG, OTHER]));
    expect(file.songs).toHaveLength(2);
  });

  test("importar traz as músicas de vários arquivos para o acervo", async ({
    page,
    api,
  }) => {
    await openLibrary(page);
    await expect(page.locator(".library__export")).toHaveCount(0);

    await chooseFile(
      page,
      () => page.locator(".library__import").click(),
      fileOf(SONG, OTHER),
      fileOf({ ...SONG, title: "Terceira" })
    );

    await expect(page.locator(".library__cipher")).toHaveCount(3);
    await expect(page.locator(".toast")).toContainText(
      "Músicas importadas para o acervo: 3"
    );
    expect(api.ciphers.map((cipher) => cipher.title).sort()).toEqual([
      "Proud Mary",
      "Segredos",
      "Terceira",
    ]);
  });

  test("importar arquivo inválido não cria nada", async ({ page, api }) => {
    await openLibrary(page);

    await chooseFile(
      page,
      () => page.locator(".library__import").click(),
      fileOf(SONG),
      JSON.stringify({ app: "tab-builder", version: 9, songs: [SONG] })
    );

    await expect(page.locator(".toast--error")).toContainText(
      "versão mais nova"
    );
    expect(api.ciphers).toEqual([]);
  });
});
