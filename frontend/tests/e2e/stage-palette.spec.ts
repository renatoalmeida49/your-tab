import {
  test,
  expect,
  addFromMenu,
  answerConfirm,
  placeCaret,
  songParts,
  tabLines,
  textFields,
} from "./helpers";

const UNDO = "ControlOrMeta+z";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("transpor", () => {
  test.beforeEach(async ({ page }) => {
    await page.locator(".tab-header__tone").fill("Am");
    await addFromMenu(page, "verse");
    await page.locator(".verse__input").click();
    await page.keyboard.type("Am  G   C");
  });

  test("'+' e '-' do tom transpõem tom e acordes, mantendo as colunas", async ({
    page,
  }) => {
    await page.locator(".tab-header__transpose-up").click();

    await expect(page.locator(".tab-header__tone")).toHaveText("A#m");
    await expect(page.locator(".verse__input")).toHaveText("A#m G#  C#");

    await page.locator(".tab-header__transpose-down").click();
    await page.locator(".tab-header__transpose-down").click();

    await expect(page.locator(".tab-header__tone")).toHaveText("G#m");
    await expect(page.locator(".verse__input")).toHaveText("G#m F#  B");
  });

  test("as tabs sobem junto, abrindo coluna quando o traste ganha um dígito", async ({
    page,
  }) => {
    await addFromMenu(page, "tab");
    await placeCaret(page, 5, 3);
    await page.keyboard.type("5");
    await placeCaret(page, 0, 3);
    await page.keyboard.type("9");

    await page.locator(".tab-header__transpose-up").click();

    const rows = await tabLines(page);
    expect(rows[0]).toBe("e|-10" + "-".repeat(39));
    expect(rows[5]).toBe("E|-6-" + "-".repeat(39));
    expect(new Set(rows.map((row) => row.length)).size).toBe(1);

    await page.locator(".tab-header__transpose-down").click();

    expect((await tabLines(page))[5]).toBe("E|-5" + "-".repeat(39));
  });

  test("um Ctrl+Z desfaz a transposição inteira", async ({ page }) => {
    await page.locator(".tab-header__transpose-up").click();
    await page.keyboard.press(UNDO);

    await expect(page.locator(".tab-header__tone")).toHaveText("Am");
    await expect(page.locator(".verse__input")).toHaveText("Am  G   C");
  });
});

