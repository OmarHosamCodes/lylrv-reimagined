import { eq } from "@lylrv/db";
import { clients } from "@lylrv/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

const WidgetSettingsInputSchema = z.object({ clientId: z.string().uuid() });

const buildRuntimeSettings = (clientId: string) => ({
  id: null,
  clientId,
  isEnabled: true,
  activeWidgets: {
    loyalty: true,
    reviews: true,
    productReviews: true,
  },
  appearance: { primaryColor: "#c56f26", position: "right" as const },
  customizationPersisted: false as const,
});

export const widgetRouter = {
  getSettings: protectedProcedure
    .input(WidgetSettingsInputSchema)
    .query(async ({ ctx, input }) => {
      // Verify the client belongs to the user
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.session.user.id) {
        throw new Error("Client not found or unauthorized");
      }

      return buildRuntimeSettings(input.clientId);
    }),

  updateSettings: protectedProcedure
    .input(WidgetSettingsInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the client belongs to the user
      const client = await ctx.db.query.clients.findFirst({
        where: eq(clients.id, input.clientId),
      });

      if (!client || client.userId !== ctx.session.user.id) {
        throw new Error("Client not found or unauthorized");
      }

      return buildRuntimeSettings(input.clientId);
    }),
} satisfies TRPCRouterRecord;
