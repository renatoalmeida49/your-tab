import { test as base, expect } from "@playwright/test";

// FALHA O TESTE SE HOUVER ERRO NO CONSOLE OU WARNING DO VUE/VUE-I18N,
// INCLUINDO MUTAÇÕES FORA DE MUTATION (STORE EM STRICT MODE NO DEV)
const frameworkWarning = /^\[(Vue warn|intlify)\]/;

export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];

    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      const isError = message.type() == "error";
      const isWarning =
        message.type() == "warning" && frameworkWarning.test(message.text());

      if (isError || isWarning) errors.push(message.text());
    });

    await use(page);

    expect(errors).toEqual([]);
  },
});

export { expect };

// RESUMO DA MÚSICA NA TELA: "text:<conteúdo>", "tab" OU "verse"
export function songParts(page) {
  return page.locator("#song .song-content").evaluateAll((parts) =>
    parts.map((part) => {
      const textField = part.querySelector(".text-field__input");

      if (textField) return `text:${textField.innerText}`;
      if (part.querySelector(".tab")) return "tab";
      if (part.querySelector(".verse")) return "verse";

      return "?";
    })
  );
}

export function textFields(page) {
  return page.locator(".text-field__input");
}

export function partSelect(page) {
  return page.locator(".text-field__select.show");
}

export function tuningLabel(page) {
  return page.locator(".tab-header__tuning");
}

export async function addFromMenu(page, part) {
  const position = { tab: 1, textField: 2, verse: 3 }[part];

  await page
    .locator(`.menu__buttons-song button:nth-child(${position})`)
    .click();
}

export async function paste(locator, text) {
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

export function tabLines(page, index = 0) {
  return page
    .locator(".tab pre")
    .nth(index)
    .evaluate((pre) => pre.innerText.split("\n"));
}

// POSICIONA O CURSOR NA CORDA `line`, COLUNA `column` DA TAB
export async function placeCaret(page, line, column, index = 0) {
  await page
    .locator(".tab")
    .nth(index)
    .evaluate(
      (tab, [line, column]) => {
        const pre = tab.querySelector("pre");
        const rows = pre.textContent.split("\n");
        const offset =
          rows
            .slice(0, line)
            .reduce((total, row) => total + row.length + 1, 0) + column;
        const range = document.createRange();

        tab.focus();
        range.setStart(pre.firstChild, offset);
        range.collapse(true);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
      },
      [line, column]
    );
}
