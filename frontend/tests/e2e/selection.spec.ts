import type { Page } from "@playwright/test";
import {
  test,
  expect,
  addFromMenu,
  songParts,
  tabLines,
  textFields,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

function part(page: Page, index: number) {
  return page.locator("#song .song-content").nth(index);
}

function selected(page: Page) {
  return page.locator("#song .song-content--selected");
}

// TEXTOS ("a", "b", "c"...), UM POR LINHA (CURSOR NO ÚLTIMO)
async function texts(page: Page, ...lines: string[]) {
  await addFromMenu(page, "textField");

  for (const [index, line] of lines.entries()) {
    if (index) await page.keyboard.press("Enter");
    await page.keyboard.type(line);
  }
}

// LINHA DE ACORDES NO FIM (O MENU NÃO FOCA O VERSO: CLICA NELE)
async function verse(page: Page, chords = "") {
  await addFromMenu(page, "verse");
  await page.locator(".verse__input").last().click();
  await page.keyboard.type(chords);
}

async function center(page: Page, index: number) {
  const box = (await part(page, index).boundingBox())!;

  return { x: box.x + 40, y: box.y + box.height / 2 };
}

// ARRASTA O MOUSE DO MEIO DE UMA LINHA ATÉ O MEIO DE OUTRA
async function dragAcross(page: Page, from: number, to: number) {
  const start = await center(page, from);
  const end = await center(page, to);

  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 8 });
  await page.mouse.up();
}

async function selectAllBlocks(page: Page) {
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+a");
}

