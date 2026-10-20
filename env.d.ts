/// <reference types="vite/client" />

// html2pdf.js NÃO PUBLICA TIPOS: SÓ O QUE O MENU USA
declare module "html2pdf.js" {
  interface Html2Pdf {
    set(options: Record<string, unknown>): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    output(type: "bloburl"): Promise<string>;
  }

  export default function html2pdf(): Html2Pdf;
}
