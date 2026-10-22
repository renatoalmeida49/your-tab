import {
  test,
  expect,
  addFromMenu,
  chooseLanguage,
  songParts,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("página", () => {
  test("ajuda mostra atalhos, títulos e lista", async ({ page }) => {
    const details = page.locator(".help__details");

    await page.locator(".app-bar__help").click();

    await expect(page.locator(".help__shortcut").first()).toContainText("/");
    await expect(details.locator("h2").first()).toHaveText(
      "Feito para iniciantes e avançados"
    );
    await expect(details.locator("li").first()).toContainText(
      "Baixos e guitarras com mais cordas"
    );

    await page.keyboard.press("Escape");
    await expect(page.locator(".help")).toHaveCount(0);

    await chooseLanguage(page, "English");
    await page.keyboard.press("?");

    await expect(details.locator("h2").first()).toHaveText(
      "Made for beginners and advanced"
    );
  });

  test("'?' dentro de um campo de texto não abre a ajuda", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("Que?");

    await expect(page.locator(".help")).toHaveCount(0);
    expect(await songParts(page)).toEqual(["text:Que?"]);
  });

  test("música vazia mostra o estado inicial, que cria a primeira parte", async ({
    page,
  }) => {
    await expect(page.locator(".empty-state")).toBeVisible();

    await page.locator(".empty-state__option--verse").click();

    await expect(page.locator(".empty-state")).toHaveCount(0);
    expect(await songParts(page)).toEqual(["verse"]);
  });

  test("clicar abaixo da última parte cria um campo de texto", async ({
    page,
  }) => {
    await addFromMenu(page, "verse");
    await page.locator(".home__tail").click();

    expect(await songParts(page)).toEqual(["verse", "text:"]);
    await expect(page.locator(".text-field__input")).toBeFocused();
  });

  test("bandeiras carregam as imagens", async ({ page }) => {
    await page.locator(".language-menu__trigger").click();

    const flags = page.locator(".language-menu__item img");

    await expect(flags).toHaveCount(2);

    for (const flag of await flags.all()) {
      const width = await flag.evaluate(
        (img) => (img as HTMLImageElement).naturalWidth
      );

      expect(width).toBeGreaterThan(0);
    }
  });
});

test.describe("arrastar partes", () => {
  test("reordena pela alça e persiste", async ({ page }) => {
    await addFromMenu(page, "verse");
    await addFromMenu(page, "textField");
    await page.keyboard.type("letra");
    await addFromMenu(page, "tab");

    const parts = page.locator("#song .song-content");
    const tab = parts.nth(2);

    await tab.hover();
    await tab
      .locator(".song-content__move")
      .dragTo(parts.nth(0), { targetPosition: { x: 40, y: 2 } });

    await expect
      .poll(() => songParts(page))
      .toEqual(["tab", "verse", "text:letra"]);

    await page.reload();

    expect(await songParts(page)).toEqual(["tab", "verse", "text:letra"]);
  });
});

test.describe("PDF", () => {
  test("pré-visualiza, baixa com o nome da música e fecha", async ({
    page,
  }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Minha Música");
    await page.locator(".tab-header__artist").click();
    await page.keyboard.type("AC/DC");
    await addFromMenu(page, "tab");

    await page.locator(".app-bar__export").click();

    const preview = page.locator(".export__preview iframe");
    await expect(preview).toHaveAttribute("src", /^blob:/, { timeout: 15000 });

    const pdf = await preview.evaluate(async (iframe) => {
      const src = (iframe as HTMLIFrameElement).src;
      const blob = await (await fetch(src)).blob();
      const header = await blob.slice(0, 5).text();

      return { type: blob.type, header, size: blob.size };
    });

    expect(pdf.type).toBe("application/pdf");
    expect(pdf.header).toBe("%PDF-");
    expect(pdf.size).toBeGreaterThan(1000);

    // A CÓPIA USADA PARA O PDF NÃO FICA NA PÁGINA
    await expect(page.locator(".pdf-export-host")).toHaveCount(0);

    const fileName = page.locator(".export__input input");
    await expect(fileName).toHaveValue("Minha Música - ACDC");
    await fileName.fill("Ensaio");

    const download = page.waitForEvent("download");
    await page.locator(".export__download").click();
    expect((await download).suggestedFilename()).toBe("Ensaio.pdf");

    await page.keyboard.press("Escape");
    await expect(page.locator(".export")).toHaveCount(0);
  });
});

test.describe("compatibilidade", () => {
  test("abre uma música salva pela versão com Vuex", async ({ browser }) => {
    // FORMATO GRAVADO PELA VERSÃO ANTERIOR (VUEX) NO localStorage
    const saved = {
      songStructure: {
        title: "Música antiga",
        artist: "Artista antigo",
        songStructure: [
          { id: "a1", type: "textField", info: { text: "[Intro]" } },
          { id: "a2", type: "verse", info: { chords: "Am   G" } },
          {
            id: "a3",
            type: "tab",
            info: { text: "G|--5--\nD|-----\nA|-----\nE|-----" },
          },
        ],
      },
      instrument: {
        tuning: ["G", "D", "A", "E"],
        instrument: "bass",
        tone: "Am",
      },
    };

    const context = await browser.newContext();
    await context.addInitScript((data) => {
      if (!localStorage.getItem("tab-builder:song")) {
        localStorage.setItem("tab-builder:song", JSON.stringify(data));
      }
    }, saved);

    const page = await context.newPage();
    await page.goto("/");

    await expect(page.locator(".tab-header__title")).toHaveText(
      "Música antiga"
    );
    await expect(page.locator(".tab-header__tone")).toHaveText("Am");
    await expect(page.locator(".tab-header__tuning")).toHaveText(
      "G - D - A - E"
    );
    expect(await songParts(page)).toEqual(["text:[Intro]", "verse", "tab"]);
    await expect(page.locator(".verse__input")).toHaveText("Am   G");
    await expect(page.locator(".tab pre")).toContainText("G|--5--");

    await context.close();
  });
});

test.describe("tema", () => {
  test("alterna sistema -> claro -> escuro e persiste", async ({ page }) => {
    const html = page.locator("html");
    const toggle = page.locator(".app-bar__theme");

    await expect(html).not.toHaveAttribute("data-theme");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "light");

    await toggle.click();
    await expect(html).toHaveAttribute("data-theme", "dark");

    await page.reload();
    await expect(html).toHaveAttribute("data-theme", "dark");

    const background = await page
      .locator("body")
      .evaluate((body) => getComputedStyle(body).backgroundColor);
    expect(background).toBe("rgb(18, 16, 16)");

    await toggle.click();
    await expect(html).not.toHaveAttribute("data-theme");
  });
});
