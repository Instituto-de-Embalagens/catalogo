import { eq, and, like, or, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  equipes,
  usuarioEquipe,
  embalagens,
  fotosEmbalagem,
  localizacoes,
  embalagemLocalizacao,
  auditoria,
  type Embalagem,
  type Equipe,
  type Localizacao,
  type InsertEquipe,
  type InsertUsuarioEquipe,
  type InsertEmbalagem,
  type InsertFotoEmbalagem,
  type InsertLocalizacao,
  type InsertEmbalagemLocalizacao,
  type InsertAuditoria,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================
// USER QUERIES
// ============================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "super_admin";
      updateSet.role = "super_admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).where(eq(users.ativo, true));
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(users).set(data).where(eq(users.id, id));
  return await getUserById(id);
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ ativo: false }).where(eq(users.id, id));
}

// ============================================
// EQUIPE QUERIES
// ============================================

export async function getAllEquipes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(equipes);
}

export async function getEquipeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(equipes).where(eq(equipes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEquipe(data: InsertEquipe) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(equipes).values(data);
  return await getEquipeById(Number((result as any).insertId));
}

export async function getUserEquipes(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: equipes.id,
      nome: equipes.nome,
      descricao: equipes.descricao,
      papelNaEquipe: usuarioEquipe.papelNaEquipe,
    })
    .from(usuarioEquipe)
    .innerJoin(equipes, eq(usuarioEquipe.equipeId, equipes.id))
    .where(eq(usuarioEquipe.usuarioId, usuarioId));
}

export async function addUserToEquipe(data: InsertUsuarioEquipe) {
  const db = await getDb();
  if (!db) return;
  await db.insert(usuarioEquipe).values(data);
}

export async function removeUserFromEquipe(usuarioId: number, equipeId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(usuarioEquipe)
    .where(and(eq(usuarioEquipe.usuarioId, usuarioId), eq(usuarioEquipe.equipeId, equipeId)));
}

// ============================================
// EMBALAGEM QUERIES
// ============================================

