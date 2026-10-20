/// <reference types="vite/client" />

// html2pdf.js NÃO PUBLICA TIPOS: SÓ O QUE O core/pdf.ts USA
declare module "html2pdf.js" {
  interface Html2Pdf {
    set(options: Record<string, unknown>): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    from(canvas: HTMLCanvasElement, type: "canvas"): Html2Pdf;
    output(type: "blob"): Promise<Blob>;
  }

  export default function html2pdf(): Html2Pdf;
}
