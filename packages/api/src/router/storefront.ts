import { and, desc, eq } from "@lylrv/db";
import { clients, storefrontOrders } from "@lylrv/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

async function resolveClient(
  db: typeof import("@lylrv/db/client").db,
  userId: string,
  clientId?: string,
) {
  const client = clientId
    ? await db.query.clients.findFirst({
        where: and(eq(clients.id, clientId), eq(clients.userId, userId)),
      })
    : await db.query.clients.findFirst({
        where: eq(clients.userId, userId),
        orderBy: [desc(clients.createdAt)],
      });

  return client ?? null;
}

export const storefrontRouter = {
  listOrders: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const client = await resolveClient(
        ctx.db,
        ctx.session.user.id,
        input.clientId,
      );

      if (!client) {
        return { client: null, rows: [] };
      }

      const rows = await ctx.db.query.storefrontOrders.findMany({
        where: eq(storefrontOrders.clientId, client.id),
        orderBy: [desc(storefrontOrders.createdAt)],
        limit: input.limit ?? 50,
        with: {
          items: true,
        },
      });

      return { client, rows };
    }),

  getOrder: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        orderId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const client = await resolveClient(
        ctx.db,
        ctx.session.user.id,
        input.clientId,
      );

      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      const order = await ctx.db.query.storefrontOrders.findFirst({
        where: and(
          eq(storefrontOrders.id, input.orderId),
          eq(storefrontOrders.clientId, client.id),
        ),
        with: {
          items: true,
        },
      });

      if (!order) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
      }

      return { client, order };
    }),
} satisfies TRPCRouterRecord;
