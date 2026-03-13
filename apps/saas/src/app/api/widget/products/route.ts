import { and, eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clients, products } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

/**
 * Public REST endpoint for listing SaaS-managed products.
 * Called by WordPress plugin or any external site via apiKey.
 *
 * Query params:
 *   - apiKey (required): client API key (UUID)
 *   - status: filter by status (default: "active")
 *   - category: filter by category
 *   - limit: max results (default 50, max 100)
 *   - offset: pagination offset (default 0)
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

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");
  const status = searchParams.get("status") || "active";
  const category = searchParams.get("category");
  const limit = Math.min(
    Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1),
    100,
  );
  const offset = Math.max(
    parseInt(searchParams.get("offset") || "0", 10) || 0,
    0,
  );

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

  try {
    // Find client by API key
    const client = await db.query.clients.findFirst({
      where: eq(clients.apiKey, apiKey),
    });

    if (!client) {
      const response = Response.json(
        { error: "API key not found", products: [] },
        { status: 404 },
      );
      setCorsHeaders(response);
      return response;
    }

    // Build where conditions
    const conditions = [
      eq(products.clientId, client.id),
      eq(products.isVisible, true),
    ];

    if (status === "active" || status === "draft" || status === "archived") {
      conditions.push(eq(products.status, status));
    }

    if (category) {
      conditions.push(eq(products.category, category));
    }

    const productRows = await db.query.products.findMany({
      where: and(...conditions),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit,
      offset,
    });

    const response = Response.json({
      products: productRows.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        currency: p.currency,
        sku: p.sku,
        images: p.images,
        status: p.status,
        category: p.category,
        tags: p.tags,
        metadata: p.metadata,
        createdAt: p.createdAt,
      })),
      meta: {
        total: productRows.length,
        offset,
        limit,
      },
    });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Widget products error:", error);
    const response = Response.json(
      { error: "Internal server error", products: [] },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
};
