import type { NextRequest } from "next/server";

import {
  getOrderWithItems,
  isValidApiKey,
  resolveClientByApiKey,
  serializeOrder,
  storefrontJson,
  storefrontOptions,
} from "../../_lib";

export const OPTIONS = () => storefrontOptions("OPTIONS, GET");

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> },
) => {
  const { publicId } = await params;
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("apiKey");

  if (!isValidApiKey(apiKey)) {
    return storefrontJson(
      { error: "Invalid 'apiKey' query parameter" },
      { status: 400 },
      "OPTIONS, GET",
    );
  }

  if (!publicId.trim()) {
    return storefrontJson(
      { error: "Missing public order id" },
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

  const order = await getOrderWithItems(client.id, publicId);
  if (!order) {
    return storefrontJson(
      { error: "Order not found" },
      { status: 404 },
      "OPTIONS, GET",
    );
  }

  return storefrontJson(
    { order: serializeOrder(order) },
    undefined,
    "OPTIONS, GET",
  );
};
