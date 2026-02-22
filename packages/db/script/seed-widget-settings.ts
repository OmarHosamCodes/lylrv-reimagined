#!/usr/bin/env npx tsx
/**
 * @fileoverview Seed widget settings for a client
 *
 * This script creates default widget settings for a given client ID.
 *
 * Usage:
 *   pnpm --filter @lylrv/db seed:widgets <clientId>
 *   # or with env loaded
 *   pnpm with-env tsx script/seed-widget-settings.ts <clientId>
 *
 * Options:
 *   --enable-loyalty       Enable the loyalty widget
 *   --enable-reviews       Enable the reviews widget
 *   --enable-product-reviews Enable the product reviews widget
 *   --color <hex>          Primary color (default: #000000)
 *   --position <pos>       Widget position: left or right (default: right)
 *   --disabled             Create settings with widget disabled
 */

import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../src/schema";
import { clients, widgetSettings } from "../src/schema";

// Parse command line arguments
function parseArgs(args: string[]) {
  const clientId = args.find((arg) => !arg.startsWith("--"));

  if (!clientId) {
    console.error("❌ Error: Client ID is required");
    console.error("\nUsage: pnpm seed:widgets <clientId> [options]");
    console.error("\nOptions:");
    console.error("  --enable-loyalty         Enable the loyalty widget");
    console.error("  --enable-reviews         Enable the reviews widget");
    console.error(
      "  --enable-product-reviews Enable the product reviews widget",
    );
    console.error(
      "  --color <hex>            Primary color (default: #000000)",
    );
    console.error(
      "  --position <pos>         Widget position: left or right (default: right)",
    );
    console.error(
      "  --disabled               Create settings with widget disabled",
    );
    process.exit(1);
  }

  // Validate UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(clientId)) {
    console.error("❌ Error: Invalid client ID format. Expected UUID.");
    process.exit(1);
  }

  const enableLoyalty = args.includes("--enable-loyalty");
  const enableReviews = args.includes("--enable-reviews");
  const enableProductReviews = args.includes("--enable-product-reviews");
  const isDisabled = args.includes("--disabled");

  // Parse --color flag
  const colorIndex = args.indexOf("--color");
  let primaryColor = "#000000";
  if (colorIndex !== -1 && args[colorIndex + 1]) {
    primaryColor = args[colorIndex + 1];
    if (!/^#[0-9a-fA-F]{6}$/.test(primaryColor)) {
      console.error(
        "❌ Error: Invalid color format. Expected hex color (e.g., #FF0000)",
      );
      process.exit(1);
    }
  }

  // Parse --position flag
  const positionIndex = args.indexOf("--position");
  let position: "left" | "right" = "right";
  if (positionIndex !== -1 && args[positionIndex + 1]) {
    const posValue = args[positionIndex + 1];
    if (posValue !== "left" && posValue !== "right") {
      console.error("❌ Error: Invalid position. Expected 'left' or 'right'");
      process.exit(1);
    }
    position = posValue;
  }

  return {
    clientId,
    isEnabled: !isDisabled,
    activeWidgets: {
      loyalty: enableLoyalty,
      reviews: enableReviews,
      productReviews: enableProductReviews,
    },
    appearance: {
      primaryColor,
      position,
    },
  };
}

async function main() {
  const connectionString = process.env.POSTGRES_URL;

  if (!connectionString) {
    console.error("❌ Error: Missing POSTGRES_URL environment variable");
    console.error(
      "Make sure to run with: pnpm with-env tsx script/seed-widget-settings.ts",
    );
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const config = parseArgs(args);

  console.log("🔧 Connecting to database...");

  const pool = new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  const db = drizzle(pool, {
    schema,
    casing: "snake_case",
  });

  try {
    // Verify the client exists
    console.log(`🔍 Verifying client ${config.clientId} exists...`);
    const client = await db.query.clients.findFirst({
      where: eq(clients.id, config.clientId),
    });

    if (!client) {
      console.error(`❌ Error: Client with ID ${config.clientId} not found`);
      process.exit(1);
    }

    console.log(`✅ Found client: ${client.name ?? client.email}`);

    // Check if settings already exist
    const existingSettings = await db.query.widgetSettings.findFirst({
      where: eq(widgetSettings.clientId, config.clientId),
    });

    if (existingSettings) {
      console.log(
        "⚠️  Widget settings already exist for this client. Updating...",
      );

      await db
        .update(widgetSettings)
        .set({
          isEnabled: config.isEnabled,
          activeWidgets: config.activeWidgets,
          appearance: config.appearance,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(widgetSettings.id, existingSettings.id));

      console.log("✅ Widget settings updated successfully!");
    } else {
      console.log("📝 Creating new widget settings...");

      const [newSettings] = await db
        .insert(widgetSettings)
        .values({
          clientId: config.clientId,
          isEnabled: config.isEnabled,
          activeWidgets: config.activeWidgets,
          appearance: config.appearance,
        })
        .returning();

      console.log("✅ Widget settings created successfully!");
      console.log(`   ID: ${newSettings.id}`);
    }

    console.log("\n📊 Configuration:");
    console.log(`   Enabled: ${config.isEnabled}`);
    console.log(`   Active Widgets:`);
    console.log(`     - Loyalty: ${config.activeWidgets.loyalty}`);
    console.log(`     - Reviews: ${config.activeWidgets.reviews}`);
    console.log(
      `     - Product Reviews: ${config.activeWidgets.productReviews}`,
    );
    console.log(`   Appearance:`);
    console.log(`     - Primary Color: ${config.appearance.primaryColor}`);
    console.log(`     - Position: ${config.appearance.position}`);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("\n👋 Done!");
  }
}

main();
