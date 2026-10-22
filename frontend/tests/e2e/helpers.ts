import {
  test as base,
  expect,
  type Locator,
  type Page,
} from "@playwright/test";
import { FakeApi } from "./fake-api";

// FALHA O TESTE SE HOUVER ERRO NO CONSOLE OU WARNING DO VUE/VUE-I18N
const frameworkWarning = /^\[(Vue warn|intlify)\]/;

// O SCRIPT DE ANÚNCIOS (index.html) LOGA ERROS QUE NÃO SÃO DO APP E VARIAM
// A CADA EXECUÇÃO (EX: CSP DE IFRAMES DO GOOGLE)
const thirdParty = /googlesyndication|doubleclick|google\.com/;

// api: A API FALSA JÁ INSTALADA NA PÁGINA (VISITANTE). CONFIGURE ANTES DO goto
export const test = base.extend<{ api: FakeApi }>({
  // O PLAYWRIGHT EXIGE A DESESTRUTURAÇÃO, MESMO SEM USAR NENHUM FIXTURE
  // eslint-disable-next-line no-empty-pattern
  api: async ({}, use) => {
    await use(new FakeApi());
  },

  page: async ({ page, api }, use) => {
    const errors: string[] = [];

    await api.install(page);

    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      const isError = message.type() == "error";
      const isWarning =
        message.type() == "warning" && frameworkWarning.test(message.text());

      const isThirdParty =
        thirdParty.test(message.location().url) ||
        thirdParty.test(message.text());

      const status = /status of (\d+)/.exec(message.text())?.[1];
      const isExpected = api.expectedStatuses.includes(Number(status));

      if ((isError || isWarning) && !isThirdParty && !isExpected) {
        errors.push(message.text());
      }
    });

    await use(page);

    expect(errors).toEqual([]);
  },
});

export { expect };

export type MenuPart = "tab" | "textField" | "verse";

// RESUMO DA MÚSICA NA TELA: "text:<conteúdo>", "tab" OU "verse"
export function songParts(page: Page): Promise<string[]> {
  return page.locator("#song .song-content").evaluateAll((parts) =>
    parts.map((part) => {
      const textField = part.querySelector<HTMLElement>(".text-field__input");

      if (textField) return `text:${textField.innerText}`;
      if (part.querySelector(".tab")) return "tab";
      if (part.querySelector(".verse")) return "verse";

      return "?";
    })
  );
}

export function textFields(page: Page): Locator {
  return page.locator(".text-field__input");
}

export function partSelect(page: Page): Locator {
  return page.locator(".text-field__select.show");
}

export function tuningLabel(page: Page): Locator {
  return page.locator(".tab-header__tuning");
}

export async function addFromMenu(page: Page, part: MenuPart): Promise<void> {
  await page.locator(`.app-bar__add-${part}`).click();
}

export async function chooseLanguage(
  page: Page,
  name: "English" | "Português (Brasil)"
): Promise<void> {
  await page.locator(".language-menu__trigger").click();
  await page.locator(".language-menu__item", { hasText: name }).click();
}

// RESPONDE O DIÁLOGO DE CONFIRMAÇÃO DO APP (NÃO O window.confirm)
export async function answerConfirm(page: Page, accept: boolean) {
  const button = accept ? ".confirm__accept" : ".confirm__cancel";

  await page.locator(button).click();
  await expect(page.locator(".confirm")).toHaveCount(0);
}

export async function paste(locator: Locator, text: string): Promise<void> {
  await locator.evaluate((element, content) => {
    const data = new DataTransfer();
    data.setData("text", content);

    element.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })
    );
  }, text);
}

export function tabLines(page: Page, index = 0): Promise<string[]> {
  return page
    .locator(".tab pre")
    .nth(index)
    .evaluate((pre) => (pre as HTMLElement).innerText.split("\n"));
}

// POSICIONA O CURSOR NA CORDA `line`, COLUNA `column` DA TAB
export async function placeCaret(
  page: Page,
  line: number,
  column: number,
  index = 0
): Promise<void> {
  await page
    .locator(".tab")
    .nth(index)
    .evaluate(
      (tab, [line, column]) => {
        const pre = tab.querySelector("pre") as HTMLPreElement;
        const text = pre.firstChild as Text;
        const rows = (pre.textContent ?? "").split("\n");
        const offset =
          rows
            .slice(0, line)
            .reduce((total, row) => total + row.length + 1, 0) + column;
        const range = document.createRange();
        const selection = window.getSelection() as Selection;

        (tab as HTMLElement).focus();
        range.setStart(text, offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      },
      [line, column]
    );
}
