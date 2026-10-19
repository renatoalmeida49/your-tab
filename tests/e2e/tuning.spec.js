import { test, expect } from "@playwright/test";
import { addFromMenu, tuningLabel } from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.locator("#changeTuningBtn").click();
});

function openInstrument(page, name) {
  return page.locator(".tunning__menu li", { hasText: name }).click();
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
  await openInstrument(page, "Ukelele");
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
