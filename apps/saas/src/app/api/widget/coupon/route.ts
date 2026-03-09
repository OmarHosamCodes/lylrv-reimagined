import { timingSafeEqual } from "node:crypto";
import { and, eq, sql } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clientConfig, clients, coupons, referrals } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const setCorsHeaders = (response: Response) => {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET");
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

const normalizeCode = (value: string | null) => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized.length > 0 ? normalized.slice(0, 191) : null;
};

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
};

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const apiKey = searchParams.get("apiKey") ?? searchParams.get("shop");
  const code = normalizeCode(searchParams.get("code"));
  const syncSecret = request.headers.get("x-lylrv-sync-secret")?.trim() ?? "";

  if (!apiKey) {
    return json({ error: "Missing 'apiKey' query parameter" }, { status: 400 });
  }

  if (!UUID_PATTERN.test(apiKey)) {
    return json({ error: "Invalid 'apiKey' format" }, { status: 400 });
  }

  if (!code) {
    return json({ error: "Missing 'code' query parameter" }, { status: 400 });
  }

  if (!syncSecret) {
    return json({ error: "Missing sync secret" }, { status: 401 });
  }

  try {
    const client = await db.query.clients.findFirst({
      where: eq(clients.apiKey, apiKey),
    });

    if (!client) {
      return json({ error: "API key not found" }, { status: 404 });
    }

    const config = await db.query.clientConfig.findFirst({
      where: eq(clientConfig.clientId, client.id),
    });

    if (!config?.syncSecret) {
      return json(
        { error: "Sync is not configured for this client" },
        { status: 403 },
      );
    }

    if (!safeSecretEqual(config.syncSecret, syncSecret)) {
      return json({ error: "Invalid sync secret" }, { status: 403 });
    }

    const coupon = await db.query.coupons.findFirst({
      where: and(
        eq(coupons.clientId, client.id),
        eq(coupons.isActive, true),
        eq(coupons.isRevoked, false),
        sql`lower(${coupons.code}) = lower(${code})`,
      ),
    });

    if (coupon) {
      if (
        coupon.expiresAt &&
        new Date(coupon.expiresAt).getTime() <= Date.now()
      ) {
        return json({ exists: false }, { status: 404 });
      }

      return json({
        exists: true,
        source: "coupon",
        code: coupon.code,
        amount: Number(coupon.amount ?? 0),
        discountType: coupon.type || "fixed_cart",
        usageLimit: coupon.usageLimit ?? null,
        expiresAt: coupon.expiresAt ?? null,
      });
    }

    const referral = await db.query.referrals.findFirst({
      where: and(
        eq(referrals.clientId, client.id),
        eq(referrals.isActive, true),
        sql`lower(${referrals.code}) = lower(${code})`,
      ),
    });

    if (!referral) {
      return json({ exists: false }, { status: 404 });
    }

    return json({
      exists: true,
      source: "referral",
      code: referral.code,
      referralCode: referral.code,
    });
  } catch (error) {
    console.error("Widget coupon lookup error:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};
