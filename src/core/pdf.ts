// GERA O PDF A PARTIR DE UMA CÓPIA DA FOLHA DO EDITOR: O QUE SE VÊ NA TELA É
// O QUE SAI NO PDF, SEM OS CONTROLES (data-pdf-hide) E SEMPRE NO TEMA CLARO

const pdfOptions = {
  margin: 0,
  image: { type: "jpeg", quality: 0.98 },
  enableLinks: false,
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
  // NÃO CORTA UMA PARTE DA MÚSICA ENTRE DUAS PÁGINAS
  pagebreak: { mode: ["avoid-all"] },
};

// O QUE SÓ EXISTE PARA EDITAR: BOTÕES, MENUS E ÁREAS DE CLIQUE
const EDITOR_ONLY = "[data-pdf-hide], .home__tail, .empty-state";

export function printableCopy(sheet: HTMLElement): HTMLElement {
  const copy = sheet.cloneNode(true) as HTMLElement;

  // O html2pdf CLONA SÓ ESTE ELEMENTO: TEMA E AJUSTES FICAM NELE, NÃO NO PAI
  copy.removeAttribute("id");
  copy.classList.add("pdf-export");
  copy.dataset.theme = "light";
  copy.querySelectorAll(EDITOR_ONLY).forEach((element) => element.remove());

  // CAMPO VAZIO NÃO IMPRIME O PLACEHOLDER ("Título da música")
  copy.querySelectorAll("[contenteditable]").forEach((element) => {
    element.removeAttribute("contenteditable");
    element.removeAttribute("placeholder");
  });

  return copy;
}

export async function sheetToPdf(sheet: HTMLElement): Promise<Blob> {
  const host = document.createElement("div");
  const copy = printableCopy(sheet);

  host.className = "pdf-export-host";
  host.append(copy);
  document.body.append(host);

  try {
    await document.fonts.ready;

    // CARREGA SÓ AO EXPORTAR: html2pdf.js (html2canvas + jsPDF) É PESADO
    const { default: html2pdf } = await import("html2pdf.js");

    return await html2pdf().set(pdfOptions).from(copy).output("blob");
  } finally {
    host.remove();
  }
}

// "Zombie - The Cranberries" -> NOME DE ARQUIVO VÁLIDO EM QUALQUER SISTEMA
export function pdfFileName(title: string, artist: string): string {
  const name = [title, artist]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" - ")
    .replace(/[\\/:*?"<>|]+/g, "")
    .trim();

  return name || "tab";
}
