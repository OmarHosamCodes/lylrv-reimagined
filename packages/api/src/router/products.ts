import { and, desc, eq, sql } from "@lylrv/db";
import { clients, products } from "@lylrv/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { protectedProcedure } from "../trpc";

const productImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const productStatusEnum = z.enum(["draft", "active", "archived"]);

const listInput = z.object({
  clientId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  status: productStatusEnum.optional(),
});

const createInput = z.object({
  clientId: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(255),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    )
    .optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal")
    .optional(),
  comparePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal")
    .optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  sku: z.string().max(100).optional(),
  images: z.array(productImageSchema).max(20).optional(),
  status: productStatusEnum.optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
});

const updateInput = z.object({
  productId: z.string().uuid(),
  name: z.string().trim().min(1).max(255).optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens",
    )
    .optional(),
  shortDescription: z.string().max(500).optional(),
  description: z.string().optional(),
  price: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal")
    .optional(),
  comparePrice: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Price must be a valid decimal")
    .nullable()
    .optional(),
  currency: z.string().length(3).toUpperCase().optional(),
  sku: z.string().max(100).nullable().optional(),
  images: z.array(productImageSchema).max(20).optional(),
  status: productStatusEnum.optional(),
  category: z.string().max(100).nullable().optional(),
  tags: z.array(z.string().max(50)).max(30).optional(),
  isVisible: z.boolean().optional(),
});

/**
 * Generates a URL-safe slug from a product name.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolves the client for a given optional clientId, enforcing ownership.
 */
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

export const productsRouter = {
  list: protectedProcedure.input(listInput).query(async ({ ctx, input }) => {
    const client = await resolveClient(
      ctx.db,
      ctx.session.user.id,
      input.clientId,
    );

    if (!client) {
      return { client: null, rows: [], total: 0 };
    }

    const whereConditions = [eq(products.clientId, client.id)];
    if (input.status) {
      whereConditions.push(eq(products.status, input.status));
    }
    const where = and(...whereConditions);

    const [rows, countResult] = await Promise.all([
      ctx.db.query.products.findMany({
        where,
        orderBy: [desc(products.createdAt)],
        limit: input.limit ?? 50,
        offset: input.offset ?? 0,
      }),
      ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(where),
    ]);

    return { client, rows, total: countResult[0]?.count ?? 0 };
  }),

  getById: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        productId: z.string().uuid(),
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

      const product = await ctx.db.query.products.findFirst({
        where: and(
          eq(products.id, input.productId),
          eq(products.clientId, client.id),
        ),
        with: {
          reviews: {
            limit: 10,
            orderBy: [desc(sql`created_at`)],
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return { client, product };
    }),

  getBySlug: protectedProcedure
    .input(
      z.object({
        clientId: z.string().uuid().optional(),
        slug: z.string().min(1),
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

      const product = await ctx.db.query.products.findFirst({
        where: and(
          eq(products.slug, input.slug),
          eq(products.clientId, client.id),
        ),
      });

      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return { client, product };
    }),

  create: protectedProcedure
    .input(createInput)
    .mutation(async ({ ctx, input }) => {
      const client = await resolveClient(
        ctx.db,
        ctx.session.user.id,
        input.clientId,
      );

      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      // Generate slug from name if not provided
      let slug = input.slug ?? slugify(input.name);

      // Ensure slug uniqueness within the client
      const existingSlug = await ctx.db.query.products.findFirst({
        where: and(eq(products.slug, slug), eq(products.clientId, client.id)),
        columns: { id: true },
      });

      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const created = await ctx.db
        .insert(products)
        .values({
          clientId: client.id,
          name: input.name,
          slug,
          shortDescription: input.shortDescription,
          description: input.description,
          price: input.price,
          comparePrice: input.comparePrice,
          currency: input.currency ?? "USD",
          sku: input.sku,
          images: input.images ?? [],
          status: input.status ?? "draft",
          category: input.category,
          tags: input.tags ?? [],
        })
        .returning();

      const product = created[0];
      if (!product) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create product",
        });
      }

      return { client, product };
    }),

  update: protectedProcedure
    .input(updateInput)
    .mutation(async ({ ctx, input }) => {
      // Find the product and verify ownership
      const existing = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // Verify client ownership
      const client = await ctx.db.query.clients.findFirst({
        where: and(
          eq(clients.id, existing.clientId),
          eq(clients.userId, ctx.session.user.id),
        ),
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      // If slug is changing, check uniqueness
      if (input.slug && input.slug !== existing.slug) {
        const slugConflict = await ctx.db.query.products.findFirst({
          where: and(
            eq(products.slug, input.slug),
            eq(products.clientId, client.id),
          ),
          columns: { id: true },
        });
        if (slugConflict && slugConflict.id !== existing.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A product with this slug already exists",
          });
        }
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.shortDescription !== undefined)
        updateData.shortDescription = input.shortDescription;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.price !== undefined) updateData.price = input.price;
      if (input.comparePrice !== undefined)
        updateData.comparePrice = input.comparePrice;
      if (input.currency !== undefined) updateData.currency = input.currency;
      if (input.sku !== undefined) updateData.sku = input.sku;
      if (input.images !== undefined) updateData.images = input.images;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.tags !== undefined) updateData.tags = input.tags;
      if (input.isVisible !== undefined) updateData.isVisible = input.isVisible;
      updateData.updatedAt = new Date().toISOString();

      const updated = await ctx.db
        .update(products)
        .set(updateData)
        .where(eq(products.id, input.productId))
        .returning();

      const product = updated[0];
      if (!product) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update product",
        });
      }

      return { client, product };
    }),

  delete: protectedProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const client = await ctx.db.query.clients.findFirst({
        where: and(
          eq(clients.id, existing.clientId),
          eq(clients.userId, ctx.session.user.id),
        ),
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      await ctx.db.delete(products).where(eq(products.id, input.productId));

      return { success: true };
    }),
} satisfies TRPCRouterRecord;
