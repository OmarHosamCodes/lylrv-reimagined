import { eq } from "@lylrv/db";
import { db } from "@lylrv/db/client";
import { clientConfig, clients } from "@lylrv/db/schema";
import type { NextRequest } from "next/server";

/**
 * Public REST endpoint for widget configuration
 * Called by loader.js from external client sites
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
        { error: "API key not found", enabled: false },
        { status: 404 },
      );
      setCorsHeaders(response);
      return response;
    }

    const config = await db.query.clientConfig.findFirst({
      where: eq(clientConfig.clientId, client.id),
    });

    // Build clientConfig for widgets
    const widgetClientConfig = config
      ? {
          theme: config.theme as {
            color: string;
            mainButtonIcon: string;
            buttonTextColor: string;
            secondaryButtonIcon: string;
            buttonBackgroundColor: string;
          },
          language: config.language as {
            local: string;
            direction: "ltr" | "rtl";
          },
          localizations: config.localizations as Record<
            string,
            Record<string, string>
          >,
          earnSections: config.earnSections as Array<{
            title: string;
            earnAmount: string;
            description: string;
          }>,
          variables: config.variables as Array<{
            name: string;
            value: string;
          }>,
          interactions: config.interactions as Array<{
            trigger: string;
            pointsGained: number;
          }>,
          conditions: config.conditions as Array<{
            status: string;
            maxAmount: number;
            minAmount: number;
            pointsGained: number;
          }>,
        }
      : null;

    const response = Response.json({
      enabled: config?.isActive ?? true,
      widgets: ["loyalty", "reviews", "productReviews"],
      styles: {
        primaryColor: "#c56f26",
        position: "right",
      },
      apiKey: client.apiKey,
      // Backward compatibility for existing widgets expecting `shop`.
      shop: client.apiKey,
      clientId: client.id,
      clientConfig: widgetClientConfig,
    });
    setCorsHeaders(response);
    return response;
  } catch (error) {
    console.error("Widget config error:", error);
    const response = Response.json(
      { error: "Internal server error", enabled: false },
      { status: 500 },
    );
    setCorsHeaders(response);
    return response;
  }
};
