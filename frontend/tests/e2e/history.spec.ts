import type { Page } from "@playwright/test";
import {
  test,
  expect,
  addFromMenu,
  paste,
  placeCaret,
  songParts,
  tabLines,
  textFields,
  tuningLabel,
} from "./helpers";

const UNDO = "ControlOrMeta+z";
const REDO = "ControlOrMeta+Shift+z";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

async function removeFirstPart(page: Page) {
  const part = page.locator("#song .song-content").first();

  await part.hover();
  await part.locator(".song-content__move").click();
  await page.locator(".song-content__remove").click();
}

test.describe("remover parte", () => {
  test.beforeEach(async ({ page }) => {
    await addFromMenu(page, "verse");
    await page.locator(".verse__input").click();
    await page.keyboard.type("Am  G");
    await addFromMenu(page, "tab");
  });

  test("mostra aviso e 'Desfazer' traz a parte de volta", async ({ page }) => {
    await removeFirstPart(page);

    expect(await songParts(page)).toEqual(["tab"]);
    await expect(page.locator(".toast")).toContainText("Parte removida");

    await page.locator(".toast__undo").click();

    expect(await songParts(page)).toEqual(["verse", "tab"]);
    await expect(page.locator(".verse__input")).toHaveText("Am  G");
    await expect(page.locator(".toast")).toHaveCount(0);
  });

  test("Ctrl+Z desfaz e Ctrl+Shift+Z / Ctrl+Y refazem", async ({ page }) => {
    await removeFirstPart(page);

    await page.keyboard.press(UNDO);
    expect(await songParts(page)).toEqual(["verse", "tab"]);

    await page.keyboard.press(REDO);
    expect(await songParts(page)).toEqual(["tab"]);

    await page.keyboard.press(UNDO);
    await page.keyboard.press("ControlOrMeta+y");
    expect(await songParts(page)).toEqual(["tab"]);
  });

  test("o aviso some quando a música muda de novo", async ({ page }) => {
    await removeFirstPart(page);
    await expect(page.locator(".toast")).toBeVisible();

    await addFromMenu(page, "textField");

    await expect(page.locator(".toast")).toHaveCount(0);
  });

  test("o desfazer também é salvo", async ({ page }) => {
    await removeFirstPart(page);
    await page.keyboard.press(UNDO);
    await page.reload();

    expect(await songParts(page)).toEqual(["verse", "tab"]);
  });
});

test.describe("desfazer digitação", () => {
  test.beforeEach(async ({ page }) => {
    await addFromMenu(page, "textField");
  });

  test("digitação seguida vira um passo só", async ({ page }) => {
    await page.keyboard.type("abc");

    await page.keyboard.press(UNDO);
    expect(await songParts(page)).toEqual(["text:"]);

    await page.keyboard.press(UNDO);
    expect(await songParts(page)).toEqual([]);
  });

  test("uma pausa separa os passos", async ({ page }) => {
    await page.keyboard.type("abc");
    await page.waitForTimeout(1200);
    await page.keyboard.type("def");

    await page.keyboard.press(UNDO);

    await expect(textFields(page).first()).toHaveText("abc");
  });

  test("colar várias linhas desfaz de uma vez", async ({ page }) => {
    await paste(textFields(page).first(), "um\ndois\ntrês");
    expect(await songParts(page)).toHaveLength(3);

    await page.keyboard.press(UNDO);

    expect(await songParts(page)).toEqual(["text:"]);
  });

  test("título do cabeçalho", async ({ page }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Minha Música");

    await page.keyboard.press(UNDO);

    await expect(page.locator(".tab-header__title")).toHaveText("");
  });
});

test.describe("desfazer na tab", () => {
  test.beforeEach(async ({ page }) => {
    await addFromMenu(page, "tab");
  });

  test("nota digitada volta a ser traço", async ({ page }) => {
    await placeCaret(page, 1, 4);
    await page.keyboard.type("3");

    await page.keyboard.press(UNDO);

    expect((await tabLines(page))[1]).toBe("B|" + "-".repeat(41));
  });

  test("troca de afinação desfaz afinação e tab num passo só", async ({
    page,
  }) => {
    await page.locator("#changeTuningBtn").click();
    await page.locator(".tuning__menu li", { hasText: "Baixo" }).click();
    await page.locator(".bass button[type=submit]").click();
    expect(await tabLines(page)).toHaveLength(4);

    await page.keyboard.press(UNDO);

    await expect(tuningLabel(page)).toHaveText("e - B - G - D - A - E");
    expect(await tabLines(page)).toHaveLength(6);
  });
});
