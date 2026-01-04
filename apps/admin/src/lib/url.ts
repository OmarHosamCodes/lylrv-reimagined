import { env } from "~/env";

export function getBaseUrl() {
	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	// Server: check various URL sources in order of priority
	if (env.PUBLIC_URL) return env.PUBLIC_URL;
	if (env.VITE_APP_URL) return env.VITE_APP_URL;
	if (env.RAILWAY_PUBLIC_DOMAIN) return `https://${env.RAILWAY_PUBLIC_DOMAIN}`;

	return `http://localhost:${process.env.PORT ?? 3001}`;
}

export function getProductionUrl() {
	if (env.PUBLIC_URL) return env.PUBLIC_URL;
	if (env.VITE_APP_URL) return env.VITE_APP_URL;
	if (env.RAILWAY_PUBLIC_DOMAIN) return `https://${env.RAILWAY_PUBLIC_DOMAIN}`;
	return "http://localhost:3001";
}
