import { test, expect } from "./helpers";
import type { FakeApi } from "./fake-api";
import type { Page } from "@playwright/test";

function song(title: string, chords: string, lines = 3) {
  return {
    title,
    artist: `Artista ${title}`,
    instrument: "guitar",
    tuning: ["e", "B", "G", "D", "A", "E"],
    tone: chords.split(" ")[0],
    parts: [
      { id: "p1", type: "verse", info: { chords } },
      ...Array.from({ length: lines }, (_, line) => ({
        id: `t${line}`,
        type: "textField",
        info: { text: `${title} linha ${line}` },
      })),
    ],
  };
}

// TRÊS MÚSICAS NA PLAYLIST "Show", NESSA ORDEM
function setup(api: FakeApi) {
  api.signIn();
  const first = api.addCipher(song("Primeira", "C G", 60));
  const second = api.addCipher(song("Segunda", "D A"));
  const third = api.addCipher(song("Terceira", "E B"));

  api.addPlaylist("Outra", [third.id]);
  api.addPlaylist("Show", [first.id, second.id, third.id]);

  return { first, second, third };
}

async function openPlaylists(page: Page): Promise<void> {
  await page.locator(".account-menu__trigger").click();
  await page.locator(".account-menu__library").click();
  await page.locator(".library__tab-playlists").click();
}

function playlistSection(page: Page, name: string) {
  return page.locator(".library__playlist").filter({ hasText: name });
}

test.describe("palco com playlist", () => {
  test.beforeEach(async ({ page, api }) => {
    setup(api);
    await page.goto("/");
  });

  test("toca a playlist do acervo e navega sem sair do palco", async ({
    page,
  }) => {
    await openPlaylists(page);
    await playlistSection(page, "Show")
      .locator(".library__play-playlist")
      .click();

    const stage = page.locator(".stage");
    await expect(stage.locator("h1")).toHaveText("Primeira");
    await expect(stage.locator(".stage__progress")).toContainText("Show");
    await expect(stage.locator(".stage__position")).toHaveText("1 de 3");
    await expect(stage.locator(".stage__previous")).toBeDisabled();

    // BOTÃO ⏭
    await stage.locator(".stage__next").click();
    await expect(stage.locator("h1")).toHaveText("Segunda");
    await expect(stage.locator(".stage__chords")).toHaveText("D A");

    // TECLA → (PEDAL)
    await page.keyboard.press("ArrowRight");
    await expect(stage.locator("h1")).toHaveText("Terceira");
    await expect(stage.locator(".stage__next")).toBeDisabled();
    await expect(stage.locator(".stage__end")).toHaveText("Fim da playlist");

    // TECLA ← E CARD "PRÓXIMA" NO FIM DA MÚSICA
    await page.keyboard.press("ArrowLeft");
    await expect(stage.locator("h1")).toHaveText("Segunda");
    await stage.locator(".stage__up-next").click();
    await expect(stage.locator("h1")).toHaveText("Terceira");

    // O EDITOR NÃO FOI TOCADO; O BOTÃO DO PALCO VOLTA A MOSTRAR A MÚSICA DELE
    await page.keyboard.press("Escape");
    await expect(stage).toHaveCount(0);
    await expect(page.locator(".tab-header__title")).toHaveText("");

    await page.locator(".app-bar__stage").click();
    await expect(stage.locator("h1")).toHaveText("Sem título");
    await expect(stage.locator(".stage__progress")).toHaveCount(0);
    await expect(stage.locator(".stage__next")).toHaveCount(0);
  });

  test("▶ numa música começa a playlist por ela", async ({ page }) => {
    await openPlaylists(page);
    await playlistSection(page, "Show")
      .locator(".library__play-from")
      .nth(1)
      .click();

    await expect(page.locator(".stage h1")).toHaveText("Segunda");
    await expect(page.locator(".stage__position")).toHaveText("2 de 3");
  });

  test("trocar de música volta ao topo e para a rolagem", async ({ page }) => {
    await openPlaylists(page);
    await playlistSection(page, "Show")
      .locator(".library__play-playlist")
      .click();

    const stage = page.locator(".stage");
    const scrollTop = () => stage.evaluate((element) => element.scrollTop);

    await expect(stage.locator("h1")).toHaveText("Primeira");
    await page.keyboard.press(" ");
    await expect.poll(scrollTop).toBeGreaterThan(10);

    await page.keyboard.press("ArrowRight");
    await expect(stage.locator("h1")).toHaveText("Segunda");
    await expect.poll(scrollTop).toBe(0);
    await expect(stage.locator(".stage__play")).toHaveAttribute(
      "aria-label",
      /Rolar automaticamente/
    );
  });

  test("o tom muda só no palco, por música, sem salvar nada", async ({
    page,
    api,
  }) => {
    await openPlaylists(page);
    await playlistSection(page, "Show")
      .locator(".library__play-playlist")
      .click();

    const stage = page.locator(".stage");
    await stage.getByRole("button", { name: /meio tom acima/ }).click();

    await expect(stage.locator(".stage__chords")).toHaveText("C# G#");
    await expect(stage.locator(".stage__meta-tone")).toHaveText("C#");
    await expect(stage.locator(".stage__shift")).toHaveText("(+1)");

    // A PRÓXIMA ESTÁ NO TOM ORIGINAL; VOLTANDO, A PRIMEIRA CONTINUA +1
    await page.keyboard.press("ArrowRight");
    await expect(stage.locator(".stage__chords")).toHaveText("D A");
    await expect(stage.locator(".stage__shift")).toHaveCount(0);
    await page.keyboard.press("ArrowLeft");
    await expect(stage.locator(".stage__chords")).toHaveText("C# G#");

    expect(api.writes).toEqual([]);
  });

  test("a lista do palco pula para uma música ou troca de playlist", async ({
    page,
  }) => {
    await openPlaylists(page);
    await playlistSection(page, "Show")
      .locator(".library__play-playlist")
      .click();

    const stage = page.locator(".stage");
    await expect(stage.locator("h1")).toHaveText("Primeira");

    await stage.locator(".stage__setlist-button").click();
    const setlist = stage.locator(".stage__setlist");
    await expect(setlist.locator(".stage__track--current")).toContainText(
      "Primeira"
    );

    await setlist.locator(".stage__track").nth(2).click();
    await expect(setlist).toHaveCount(0);
    await expect(stage.locator("h1")).toHaveText("Terceira");

    // A PLAYLIST QUE ESTÁ TOCANDO NÃO APARECE EM "OUTRAS"
    await stage.locator(".stage__setlist-button").click();
    await expect(setlist.locator(".stage__playlist")).toHaveCount(1);
    await setlist
      .locator(".stage__playlist")
      .filter({ hasText: "Outra" })
      .click();

    await expect(stage.locator(".stage__progress")).toContainText("Outra");
    await expect(stage.locator(".stage__position")).toHaveText("1 de 1");
  });

  test("Esc fecha primeiro a lista, depois o palco", async ({ page }) => {
    await page.locator(".app-bar__stage").click();
    await page.locator(".stage__setlist-button").click();
    await expect(page.locator(".stage__setlist")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".stage__setlist")).toHaveCount(0);
    await expect(page.locator(".stage")).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.locator(".stage")).toHaveCount(0);
  });

  test("do palco da música do editor dá para carregar uma playlist", async ({
    page,
  }) => {
    await page.locator(".app-bar__stage").click();
    await page.locator(".stage__setlist-button").click();

    await page.locator(".stage__playlist").filter({ hasText: "Show" }).click();

    await expect(page.locator(".stage h1")).toHaveText("Primeira");
    await expect(page.locator(".stage__position")).toHaveText("1 de 3");
  });

  test("a paleta de comandos toca uma playlist", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await page.locator(".palette__input").fill("tocar show");
    await page.keyboard.press("Enter");

    await expect(page.locator(".stage h1")).toHaveText("Primeira");
    await expect(page.locator(".stage__progress")).toContainText("Show");
  });
});

