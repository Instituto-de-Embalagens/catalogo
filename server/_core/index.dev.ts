import "dotenv/config";
import express from "express";
import { createServer } from "http";
// importa o que precisar dev
// se quiser integrar Vite, beleza aqui

const app = express();
// ...rotas, trpc, etc

const server = createServer(app);
const PORT = Number(process.env.PORT ?? 3000);

server.listen(PORT, () => {
  console.log(`[dev] Server rodando em http://localhost:${PORT}`);
});
