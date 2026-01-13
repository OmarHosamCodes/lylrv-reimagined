/**
 * Lylrv Widget Loader
 *
 * This script is embedded on client websites and handles:
 * 1. Fetching widget configuration from the API
 * 2. Dynamically loading enabled widget bundles
 * 3. Initializing widgets with Shadow DOM isolation
 *
 * Usage:
 * <script src="https://your-domain.com/widgets/loader.bundle.js?shop=myshop.com" async></script>
 */

import type {
	UserDetails,
	WidgetConfig,
	WidgetContext,
	WidgetModule,
} from "@/types";

(() => {
	const win = window as Window & {
		__LYLRV_LOADED__?: boolean;
		__LYLRV_CONFIG__?: WidgetConfig;
		LYLRV_WP_DATA?: {
			user?: UserDetails;
			context?: WidgetContext;
		};
		LylrvWidgets?: Record<string, WidgetModule>;
	};

	// Prevent double-loading
	if (win.__LYLRV_LOADED__) return;
	win.__LYLRV_LOADED__ = true;

	// Get the script tag to extract params
	// Note: document.currentScript is null for ES modules, so we find the script by URL pattern
	let scriptElement: HTMLScriptElement | null =
		document.currentScript as HTMLScriptElement;

	if (!scriptElement) {
		// For ES modules, find the script tag by looking for our loader URL
		const scripts = document.querySelectorAll(
			'script[src*="loader.bundle.js"]',
		);
		if (scripts.length > 0) {
			scriptElement = scripts[0] as HTMLScriptElement;
		}
	}

	if (!scriptElement) {
		console.error("[Lylrv] Could not find script tag");
		return;
	}

	const scriptUrl = new URL(scriptElement.src);
	const shop = scriptUrl.searchParams.get("shop");

	if (!shop) {
		console.error("[Lylrv] Missing 'shop' parameter in script URL");
		return;
	}

	// Determine API base URL (same origin as the script)
	const apiBaseUrl = scriptUrl.origin;

	async function loadConfig(): Promise<WidgetConfig | null> {
		try {
			const response = await fetch(
				`${apiBaseUrl}/api/widget/config?shop=${encodeURIComponent(shop!)}`,
			);
			if (!response.ok) {
				console.error("[Lylrv] Failed to load config:", response.status);
				return null;
			}
			return await response.json();
		} catch (error) {
			console.error("[Lylrv] Error loading config:", error);
			return null;
		}
	}

	async function loadWidgetBundle(
		widgetName: string,
	): Promise<WidgetModule | null> {
		try {
			// Use dynamic import for ES modules
			const widgetUrl = `${apiBaseUrl}/widgets/${widgetName}.bundle.js`;
			const module = await import(/* @vite-ignore */ widgetUrl);

			if (module && typeof module.mount === "function") {
				return module as WidgetModule;
			}

			console.error(
				`[Lylrv] Widget ${widgetName} does not export a mount function`,
			);
			return null;
		} catch (error) {
			console.error(`[Lylrv] Error loading widget ${widgetName}:`, error);
			return null;
		}
	}

	function createWidgetContainer(
		widgetName: string,
		_position: "left" | "right",
	): HTMLElement {
		// Check for existing container (for inline embedding)
		const existingContainer = document.getElementById(
			`lylrv-${widgetName}-container`,
		);
		if (existingContainer) {
			return existingContainer;
		}

		throw new Error("Inline embedding only - no dynamic container creation");
	}

	async function init() {
		const config = await loadConfig();
		if (!config || !config.enabled) {
			console.log("[Lylrv] Widgets disabled or no config found");
			return;
		}

		// Merge injected WordPress data
		if (win.LYLRV_WP_DATA) {
			console.log("[Lylrv] Found WP Data:", win.LYLRV_WP_DATA);
			config.user = win.LYLRV_WP_DATA.user;
			config.context = win.LYLRV_WP_DATA.context;
		}

		win.__LYLRV_CONFIG__ = config;

		// Load and mount each enabled widget
		for (const widgetName of config.widgets) {
			try {
				const widgetModule = await loadWidgetBundle(widgetName);
				if (widgetModule) {
					const container = createWidgetContainer(
						widgetName,
						config.styles.position,
					);
					widgetModule.mount(container, config);
				}
			} catch (error) {
				console.error(`[Lylrv] Failed to initialize ${widgetName}:`, error);
			}
		}
	}

	// Wait for DOM to be ready
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();