test.describe("modo palco", () => {
  test.beforeEach(async ({ page }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Minha Música");
    await addFromMenu(page, "verse");
    await page.locator(".verse__input").click();
    await page.keyboard.type("Em  C");
    await page.keyboard.press("Enter");
    await page.keyboard.type("primeira linha");

    // LETRA LONGA PARA HAVER O QUE ROLAR
    for (let line = 0; line < 60; line++) {
      await page.keyboard.press("Enter");
      await page.keyboard.type(`linha ${line}`);
    }
  });

  test("mostra a música, transpõe, muda a letra e fecha com Esc", async ({
    page,
  }) => {
    await page.locator(".app-bar__stage").click();

    const stage = page.locator(".stage");
    await expect(stage).toBeVisible();
    await expect(stage.locator("h1")).toHaveText("Minha Música");
    await expect(stage.locator(".stage__chords")).toHaveText("Em  C");
    await expect(stage).toHaveAttribute("data-theme", "dark");

    await stage.getByRole("button", { name: /meio tom acima/ }).click();
    await expect(stage.locator(".stage__chords")).toHaveText("Fm  C#");

    const size = () =>
      stage.evaluate((element) =>
        getComputedStyle(element).getPropertyValue("--stage-size")
      );
    const before = await size();
    await page.locator(".stage__bigger").click();
    expect(await size()).not.toBe(before);

    await page.keyboard.press("Escape");
    await expect(stage).toHaveCount(0);

    // A TRANSPOSIÇÃO FEITA NO PALCO VALE NO EDITOR
    await expect(page.locator(".verse__input")).toHaveText("Fm  C#");
  });

  test("Espaço liga e desliga a rolagem automática", async ({ page }) => {
    await page.locator(".app-bar__stage").click();

    const stage = page.locator(".stage");
    const scrollTop = () => stage.evaluate((element) => element.scrollTop);

    await page.keyboard.press(" ");
    await expect.poll(scrollTop).toBeGreaterThan(10);

    await page.keyboard.press(" ");
    const stopped = await scrollTop();
    await page.waitForTimeout(300);
    expect(await scrollTop()).toBe(stopped);
  });

  test("rolar na mão não desliga a rolagem automática", async ({ page }) => {
    await page.locator(".app-bar__stage").click();

    const stage = page.locator(".stage");
    const scrollTop = () => stage.evaluate((element) => element.scrollTop);

    await page.keyboard.press(" ");
    await expect.poll(scrollTop).toBeGreaterThan(10);

    await page.mouse.move(200, 200);
    await page.mouse.wheel(0, 200);
    await expect.poll(scrollTop).toBeGreaterThan(200);

    // CONTINUA DE ONDE O USUÁRIO PAROU
    const afterWheel = await scrollTop();
    await expect.poll(scrollTop).toBeGreaterThan(afterWheel + 10);
    await expect(page.locator(".stage__play")).toHaveAttribute(
      "aria-label",
      /Pausar/
    );
  });

  test.describe("no celular (375px)", () => {
    test.use({
      viewport: { width: 375, height: 667 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
    });

    test("a página não estoura a tela e o play do palco rola a música", async ({
      page,
    }) => {
      // UMA PÁGINA MAIS LARGA QUE O VIEWPORT AUMENTA O PALCO FIXO E JOGA OS
      // CONTROLES PARA FORA DA TELA
      const width = () =>
        page.evaluate(() => document.documentElement.scrollWidth);
      expect(await width()).toBeLessThanOrEqual(375);

      await page.locator(".app-bar__stage").click();

      const controls = await page.locator(".stage__controls").boundingBox();
      expect(controls!.x).toBeGreaterThanOrEqual(0);
      expect(controls!.x + controls!.width).toBeLessThanOrEqual(375);
      expect(controls!.y + controls!.height).toBeLessThanOrEqual(667);

      const stage = page.locator(".stage");
      const scrollTop = () => stage.evaluate((element) => element.scrollTop);

      await page.locator(".stage__play").tap();
      await expect.poll(scrollTop).toBeGreaterThan(10);
    });
  });
});

test.describe("paleta de comandos", () => {
  test("Ctrl+K abre, filtra sem acento e Enter executa", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");

    const palette = page.locator(".palette");
    await expect(palette).toBeVisible();
    await expect(page.locator(".palette__input")).toBeFocused();

    await page.keyboard.type("verso");
    await page.keyboard.press("Enter");

    await expect(palette).toHaveCount(0);
    expect(await songParts(page)).toEqual(["verse"]);
  });

  test("abre de dentro de um campo de texto e navega com as setas", async ({
    page,
  }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("letra");
    await page.keyboard.press("ControlOrMeta+k");

    await page.keyboard.type("nova musica");
    await expect(page.locator(".palette__item")).toHaveText(["Nova música"]);

    await page.keyboard.press("Enter");
    await answerConfirm(page, true);

    expect(await songParts(page)).toEqual([]);
  });

  test("busca sem resultado mostra aviso e Esc fecha", async ({ page }) => {
    await page.locator(".app-bar__palette").click();
    await page.keyboard.type("zzzz");

    await expect(page.locator(".palette__empty")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".palette")).toHaveCount(0);
  });

  test("setas mudam o comando destacado", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await page.keyboard.type("adicionar");

    const items = page.locator(".palette__item");
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toHaveClass(/palette__item--active/);

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(0)).toHaveClass(/palette__item--active/);

    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Enter");

    expect(await songParts(page)).toEqual(["tab"]);
    await expect(textFields(page)).toHaveCount(0);
  });
});
