import "dotenv/config";

export const ENV = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  // Banco
  databaseUrl: process.env.DATABASE_URL ?? "",

  // App / Auth
  appId: process.env.APP_ID ?? "catalogo",
  appSecret: process.env.APP_SECRET ?? "",
  oauthServerUrl: process.env.OAUTH_SERVER_URL ?? "",

  // Flag pra permitir devLogin em prod controlado
  allowDevLogin:
    process.env.ALLOW_DEV_LOGIN === "true" ||
    process.env.ALLOW_DEV_LOGIN === "1",
};

if (!ENV.databaseUrl) {
  console.warn("[ENV] DATABASE_URL não configurado.");
}

if (!ENV.appSecret) {
  console.warn(
    "[ENV] APP_SECRET não configurado. Tokens de sessão podem falhar (Zero-length key)."
  );
}
