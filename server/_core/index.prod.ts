import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
// aqui entra seu tRPC, Drizzle, etc

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const clientDistPath = path.join(__dirname, "client");

app.use(express.static(clientDistPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

const server = createServer(app);

// Fly exige escutar em 0.0.0.0 e geralmente porta 8080
const PORT = Number(process.env.PORT ?? 8080);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[prod] Server rodando na porta ${PORT}`);
});