test("cifra excluída sai da fila; o resto da playlist toca", async ({
  page,
  api,
}) => {
  const { second } = setup(api);

  api.ciphers = api.ciphers.filter((cipher) => cipher.id != second.id);
  api.expectedStatuses.push(404);
  await page.goto("/");

  await openPlaylists(page);
  await playlistSection(page, "Show")
    .locator(".library__play-playlist")
    .click();

  await expect(page.locator(".stage__position")).toHaveText("1 de 2");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(".stage h1")).toHaveText("Terceira");
});

test("visitante: a lista do palco pede login para tocar playlists", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".app-bar__stage").click();
  await page.locator(".stage__setlist-button").click();

  await expect(page.locator(".stage__hint")).toHaveText(
    "Entre com sua conta para tocar suas playlists."
  );
});

test.describe("no celular (375px)", () => {
  test.use({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });

  test("a barra tem lista, ⏮ ▶ ⏭ e o ⋯ abre os ajustes", async ({
    page,
    api,
  }) => {
    setup(api);
    await page.goto("/");
    await openPlaylists(page);
    await playlistSection(page, "Show")
      .locator(".library__play-playlist")
      .tap();

    const stage = page.locator(".stage");
    await expect(stage.locator("h1")).toHaveText("Primeira");

    const controls = await stage.locator(".stage__controls").boundingBox();
    expect(controls!.x).toBeGreaterThanOrEqual(0);
    expect(controls!.x + controls!.width).toBeLessThanOrEqual(375);

    await expect(stage.locator(".stage__bigger")).toBeHidden();
    await stage.locator(".stage__more").tap();
    await expect(stage.locator(".stage__bigger")).toBeVisible();

    const settings = await stage.locator(".stage__settings").boundingBox();
    expect(settings!.x).toBeGreaterThanOrEqual(0);
    expect(settings!.x + settings!.width).toBeLessThanOrEqual(375);

    await stage.locator(".stage__next").tap();
    await expect(stage.locator("h1")).toHaveText("Segunda");
    // TROCAR DE MÚSICA FECHA O PAINEL DE AJUSTES
    await expect(stage.locator(".stage__bigger")).toBeHidden();
  });
});
