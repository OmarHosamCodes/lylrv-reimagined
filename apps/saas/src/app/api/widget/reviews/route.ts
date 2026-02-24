import { eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clients, reviews } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

/**
 * Public REST endpoint for fetching and submitting reviews
 * Called by widget from external client sites
 */

const setCorsHeaders = (res: Response) => {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "OPTIONS, GET, POST");
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
  const apiKey = searchParams.get("apiKey") ?? searchParams.get("shop");
  const productId = searchParams.get("productId");
  const type = searchParams.get("type") || "all"; // all, product, website
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

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
        { error: "API key not found", reviews: [] },
        { status: 404 },
      );
      setCorsHeaders(response);
      return response;
    }

    // Build conditions for reviews query
    let reviewsData: Awaited<ReturnType<typeof db.query.reviews.findMany>> = [];

    if (productId) {
      // Get product reviews for specific product
      const product = await db.query.products.findFirst({
        where: (p, { and, eq: eqOp }) =>
          and(
            eqOp(p.clientId, client.id),
            eqOp(p.productId, parseInt(productId, 10)),
          ),
      });

      if (product) {
        reviewsData = await db.query.reviews.findMany({
          where: (r, { and, eq: eqOp }) =>
            and(eqOp(r.clientId, client.id), eqOp(r.productId, product.id)),
          orderBy: (r, { desc }) => [desc(r.createdAt)],
          limit,
          offset,
        });
      } else {
        reviewsData = [];
      }
    } else if (type === "website") {
      // Website reviews only
      reviewsData = await db.query.reviews.findMany({
        where: (r, { and, eq: eqOp }) =>
          and(eqOp(r.clientId, client.id), eqOp(r.type, "website")),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit,
        offset,
      });
    } else if (type === "product") {
      // Product reviews only
      reviewsData = await db.query.reviews.findMany({
        where: (r, { and, eq: eqOp }) =>
          and(eqOp(r.clientId, client.id), eqOp(r.type, "product")),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit,
        offset,
      });
    } else {
      // All reviews
      reviewsData = await db.query.reviews.findMany({
        where: eq(reviews.clientId, client.id),
        orderBy: (r, { desc }) => [desc(r.createdAt)],
        limit,
        offset,
      });
    }

    // Calculate average rating and total count
    const allReviews = await db.query.reviews.findMany({
      where: productId
        ? (r, { and, eq: eqOp }) => {
            return and(eqOp(r.clientId, client.id));
          }
        : eq(reviews.clientId, client.id),
    });

    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + parseFloat(r.rating || "0"), 0) /
          totalReviews
        : 0;

    // Rating distribution
    const ratingDistribution = [0, 0, 0, 0, 0];
    allReviews.forEach((r) => {
      const rating = Math.floor(parseFloat(r.rating || "0"));
      const bucket = rating - 1;
      if (bucket >= 0 && bucket < ratingDistribution.length) {
        ratingDistribution[bucket] = (ratingDistribution[bucket] ?? 0) + 1;
      }
    });

    const response = Response.json({
      reviews: reviewsData.map((r) => ({
        id: r.id,
        author: r.author,
        rating: parseFloat(r.rating || "0"),
        title: r.title,
        body: r.body,
        images: r.images,
        verified: r.verified,
        createdAt: r.createdAt,
        type: r.type,
      })),
      meta: {
        total: totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        offset,
        limit,
      },
    });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Widget reviews error:", error);
    const response = Response.json(
      { error: "Internal server error", reviews: [] },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const apiKey = formData.get("apiKey") as string | null;
    const rating = formData.get("rating") as string | null;
    const title = formData.get("title") as string | null;
    const body = formData.get("body") as string | null;
    const productId = formData.get("productId") as string | null;
    const images = formData.getAll("images") as File[];

    if (!apiKey) {
      const response = Response.json(
        { error: "Missing 'apiKey' field" },
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

    if (!rating) {
      const response = Response.json(
        { error: "Missing 'rating' field" },
        { status: 400 },
      );
      setCorsHeaders(response);
      return response;
    }

    const ratingNum = parseFloat(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      const response = Response.json(
        { error: "Invalid rating: must be between 0 and 5" },
        { status: 400 },
      );
      setCorsHeaders(response);
      return response;
    }

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

    // Process image uploads
    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      // For now, we store file names or base64 data
      // In production, you'd upload to cloud storage (S3, etc.)
      for (const image of images) {
        const buffer = await image.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        imageUrls.push(`data:${image.type};base64,${base64}`);
      }
    }

    // Determine review type and product UUID
    let productUUID: string | null = null;
    let reviewType: "product" | "website" = "website";

    if (productId) {
      // Find product by productId (external ID) and client
      const product = await db.query.products.findFirst({
        where: (p, { and, eq: eqOp }) =>
          and(
            eqOp(p.clientId, client.id),
            eqOp(p.productId, parseInt(productId, 10)),
          ),
      });

      if (product) {
        productUUID = product.id;
        reviewType = "product";
      }
    }

    // Create review
    await db.insert(reviews).values({
      clientId: client.id,
      productId: productUUID,
      rating: ratingNum.toString(),
      title: title || null,
      body: body || null,
      images: imageUrls.length > 0 ? imageUrls : null,
      type: reviewType,
      verified: false,
    });

    const response = Response.json({ success: true });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Widget review submission error:", error);
    const response = Response.json(
      { error: "Internal server error", success: false },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
};
