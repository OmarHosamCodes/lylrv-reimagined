import { and, desc, eq, sql } from "@lylrv/db";
import {
  activity,
  clientConfig,
  clients,
  customers,
  orders,
  referrals,
  reviews,
} from "@lylrv/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

const optionalClientIdInput = z.object({
  clientId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

const createClientInput = z.object({
  name: z.string().trim().min(2).max(120),
  type: z.enum(["free", "hobby", "super", "agency", "pro"]).optional(),
  createSource: z.string().trim().min(2).max(60),
});

export const dashboardRouter = {
  getClients: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.clients.findMany({
      where: eq(clients.userId, ctx.session.user.id),
      orderBy: [desc(clients.createdAt)],
      columns: {
        id: true,
        name: true,
        email: true,
        type: true,
        createSource: true,
        createdAt: true,
      },
    });
  }),

  createClient: protectedProcedure
    .input(createClientInput)
    .mutation(async ({ ctx, input }) => {
      const sourceSlug = input.createSource
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .slice(0, 40);

      const generatedCreateSource = `${sourceSlug || "client"}-${ctx.session.user.id.slice(0, 8)}-${Date.now()}`;

      const createdClients = await ctx.db
        .insert(clients)
        .values({
          userId: ctx.session.user.id,
          name: input.name,
          email: ctx.session.user.email,
          type: input.type ?? "free",
          createSource: generatedCreateSource,
        })
        .returning();

      const createdClient = createdClients[0];
      if (!createdClient) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create client",
        });
      }

      return createdClient;
    }),

  overview: protectedProcedure
    .input(z.object({ clientId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return null;
      }

      const [
        customerSummary,
        activitySummary,
        reviewSummary,
        referralSummary,
        orderSummary,
      ] = await Promise.all([
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(customers)
          .where(eq(customers.clientId, client.id)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(activity)
          .where(eq(activity.clientId, client.id)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(reviews)
          .where(eq(reviews.clientId, client.id)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(referrals)
          .where(eq(referrals.clientId, client.id)),
        ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(eq(orders.clientId, client.id)),
      ]);

      const summary = {
        customerCount: customerSummary[0]?.count ?? 0,
        activityCount: activitySummary[0]?.count ?? 0,
        reviewCount: reviewSummary[0]?.count ?? 0,
        referralCount: referralSummary[0]?.count ?? 0,
        orderCount: orderSummary[0]?.count ?? 0,
      };

      const recentActivity = await ctx.db.query.activity.findMany({
        where: eq(activity.clientId, client.id),
        orderBy: [desc(activity.createdAt)],
        limit: 8,
        columns: {
          id: true,
          name: true,
          email: true,
          reason: true,
          amount: true,
          createdAt: true,
        },
      });

      return { client, summary, recentActivity };
    }),

  customers: protectedProcedure
    .input(optionalClientIdInput)
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return { client: null, rows: [] };
      }

      const rows = await ctx.db.query.customers.findMany({
        where: eq(customers.clientId, client.id),
        orderBy: [desc(customers.createdAt)],
        limit: input.limit ?? 50,
      });

      return { client, rows };
    }),

  loyalty: protectedProcedure
    .input(optionalClientIdInput)
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return { client: null, rows: [] };
      }

      const rows = await ctx.db.query.activity.findMany({
        where: eq(activity.clientId, client.id),
        orderBy: [desc(activity.createdAt)],
        limit: input.limit ?? 50,
      });

      return { client, rows };
    }),

  reviews: protectedProcedure
    .input(optionalClientIdInput)
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return { client: null, rows: [] };
      }

      const rows = await ctx.db.query.reviews.findMany({
        where: eq(reviews.clientId, client.id),
        orderBy: [desc(reviews.createdAt)],
        limit: input.limit ?? 50,
      });

      return { client, rows };
    }),

  referrals: protectedProcedure
    .input(optionalClientIdInput)
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return { client: null, rows: [] };
      }

      const rows = await ctx.db.query.referrals.findMany({
        where: eq(referrals.clientId, client.id),
        orderBy: [desc(referrals.createdAt)],
        limit: input.limit ?? 50,
        with: {
          customer: {
            columns: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { client, rows };
    }),

  orders: protectedProcedure
    .input(optionalClientIdInput)
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return { client: null, rows: [] };
      }

      const rows = await ctx.db.query.orders.findMany({
        where: eq(orders.clientId, client.id),
        orderBy: [desc(orders.createdAt)],
        limit: input.limit ?? 50,
      });

      return { client, rows };
    }),

  settings: protectedProcedure
    .input(z.object({ clientId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const client = input.clientId
        ? await ctx.db.query.clients.findFirst({
            where: and(
              eq(clients.id, input.clientId),
              eq(clients.userId, ctx.session.user.id),
            ),
          })
        : await ctx.db.query.clients.findFirst({
            where: eq(clients.userId, ctx.session.user.id),
            orderBy: [desc(clients.createdAt)],
          });

      if (!client) {
        return null;
      }

      const config = await ctx.db.query.clientConfig.findFirst({
        where: eq(clientConfig.clientId, client.id),
      });

      return { client, config };
    }),
} satisfies TRPCRouterRecord;
