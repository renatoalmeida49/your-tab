import type { Page } from "@playwright/test";
import { test, expect, addFromMenu } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

function preview(page: Page) {
  return page.locator(".export__preview iframe");
}

function note(page: Page) {
  return page.locator(".export__note");
}

// UM POUCO MAIS QUE UMA FOLHA EM 100%
async function longSong(page: Page) {
  await addFromMenu(page, "textField");

  for (let line = 0; line < 40; line++) {
    await page.keyboard.type(`Linha ${line}`);
    await page.keyboard.press("Enter");
  }
}

// ESPERA UMA PRÉVIA DIFERENTE DE `previous` E CONTA AS PÁGINAS DO PDF
async function nextPdf(page: Page, previous: string | null = null) {
  await expect(preview(page)).toHaveAttribute("src", /^blob:/, {
    timeout: 15000,
  });
  await expect(preview(page)).not.toHaveAttribute("src", previous ?? "", {
    timeout: 15000,
  });

  const src = (await preview(page).getAttribute("src")) as string;
  const pages = await preview(page).evaluate(async (iframe) => {
    const pdf = await (await fetch((iframe as HTMLIFrameElement).src)).text();

    return pdf.match(/\/Type \/Page\b(?!s)/g)?.length ?? 0;
  });

  return { src, pages };
}

test.describe("tamanho do PDF", () => {
  test("ajustar a uma página reduz a música para uma folha", async ({
    page,
  }) => {
    await longSong(page);
    await page.locator(".app-bar__export").click();

    const normal = await nextPdf(page);
    expect(normal.pages).toBe(2);
    await expect(note(page)).toContainText("mais de uma folha");

    await page.locator(".export__fit input").check();

    const fitted = await nextPdf(page, normal.src);
    expect(fitted.pages).toBe(1);
    await expect(note(page)).toContainText(/Reduzido para \d+%/);
  });

  test("trocar o tamanho do texto gera o PDF de novo", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("Curta");
    await page.locator(".app-bar__export").click();

    const medium = await nextPdf(page);
    expect(medium.pages).toBe(1);
    await expect(note(page)).toHaveCount(0);

    await page.locator(".export__size", { hasText: "G" }).click();
    await expect(page.getByRole("radio", { name: "Grande" })).toBeChecked();

    const large = await nextPdf(page, medium.src);
    expect(large.pages).toBe(1);
  });

  test("as opções ficam para a próxima exportação", async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.locator(".app-bar__export").click();
    await page.locator(".export__size", { hasText: "P" }).click();
    await page.locator(".export__fit input").check();
    await page.keyboard.press("Escape");

    await page.locator(".app-bar__export").click();
    await expect(page.getByRole("radio", { name: "Pequeno" })).toBeChecked();
    await expect(page.locator(".export__fit input")).toBeChecked();
  });
});
