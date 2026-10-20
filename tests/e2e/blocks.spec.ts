import type { Page } from "@playwright/test";
import {
  test,
  expect,
  addFromMenu,
  partSelect,
  songParts,
  textFields,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

function part(page: Page, index: number) {
  return page.locator("#song .song-content").nth(index);
}

async function openActions(page: Page, index: number) {
  await part(page, index).hover();
  await part(page, index).locator(".song-content__move").click();
}

// TRÊS TEXTOS: "a", "b", "c"
async function threeTexts(page: Page) {
  await addFromMenu(page, "textField");
  await page.keyboard.type("a");
  await page.keyboard.press("Enter");
  await page.keyboard.type("b");
  await page.keyboard.press("Enter");
  await page.keyboard.type("c");
}

test.describe("ações da parte", () => {
  test("'+' insere a parte escolhida logo abaixo", async ({ page }) => {
    await threeTexts(page);

    await part(page, 0).hover();
    await part(page, 0).locator(".song-content__add").click();
    await page.locator(".song-content__insert-verse").click();

    expect(await songParts(page)).toEqual([
      "text:a",
      "verse",
      "text:b",
      "text:c",
    ]);
  });

  test("duplicar copia o conteúdo logo abaixo", async ({ page }) => {
    await threeTexts(page);

    await openActions(page, 1);
    await page.locator(".song-content__duplicate").click();

    expect(await songParts(page)).toEqual([
      "text:a",
      "text:b",
      "text:b",
      "text:c",
    ]);

    // AS CÓPIAS SÃO INDEPENDENTES
    await textFields(page).nth(2).click();
    await page.keyboard.press("End");
    await page.keyboard.type("2");

    expect(await songParts(page)).toEqual([
      "text:a",
      "text:b",
      "text:b2",
      "text:c",
    ]);
  });

  test("mover para cima e para baixo, desabilitado nas pontas", async ({
    page,
  }) => {
    await threeTexts(page);

    await openActions(page, 0);
    await expect(page.locator(".song-content__move-up")).toHaveAttribute(
      "data-disabled"
    );
    await page.locator(".song-content__move-down").click();

    expect(await songParts(page)).toEqual(["text:b", "text:a", "text:c"]);

    await openActions(page, 2);
    await expect(page.locator(".song-content__move-down")).toHaveAttribute(
      "data-disabled"
    );
    await page.locator(".song-content__move-up").click();

    expect(await songParts(page)).toEqual(["text:b", "text:c", "text:a"]);

    await page.keyboard.press("ControlOrMeta+z");
    expect(await songParts(page)).toEqual(["text:b", "text:a", "text:c"]);
  });

  test("remover funciona também em campos de texto", async ({ page }) => {
    await threeTexts(page);

    await openActions(page, 1);
    await page.locator(".song-content__remove").click();

    expect(await songParts(page)).toEqual(["text:a", "text:c"]);
    await expect(page.locator(".toast")).toContainText("Parte removida");
  });
});

test.describe("seletor '/'", () => {
  test("clicar numa opção insere a parte e mantém o texto", async ({
    page,
  }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("letra");
    await page.keyboard.press("/");

    await partSelect(page).locator(".text-field__option").nth(0).click();

    expect(await songParts(page)).toEqual(["text:letra", "tab"]);
    await expect(partSelect(page)).toHaveCount(0);
  });

  test("passar o mouse muda a opção destacada", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.press("/");

    const verse = partSelect(page).locator(".text-field__option").nth(1);
    await verse.hover();

    await expect(verse).toHaveClass(/show/);

    await page.keyboard.press("Enter");
    expect(await songParts(page)).toEqual(["verse", "text:"]);
  });
});
