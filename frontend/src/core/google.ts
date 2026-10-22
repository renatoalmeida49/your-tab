// GOOGLE IDENTITY SERVICES: O BOTÃO "ENTRAR COM O GOOGLE". O SCRIPT SÓ É
// CARREGADO QUANDO O LOGIN É ABERTO, NÃO EM TODA VISITA

const SCRIPT_URL = "https://accounts.google.com/gsi/client";

interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(element: HTMLElement, options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let loading: Promise<GoogleIdentity> | null = null;

function loadScript(): Promise<GoogleIdentity> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () =>
      window.google
        ? resolve(window.google.accounts.id)
        : reject(new Error("Google Identity indisponível"));
    script.onerror = () => {
      // DEIXA TENTAR DE NOVO NA PRÓXIMA ABERTURA
      script.remove();
      loading = null;
      reject(new Error("Falha ao carregar o login do Google"));
    };

    document.head.append(script);
  });
}

// DESENHA O BOTÃO EM `element`. `onCredential` RECEBE O ID TOKEN, QUE A API
// TROCA PELA SESSÃO
export async function renderGoogleButton(payload: {
  element: HTMLElement;
  clientId: string;
  locale: string;
  theme: "light" | "dark";
  onCredential: (credential: string) => void;
}): Promise<void> {
  loading ??= loadScript();

  const identity = await loading;

  identity.initialize({
    client_id: payload.clientId,
    callback: ({ credential }) => payload.onCredential(credential),
  });
  identity.renderButton(payload.element, {
    type: "standard",
    theme: payload.theme == "dark" ? "filled_black" : "outline",
    size: "large",
    shape: "pill",
    text: "signin_with",
    locale: payload.locale,
  });
}
