import { timingSafeEqual } from "node:crypto";
import { eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clientConfig, clients, customers, orders } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const customerSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(255),
  phone: z.string().trim().max(50).nullable().optional(),
  externalUserId: z.string().trim().max(191).nullable().optional(),
  totalPoints: z.number().int().min(0).max(100000000).optional(),
  createdAt: z.string().datetime({ offset: true, local: true }).optional(),
  updatedAt: z.string().datetime({ offset: true, local: true }).optional(),
});

const orderSchema = z.object({
  orderId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  status: z.string().trim().max(80).nullable().optional(),
  payment: z.string().trim().max(80).nullable().optional(),
  total: z.union([z.number(), z.string()]).nullable().optional(),
  billing: z.record(z.string(), z.unknown()).nullable().optional(),
  shipping: z.record(z.string(), z.unknown()).nullable().optional(),
  slugs: z.array(z.string().trim().min(1).max(191)).max(100).optional(),
  createdAt: z.string().datetime({ offset: true, local: true }).optional(),
  updatedAt: z.string().datetime({ offset: true, local: true }).optional(),
});

const syncPayloadSchema = z
  .object({
    apiKey: z.string().trim(),
    syncSecret: z.string().trim().min(20).max(255),
    storeUrl: z.string().url().max(500),
    customers: z.array(customerSchema).max(250).default([]),
    orders: z.array(orderSchema).max(250).default([]),
  })
  .refine(
    (value) => value.customers.length > 0 || value.orders.length > 0,
    "At least one customer or order is required",
  );

const setCorsHeaders = (response: Response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "OPTIONS, POST");
  response.headers.set("Access-Control-Allow-Headers", "*");
  response.headers.set("Cache-Control", "private, max-age=0, no-cache");
};

const json = (body: unknown, init?: ResponseInit) => {
  const response = Response.json(body, init);
  setCorsHeaders(response);
  return response;
};

const safeSecretEqual = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};

const normalizeNumericString = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(String(value).replace(/[^0-9.-]/g, ""));

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue.toFixed(2);
};

const normalizeText = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const normalizeTimestamp = (value: string | undefined) => {
  if (!value) {
    return new Date().toISOString();
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return new Date().toISOString();
  }

  return parsedDate.toISOString();
};

const isMissingSyncSecretColumnError = (error: unknown) => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("cause" in error) ||
    typeof error.cause !== "object" ||
    error.cause === null
  ) {
    return false;
  }

  const cause = error.cause as {
    cause?: {
      code?: string;
      message?: string;
    };
  };

  return (
    cause.cause?.code === "42703" &&
    String(cause.cause?.message ?? "").includes("sync_secret")
  );
};

const ensureSyncAccess = async ({
  apiKey,
  syncSecret,
  storeUrl,
}: {
  apiKey: string;
  syncSecret: string;
  storeUrl: string;
}) => {
  if (!UUID_PATTERN.test(apiKey)) {
    return {
      error: json({ error: "Invalid 'apiKey' format" }, { status: 400 }),
      clientId: null,
    };
  }

  const client = await db.query.clients.findFirst({
    where: eq(clients.apiKey, apiKey),
  });

  if (!client) {
    return {
      error: json({ error: "API key not found" }, { status: 404 }),
      clientId: null,
    };
  }

  const existingConfig = await db.query.clientConfig.findFirst({
    where: eq(clientConfig.clientId, client.id),
  });

  if (!existingConfig) {
    await db.insert(clientConfig).values({
      clientId: client.id,
      integrationType: "woocommerce",
      storeUrl,
      syncSecret,
    });

    return { error: null, clientId: client.id };
  }

  if (!existingConfig.syncSecret) {
    await db
      .update(clientConfig)
      .set({
        integrationType: "woocommerce",
        storeUrl,
        syncSecret,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clientConfig.clientId, client.id));

    return { error: null, clientId: client.id };
  }

  if (!safeSecretEqual(existingConfig.syncSecret, syncSecret)) {
    return {
      error: json({ error: "Invalid sync secret" }, { status: 403 }),
      clientId: null,
    };
  }

  const nextStoreUrl =
    existingConfig.storeUrl !== storeUrl ? storeUrl : undefined;

  if (nextStoreUrl) {
    await db
      .update(clientConfig)
      .set({
        storeUrl: nextStoreUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(clientConfig.clientId, client.id));
  }

  return { error: null, clientId: client.id };
};

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
};

