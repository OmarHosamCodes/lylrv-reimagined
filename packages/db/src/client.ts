import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
	throw new Error("Missing POSTGRES_URL environment variable");
}

// Railway Pro tier pool configuration - configurable via environment
// Pro plan can handle more connections, adjust based on your plan
const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "15", 10);
const poolMin = Number.parseInt(process.env.DATABASE_POOL_MIN ?? "2", 10);
const idleTimeout = Number.parseInt(
	process.env.DATABASE_IDLE_TIMEOUT ?? "30000",
	10,
);
const connectionTimeout = Number.parseInt(
	process.env.DATABASE_CONNECTION_TIMEOUT ?? "10000",
	10,
);

const pool = new Pool({
	connectionString,
	// Use SSL for production connections
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: false,
	// Connection pool limits - optimized for Railway Pro
	max: poolMax, // Maximum connections in pool (Railway Pro: 15-25 recommended)
	min: poolMin, // Minimum connections to keep ready
	idleTimeoutMillis: idleTimeout, // Close idle connections after 30s
	connectionTimeoutMillis: connectionTimeout, // Timeout for new connections (10s for Railway network)
	// Statement timeout to prevent long-running queries
	statement_timeout: 60000, // 60s max query time
});

// Graceful shutdown handler for Railway deployments
if (typeof process !== "undefined") {
	const shutdown = async () => {
		console.log("[DB] Shutting down connection pool...");
		await pool.end();
		console.log("[DB] Connection pool closed");
	};

	process.on("SIGTERM", shutdown);
	process.on("SIGINT", shutdown);
}

export const db = drizzle(pool, {
	schema,
	casing: "snake_case",
});
