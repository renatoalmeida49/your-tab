import {
  test,
  expect,
  addFromMenu,
  partSelect,
  paste,
  songParts,
  textFields,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("campos de texto", () => {
  test("campo adicionado pelo menu recebe foco", async ({ page }) => {
    await addFromMenu(page, "textField");

    await expect(textFields(page).first()).toBeFocused();
  });

  test("Enter cria um novo campo abaixo e foca nele", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("linha 1");
    await page.keyboard.press("Enter");
    await page.keyboard.type("linha 2");

    expect(await songParts(page)).toEqual(["text:linha 1", "text:linha 2"]);
    await expect(textFields(page).nth(1)).toBeFocused();
  });

  test("Backspace em campo vazio remove o campo", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("fica");
    await page.keyboard.press("Enter");

    await page.keyboard.press("Backspace");

    expect(await songParts(page)).toEqual(["text:fica"]);
  });

  test("setas navegam entre os campos", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.press("Enter");

    await page.keyboard.press("ArrowUp");
    await expect(textFields(page).first()).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(textFields(page).nth(1)).toBeFocused();
  });

  test("colar várias linhas cria um campo por linha, na ordem", async ({
    page,
  }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("antes");
    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await page.keyboard.type("depois");

    await paste(textFields(page).nth(1), "p1\np2\np3");

    expect(await songParts(page)).toEqual([
      "text:antes",
      "text:p1",
      "text:p2",
      "text:p3",
      "text:depois",
    ]);
  });
});

test.describe("seletor de partes (/)", () => {
  test.beforeEach(async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("linha");
  });

  test("'/' seguido de Enter insere uma tab abaixo", async ({ page }) => {
    await page.keyboard.press("/");
    await expect(partSelect(page)).toBeVisible();

    await page.keyboard.press("Enter");

    expect(await songParts(page)).toEqual(["text:linha", "tab"]);
    await expect(partSelect(page)).toHaveCount(0);
  });

  test("'/' seguido de seta e Enter insere um verso acima", async ({
    page,
  }) => {
    await page.keyboard.press("/");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    expect(await songParts(page)).toEqual(["verse", "text:linha"]);
  });

  test("'/' do teclado numérico também abre o seletor", async ({ page }) => {
    await page.keyboard.press("NumpadDivide");

    await expect(partSelect(page)).toBeVisible();
  });

  test("Esc fecha o seletor sem inserir nada", async ({ page }) => {
    await page.keyboard.press("/");
    await page.keyboard.press("Escape");

    await expect(partSelect(page)).toHaveCount(0);
    expect(await songParts(page)).toEqual(["text:linha"]);
  });
});

test.describe("idioma", () => {
  test("trocar o idioma mantém a música na tela", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("minha letra");

    await page.locator('.links img[alt="English"]').click();

    await expect(page.locator("#app .container > p")).toHaveText(
      "A chord sheet, tablature and annotation builder."
    );
    expect(await songParts(page)).toEqual(["text:minha letra"]);
  });
});

test.describe("idioma inglês", () => {
  test.beforeEach(async ({ page }) => {
    await page.locator('.links img[alt="English"]').click();
  });

  test("traduz o modal de afinação e o atributo lang", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");

    await page.locator("#changeTuningBtn").click();

    await expect(page.locator(".tuning__menu li")).toHaveText([
      "Acoustic/Electric guitar",
      "Ukulele",
      "Bass",
    ]);
    await expect(page.locator(".guitar")).toContainText("Quick tuning");
    await expect(page.locator(".guitar")).toContainText("Half step down");
    await expect(page.locator(".guitar button[type=submit]")).toHaveText(
      "Confirm"
    );
    await expect(page.locator(".modal footer")).toHaveText("Cancel");
  });

  test("idioma escolhido continua após o reload", async ({ page }) => {
    await page.reload();

    await expect(page.locator("html")).toHaveAttribute("lang", "en-US");
    await expect(page.locator(".menu__new-song")).toHaveText("New song");
  });
});

test.describe("persistência", () => {
  test("música e cabeçalho sobrevivem ao reload", async ({ page }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Minha Música");
    await page.locator(".tab-header__artist").click();
    await page.keyboard.type("Artista X");

    await addFromMenu(page, "verse");
    await addFromMenu(page, "textField");
    await page.keyboard.type("letra");
    await addFromMenu(page, "tab");

    const before = await songParts(page);
    await page.reload();

    expect(await songParts(page)).toEqual(before);
    await expect(page.locator(".tab-header__title")).toHaveText("Minha Música");
    await expect(page.locator(".tab-header__artist")).toHaveText("Artista X");
  });

  test("tab editada sobrevive ao reload", async ({ page }) => {
    await addFromMenu(page, "tab");

    const tab = page.locator(".tab");
    await tab.evaluate((element) => {
      element.querySelector("pre").innerText = "B|--3--\nE|-----";
    });
    await tab.focus();
    await tab.blur();

    await page.reload();

    await expect(page.locator(".tab")).toHaveText("B|--3--\nE|-----");
  });

  test("nenhum campo rouba o foco ao recarregar", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.press("Enter");

    await page.reload();

    await expect(page.locator(".text-field__input:focus")).toHaveCount(0);
  });
});

test.describe("nova música", () => {
  test.beforeEach(async ({ page }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Antiga");
    await page.locator(".tab-header__tone").fill("Am");
    await addFromMenu(page, "textField");
    await page.keyboard.type("letra antiga");
    await addFromMenu(page, "tab");

    await page.locator("#changeTuningBtn").click();
    await page.locator(".tuning__menu li", { hasText: "Baixo" }).click();
    await page.locator(".bass button[type=submit]").click();
  });

  test("confirmar apaga a música e o cabeçalho, mantendo a afinação", async ({
    page,
  }) => {
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator(".menu__new-song").click();

    expect(await songParts(page)).toEqual([]);
    await expect(page.locator(".tab-header__title")).toHaveText("");
    await expect(page.locator(".tab-header__tone")).toHaveText("C");
    await expect(page.locator(".tab-header__tuning")).toHaveText(
      "G - D - A - E"
    );

    await page.reload();

    expect(await songParts(page)).toEqual([]);
    await expect(page.locator(".tab-header__title")).toHaveText("");
  });

  test("cancelar mantém tudo", async ({ page }) => {
    page.once("dialog", (dialog) => dialog.dismiss());
    await page.locator(".menu__new-song").click();

    expect(await songParts(page)).toEqual(["text:letra antiga", "tab"]);
    await expect(page.locator(".tab-header__title")).toHaveText("Antiga");
    await expect(page.locator(".tab-header__tone")).toHaveText("Am");
  });
});
