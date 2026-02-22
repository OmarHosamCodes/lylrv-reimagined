import "server-only";

import { initAuth } from "@lylrv/auth";

import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { cache } from "react";
import { env } from "~/env";
import { getBaseUrl, getProductionUrl } from "~/lib/url";

export const auth = initAuth({
  baseUrl: getBaseUrl(),
  productionUrl: getProductionUrl(),
  secret: env.AUTH_SECRET,
  extraPlugins: [nextCookies()],
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
