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
