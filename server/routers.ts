import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk"; // 👈 IMPORTANTE: usar o SDK oficial

// Middleware para Super Admin
const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas Super Admins podem executar esta ação",
    });
  }
  return next({ ctx });
});

// Middleware para Admin ou superior
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "super_admin" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas Admins podem executar esta ação",
    });
  }
  return next({ ctx });
});

// Middleware para Gerente ou superior
const gerenteProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (
    ctx.user.role !== "super_admin" &&
    ctx.user.role !== "admin" &&
    ctx.user.role !== "gerente"
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas Gerentes podem executar esta ação",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    // Login de desenvolvimento (apenas para ambiente local)
devLogin: publicProcedure.mutation(async ({ ctx }) => {
  const isDev = process.env.NODE_ENV === "development";
  const allowDevInProd = process.env.ALLOW_DEV_LOGIN === "true";

  if (!isDev && !allowDevInProd) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "Login de desenvolvimento está desabilitado neste ambiente.",
    });
  }

  await db.upsertUser({
    openId: "dev-admin-local",
    name: "Admin Desenvolvimento",
    email: "admin@dev.local",
    loginMethod: "dev",
    role: "super_admin",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId("dev-admin-local");
  if (!user) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Falha ao criar usuário de desenvolvimento",
        });
  }

  const sessionToken = await sdk.createSessionToken(user.openId, {
    name: user.name || "Admin Desenvolvimento",
    expiresInMs: ONE_YEAR_MS,
  });

  const cookieOptions = getSessionCookieOptions(ctx.req);
  ctx.res.cookie(COOKIE_NAME, sessionToken, {
    ...cookieOptions,
    maxAge: ONE_YEAR_MS,
  });

  return { success: true, user };
}),
  }),

  // Routers de embalagens
  embalagens: router({
    list: publicProcedure
      .input(
        z
          .object({
            busca: z.string().optional(),
            material: z.string().optional(),
            pais: z.string().optional(),
            tipoEmbalagem: z.string().optional(),
            seraUtilizadoEm: z.string().optional(),
            deletado: z.boolean().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return db.getAllEmbalagens(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getEmbalagemById(input.id)),

    create: gerenteProcedure
      .input(
        z.object({
          material: z.string(),
          produto: z.string(),
          marca: z.string(),
          pais: z.string(),
          codigoBarras: z.string().optional(),
          tipoEmbalagem: z.string().optional(),
          seraUtilizadoEm: z.string().optional(),
          observacoes: z.string().optional(),
          fotos: z
            .array(
              z.object({
                linkDrive: z.string(),
                descricao: z.string().optional(),
                ordem: z.number(),
              })
            )
            .optional(),
          localizacoes: z
            .array(
              z.object({
                localizacaoId: z.number(),
                quantidade: z.number(),
              })
            )
            .optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { fotos, localizacoes, ...embalagemData } = input;
        return db.createEmbalagem({
          ...embalagemData,
          usuarioCriadorId: ctx.user.id,
        });
      }),

    update: gerenteProcedure
      .input(
        z.object({
          id: z.number(),
          material: z.string().optional(),
          produto: z.string().optional(),
          marca: z.string().optional(),
          pais: z.string().optional(),
          codigoBarras: z.string().optional(),
          tipoEmbalagem: z.string().optional(),
          seraUtilizadoEm: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;
        return db.updateEmbalagem(id, {
          ...updateData,
          usuarioAtualizadorId: ctx.user.id,
        });
      }),

    softDelete: adminProcedure
      .input(
        z.object({
          id: z.number(),
          motivo: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return db.softDeleteEmbalagem(input.id, ctx.user.id, input.motivo);
      }),

    recuperar: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.recuperarEmbalagem(input.id)),

    deletePermanente: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) =>
        db.deleteEmbalagemPermanente(input.id)
      ),
  }),

  // Routers de fotos
  fotos: router({
    add: gerenteProcedure
      .input(
        z.object({
          embalagemId: z.number(),
          linkDrive: z.string(),
          descricao: z.string().optional(),
          ordem: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) =>
        db.addFotoEmbalagem({
          ...input,
          usuarioUploadId: ctx.user.id,
        })
      ),

    delete: gerenteProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.deleteFotoEmbalagem(input.id)),
  }),

  // Routers de localizações
  localizacoes: router({
    list: publicProcedure.query(() => db.getAllLocalizacoes()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getLocalizacaoById(input.id)),

    getBySigla: publicProcedure
      .input(z.object({ sigla: z.string() }))
      .query(async ({ input }) => db.getLocalizacaoBySigla(input.sigla)),

    create: gerenteProcedure
      .input(
        z.object({
          galpao: z.string(),
          andar: z.string(),
          prateleira: z.string(),
          caixaSigla: z.string(),
          caixaIdentificacao: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => db.createLocalizacao(input)),

    update: gerenteProcedure
      .input(
        z.object({
          id: z.number(),
          galpao: z.string().optional(),
          andar: z.string().optional(),
          prateleira: z.string().optional(),
          caixaSigla: z.string().optional(),
          caixaIdentificacao: z.string().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) =>
        db.updateLocalizacao(input.id, input)
      ),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) =>
        db.deleteLocalizacao(input.id)
      ),

    addEmbalagem: gerenteProcedure
      .input(
        z.object({
          localizacaoId: z.number(),
          embalagemId: z.number(),
          quantidade: z.number(),
        })
      )
      .mutation(async ({ input }) =>
        db.addEmbalagemToLocalizacao(input)
      ),

    removeEmbalagem: gerenteProcedure
      .input(
        z.object({
          localizacaoId: z.number(),
          embalagemId: z.number(),
        })
      )
      .mutation(async ({ input }) =>
        db.removeEmbalagemFromLocalizacao(
          input.embalagemId,
          input.localizacaoId
        )
      ),
  }),

  usuarios: router({
    list: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getUserById(input.id);
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string().min(1, "Nome é obrigatório"),
          email: z.string().email("E-mail inválido"),
          role: z.enum(["super_admin", "admin", "gerente", "visualizador"]),
        })
      )
      .mutation(async ({ input }) => {
        await db.upsertUser({
          openId: input.email, // simples e único para esse contexto
          name: input.name,
          email: input.email,
          role: input.role,
          loginMethod: "manual",
          lastSignedIn: new Date(),
        });

        const created = await db.getUserByOpenId(input.email);
        if (!created) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao criar usuário",
          });
        }

        return created;
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          email: z.string().optional(),
          role: z
            .enum(["super_admin", "admin", "gerente", "visualizador"])
            .optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateUser(input.id, input);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteUser(input.id);
      }),
  }),


  // Routers de equipes
  equipes: router({
    list: publicProcedure.query(() => db.getAllEquipes()),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getEquipeById(input.id)),

    create: adminProcedure
      .input(
        z.object({
          nome: z.string(),
          descricao: z.string().optional(),
        })
      )
      .mutation(async ({ input }) =>
        db.createEquipe(input)
      ),

    addUsuario: gerenteProcedure
      .input(
        z.object({
          equipeId: z.number(),
          usuarioId: z.number(),
        })
      )
      .mutation(async ({ input }) =>
        db.addUserToEquipe({
          usuarioId: input.usuarioId,
          equipeId: input.equipeId,
        })
      ),

    removeUsuario: gerenteProcedure
      .input(
        z.object({
          equipeId: z.number(),
          usuarioId: z.number(),
        })
      )
      .mutation(async ({ input }) =>
        db.removeUserFromEquipe(
          input.usuarioId,
          input.equipeId
        )
      ),
  }),
});

export type AppRouter = typeof appRouter;
