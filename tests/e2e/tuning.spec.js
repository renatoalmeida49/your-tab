import {
  test,
  expect,
  addFromMenu,
  placeCaret,
  tabLines,
  tuningLabel,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#changeTuningBtn").click();
});

function openInstrument(page, name) {
  return page.locator(".tuning__menu li", { hasText: name }).click();
}

function presets(page, form) {
  return page.locator(`.${form} .the-button:not([type=submit])`);
}

function confirm(page, form) {
  return page.locator(`.${form} button[type=submit]`).click();
}

test("campo vazio impede confirmar a afinação", async ({ page }) => {
  await page.locator(".guitar input").first().fill("");
  await confirm(page, "guitar");

  await expect(page.locator(".modal")).toBeVisible();
  await expect(tuningLabel(page)).toHaveText("e - B - G - D - A - E");
});

test("editar um campo não altera o preset", async ({ page }) => {
  const dropD = presets(page, "guitar").filter({ hasText: "Drop D" });
  const firstString = page.locator(".guitar input").first();

  await dropD.click();
  await firstString.fill("X");
  await dropD.click();

  await expect(firstString).toHaveValue("e");

  await confirm(page, "guitar");

  await expect(page.locator(".modal")).toHaveCount(0);
  await expect(tuningLabel(page)).toHaveText("e - B - G - D - A - D");
});

test("baixo 1 tom abaixo é F C G D", async ({ page }) => {
  await openInstrument(page, "Baixo");
  await presets(page, "bass").filter({ hasText: "1 tom" }).click();
  await confirm(page, "bass");

  await expect(tuningLabel(page)).toHaveText("F - C - G - D");
});

test("afinação editada do ukulele é salva", async ({ page }) => {
  await openInstrument(page, "Ukulele");
  await page.locator(".ukulele input").first().fill("B");
  await confirm(page, "ukulele");

  await expect(tuningLabel(page)).toHaveText("B - E - C - G");
});

test("Cancelar fecha o modal", async ({ page }) => {
  await page.locator(".modal footer .the-button").click();

  await expect(page.locator(".modal")).toHaveCount(0);
});

test("nova tab usa a afinação atual e ela persiste", async ({ page }) => {
  await openInstrument(page, "Baixo");
  await confirm(page, "bass");
  await addFromMenu(page, "tab");

  await page.reload();

  await expect(tuningLabel(page)).toHaveText("G - D - A - E");
  await expect(page.locator(".tab")).toContainText("G|---");
  await expect(page.locator(".tab")).toContainText("E|---");
});

test.describe("tabs acompanham a afinação", () => {
  async function chooseBass(page) {
    await openInstrument(page, "Baixo");
    await confirm(page, "bass");
  }

  test.beforeEach(async ({ page }) => {
    // FECHA O MODAL ABERTO NO beforeEach GERAL E CRIA UMA TAB DE VIOLÃO
    await page.locator(".modal footer .the-button").click();
    await addFromMenu(page, "tab");
  });

  test("violão -> baixo: tab vazia passa a ter G D A E", async ({ page }) => {
    await page.locator("#changeTuningBtn").click();
    await chooseBass(page);

    const rows = await tabLines(page);
    expect(rows.map((row) => row.slice(0, 2))).toEqual([
      "G|",
      "D|",
      "A|",
      "E|",
    ]);
  });

  test("notas só nas cordas graves: troca sem perguntar e mantém as notas", async ({
    page,
  }) => {
    await placeCaret(page, 5, 2);
    await page.keyboard.type("3");

    let asked = false;
    page.on("dialog", (dialog) => {
      asked = true;
      dialog.accept();
    });

    await page.locator("#changeTuningBtn").click();
    await chooseBass(page);

    expect(asked).toBe(false);
    expect((await tabLines(page))[3].startsWith("E|3")).toBe(true);
  });

  test("notas em corda removida: cancelar mantém afinação e tab", async ({
    page,
  }) => {
    await placeCaret(page, 0, 2);
    await page.keyboard.type("0");

    page.once("dialog", (dialog) => dialog.dismiss());
    await page.locator("#changeTuningBtn").click();
    await chooseBass(page);

    await expect(page.locator(".modal")).toBeVisible();
    await expect(tuningLabel(page)).toHaveText("e - B - G - D - A - E");
    expect((await tabLines(page))[0].startsWith("e|0")).toBe(true);
  });

  test("notas em corda removida: confirmar aplica a nova afinação", async ({
    page,
  }) => {
    await placeCaret(page, 0, 2);
    await page.keyboard.type("0");

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#changeTuningBtn").click();
    await chooseBass(page);

    await expect(tuningLabel(page)).toHaveText("G - D - A - E");
    expect(await tabLines(page)).toHaveLength(4);
  });

  test("baixo -> violão: cordas novas entram no topo", async ({ page }) => {
    await page.locator("#changeTuningBtn").click();
    await chooseBass(page);
    await placeCaret(page, 3, 2);
    await page.keyboard.type("5");

    await page.locator("#changeTuningBtn").click();
    await confirm(page, "guitar");

    const rows = await tabLines(page);
    expect(rows.map((row) => row.slice(0, 2))).toEqual([
      "e|",
      "B|",
      "G|",
      "D|",
      "A|",
      "E|",
    ]);
    expect(rows[5].startsWith("E|5")).toBe(true);
    expect(new Set(rows.map((row) => row.length)).size).toBe(1);
  });

  test("rótulos de tamanhos diferentes ficam alinhados", async ({ page }) => {
    await page.locator("#changeTuningBtn").click();
    await presets(page, "guitar").filter({ hasText: "Meio tom" }).click();
    await page.locator(".guitar input").nth(4).fill("A");
    await confirm(page, "guitar");

    const rows = await tabLines(page);
    expect(rows[3].slice(0, 3)).toBe("Db|");
    expect(rows[4].slice(0, 3)).toBe("A |");
  });

  test("mudança de afinação persiste nas tabs", async ({ page }) => {
    await page.locator("#changeTuningBtn").click();
    await chooseBass(page);
    await page.reload();

    expect(await tabLines(page)).toHaveLength(4);
  });
});
