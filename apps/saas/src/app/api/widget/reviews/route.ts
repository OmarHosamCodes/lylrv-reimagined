import { eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clients, reviews } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

/**
 * Public REST endpoint for fetching reviews
 * Called by widget from external client sites
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

export const OPTIONS = () => {
  const response = new Response(null, { status: 204 });
  setCorsHeaders(response);
  return response;
};

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");
  const productId = searchParams.get("productId");
  const type = searchParams.get("type") || "all"; // all, product, website
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (!shop) {
    const response = Response.json(
      { error: "Missing 'shop' query parameter" },
      { status: 400 },
    );
    setCorsHeaders(response);
    return response;
  }

  try {
    // Find client by createSource (shop identifier)
    const client = await db.query.clients.findFirst({
      where: eq(clients.createSource, shop),
    });

    if (!client) {
      const response = Response.json(
        { error: "Shop not found", reviews: [] },
        { status: 404 },
      );
      setCorsHeaders(response);
      return response;
    }

    // Build conditions for reviews query
    let reviewsData;

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
      if (rating >= 1 && rating <= 5) {
        ratingDistribution[rating - 1]++;
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
