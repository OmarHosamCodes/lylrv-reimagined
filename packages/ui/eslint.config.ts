import { defineConfig } from "eslint/config";

import { baseConfig } from "@lylrv/eslint-config/base";
import { reactConfig } from "@lylrv/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
