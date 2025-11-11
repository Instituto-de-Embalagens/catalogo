import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";

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

    // Login de desenvolvimento (com flag para produção)
    devLogin: publicProcedure.mutation(async ({ ctx }) => {
      // Debug inicial para garantir que o handler está lendo o ENV certo
      console.log("[auth.devLogin] NODE_ENV:", ENV.nodeEnv);
      console.log("[auth.devLogin] allowDevLogin:", ENV.allowDevLogin);
      console.log(
        "[auth.devLogin] APP_SECRET length:",
        ENV.appSecret ? ENV.appSecret.length : 0
      );

      const isDevEnv = ENV.nodeEnv === "development";

      // Só permite em:
      // - NODE_ENV=development
      // - ou produção COM ALLOW_DEV_LOGIN habilitado
      if (!isDevEnv && !ENV.allowDevLogin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Login de desenvolvimento disponível apenas em ambiente de desenvolvimento",
        });
      }

      // Validação forte do APP_SECRET
      if (!ENV.appSecret || ENV.appSecret.length === 0) {
        console.error(
          "[auth.devLogin] APP_SECRET vazio/ausente dentro da mutation"
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Configuração de autenticação inválida (APP_SECRET ausente).",
        });
      }

      // Garante usuário super admin local
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
        console.error(
          "[auth.devLogin] Falha ao recuperar usuário dev-admin-local após upsert"
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao criar usuário de desenvolvimento",
        });
      }

      console.log(
        "[auth.devLogin] Gerando sessão para:",
        user.email,
        "openId:",
        user.openId
      );

      try {
        // Cria token de sessão no formato esperado pelo sdk.verifySession
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "Admin Desenvolvimento",
          expiresInMs: ONE_YEAR_MS,
        });

        if (!sessionToken || sessionToken.length === 0) {
          console.error(
            "[auth.devLogin] sdk.createSessionToken retornou token vazio"
          );
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao gerar token de sessão (token vazio).",
          });
        }

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        console.log("[auth.devLogin] Sessão criada com sucesso");
        return { success: true, user };
      } catch (err: any) {
        console.error(
          "[auth.devLogin] Erro ao criar sessão via sdk.createSessionToken:",
          err?.message || err
        );
        console.error(err?.stack || "");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            err?.message ||
            "Falha ao gerar token de sessão (erro interno no SDK).",
        });
      }
    }),
  }),

  // ===== Embalagens =====
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
      .query(async ({ input }) => db.getAllEmbalagens(input)),

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
      .mutation(async ({ input, ctx }) =>
        db.softDeleteEmbalagem(input.id, ctx.user.id, input.motivo)
      ),

    recuperar: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => db.recuperarEmbalagem(input.id)),

    deletePermanente: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) =>
        db.deleteEmbalagemPermanente(input.id)
      ),
  }),

  // ===== Fotos =====
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

  // ===== Localizações =====
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

  // ===== Usuários =====
  usuarios: router({
    list: adminProcedure.query(async () => db.getAllUsers()),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getUserById(input.id)),

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
          openId: input.email,
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
      .mutation(async ({ input }) =>
        db.updateUser(input.id, input)
      ),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) =>
        db.deleteUser(input.id)
      ),
  }),

  // ===== Equipes =====
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
