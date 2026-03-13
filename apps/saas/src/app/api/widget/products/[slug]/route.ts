import { and, eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clients, products } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

/**
 * Public REST endpoint for fetching a single SaaS-managed product by slug.
 * Called by WordPress plugin or any external site via apiKey.
 *
 * Route: GET /api/widget/products/[slug]?apiKey=...
 */

const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET");
  res.headers.set("Access-Control-Allow-Headers", "*");
  res.headers.set(
    "Cache-Control",
    "public, max-age=60, stale-while-revalidate=300",
  );
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");

  if (!apiKey) {
    const response = Response.json(
      { error: "Missing 'apiKey' query parameter" },
      { status: 400 },
    );
    setCorsHeaders(response);
    return response;
  }

  if (!UUID_PATTERN.test(apiKey)) {
    const response = Response.json(
      { error: "Invalid 'apiKey' format" },
      { status: 400 },
    );
    setCorsHeaders(response);
    return response;
  }

  if (!slug || slug.trim() === "") {
    const response = Response.json(
      { error: "Missing product slug" },
      { status: 400 },
    );
    setCorsHeaders(response);
    return response;
  }

  try {
    // Find client by API key
    const client = await db.query.clients.findFirst({
      where: eq(clients.apiKey, apiKey),
    });

    if (!client) {
      const response = Response.json(
        { error: "API key not found" },
        { status: 404 },
      );
      setCorsHeaders(response);
      return response;
    }

    // Find product by slug and client
    const product = await db.query.products.findFirst({
      where: and(
        eq(products.clientId, client.id),
        eq(products.slug, slug),
        eq(products.isVisible, true),
      ),
    });

    if (!product) {
      const response = Response.json(
        { error: "Product not found" },
        { status: 404 },
      );
      setCorsHeaders(response);
      return response;
    }

    const response = Response.json({
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        shortDescription: product.shortDescription,
        description: product.description,
        price: product.price,
        comparePrice: product.comparePrice,
        currency: product.currency,
        sku: product.sku,
        images: product.images,
        status: product.status,
        category: product.category,
        tags: product.tags,
        metadata: product.metadata,
        createdAt: product.createdAt,
      },
    });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Widget product by slug error:", error);
    const response = Response.json(
      { error: "Internal server error" },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
};
