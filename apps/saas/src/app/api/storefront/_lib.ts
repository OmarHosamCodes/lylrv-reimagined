import { and, eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import {
  clients,
  products,
  type storefrontCartItems,
  storefrontCarts,
  type storefrontOrderItems,
  storefrontOrders,
} from "@lylrv/db/schema";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function setStorefrontCorsHeaders(
  response: Response,
  methods = "OPTIONS, GET, POST, PATCH",
) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", methods);
  response.headers.set("Access-Control-Allow-Headers", "*");
  response.headers.set("Cache-Control", "no-store");
}

export function storefrontOptions(methods?: string) {
  const response = new Response(null, { status: 204 });
  setStorefrontCorsHeaders(response, methods);
  return response;
}

export function storefrontJson(
  data: unknown,
  init?: ResponseInit,
  methods?: string,
) {
  const response = Response.json(data, init);
  setStorefrontCorsHeaders(response, methods);
  return response;
}

export function isValidApiKey(apiKey: string | null) {
  return !!apiKey && UUID_PATTERN.test(apiKey);
}

export async function resolveClientByApiKey(apiKey: string) {
  return db.query.clients.findFirst({
    where: eq(clients.apiKey, apiKey),
  });
}

export function normalizeToken(value: string | null | undefined) {
  const token = (value ?? "").trim();
  return token ? token.slice(0, 64) : "";
}

export function createOpaqueToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function createPublicOrderId() {
  return `ord_${crypto
    .randomUUID()
    .replaceAll("-", "")
    .slice(0, 12)
    .toUpperCase()}`;
}

export function moneyToNumber(value: string | number | null | undefined) {
  const parsed = Number.parseFloat(String(value ?? 0));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function moneyToString(value: number) {
  return value.toFixed(2);
}

export async function getStorefrontProduct(clientId: string, slug: string) {
  return db.query.products.findFirst({
    where: and(
      eq(products.clientId, clientId),
      eq(products.slug, slug),
      eq(products.isVisible, true),
      eq(products.status, "active"),
    ),
  });
}

export async function getCartWithItems(clientId: string, token: string) {
  if (!token) {
    return null;
  }

  return db.query.storefrontCarts.findFirst({
    where: and(
      eq(storefrontCarts.clientId, clientId),
      eq(storefrontCarts.token, token),
    ),
    with: {
      items: true,
    },
  });
}

export async function createCart(clientId: string, currency?: string | null) {
  const created = await db
    .insert(storefrontCarts)
    .values({
      clientId,
      token: createOpaqueToken(),
      status: "active",
      currency: currency || "USD",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    })
    .returning();

  return created[0] ?? null;
}

export function serializeCart(
  cart:
    | ({
        items: Array<typeof storefrontCartItems.$inferSelect>;
      } & typeof storefrontCarts.$inferSelect)
    | null
    | undefined,
) {
  if (!cart) {
    return null;
  }

  const items = cart.items.map((item) => {
    const unitPrice = moneyToNumber(item.unitPrice);
    const lineTotal = unitPrice * item.quantity;

    return {
      id: item.id,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      imageUrl: item.imageUrl,
      unitPrice: moneyToString(unitPrice),
      quantity: item.quantity,
      currency: item.currency ?? cart.currency ?? "USD",
      snapshot: item.snapshot ?? {},
      lineTotal: moneyToString(lineTotal),
    };
  });

  const subtotal = items.reduce(
    (sum, item) => sum + moneyToNumber(item.lineTotal),
    0,
  );

  return {
    id: cart.id,
    token: cart.token,
    status: cart.status,
    currency: cart.currency ?? "USD",
    email: cart.email,
    items,
    totals: {
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: moneyToString(subtotal),
      total: moneyToString(subtotal),
    },
    expiresAt: cart.expiresAt,
    updatedAt: cart.updatedAt,
  };
}

export async function getOrderWithItems(clientId: string, publicId: string) {
  return db.query.storefrontOrders.findFirst({
    where: and(
      eq(storefrontOrders.clientId, clientId),
      eq(storefrontOrders.publicId, publicId),
    ),
    with: {
      items: true,
    },
  });
}

export function serializeOrder(
  order:
    | ({
        items: Array<typeof storefrontOrderItems.$inferSelect>;
      } & typeof storefrontOrders.$inferSelect)
    | null
    | undefined,
) {
  if (!order) {
    return null;
  }

  return {
    id: order.id,
    publicId: order.publicId,
    status: order.status,
    email: order.email,
    name: order.name,
    phone: order.phone,
    currency: order.currency ?? "USD",
    subtotal: moneyToString(moneyToNumber(order.subtotal)),
    total: moneyToString(moneyToNumber(order.total)),
    billing: order.billing ?? {},
    shipping: order.shipping ?? {},
    metadata: order.metadata ?? {},
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      imageUrl: item.imageUrl,
      unitPrice: moneyToString(moneyToNumber(item.unitPrice)),
      quantity: item.quantity,
      lineTotal: moneyToString(moneyToNumber(item.lineTotal)),
      snapshot: item.snapshot ?? {},
    })),
  };
}
