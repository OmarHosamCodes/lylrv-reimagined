import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@lylrv/eslint-config/base";

export default defineConfig(
  {
    ignores: ["script/**"],
  },
  baseConfig,
  restrictEnvAccess,
);
