import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@lylrv/eslint-config/base";
import { reactConfig } from "@lylrv/eslint-config/react";

export default defineConfig(
  {
    ignores: [".nitro/**", ".output/**", ".tanstack/**"],
  },
  baseConfig,
  reactConfig,
  restrictEnvAccess,
);
