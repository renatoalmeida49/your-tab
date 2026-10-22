import { OAuth2Client } from "google-auth-library";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}

// RECEBE O ID TOKEN ("credential") QUE O GOOGLE ENTREGA AO FRONTEND NO LOGIN
// E DEVOLVE O PERFIL. LANÇA ERRO SE O TOKEN FOR INVÁLIDO OU DE OUTRO CLIENT ID
export type VerifyGoogleToken = (credential: string) => Promise<GoogleProfile>;

export function googleVerifier(clientId: string): VerifyGoogleToken {
  const client = new OAuth2Client(clientId);

  return async (credential) => {
    if (!clientId) throw new Error("GOOGLE_CLIENT_ID não configurado");

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new Error("Conta Google sem e-mail verificado");
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name ?? payload.email,
      picture: payload.picture,
    };
  };
}
