import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";   // 👈 este é o arquivo que você colou
import { createContext } from "./context"; // 👈 contexto TRPC (já deve existir aí)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Depois do build:
// - este arquivo vira dist/index.js → __dirname = <raiz>/dist
// - Vite gera o frontend em dist/public (pelo seu vite.config original)
const publicDir = path.join(__dirname, "public");
const indexHtmlPath = path.join(publicDir, "index.html");

const app = express();

app.use(express.json());

// 🔹 tRPC: monta na mesma URL que o front está chamando
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// 🔹 arquivos estáticos do frontend
app.use(express.static(publicDir));

// 🔹 healthcheck
app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// 🔹 SPA fallback: qualquer rota que não seja /api*/trpc* devolve index.html
app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
    return res.status(404).json({ error: "Not found" });
  }

  res.sendFile(indexHtmlPath, (err) => {
    if (err) {
      console.error("[prod] Erro ao enviar index.html:", err);
      if (!res.headersSent) {
        res.status(500).send("Erro ao carregar a aplicação");
      }
    }
  });
});

const PORT = Number(process.env.PORT || 8080);
const HOST = "0.0.0.0";

createServer(app).listen(PORT, HOST, () => {
  console.log(`[prod] Server rodando na porta ${PORT}`);
});
