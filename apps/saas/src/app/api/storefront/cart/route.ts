import { eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { storefrontCartItems, storefrontCarts } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

import {
  createCart,
  getCartWithItems,
  getStorefrontProduct,
  isValidApiKey,
  normalizeToken,
  resolveClientByApiKey,
  serializeCart,
  storefrontJson,
  storefrontOptions,
} from "../_lib";

export const OPTIONS = () => storefrontOptions();

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");
  const cartToken = normalizeToken(searchParams.get("cartToken"));

  if (!isValidApiKey(apiKey)) {
    return storefrontJson(
      { error: "Invalid 'apiKey' query parameter" },
      { status: 400 },
    );
  }

  const validApiKey = apiKey as string;
  const client = await resolveClientByApiKey(validApiKey);
  if (!client) {
    return storefrontJson({ error: "API key not found" }, { status: 404 });
  }

  if (!cartToken) {
    return storefrontJson({ cart: null });
  }

  const cart = await getCartWithItems(client.id, cartToken);
  return storefrontJson({ cart: serializeCart(cart) });
};

export const POST = async (req: NextRequest) => {
  const body = (await req.json().catch(() => null)) as {
    apiKey?: string;
    cartToken?: string;
    productSlug?: string;
    quantity?: number;
  } | null;

  const apiKey = body?.apiKey?.trim() ?? "";
  const productSlug = body?.productSlug?.trim() ?? "";
  const quantity = Math.max(Number(body?.quantity ?? 1) || 1, 1);
  const incomingCartToken = normalizeToken(body?.cartToken);

  if (!isValidApiKey(apiKey)) {
    return storefrontJson(
      { error: "Invalid 'apiKey' in request body" },
      { status: 400 },
    );
  }

  if (!productSlug) {
    return storefrontJson(
      { error: "Missing 'productSlug' in request body" },
      { status: 400 },
    );
  }

  const client = await resolveClientByApiKey(apiKey);
  if (!client) {
    return storefrontJson({ error: "API key not found" }, { status: 404 });
  }

  const product = await getStorefrontProduct(client.id, productSlug);
  if (!product) {
    return storefrontJson({ error: "Product not found" }, { status: 404 });
  }

  let cart = incomingCartToken
    ? await getCartWithItems(client.id, incomingCartToken)
    : null;

  if (!cart) {
    const createdCart = await createCart(client.id, product.currency);
    if (!createdCart) {
      return storefrontJson(
        { error: "Failed to create cart" },
        { status: 500 },
      );
    }
    cart = await getCartWithItems(client.id, createdCart.token);
  }

  if (!cart) {
    return storefrontJson({ error: "Cart not found" }, { status: 500 });
  }

  const existingItem = cart.items.find((item) => item.productId === product.id);
  const primaryImage =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : null;

  if (existingItem) {
    await db
      .update(storefrontCartItems)
      .set({
        quantity: existingItem.quantity + quantity,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(storefrontCartItems.id, existingItem.id));
  } else {
    await db.insert(storefrontCartItems).values({
      cartId: cart.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      imageUrl:
        primaryImage &&
        typeof primaryImage === "object" &&
        "url" in primaryImage
          ? String(primaryImage.url)
          : null,
      unitPrice: String(product.price ?? "0"),
      quantity,
      currency: product.currency ?? "USD",
      snapshot: {
        shortDescription: product.shortDescription,
        description: product.description,
        category: product.category,
        tags: product.tags,
        images: product.images,
      },
    });
  }

  await db
    .update(storefrontCarts)
    .set({
      currency: product.currency ?? cart.currency ?? "USD",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(storefrontCarts.id, cart.id));

  const updatedCart = await getCartWithItems(client.id, cart.token);
  return storefrontJson({ cart: serializeCart(updatedCart) });
};

export const PATCH = async (req: NextRequest) => {
  const body = (await req.json().catch(() => null)) as {
    apiKey?: string;
    cartToken?: string;
    itemId?: string;
    quantity?: number;
  } | null;

  const apiKey = body?.apiKey?.trim() ?? "";
  const cartToken = normalizeToken(body?.cartToken);
  const itemId = body?.itemId?.trim() ?? "";
  const quantity = Math.max(Number(body?.quantity ?? 0) || 0, 0);

  if (!isValidApiKey(apiKey)) {
    return storefrontJson(
      { error: "Invalid 'apiKey' in request body" },
      { status: 400 },
    );
  }

  if (!cartToken || !itemId) {
    return storefrontJson(
      { error: "Missing cartToken or itemId" },
      { status: 400 },
    );
  }

  const client = await resolveClientByApiKey(apiKey);
  if (!client) {
    return storefrontJson({ error: "API key not found" }, { status: 404 });
  }

  const cart = await getCartWithItems(client.id, cartToken);
  if (!cart) {
    return storefrontJson({ error: "Cart not found" }, { status: 404 });
  }

  const item = cart.items.find((entry) => entry.id === itemId);
  if (!item) {
    return storefrontJson({ error: "Cart item not found" }, { status: 404 });
  }

  if (quantity <= 0) {
    await db
      .delete(storefrontCartItems)
      .where(eq(storefrontCartItems.id, item.id));
  } else {
    await db
      .update(storefrontCartItems)
      .set({
        quantity,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(storefrontCartItems.id, item.id));
  }

  await db
    .update(storefrontCarts)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(storefrontCarts.id, cart.id));

  const updatedCart = await getCartWithItems(client.id, cartToken);
  return storefrontJson({ cart: serializeCart(updatedCart) });
};