test.describe("seleção de blocos com o mouse", () => {
  test("arrastar de uma linha a outra seleciona as linhas e Delete apaga", async ({
    page,
  }) => {
    await texts(page, "a", "b", "c", "d");

    await dragAcross(page, 1, 2);
    await expect(selected(page)).toHaveCount(2);
    await expect(textFields(page).nth(1)).not.toBeFocused();

    await page.keyboard.press("Delete");
    expect(await songParts(page)).toEqual(["text:a", "text:d"]);
    await expect(page.locator(".toast")).toContainText("Partes removidas");

    // UM PASSO SÓ NO HISTÓRICO
    await page.keyboard.press("ControlOrMeta+z");
    expect(await songParts(page)).toEqual([
      "text:a",
      "text:b",
      "text:c",
      "text:d",
    ]);
  });

  test("arrastar de baixo para cima também seleciona, inclusive a tab", async ({
    page,
  }) => {
    await texts(page, "a");
    await addFromMenu(page, "tab");
    await addFromMenu(page, "textField");
    await page.keyboard.type("c");

    await dragAcross(page, 2, 0);
    await expect(selected(page)).toHaveCount(3);

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual([]);
  });

  test("arrastar dentro da mesma linha continua selecionando texto", async ({
    page,
  }) => {
    await texts(page, "abcdef", "fica");

    const box = (await textFields(page).first().boundingBox())!;
    await page.mouse.move(box.x + 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();

    await expect(selected(page)).toHaveCount(0);
    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:", "text:fica"]);
  });

  test("arrastar a partir do fim da folha seleciona sem criar linha", async ({
    page,
  }) => {
    await texts(page, "a", "b", "c");

    const tail = (await page.locator(".home__tail").boundingBox())!;
    const target = await center(page, 1);

    await page.mouse.move(target.x, tail.y + 40);
    await page.mouse.down();
    await page.mouse.move(target.x, target.y, { steps: 8 });
    await page.mouse.up();

    await expect(selected(page)).toHaveCount(2);
    expect(await songParts(page)).toEqual(["text:a", "text:b", "text:c"]);
  });

  test("Shift+clique noutra linha seleciona o intervalo", async ({ page }) => {
    await texts(page, "a", "b", "c", "d");
    await textFields(page).nth(1).click();

    await textFields(page)
      .nth(3)
      .click({ modifiers: ["Shift"] });
    await expect(selected(page)).toHaveCount(3);

    await page.keyboard.press("Delete");
    expect(await songParts(page)).toEqual(["text:a"]);
  });

  test("Shift+clique na alça seleciona sem abrir o menu", async ({ page }) => {
    await texts(page, "a", "b", "c");
    await textFields(page).first().click();

    await part(page, 1).hover();
    await part(page, 1)
      .locator(".song-content__move")
      .click({ modifiers: ["Shift"] });

    await expect(selected(page)).toHaveCount(2);
    await expect(page.locator(".song-content__menu")).toHaveCount(0);

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:c"]);
  });

  test("clicar numa linha desfaz a seleção", async ({ page }) => {
    await texts(page, "a", "b", "c");
    await selectAllBlocks(page);

    await textFields(page).first().click();
    await expect(selected(page)).toHaveCount(0);

    await page.keyboard.press("End");
    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:", "text:b", "text:c"]);
  });

  test("arrastar a alça de uma linha selecionada leva as outras junto", async ({
    page,
  }) => {
    await texts(page, "a", "b", "c", "d");
    await dragAcross(page, 0, 1);
    await expect(selected(page)).toHaveCount(2);

    await part(page, 1).hover();
    await part(page, 1)
      .locator(".song-content__move")
      .dragTo(part(page, 3), { targetPosition: { x: 40, y: 20 } });

    await expect
      .poll(() => songParts(page))
      .toEqual(["text:c", "text:d", "text:a", "text:b"]);
  });
});

test.describe("seleção de blocos com o teclado", () => {
  test("Esc seleciona a linha e Shift+↑/↓ aumenta a seleção", async ({
    page,
  }) => {
    await texts(page, "a", "b", "c", "d");
    await textFields(page).nth(1).click();

    await page.keyboard.press("Escape");
    await expect(selected(page)).toHaveCount(1);

    await page.keyboard.press("Shift+ArrowDown");
    await page.keyboard.press("Shift+ArrowDown");
    await expect(selected(page)).toHaveCount(3);

    await page.keyboard.press("Shift+ArrowUp");
    await expect(selected(page)).toHaveCount(2);

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:a", "text:d"]);
  });

  test("setas movem a seleção e Enter volta a editar", async ({ page }) => {
    await texts(page, "a", "b", "c");

    await page.keyboard.press("Escape");
    await page.keyboard.press("ArrowUp");
    await expect(part(page, 1)).toHaveClass(/song-content--selected/);
    await expect(selected(page)).toHaveCount(1);

    await page.keyboard.press("Enter");
    await expect(selected(page)).toHaveCount(0);
    await expect(textFields(page).nth(1)).toBeFocused();

    await page.keyboard.type("!");
    expect(await songParts(page)).toEqual(["text:a", "text:b!", "text:c"]);
  });

  test("Esc com o seletor do '/' aberto só fecha o seletor", async ({
    page,
  }) => {
    await texts(page, "a");

    await page.keyboard.press("/");
    await page.keyboard.press("Escape");

    await expect(page.locator(".text-field__select.show")).toHaveCount(0);
    await expect(selected(page)).toHaveCount(0);
  });

  test("Ctrl+A uma vez seleciona só o texto da linha", async ({ page }) => {
    await texts(page, "a", "b", "c");

    await page.keyboard.press("ControlOrMeta+a");
    await expect(selected(page)).toHaveCount(0);

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:a", "text:b", "text:"]);
  });

  test("Ctrl+A duas vezes seleciona a música inteira, até de dentro da tab", async ({
    page,
  }) => {
    await texts(page, "a");
    await addFromMenu(page, "tab");
    const before = await tabLines(page);

    await page.locator(".tab").click();
    await page.keyboard.press("ControlOrMeta+a");
    await expect(selected(page)).toHaveCount(0);

    await page.keyboard.press("ControlOrMeta+a");
    await expect(selected(page)).toHaveCount(2);

    // ESC DESFAZ A SELEÇÃO SEM APAGAR NADA
    await page.keyboard.press("Escape");
    await expect(selected(page)).toHaveCount(0);
    expect(await tabLines(page)).toEqual(before);
  });
});

test.describe("copiar e recortar blocos", () => {
  test.beforeEach(async ({ context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("Ctrl+C copia as linhas como cifra", async ({ page }) => {
    await verse(page, "Am   G");
    await addFromMenu(page, "textField");
    await page.keyboard.type("A vida");
    await addFromMenu(page, "textField");
    await page.keyboard.type("fica");

    await dragAcross(page, 0, 1);
    await page.keyboard.press("ControlOrMeta+c");

    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      "Am   G\nA vida"
    );
    await expect(selected(page)).toHaveCount(2);
  });

  test("Ctrl+X recorta e colar numa linha devolve os blocos", async ({
    page,
  }) => {
    await verse(page, "Am   G");
    await addFromMenu(page, "textField");
    await page.keyboard.type("A vida");
    await addFromMenu(page, "textField");

    await dragAcross(page, 0, 1);
    await page.keyboard.press("ControlOrMeta+x");
    expect(await songParts(page)).toEqual(["text:"]);

    await textFields(page).first().click();
    await page.keyboard.press("ControlOrMeta+v");
    expect(await songParts(page)).toEqual(["verse", "text:A vida"]);
  });
});

test.describe("juntar linhas", () => {
  test("Backspace no começo junta com a linha de cima", async ({ page }) => {
    await texts(page, "abc", "def");
    await page.keyboard.press("Home");

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:abcdef"]);

    // O CURSOR FICA NA EMENDA
    await page.keyboard.type("-");
    expect(await songParts(page)).toEqual(["text:abc-def"]);

    // UM PASSO SÓ NO HISTÓRICO (ALÉM DA DIGITAÇÃO)
    await page.keyboard.press("ControlOrMeta+z");
    await page.keyboard.press("ControlOrMeta+z");
    expect(await songParts(page)).toEqual(["text:abc", "text:def"]);
  });

  test("Delete no fim junta a linha de baixo", async ({ page }) => {
    await texts(page, "abc", "def");
    await textFields(page).first().click();
    await page.keyboard.press("End");

    await page.keyboard.press("Delete");
    expect(await songParts(page)).toEqual(["text:abcdef"]);

    await page.keyboard.type("-");
    expect(await songParts(page)).toEqual(["text:abc-def"]);
  });

  test("Backspace numa linha vazia a remove e volta para o fim da de cima", async ({
    page,
  }) => {
    await texts(page, "abc", "");

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:abc"]);

    await page.keyboard.type("!");
    expect(await songParts(page)).toEqual(["text:abc!"]);
  });

  test("letra não entra na linha de acordes de cima", async ({ page }) => {
    await verse(page, "Am");
    await addFromMenu(page, "textField");
    await page.keyboard.type("letra");
    await page.keyboard.press("Home");

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["verse", "text:letra"]);
  });

  test("Backspace numa linha de acordes vazia a remove", async ({ page }) => {
    await texts(page, "abc");
    await verse(page);

    await page.keyboard.press("Backspace");
    expect(await songParts(page)).toEqual(["text:abc"]);
  });
});
