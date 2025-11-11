if (process.env.NODE_ENV !== "production") {
  await import("dotenv/config");
}

export const ENV = {
  nodeEnv: process.env.NODE_ENV ?? "development",

  // Banco
  databaseUrl: process.env.DATABASE_URL ?? "",

  // App / Auth
  appId: process.env.APP_ID ?? "catalogo",
  appSecret: process.env.APP_SECRET ?? "",
  oauthServerUrl: process.env.OAUTH_SERVER_URL ?? "",

  // Secret para sessão (usa COOKIE_SECRET se existir, senão APP_SECRET)
  cookieSecret:
    process.env.COOKIE_SECRET ||
    process.env.APP_SECRET ||
    "",

  // Flag pra permitir devLogin em prod controlado
  allowDevLogin:
    process.env.ALLOW_DEV_LOGIN === "true" ||
    process.env.ALLOW_DEV_LOGIN === "1",
};

// Debug adicional para produção
if (ENV.nodeEnv === "production") {
  console.log("[ENV PROD] Carregando configurações:");
  console.log("  - NODE_ENV:", ENV.nodeEnv);
  console.log("  - APP_SECRET configurado:", !!ENV.appSecret);
  console.log("  - APP_SECRET length:", ENV.appSecret.length);
  console.log("  - COOKIE_SECRET configurado:", !!ENV.cookieSecret);
  console.log("  - COOKIE_SECRET length:", ENV.cookieSecret.length);
  console.log("  - DATABASE_URL configurado:", !!ENV.databaseUrl);
  console.log("  - OAUTH_SERVER_URL:", ENV.oauthServerUrl);
  console.log("  - ALLOW_DEV_LOGIN:", ENV.allowDevLogin);
}

if (!ENV.databaseUrl) {
  console.warn("[ENV] DATABASE_URL não configurado.");
}

if (!ENV.appSecret) {
  console.warn(
    "[ENV] APP_SECRET não configurado. Tokens de sessão podem falhar."
  );
}

if (!ENV.cookieSecret) {
  console.warn(
    "[ENV] COOKIE_SECRET não configurado. Usando chave vazia quebrará sessões."
  );
}
