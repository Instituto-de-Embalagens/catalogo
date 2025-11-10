import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Papel global do usuário no sistema
  role: mysqlEnum("role", ["super_admin", "admin", "gerente", "visualizador"]).default("visualizador").notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Equipes (Criativo, Logística, Administração)
 */
export const equipes = mysqlTable("equipes", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 100 }).notNull().unique(),
  descricao: text("descricao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Equipe = typeof equipes.$inferSelect;
export type InsertEquipe = typeof equipes.$inferInsert;

/**
 * Relação entre usuários e equipes (many-to-many)
 * Um usuário pode pertencer a várias equipes e ter papéis diferentes em cada uma
 */
export const usuarioEquipe = mysqlTable("usuario_equipe", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull().references(() => users.id, { onDelete: "cascade" }),
  equipeId: int("equipeId").notNull().references(() => equipes.id, { onDelete: "cascade" }),
  // Papel específico na equipe (pode sobrescrever o papel global)
  papelNaEquipe: mysqlEnum("papelNaEquipe", ["super_admin", "admin", "gerente", "membro"]),
  dataEntrada: timestamp("dataEntrada").defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index("usuario_idx").on(table.usuarioId),
  equipeIdx: index("equipe_idx").on(table.equipeId),
}));

export type UsuarioEquipe = typeof usuarioEquipe.$inferSelect;
export type InsertUsuarioEquipe = typeof usuarioEquipe.$inferInsert;

/**
 * Embalagens - tabela principal do catálogo
 */
export const embalagens = mysqlTable("embalagens", {
  id: int("id").autoincrement().primaryKey(),
  material: varchar("material", { length: 100 }).notNull(),
  produto: varchar("produto", { length: 255 }).notNull(),
  marca: varchar("marca", { length: 255 }).notNull(),
  pais: varchar("pais", { length: 100 }).notNull(),
  codigoBarras: varchar("codigoBarras", { length: 50 }),
  tipoEmbalagem: varchar("tipoEmbalagem", { length: 100 }), // garrafa, pote, caixa, etc.
  seraUtilizadoEm: text("seraUtilizadoEm"), // nome do livro/projeto
  observacoes: text("observacoes"),
  // Soft delete
  deletado: boolean("deletado").default(false).notNull(),
  dataDelecao: timestamp("dataDelecao"),
  usuarioDelecaoId: int("usuarioDelecaoId").references(() => users.id),
  motivoDelecao: text("motivoDelecao"),
  // Auditoria
  usuarioCriadorId: int("usuarioCriadorId").notNull().references(() => users.id),
  usuarioAtualizadorId: int("usuarioAtualizadorId").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  materialIdx: index("material_idx").on(table.material),
  paisIdx: index("pais_idx").on(table.pais),
  deletadoIdx: index("deletado_idx").on(table.deletado),
  tipoEmbalagemIdx: index("tipo_embalagem_idx").on(table.tipoEmbalagem),
}));

export type Embalagem = typeof embalagens.$inferSelect;
export type InsertEmbalagem = typeof embalagens.$inferInsert;

/**
 * Fotos das embalagens (armazenadas no Google Drive)
 */
export const fotosEmbalagem = mysqlTable("fotos_embalagem", {
  id: int("id").autoincrement().primaryKey(),
  embalagemId: int("embalagemId").notNull().references(() => embalagens.id, { onDelete: "cascade" }),
  linkDrive: text("linkDrive").notNull(),
  descricao: text("descricao"), // ângulo, vista, etc.
  ordem: int("ordem").default(1).notNull(), // para ordenação de exibição
  usuarioUploadId: int("usuarioUploadId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  embalagemIdx: index("embalagem_idx").on(table.embalagemId),
}));

export type FotoEmbalagem = typeof fotosEmbalagem.$inferSelect;
export type InsertFotoEmbalagem = typeof fotosEmbalagem.$inferInsert;

/**
 * Localizações (Galpão > Andar > Prateleira > Caixa)
 */
export const localizacoes = mysqlTable("localizacoes", {
  id: int("id").autoincrement().primaryKey(),
  galpao: varchar("galpao", { length: 100 }).notNull(),
  andar: varchar("andar", { length: 50 }).notNull(),
  prateleira: varchar("prateleira", { length: 50 }).notNull(),
  caixaSigla: varchar("caixaSigla", { length: 50 }).notNull().unique(), // P1, AÇ1, CRIATIVO-A2, etc.
  qrCodeData: text("qrCodeData"), // link para abrir no sistema
  quantidadeEmbalagens: int("quantidadeEmbalagens").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  galpaoIdx: index("galpao_idx").on(table.galpao),
  caixaSiglaIdx: index("caixa_sigla_idx").on(table.caixaSigla),
}));

