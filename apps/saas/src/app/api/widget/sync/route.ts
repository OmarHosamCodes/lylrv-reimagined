import { randomBytes, timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import {
  clientConfig,
  clients,
  coupons,
  customers,
  orders,
  referrals,
} from "@lylrv/db/schema";
import type { NextRequest } from "next/server";
import { z } from "zod/v4";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REFERRAL_CODE_LENGTH = 12;

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

const customerSchema = z.object({
  email: z.string().email(),
  name: z.string().trim().min(1).max(255),
  phone: z.string().trim().max(50).nullable().optional(),
  externalUserId: z.string().trim().max(191).nullable().optional(),
  referralCode: z
    .string()
    .trim()
    .max(REFERRAL_CODE_LENGTH)
    .nullable()
    .optional(),
  totalPoints: z.number().int().min(0).max(100000000).optional(),
  createdAt: z.string().datetime({ offset: true, local: true }).optional(),
  updatedAt: z.string().datetime({ offset: true, local: true }).optional(),
});

const orderSchema = z.object({
  orderId: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  email: z.string().email().nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  externalUserId: z.string().trim().max(191).nullable().optional(),
  status: z.string().trim().max(80).nullable().optional(),
  payment: z.string().trim().max(80).nullable().optional(),
  total: z.union([z.number(), z.string()]).nullable().optional(),
  billing: z.record(z.string(), z.unknown()).nullable().optional(),
  shipping: z.record(z.string(), z.unknown()).nullable().optional(),
  slugs: z.array(z.string().trim().min(1).max(191)).max(100).optional(),
  referralCode: z
    .string()
    .trim()
    .max(REFERRAL_CODE_LENGTH)
    .nullable()
    .optional(),
  referralStatus: z.string().trim().max(80).nullable().optional(),
  referralReason: z.string().trim().max(255).nullable().optional(),
  rewardCouponId: z.string().trim().max(191).nullable().optional(),
  rewardCouponCode: z.string().trim().max(191).nullable().optional(),
  rewardCouponType: z.string().trim().max(80).nullable().optional(),
  rewardCouponAmount: z
    .number()
    .int()
    .min(0)
    .max(1000000)
    .nullable()
    .optional(),
  rewardIssuedAt: z.string().datetime({ offset: true, local: true }).optional(),
  rewardRevokedAt: z
    .string()
    .datetime({ offset: true, local: true })
    .optional(),
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

const normalizeInteger = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value).replace(/[^0-9-]/g, ""), 10);

  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
};

const normalizeText = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length ? normalized : null;
};

const normalizeReferralCode = (value: string | null | undefined) => {
  const normalized = normalizeText(value)?.replace(/[^A-Za-z0-9]/g, "") ?? null;

  if (!normalized) {
    return null;
  }

  return normalized.toUpperCase().slice(0, REFERRAL_CODE_LENGTH);
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

const isMissingSchemaColumnError = (error: unknown) => {
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

  return cause.cause?.code === "42703";
};

const buildReferralSeed = (name: string, email: string) => {
  const fromName = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const fromEmail = email
    .split("@")[0]
    ?.replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase();

  return (fromName || fromEmail || "LYLRV").slice(0, 6);
};

const generateUniqueReferralCode = async (
  tx: Transaction,
  customerId: string,
  name: string,
  email: string,
) => {
  const seed = buildReferralSeed(name, email);

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const suffix = randomBytes(4).toString("hex").toUpperCase();
    const candidate = `${seed}${suffix}`.slice(0, REFERRAL_CODE_LENGTH);
    const conflict = await tx.query.referrals.findFirst({
      where: eq(referrals.code, candidate),
    });

    if (!conflict || conflict.customerId === customerId) {
      return candidate;
    }
  }

  return `${seed}${Date.now().toString(36).toUpperCase()}`.slice(
    0,
    REFERRAL_CODE_LENGTH,
  );
};

