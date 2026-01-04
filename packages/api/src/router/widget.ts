import { eq } from "@lylrv/db";
import { clients, widgetSettings } from "@lylrv/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

const ActiveWidgetsSchema = z.object({
    loyalty: z.boolean(),
    reviews: z.boolean(),
    productReviews: z.boolean(),
});

const AppearanceSchema = z.object({
    primaryColor: z.string(),
    position: z.enum(["left", "right"]),
});

const UpdateWidgetSettingsSchema = z.object({
    clientId: z.string().uuid(),
    isEnabled: z.boolean().optional(),
    activeWidgets: ActiveWidgetsSchema.optional(),
    appearance: AppearanceSchema.optional(),
});

export const widgetRouter = {
    getSettings: protectedProcedure
        .input(z.object({ clientId: z.string().uuid() }))
        .query(async ({ ctx, input }) => {
            // Verify the client belongs to the user
            const client = await ctx.db.query.clients.findFirst({
                where: eq(clients.id, input.clientId),
            });

            if (!client || client.userId !== ctx.session.user.id) {
                throw new Error("Client not found or unauthorized");
            }

            const settings = await ctx.db.query.widgetSettings.findFirst({
                where: eq(widgetSettings.clientId, input.clientId),
            });

            // Return default settings if none exist
            if (!settings) {
                return {
                    id: null,
                    clientId: input.clientId,
                    isEnabled: true,
                    activeWidgets: { loyalty: false, reviews: false, productReviews: false },
                    appearance: { primaryColor: "#000000", position: "right" as const },
                };
            }

            return settings;
        }),

    updateSettings: protectedProcedure
        .input(UpdateWidgetSettingsSchema)
        .mutation(async ({ ctx, input }) => {
            // Verify the client belongs to the user
            const client = await ctx.db.query.clients.findFirst({
                where: eq(clients.id, input.clientId),
            });

            if (!client || client.userId !== ctx.session.user.id) {
                throw new Error("Client not found or unauthorized");
            }

            const existing = await ctx.db.query.widgetSettings.findFirst({
                where: eq(widgetSettings.clientId, input.clientId),
            });

            const updateData = {
                ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
                ...(input.activeWidgets && { activeWidgets: input.activeWidgets }),
                ...(input.appearance && { appearance: input.appearance }),
                updatedAt: new Date().toISOString(),
            };

            if (existing) {
                await ctx.db
                    .update(widgetSettings)
                    .set(updateData)
                    .where(eq(widgetSettings.id, existing.id));

                return { ...existing, ...updateData };
            }

            // Create new settings
            const [newSettings] = await ctx.db
                .insert(widgetSettings)
                .values({
                    clientId: input.clientId,
                    isEnabled: input.isEnabled ?? true,
                    activeWidgets: input.activeWidgets ?? { loyalty: false, reviews: false, productReviews: false },
                    appearance: input.appearance ?? { primaryColor: "#000000", position: "right" },
                })
                .returning();

            return newSettings;
        }),
} satisfies TRPCRouterRecord;
