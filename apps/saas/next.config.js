import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",

  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@lylrv/api",
    "@lylrv/auth",
    "@lylrv/db",
    "@lylrv/ui",
    "@lylrv/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },

  /** CORS headers for embeddable widgets - allow any origin to load widget bundles */
  async headers() {
    return [
      {
        source: "/widgets/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },
};

export default config;