const ensureCustomerReferralCode = async ({
  tx,
  clientId,
  customerId,
  name,
  email,
  referralCode,
  updatedAt,
}: {
  tx: Transaction;
  clientId: string;
  customerId: string;
  name: string;
  email: string;
  referralCode: string | null | undefined;
  updatedAt: string;
}) => {
  const existingReferral = await tx.query.referrals.findFirst({
    where: eq(referrals.customerId, customerId),
  });

  const incomingCode = normalizeReferralCode(referralCode);
  let nextCode = existingReferral?.code ?? incomingCode;

  if (incomingCode && incomingCode !== existingReferral?.code) {
    const codeConflict = await tx.query.referrals.findFirst({
      where: eq(referrals.code, incomingCode),
    });

    nextCode =
      !codeConflict || codeConflict.customerId === customerId
        ? incomingCode
        : await generateUniqueReferralCode(tx, customerId, name, email);
  }

  if (!nextCode) {
    nextCode = await generateUniqueReferralCode(tx, customerId, name, email);
  }

  if (existingReferral) {
    await tx
      .update(referrals)
      .set({
        clientId,
        code: nextCode,
        isActive: true,
        updatedAt,
      })
      .where(eq(referrals.id, existingReferral.id));

    return nextCode;
  }

  await tx.insert(referrals).values({
    clientId,
    customerId,
    code: nextCode,
    isActive: true,
    usageCount: 0,
    createdAt: updatedAt,
    updatedAt,
  });

  return nextCode;
};

