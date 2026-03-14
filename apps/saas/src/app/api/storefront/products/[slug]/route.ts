import type { NextRequest } from "next/server";

import {
  getStorefrontProduct,
  isValidApiKey,
  resolveClientByApiKey,
  storefrontJson,
  storefrontOptions,
} from "../../_lib";

export const OPTIONS = () => storefrontOptions("OPTIONS, GET");

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) => {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");

  if (!isValidApiKey(apiKey)) {
    return storefrontJson(
      { error: "Invalid 'apiKey' query parameter" },
      { status: 400 },
      "OPTIONS, GET",
    );
  }

  if (!slug.trim()) {
    return storefrontJson(
      { error: "Missing product slug" },
      { status: 400 },
      "OPTIONS, GET",
    );
  }

  const validApiKey = apiKey as string;
  const client = await resolveClientByApiKey(validApiKey);
  if (!client) {
    return storefrontJson(
      { error: "API key not found" },
      { status: 404 },
      "OPTIONS, GET",
    );
  }

  const product = await getStorefrontProduct(client.id, slug);
  if (!product) {
    return storefrontJson(
      { error: "Product not found" },
      { status: 404 },
      "OPTIONS, GET",
    );
  }

  return storefrontJson(
    {
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
        category: product.category,
        tags: product.tags,
        metadata: product.metadata,
        storefrontUrl: `/store/${product.slug}`,
      },
    },
    undefined,
    "OPTIONS, GET",
  );
};
