import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Depois do build:
// - este arquivo vira dist/index.js  → __dirname = <...>/dist
// - o Vite gera o frontend em dist/public
const publicDir = path.join(__dirname, "public");
const indexHtmlPath = path.join(publicDir, "index.html");

const app = express();

app.use(express.json());
app.use(express.static(publicDir));

console.log("[prod] __dirname:", __dirname);
console.log("[prod] publicDir:", publicDir);
console.log("[prod] indexHtmlPath:", indexHtmlPath);

app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// SPA fallback — qualquer rota não-API volta pro index.html
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