const syncReferralCoupon = async ({
  tx,
  clientId,
  order,
  referrerCustomerId,
}: {
  tx: Transaction;
  clientId: string;
  order: z.infer<typeof orderSchema>;
  referrerCustomerId: string;
}) => {
  const couponCode = normalizeText(order.rewardCouponCode);

  if (!couponCode) {
    return false;
  }

  const isRevoked =
    Boolean(order.rewardRevokedAt) || order.referralStatus === "reward_revoked";
  const updatedAt = normalizeTimestamp(order.updatedAt);

  await tx
    .insert(coupons)
    .values({
      clientId,
      customerId: referrerCustomerId,
      orderId: order.orderId,
      code: couponCode,
      externalCouponId: normalizeText(order.rewardCouponId),
      type: normalizeText(order.rewardCouponType),
      amount: normalizeInteger(order.rewardCouponAmount) ?? 0,
      isActive: !isRevoked,
      source: "referral",
      expiresAt: null,
      usageLimit: 1,
      timesUsed: 0,
      isRevoked,
      revokedAt: order.rewardRevokedAt
        ? normalizeTimestamp(order.rewardRevokedAt)
        : null,
      createdAt: order.rewardIssuedAt
        ? normalizeTimestamp(order.rewardIssuedAt)
        : normalizeTimestamp(order.createdAt),
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [coupons.clientId, coupons.code],
      set: {
        customerId: referrerCustomerId,
        orderId: order.orderId,
        externalCouponId: normalizeText(order.rewardCouponId),
        type: normalizeText(order.rewardCouponType),
        amount: normalizeInteger(order.rewardCouponAmount) ?? 0,
        isActive: !isRevoked,
        source: "referral",
        isRevoked,
        revokedAt: order.rewardRevokedAt
          ? normalizeTimestamp(order.rewardRevokedAt)
          : null,
        updatedAt,
      },
    });

  return true;
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
      integrationType: "custom",
      storeUrl,
      syncSecret,
    });

    return { error: null, clientId: client.id };
  }

  if (!existingConfig.syncSecret) {
    await db
      .update(clientConfig)
      .set({
        integrationType: "custom",
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
    let syncedCoupons = 0;

    await db.transaction(async (tx) => {
      for (const customer of parsedBody.data.customers) {
        const createdAt = normalizeTimestamp(customer.createdAt);
        const updatedAt = normalizeTimestamp(customer.updatedAt);
        const normalizedEmail = customer.email.trim().toLowerCase();

        const [savedCustomer] = await tx
          .insert(customers)
          .values({
            clientId: access.clientId,
            name: customer.name.trim(),
            email: normalizedEmail,
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
          })
          .returning({
            id: customers.id,
            name: customers.name,
            email: customers.email,
          });

        if (savedCustomer) {
          await ensureCustomerReferralCode({
            tx,
            clientId: access.clientId,
            customerId: savedCustomer.id,
            name: savedCustomer.name,
            email: savedCustomer.email,
            referralCode: customer.referralCode,
            updatedAt,
          });
        }

        syncedCustomers += 1;
      }

      for (const order of parsedBody.data.orders) {
        const createdAt = normalizeTimestamp(order.createdAt);
        const updatedAt = normalizeTimestamp(order.updatedAt);
        const normalizedEmail =
          normalizeText(order.email)?.toLowerCase() ?? null;
        const normalizedReferralCode = normalizeReferralCode(
          order.referralCode,
        );
        const normalizedReferralStatus = normalizeText(order.referralStatus);

        await tx
          .insert(orders)
          .values({
            clientId: access.clientId,
            orderId: order.orderId,
            email: normalizedEmail,
            phone: normalizeText(order.phone),
            externalUserId: normalizeText(order.externalUserId),
            status: normalizeText(order.status),
            payment: normalizeText(order.payment),
            total: normalizeNumericString(order.total),
            billing: order.billing ?? null,
            shipping: order.shipping ?? null,
            slugs: order.slugs ?? [],
            referralCode: normalizedReferralCode,
            referralStatus: normalizedReferralStatus,
            referralReason: normalizeText(order.referralReason),
            rewardCouponId: normalizeText(order.rewardCouponId),
            rewardCouponCode: normalizeText(order.rewardCouponCode),
            rewardCouponType: normalizeText(order.rewardCouponType),
            rewardCouponAmount: normalizeInteger(order.rewardCouponAmount),
            rewardIssuedAt: order.rewardIssuedAt
              ? normalizeTimestamp(order.rewardIssuedAt)
              : null,
            rewardRevokedAt: order.rewardRevokedAt
              ? normalizeTimestamp(order.rewardRevokedAt)
              : null,
            createdAt,
            updatedAt,
          })
          .onConflictDoUpdate({
            target: [orders.clientId, orders.orderId],
            set: {
              email: normalizedEmail,
              phone: normalizeText(order.phone),
              externalUserId: normalizeText(order.externalUserId),
              status: normalizeText(order.status),
              payment: normalizeText(order.payment),
              total: normalizeNumericString(order.total),
              billing: order.billing ?? null,
              shipping: order.shipping ?? null,
              slugs: order.slugs ?? [],
              referralCode: normalizedReferralCode,
              referralStatus: normalizedReferralStatus,
              referralReason: normalizeText(order.referralReason),
              rewardCouponId: normalizeText(order.rewardCouponId),
              rewardCouponCode: normalizeText(order.rewardCouponCode),
              rewardCouponType: normalizeText(order.rewardCouponType),
              rewardCouponAmount: normalizeInteger(order.rewardCouponAmount),
              rewardIssuedAt: order.rewardIssuedAt
                ? normalizeTimestamp(order.rewardIssuedAt)
                : null,
              rewardRevokedAt: order.rewardRevokedAt
                ? normalizeTimestamp(order.rewardRevokedAt)
                : null,
              updatedAt,
            },
          });

        if (normalizedReferralCode) {
          const referralRecord = await tx.query.referrals.findFirst({
            where: eq(referrals.code, normalizedReferralCode),
          });

          if (referralRecord) {
            const usageSummary = await tx
              .select({ count: sql<number>`count(*)` })
              .from(orders)
              .where(
                and(
                  eq(orders.clientId, access.clientId),
                  eq(orders.referralCode, normalizedReferralCode),
                ),
              );

            await tx
              .update(referrals)
              .set({
                usageCount: usageSummary[0]?.count ?? 0,
                updatedAt,
              })
              .where(eq(referrals.id, referralRecord.id));

            const couponSynced = await syncReferralCoupon({
              tx,
              clientId: access.clientId,
              order,
              referrerCustomerId: referralRecord.customerId,
            });

            if (couponSynced) {
              syncedCoupons += 1;
            }
          }
        }

        syncedOrders += 1;
      }

      await tx
        .update(clientConfig)
        .set({
          integrationType: "custom",
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
        coupons: syncedCoupons,
      },
    });
  } catch (error) {
    if (isMissingSchemaColumnError(error)) {
      return json(
        {
          error:
            "Database schema is outdated. Push the latest Drizzle schema before using referral sync.",
        },
        { status: 503 },
      );
    }

    console.error("Widget sync error:", error);

    return json({ error: "Internal server error" }, { status: 500 });
  }
};
