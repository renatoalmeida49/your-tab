// GERA O PDF A PARTIR DE UMA CÓPIA DA FOLHA DO EDITOR: O QUE SE VÊ NA TELA É
// O QUE SAI NO PDF, SEM OS CONTROLES (data-pdf-hide) E SEMPRE NO TEMA CLARO

// O html2pdf SÓ FATIA A IMAGEM EM PÁGINAS. A IMAGEM É NOSSA (html2canvas
// DIRETO NA CÓPIA): ELE CAPTURARIA UM CONTÊINER DA LARGURA DO A4, CORTANDO A
// CÓPIA ALARGADA PELA ESCALA. PELO MESMO MOTIVO AS QUEBRAS SÃO NOSSAS
const canvasOptions = { scale: 2, useCORS: true };

const pdfOptions = {
  margin: 0,
  image: { type: "jpeg", quality: 0.98 },
  enableLinks: false,
  jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
};

// TAMANHO DO TEXTO NO PDF, EM RELAÇÃO À TELA
export const PDF_SIZES = { small: 0.85, medium: 1, large: 1.15 } as const;
export type PdfSize = keyof typeof PDF_SIZES;

// "AJUSTAR A UMA PÁGINA" NÃO ENCOLHE ALÉM DISTO: O TEXTO FICARIA ILEGÍVEL
export const MIN_SCALE = 0.7;
const SCALE_STEP = 0.05;

// LARGURA DA FOLHA NO EDITOR E PROPORÇÃO DO A4 (ALTURA / LARGURA)
const SHEET_WIDTH = 800;
const PAGE_RATIO = 297 / 210;

export interface PdfOptions {
  size: PdfSize;
  fitToPage: boolean;
}

export interface PdfResult {
  pdf: Blob;
  // ESCALA USADA DE FATO (MENOR QUE A DO TAMANHO SE FOI AJUSTADA À PÁGINA)
  scale: number;
  onePage: boolean;
}

// ESCALAS A TENTAR, DA MAIOR PARA A MENOR: 1 -> 1, 0.95, ..., 0.7
export function scaleSteps(scale: number): number[] {
  const steps = [scale];

  while (steps[steps.length - 1] - SCALE_STEP >= MIN_SCALE - 1e-9) {
    const next = steps[steps.length - 1] - SCALE_STEP;
    steps.push(Math.round(next * 100) / 100);
  }

  return steps;
}

// BLOCOS QUE NÃO PODEM SER CORTADOS ENTRE DUAS PÁGINAS
const UNBREAKABLE = ".tab-header, .song-content";

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

// O html2pdf ENCOLHE A CÓPIA PARA A LARGURA DA PÁGINA. CÓPIA 1/x MAIS LARGA
// SAI x VEZES O TAMANHO DA TELA: TEXTO E MARGENS JUNTOS, COMO UM ZOOM
function applyScale(host: HTMLElement, copy: HTMLElement, scale: number) {
  const width = `${SHEET_WIDTH / scale}px`;

  host.style.width = width;
  copy.style.width = width;
}

function pageHeight(copy: HTMLElement): number {
  return copy.offsetWidth * PAGE_RATIO;
}

function fitsOnePage(copy: HTMLElement): boolean {
  return copy.offsetHeight <= pageHeight(copy);
}

// BLOCO QUE CAIRIA NA DIVISA DE DUAS PÁGINAS DESCE PARA A SEGUINTE, COM A
// MESMA MARGEM DO TOPO DA PRIMEIRA. EM ORDEM: CADA EMPURRÃO MOVE OS DE BAIXO
function avoidPageBreaks(copy: HTMLElement) {
  const height = pageHeight(copy);
  const gap = parseFloat(getComputedStyle(copy).paddingTop) || 0;

  copy.querySelectorAll<HTMLElement>(UNBREAKABLE).forEach((block) => {
    const origin = copy.getBoundingClientRect().top;
    const rect = block.getBoundingClientRect();
    const top = rect.top - origin;
    const page = Math.floor(top / height);
    const nextPage = (page + 1) * height;

    // MAIOR QUE UMA PÁGINA: SERÁ CORTADO DE QUALQUER JEITO
    if (rect.bottom - origin <= nextPage || rect.height + gap > height) return;

    const margin = parseFloat(getComputedStyle(block).marginTop) || 0;
    block.style.marginTop = `${margin + nextPage - top + gap}px`;
  });
}

export async function sheetToPdf(
  sheet: HTMLElement,
  options: PdfOptions
): Promise<PdfResult> {
  const host = document.createElement("div");
  const copy = printableCopy(sheet);
  const steps = scaleSteps(PDF_SIZES[options.size]);
  let scale = steps[0];

  host.className = "pdf-export-host";
  host.append(copy);
  document.body.append(host);

  try {
    await document.fonts.ready;

    // MAIS LARGA, A LETRA QUEBRA MENOS: MEDE DE NOVO A CADA ESCALA
    applyScale(host, copy, scale);

    if (options.fitToPage) {
      for (scale of steps) {
        applyScale(host, copy, scale);
        if (fitsOnePage(copy)) break;
      }
    }

    const onePage = fitsOnePage(copy);
    avoidPageBreaks(copy);

    // CARREGA SÓ AO EXPORTAR: html2canvas E html2pdf.js (jsPDF) SÃO PESADOS
    const [{ default: html2canvas }, { default: html2pdf }] = await Promise.all(
      [import("html2canvas"), import("html2pdf.js")]
    );
    const canvas = await html2canvas(copy, canvasOptions);
    const pdf = await html2pdf()
      .set(pdfOptions)
      .from(canvas, "canvas")
      .output("blob");

    return { pdf, scale, onePage };
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
