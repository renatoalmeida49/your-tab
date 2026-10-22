import { buildApp } from "./app.js";
import { googleVerifier } from "./auth/google.js";
import { loadConfig } from "./config.js";
import { connect } from "./db.js";

const config = loadConfig();
const { client, db } = await connect(config.MONGO_URL, config.MONGO_DB);

const app = await buildApp({
  db,
  verifyGoogleToken: googleVerifier(config.GOOGLE_CLIENT_ID),
  googleClientId: config.GOOGLE_CLIENT_ID,
  jwtSecret: config.JWT_SECRET,
  corsOrigin: config.CORS_ORIGIN,
  // EM PRODUÇÃO O SITE É SERVIDO EM HTTPS, E O COOKIE SÓ VIAJA POR HTTPS
  secureCookie: config.NODE_ENV === "production",
  logger: true,
});

app.addHook("onClose", () => client.close());

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => void app.close());
}

await app.listen({ port: config.PORT, host: "0.0.0.0" });
