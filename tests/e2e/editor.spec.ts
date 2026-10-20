import type { Page } from "@playwright/test";
import {
  test,
  expect,
  addFromMenu,
  placeCaret,
  songParts,
  tabLines,
  textFields,
} from "./helpers";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// LINHA E COLUNA DO CURSOR DENTRO DA TAB FOCADA
function caretInTab(page: Page) {
  return page.evaluate(() => {
    const pre = document.activeElement?.querySelector("pre") as HTMLPreElement;
    const range = (window.getSelection() as Selection).getRangeAt(0);
    const before = document.createRange();

    before.selectNodeContents(pre);
    before.setEnd(range.startContainer, range.startOffset);

    const rows = before.toString().split("\n");

    return { line: rows.length - 1, column: rows[rows.length - 1].length };
  });
}

test.describe("tab: edição por cima dos traços", () => {
  test.beforeEach(async ({ page }) => {
    await addFromMenu(page, "tab");
  });

  test("digitar uma nota troca o traço, sem desalinhar as cordas", async ({
    page,
  }) => {
    const before = await tabLines(page);

    await placeCaret(page, 1, 4);
    await page.keyboard.type("3");

    const after = await tabLines(page);
    expect(after[1]).toBe("B|--3" + "-".repeat(38));
    expect(after.map((row) => row.length)).toEqual(
      before.map((row) => row.length)
    );
  });

  test("Backspace volta o traço no lugar da nota", async ({ page }) => {
    await placeCaret(page, 0, 2);
    await page.keyboard.type("12");
    await page.keyboard.press("Backspace");

    expect((await tabLines(page))[0]).toBe("e|1" + "-".repeat(40));
  });

  test("digitar no rótulo escreve na primeira coluna da corda", async ({
    page,
  }) => {
    await placeCaret(page, 2, 0);
    await page.keyboard.type("7");

    expect((await tabLines(page))[2]).toBe("G|7" + "-".repeat(40));
  });

  test("passar do fim estende todas as cordas juntas", async ({ page }) => {
    const width = (await tabLines(page))[0].length;

    await placeCaret(page, 5, width);
    await page.keyboard.type("5");

    const after = await tabLines(page);
    expect(after[5].endsWith("5")).toBe(true);
    expect(new Set(after.map((row) => row.length))).toEqual(
      new Set([width + 1])
    );
  });

  test("apagar tudo limpa as notas e mantém os rótulos", async ({ page }) => {
    await placeCaret(page, 0, 2);
    await page.keyboard.type("3");
    await placeCaret(page, 3, 5);
    await page.keyboard.type("5");

    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Backspace");

    const rows = await tabLines(page);
    expect(rows.map((row) => row.slice(0, 2))).toEqual([
      "e|",
      "B|",
      "G|",
      "D|",
      "A|",
      "E|",
    ]);
    expect(rows.every((row) => /^.\|-+$/.test(row))).toBe(true);
  });

  test("colar várias linhas escreve uma por corda", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => navigator.clipboard.writeText("0-\n-1\n2-"));

    await placeCaret(page, 0, 2);
    await page.keyboard.press("ControlOrMeta+v");

    const rows = await tabLines(page);
    expect(rows.slice(0, 3).map((row) => row.slice(0, 4))).toEqual([
      "e|0-",
      "B|-1",
      "G|2-",
    ]);
    expect(new Set(rows.map((row) => row.length)).size).toBe(1);
  });

  test("Enter cria um campo de texto abaixo da tab", async ({ page }) => {
    await placeCaret(page, 0, 2);
    await page.keyboard.press("Enter");

    expect(await songParts(page)).toEqual(["tab", "text:"]);
    await expect(textFields(page).first()).toBeFocused();
  });

  test("nota editada sobrevive ao reload", async ({ page }) => {
    await placeCaret(page, 4, 3);
    await page.keyboard.type("10");
    await page.reload();

    expect((await tabLines(page))[4]).toBe("A|-10" + "-".repeat(38));
  });
});

test.describe("verso: acordes alinhados com a letra", () => {
  test("cada coluna do acorde fica sobre a mesma coluna da letra", async ({
    page,
  }) => {
    await addFromMenu(page, "verse");
    await page.locator(".verse__input").click();
    await page.keyboard.type("Am      G");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Quando tá escuro e");

    // MEDE COM O VERSO FOCADO E SEM FOCO (A BORDA DE FOCO NÃO PODE EMPURRAR)
    for (const focus of [".verse__input", ".text-field__input"]) {
      await page.locator(focus).click();

      const [chordX, lyricX] = await page.evaluate(() => {
        const xOf = (element: Element, column: number) => {
          const range = document.createRange();
          const text = element.firstChild as Text;
          range.setStart(text, column);
          range.setEnd(text, column + 1);
          return range.getBoundingClientRect().left;
        };

        return [
          xOf(document.querySelector(".verse__input") as Element, 8),
          xOf(document.querySelector(".text-field__input") as Element, 8),
        ];
      });

      expect(Math.abs(chordX - lyricX)).toBeLessThan(0.5);
    }
  });
});

test.describe("setas entre partes", () => {
  test.beforeEach(async ({ page }) => {
    await addFromMenu(page, "textField");
    await page.keyboard.type("intro");
    await addFromMenu(page, "verse");
    await addFromMenu(page, "tab");
    await addFromMenu(page, "textField");
    await page.keyboard.type("fim da linha");
  });

  test("descem e sobem passando por verso e tab", async ({ page }) => {
    const intro = textFields(page).first();
    const last = textFields(page).nth(1);

    await intro.click();
    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".verse__input")).toBeFocused();

    await page.keyboard.press("ArrowDown");
    await expect(page.locator(".tab")).toBeFocused();
    expect((await caretInTab(page)).line).toBe(0);

    // DENTRO DA TAB AS SETAS ANDAM PELAS CORDAS; NA ÚLTIMA, SAEM DA TAB
    for (let line = 1; line <= 5; line++) {
      await page.keyboard.press("ArrowDown");
      expect((await caretInTab(page)).line).toBe(line);
    }

    await page.keyboard.press("ArrowDown");
    await expect(last).toBeFocused();

    await page.keyboard.press("ArrowUp");
    await expect(page.locator(".tab")).toBeFocused();
    expect((await caretInTab(page)).line).toBe(5);
  });

  test("a coluna do cursor é mantida ao entrar na tab", async ({ page }) => {
    await page.locator(".verse__input").click();
    await page.keyboard.type("Am      G");
    await page.keyboard.press("Home");
    for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");

    await page.keyboard.press("ArrowDown");

    expect(await caretInTab(page)).toEqual({ line: 0, column: 6 });
  });
});
