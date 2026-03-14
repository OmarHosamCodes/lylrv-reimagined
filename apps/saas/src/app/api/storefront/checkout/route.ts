import { eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import {
  checkoutSessions,
  storefrontCarts,
  storefrontOrderItems,
  storefrontOrders,
} from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

import {
  createOpaqueToken,
  createPublicOrderId,
  getCartWithItems,
  isValidApiKey,
  moneyToNumber,
  moneyToString,
  normalizeToken,
  resolveClientByApiKey,
  serializeOrder,
  storefrontJson,
  storefrontOptions,
} from "../_lib";

export const OPTIONS = () => storefrontOptions("OPTIONS, POST");

export const POST = async (req: NextRequest) => {
  const body = (await req.json().catch(() => null)) as {
    apiKey?: string;
    cartToken?: string;
    email?: string;
    name?: string;
    phone?: string;
    billing?: Record<string, unknown>;
    shipping?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    thankYouUrlBase?: string;
  } | null;

  const apiKey = body?.apiKey?.trim() ?? "";
  const cartToken = normalizeToken(body?.cartToken);
  const email = body?.email?.trim().toLowerCase() ?? "";
  const name = body?.name?.trim() ?? "";
  const phone = body?.phone?.trim() ?? "";
  const billing = body?.billing ?? {};
  const shipping = body?.shipping ?? {};
  const metadata = body?.metadata ?? {};
  const thankYouUrlBase = body?.thankYouUrlBase?.trim() ?? "";

  if (!isValidApiKey(apiKey)) {
    return storefrontJson(
      { error: "Invalid 'apiKey' in request body" },
      { status: 400 },
      "OPTIONS, POST",
    );
  }

  if (!cartToken || !email) {
    return storefrontJson(
      { error: "Missing cartToken or email" },
      { status: 400 },
      "OPTIONS, POST",
    );
  }

  const client = await resolveClientByApiKey(apiKey);
  if (!client) {
    return storefrontJson(
      { error: "API key not found" },
      { status: 404 },
      "OPTIONS, POST",
    );
  }

  const cart = await getCartWithItems(client.id, cartToken);
  if (!cart) {
    return storefrontJson(
      { error: "Cart not found" },
      { status: 404 },
      "OPTIONS, POST",
    );
  }

  if (!cart.items.length) {
    return storefrontJson(
      { error: "Cart is empty" },
      { status: 400 },
      "OPTIONS, POST",
    );
  }

  const subtotal = cart.items.reduce((sum, item) => {
    return sum + moneyToNumber(item.unitPrice) * item.quantity;
  }, 0);
  const orderTotal = moneyToString(subtotal);

  const createdSession = await db
    .insert(checkoutSessions)
    .values({
      clientId: client.id,
      cartId: cart.id,
      token: createOpaqueToken(),
      status: "submitted",
      email,
      name: name || null,
      phone: phone || null,
      billing,
      shipping,
      metadata,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    })
    .returning();

  const session = createdSession[0];
  if (!session) {
    return storefrontJson(
      { error: "Failed to create checkout session" },
      { status: 500 },
      "OPTIONS, POST",
    );
  }

  const createdOrder = await db
    .insert(storefrontOrders)
    .values({
      clientId: client.id,
      checkoutSessionId: session.id,
      cartId: cart.id,
      publicId: createPublicOrderId(),
      email,
      name: name || null,
      phone: phone || null,
      status: "submitted",
      currency: cart.currency ?? "USD",
      subtotal: orderTotal,
      total: orderTotal,
      billing,
      shipping,
      metadata,
    })
    .returning();

  const order = createdOrder[0];
  if (!order) {
    return storefrontJson(
      { error: "Failed to create order" },
      { status: 500 },
      "OPTIONS, POST",
    );
  }

  await db.insert(storefrontOrderItems).values(
    cart.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      imageUrl: item.imageUrl,
      unitPrice: String(item.unitPrice ?? "0"),
      quantity: item.quantity,
      lineTotal: moneyToString(moneyToNumber(item.unitPrice) * item.quantity),
      snapshot: item.snapshot ?? {},
    })),
  );

  await db
    .update(storefrontCarts)
    .set({
      status: "converted",
      email,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(storefrontCarts.id, cart.id));

  const orderWithItems = await db.query.storefrontOrders.findFirst({
    where: eq(storefrontOrders.id, order.id),
    with: {
      items: true,
    },
  });

  const thankYouUrl = thankYouUrlBase
    ? `${thankYouUrlBase.replace(/\/$/, "")}/${order.publicId}`
    : null;

  return storefrontJson(
    {
      order: serializeOrder(orderWithItems),
      thankYouUrl,
    },
    undefined,
    "OPTIONS, POST",
  );
};
