import {
  test,
  expect,
  addFromMenu,
  answerConfirm,
  paste,
  placeCaret,
  songParts,
  tabLines,
  textFields,
  tuningLabel,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// TRECHO DE UMA CIFRA DE BAIXO COPIADA DE UM SITE
const BASS_SONG = `Introdução

Parte 01

G|--------------------------------------------|
D|-----------------------------5-3--3-3-3-3---|
A|-3-3--------3-3--------3-3----------------5-|
E|-----5--5-5-----5--5-5-----5----------------|

G|--------------------------------------------|
D|--------------------------------------------|
A|-5--5-5-5--5--5-5-5-------------------------|
E|--------------------5-----------------------|

Primeira parte

Left a good job in the city
`;

test.describe("colar cifra com tablatura", () => {
  test("cada tab colada vira uma tab, e a música adota a afinação", async ({
    page,
  }) => {
    await addFromMenu(page, "textField");
    await paste(textFields(page).first(), BASS_SONG);

    expect(await songParts(page)).toEqual([
      "text:Introdução",
      "text:",
      "text:Parte 01",
      "tab",
      "tab",
      "text:Primeira parte",
      "text:",
      "text:Left a good job in the city",
    ]);
    await expect(tuningLabel(page)).toHaveText("G - D - A - E");
    expect(await tabLines(page, 0)).toEqual([
      "G|--------------------------------------------|",
      "D|-----------------------------5-3--3-3-3-3---|",
      "A|-3-3--------3-3--------3-3----------------5-|",
      "E|-----5--5-5-----5--5-5-----5----------------|",
    ]);

    // UM Ctrl+Z DESFAZ A COLAGEM INTEIRA (PARTES E AFINAÇÃO)
    await page.keyboard.press("ControlOrMeta+z");
    expect(await songParts(page)).toEqual(["text:"]);
    await expect(tuningLabel(page)).toHaveText("e - B - G - D - A - E");
  });

  test("colando abaixo de um texto, o texto fica", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("Proud Mary");
    await paste(textFields(page).first(), "Parte 01\nG|-5-\nD|-3-");

    expect(await songParts(page)).toEqual([
      "text:Proud Mary",
      "text:Parte 01",
      "tab",
    ]);
  });

  test("linha de acordes vira verso", async ({ page }) => {
    await addFromMenu(page, "textField");
    await paste(textFields(page).first(), "Am    G    C\nRolling on the river");

    expect(await songParts(page)).toEqual([
      "verse",
      "text:Rolling on the river",
    ]);
    await expect(page.locator(".verse__input")).toHaveText("Am    G    C");
  });

  test("com notas já escritas, pergunta antes de trocar a afinação", async ({
    page,
  }) => {
    await addFromMenu(page, "tab");
    await placeCaret(page, 0, 3);
    await page.keyboard.type("7");
    await addFromMenu(page, "textField");

    await paste(textFields(page).first(), "G|-5-\nD|-3-\nA|---\nE|---");
    await expect(page.locator(".confirm")).toBeVisible();

    // MANTENDO A AFINAÇÃO, A TAB COLADA GANHA AS CORDAS QUE FALTAM (e, B)
    await answerConfirm(page, false);
    await expect(tuningLabel(page)).toHaveText("e - B - G - D - A - E");
    expect(await tabLines(page, 1)).toEqual([
      "e|---",
      "B|---",
      "G|-5-",
      "D|-3-",
      "A|---",
      "E|---",
    ]);
  });
});