export type Localizacao = typeof localizacoes.$inferSelect;
export type InsertLocalizacao = typeof localizacoes.$inferInsert;

/**
 * Relação entre embalagens e localizações (many-to-many)
 * Uma embalagem pode estar em várias localizações e uma localização pode ter várias embalagens
 */
export const embalagemLocalizacao = mysqlTable("embalagem_localizacao", {
  id: int("id").autoincrement().primaryKey(),
  embalagemId: int("embalagemId").notNull().references(() => embalagens.id, { onDelete: "cascade" }),
  localizacaoId: int("localizacaoId").notNull().references(() => localizacoes.id, { onDelete: "cascade" }),
  quantidade: int("quantidade").default(1).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  embalagemIdx: index("embalagem_idx").on(table.embalagemId),
  localizacaoIdx: index("localizacao_idx").on(table.localizacaoId),
}));

export type EmbalagemLocalizacao = typeof embalagemLocalizacao.$inferSelect;
export type InsertEmbalagemLocalizacao = typeof embalagemLocalizacao.$inferInsert;

/**
 * Auditoria de operações
 */
export const auditoria = mysqlTable("auditoria", {
  id: int("id").autoincrement().primaryKey(),
  usuarioId: int("usuarioId").notNull().references(() => users.id),
  tabela: varchar("tabela", { length: 100 }).notNull(),
  operacao: mysqlEnum("operacao", ["CREATE", "UPDATE", "DELETE"]).notNull(),
  registroId: int("registroId").notNull(),
  dadosAntes: text("dadosAntes"), // JSON
  dadosDepois: text("dadosDepois"), // JSON
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  usuarioIdx: index("usuario_idx").on(table.usuarioId),
  tabelaIdx: index("tabela_idx").on(table.tabela),
  operacaoIdx: index("operacao_idx").on(table.operacao),
}));

export type Auditoria = typeof auditoria.$inferSelect;
export type InsertAuditoria = typeof auditoria.$inferInsert;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  equipes: many(usuarioEquipe),
  embalagens: many(embalagens),
  fotos: many(fotosEmbalagem),
  auditorias: many(auditoria),
}));

export const equipesRelations = relations(equipes, ({ many }) => ({
  usuarios: many(usuarioEquipe),
}));

export const usuarioEquipeRelations = relations(usuarioEquipe, ({ one }) => ({
  usuario: one(users, {
    fields: [usuarioEquipe.usuarioId],
    references: [users.id],
  }),
  equipe: one(equipes, {
    fields: [usuarioEquipe.equipeId],
    references: [equipes.id],
  }),
}));

export const embalagensRelations = relations(embalagens, ({ one, many }) => ({
  criador: one(users, {
    fields: [embalagens.usuarioCriadorId],
    references: [users.id],
  }),
  atualizador: one(users, {
    fields: [embalagens.usuarioAtualizadorId],
    references: [users.id],
  }),
  fotos: many(fotosEmbalagem),
  localizacoes: many(embalagemLocalizacao),
}));

export const fotosEmbalagemRelations = relations(fotosEmbalagem, ({ one }) => ({
  embalagem: one(embalagens, {
    fields: [fotosEmbalagem.embalagemId],
    references: [embalagens.id],
  }),
  usuario: one(users, {
    fields: [fotosEmbalagem.usuarioUploadId],
    references: [users.id],
  }),
}));

export const localizacoesRelations = relations(localizacoes, ({ many }) => ({
  embalagens: many(embalagemLocalizacao),
}));

export const embalagemLocalizacaoRelations = relations(embalagemLocalizacao, ({ one }) => ({
  embalagem: one(embalagens, {
    fields: [embalagemLocalizacao.embalagemId],
    references: [embalagens.id],
  }),
  localizacao: one(localizacoes, {
    fields: [embalagemLocalizacao.localizacaoId],
    references: [localizacoes.id],
  }),
}));

export const auditoriaRelations = relations(auditoria, ({ one }) => ({
  usuario: one(users, {
    fields: [auditoria.usuarioId],
    references: [users.id],
  }),
}));
