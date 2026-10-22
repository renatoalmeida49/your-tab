// BAIXAR E ESCOLHER ARQUIVOS NO NAVEGADOR

export function downloadText(content: string, name: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" })
  );
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  link.click();

  // O NAVEGADOR JÁ COPIOU O ARQUIVO NO click: A URL PODE SAIR
  setTimeout(() => URL.revokeObjectURL(url));
}

// ABRE O SELETOR DE ARQUIVOS. CANCELAR DEVOLVE LISTA VAZIA
export function pickFiles(options: {
  accept: string;
  multiple?: boolean;
}): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = options.accept;
    input.multiple = !!options.multiple;
    input.hidden = true;

    const done = () => {
      resolve(Array.from(input.files ?? []));
      input.remove();
    };

    input.addEventListener("change", done, { once: true });
    input.addEventListener("cancel", done, { once: true });

    // NO DOCUMENTO: ALGUNS NAVEGADORES IGNORAM O click EM INPUT SOLTO
    document.body.append(input);
    input.click();
  });
}