export const POST = async (request: NextRequest) => {
  try {
    const parsedBody = syncPayloadSchema.safeParse(await request.json());

    if (!parsedBody.success) {
      return json(
        {
          error: "Invalid sync payload",
          details: parsedBody.error.flatten(),
        },
        { status: 400 },
      );
    }

    const access = await ensureSyncAccess(parsedBody.data);

    if (access.error || !access.clientId) {
      return access.error;
    }

    const now = new Date().toISOString();
    let syncedCustomers = 0;
    let syncedOrders = 0;

    await db.transaction(async (tx) => {
      for (const customer of parsedBody.data.customers) {
        const createdAt = normalizeTimestamp(customer.createdAt);
        const updatedAt = normalizeTimestamp(customer.updatedAt);

        await tx
          .insert(customers)
          .values({
            clientId: access.clientId,
            name: customer.name.trim(),
            email: customer.email.trim().toLowerCase(),
            phone: normalizeText(customer.phone),
            externalUserId: normalizeText(customer.externalUserId),
            totalPoints: customer.totalPoints ?? 0,
            createdAt,
            updatedAt,
          })
          .onConflictDoUpdate({
            target: [customers.clientId, customers.email],
            set: {
              name: customer.name.trim(),
              phone: normalizeText(customer.phone),
              externalUserId: normalizeText(customer.externalUserId),
              totalPoints: customer.totalPoints ?? 0,
              updatedAt,
            },
          });

        syncedCustomers += 1;
      }

      for (const order of parsedBody.data.orders) {
        const createdAt = normalizeTimestamp(order.createdAt);
        const updatedAt = normalizeTimestamp(order.updatedAt);

        await tx
          .insert(orders)
          .values({
            clientId: access.clientId,
            orderId: order.orderId,
            email: normalizeText(order.email)?.toLowerCase() ?? null,
            phone: normalizeText(order.phone),
            status: normalizeText(order.status),
            payment: normalizeText(order.payment),
            total: normalizeNumericString(order.total),
            billing: order.billing ?? null,
            shipping: order.shipping ?? null,
            slugs: order.slugs ?? [],
            createdAt,
            updatedAt,
          })
          .onConflictDoUpdate({
            target: [orders.clientId, orders.orderId],
            set: {
              email: normalizeText(order.email)?.toLowerCase() ?? null,
              phone: normalizeText(order.phone),
              status: normalizeText(order.status),
              payment: normalizeText(order.payment),
              total: normalizeNumericString(order.total),
              billing: order.billing ?? null,
              shipping: order.shipping ?? null,
              slugs: order.slugs ?? [],
              updatedAt,
            },
          });

        syncedOrders += 1;
      }

      await tx
        .update(clientConfig)
        .set({
          integrationType: "woocommerce",
          storeUrl: parsedBody.data.storeUrl,
          updatedAt: now,
        })
        .where(eq(clientConfig.clientId, access.clientId));
    });

    return json({
      success: true,
      synced: {
        customers: syncedCustomers,
        orders: syncedOrders,
      },
    });
  } catch (error) {
    if (isMissingSyncSecretColumnError(error)) {
      return json(
        {
          error:
            "Database schema is outdated. Add the client_config.sync_secret column before using WooCommerce sync.",
        },
        { status: 503 },
      );
    }

    console.error("Widget sync error:", error);

    return json({ error: "Internal server error" }, { status: 500 });
  }
};
