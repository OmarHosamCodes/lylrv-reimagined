import { createFileRoute } from "@tanstack/react-router";

import { AuthShowcase } from "~/component/auth-showcase";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  return (
    <div className="bg-ambient noise min-h-screen px-6 py-10 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 pt-10">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Lylrv Admin
          </p>
          <h1 className="font-display mt-2 text-4xl font-bold tracking-tight lg:text-5xl">
            Client Operations Console
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground lg:text-base">
            Sign in to manage customers, loyalty, reviews, referrals, orders,
            and settings with live data from your backend.
          </p>
        </div>

        <AuthShowcase />
      </div>
    </div>
  );
}
