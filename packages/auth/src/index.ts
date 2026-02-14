import { db } from "@lylrv/db/client";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, oAuthProxy } from "better-auth/plugins";

export function initAuth<
  TExtraPlugins extends BetterAuthPlugin[] = [],
>(options: {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  extraPlugins?: TExtraPlugins;
}) {
  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,

    // Enable first-party credentials auth
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },

    // Keep proxy support for deployed environments and include OTP support.
    // No social provider configuration is defined here.
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      emailOTP(),
      ...(options.extraPlugins ?? []),
    ],

    trustedOrigins: [],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
}

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
