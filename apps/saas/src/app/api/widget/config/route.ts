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
        { error: "Shop not found", enabled: false },
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
      shop: client.createSource,
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
