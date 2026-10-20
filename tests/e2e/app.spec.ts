import { test, expect, addFromMenu, songParts } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test.describe("página", () => {
  test("seção de ajuda mostra títulos e lista", async ({ page }) => {
    const help = page.locator("#help");

    await expect(help.locator("h2").first()).toHaveText(
      "Feito para iniciantes e avançados"
    );
    await expect(help.locator("li").first()).toContainText(
      "Funcionalidade de login"
    );

    await page.locator('.links img[alt="English"]').click();

    await expect(help.locator("h2").first()).toHaveText(
      "Made for beginners and advanced"
    );
  });

  test("bandeiras carregam as imagens", async ({ page }) => {
    const flags = page.locator(".links img");

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
  test("gera a pré-visualização e fecha", async ({ page }) => {
    await page.locator(".tab-header__title").click();
    await page.keyboard.type("Minha Música");
    await addFromMenu(page, "tab");

    await page.locator(".menu__buttons-downloads button").nth(1).click();

    const preview = page.locator(".menu__pdf-preview iframe");
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

    await page.locator(".menu__pdf-preview button").click();

    await expect(page.locator(".menu__pdf-preview")).toHaveCount(0);
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
