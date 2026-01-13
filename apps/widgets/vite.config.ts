import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// Build configuration for embeddable widgets
// Each widget needs to be a self-contained IIFE bundle
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@widgets": resolve(__dirname, "./src/widgets"),
		},
	},
	build: {
		outDir: "../saas/public/widgets",
		emptyOutDir: true,
		cssCodeSplit: false, // Bundle CSS with each entry
		rollupOptions: {
			input: {
				loader: resolve(__dirname, "src/loader.ts"),
				loyalty: resolve(__dirname, "src/widgets/loyalty/index.tsx"),
				reviews: resolve(__dirname, "src/widgets/reviews/index.tsx"),
				productReviews: resolve(
					__dirname,
					"src/widgets/product-reviews/index.tsx",
				),
			},
			output: {
				entryFileNames: "[name].bundle.js",
				chunkFileNames: "[name]-[hash].js",
				assetFileNames: "[name][extname]",
				format: "es", // Use ES modules, loader will handle dynamic imports
				// Manually chunk to keep widgets separate
				manualChunks: (id) => {
					// Keep React in a shared vendor chunk
					if (id.includes("node_modules/react")) {
						return "vendor-react";
					}
					return undefined;
				},
			},
			// Preserve exports from entry files
			preserveEntrySignatures: "exports-only",
		},
		// Optimize for size
		minify: "esbuild",
		target: "es2020",
	},
	define: {
		"process.env": {},
	},
});