export async function getAllEmbalagens(filters?: {
  material?: string;
  pais?: string;
  marca?: string;
  tipoEmbalagem?: string;
  seraUtilizadoEm?: string;
  caixaSigla?: string;
  deletado?: boolean;
  busca?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(embalagens);

  const conditions = [];

  if (filters?.material) {
    conditions.push(eq(embalagens.material, filters.material));
  }
  if (filters?.pais) {
    conditions.push(eq(embalagens.pais, filters.pais));
  }
  if (filters?.marca) {
    conditions.push(like(embalagens.marca, `%${filters.marca}%`));
  }
  if (filters?.tipoEmbalagem) {
    conditions.push(eq(embalagens.tipoEmbalagem, filters.tipoEmbalagem));
  }
  if (filters?.seraUtilizadoEm) {
    conditions.push(like(embalagens.seraUtilizadoEm, `%${filters.seraUtilizadoEm}%`));
  }
  if (filters?.deletado !== undefined) {
    conditions.push(eq(embalagens.deletado, filters.deletado));
  } else {
    conditions.push(eq(embalagens.deletado, false));
  }

  if (filters?.busca) {
    conditions.push(
      or(
        like(embalagens.produto, `%${filters.busca}%`),
        like(embalagens.marca, `%${filters.busca}%`),
        like(embalagens.codigoBarras, `%${filters.busca}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(embalagens.createdAt));
}

export async function getEmbalagemById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(embalagens).where(eq(embalagens.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEmbalagem(data: InsertEmbalagem) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(embalagens).values(data);
  return await getEmbalagemById(Number((result as any).insertId));
}

export async function updateEmbalagem(id: number, data: Partial<InsertEmbalagem>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(embalagens).set(data).where(eq(embalagens.id, id));
  return await getEmbalagemById(id);
}

export async function softDeleteEmbalagem(id: number, usuarioId: number, motivo?: string) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .update(embalagens)
    .set({
      deletado: true,
      dataDelecao: new Date(),
      usuarioDelecaoId: usuarioId,
      motivoDelecao: motivo,
    })
    .where(eq(embalagens.id, id));
  return await getEmbalagemById(id);
}

export async function recuperarEmbalagem(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .update(embalagens)
    .set({
      deletado: false,
      dataDelecao: null,
      usuarioDelecaoId: null,
      motivoDelecao: null,
    })
    .where(eq(embalagens.id, id));
  return await getEmbalagemById(id);
}

export async function deleteEmbalagemPermanente(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(embalagens).where(eq(embalagens.id, id));
}

// ============================================
// FOTO EMBALAGEM QUERIES
// ============================================

export async function getFotosByEmbalagemId(embalagemId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(fotosEmbalagem)
    .where(eq(fotosEmbalagem.embalagemId, embalagemId))
    .orderBy(fotosEmbalagem.ordem);
}

export async function addFotoEmbalagem(data: InsertFotoEmbalagem) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(fotosEmbalagem).values(data);
  return (result as any).insertId;
}

export async function deleteFotoEmbalagem(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(fotosEmbalagem).where(eq(fotosEmbalagem.id, id));
}

// ============================================
// LOCALIZACAO QUERIES
// ============================================

export async function getAllLocalizacoes() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(localizacoes);
}

export async function getLocalizacaoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(localizacoes).where(eq(localizacoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLocalizacaoBySigla(sigla: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(localizacoes).where(eq(localizacoes.caixaSigla, sigla)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createLocalizacao(data: InsertLocalizacao) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(localizacoes).values(data);
  return await getLocalizacaoById(Number((result as any).insertId));
}

export async function updateLocalizacao(id: number, data: Partial<InsertLocalizacao>) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(localizacoes).set(data).where(eq(localizacoes.id, id));
  return await getLocalizacaoById(id);
}

export async function deleteLocalizacao(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(localizacoes).where(eq(localizacoes.id, id));
}

// ============================================
// EMBALAGEM LOCALIZACAO QUERIES
// ============================================

export async function getEmbalagensByLocalizacaoId(localizacaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: embalagens.id,
      produto: embalagens.produto,
      marca: embalagens.marca,
      material: embalagens.material,
      quantidade: embalagemLocalizacao.quantidade,
    })
    .from(embalagemLocalizacao)
    .innerJoin(embalagens, eq(embalagemLocalizacao.embalagemId, embalagens.id))
    .where(and(eq(embalagemLocalizacao.localizacaoId, localizacaoId), eq(embalagens.deletado, false)));
}

export async function getLocalizacoesByEmbalagemId(embalagemId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select({
      id: localizacoes.id,
      galpao: localizacoes.galpao,
      andar: localizacoes.andar,
      prateleira: localizacoes.prateleira,
      caixaSigla: localizacoes.caixaSigla,
      quantidade: embalagemLocalizacao.quantidade,
    })
    .from(embalagemLocalizacao)
    .innerJoin(localizacoes, eq(embalagemLocalizacao.localizacaoId, localizacoes.id))
    .where(eq(embalagemLocalizacao.embalagemId, embalagemId));
}

export async function addEmbalagemToLocalizacao(data: InsertEmbalagemLocalizacao) {
  const db = await getDb();
  if (!db) return;
  await db.insert(embalagemLocalizacao).values(data);
}

export async function updateEmbalagemLocalizacao(
  embalagemId: number,
  localizacaoId: number,
  quantidade: number
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(embalagemLocalizacao)
    .set({ quantidade })
    .where(
      and(
        eq(embalagemLocalizacao.embalagemId, embalagemId),
        eq(embalagemLocalizacao.localizacaoId, localizacaoId)
      )
    );
}

export async function removeEmbalagemFromLocalizacao(embalagemId: number, localizacaoId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(embalagemLocalizacao)
    .where(
      and(
        eq(embalagemLocalizacao.embalagemId, embalagemId),
        eq(embalagemLocalizacao.localizacaoId, localizacaoId)
      )
    );
}

// ============================================
// AUDITORIA QUERIES
// ============================================

export async function createAuditoria(data: InsertAuditoria) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditoria).values(data);
}

export async function getAuditoriaByTabela(tabela: string, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(auditoria)
    .where(eq(auditoria.tabela, tabela))
    .orderBy(desc(auditoria.createdAt))
    .limit(limit);
}
