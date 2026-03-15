import { Button } from "@lylrv/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "~/auth/client";
import { useTRPC } from "~/lib/trpc";

type AuthMode = "sign-in" | "sign-up";

export function AuthShowcase() {
  const { data: session } = authClient.useSession();
  const trpc = useTRPC();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientSource, setClientSource] = useState("custom");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createClientMutation = useMutation(
    trpc.dashboard.createClient.mutationOptions(),
  );

  if (!session) {
    return (
      <div className="reveal-up delay-2 flex w-full max-w-md flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Sign in with your email and password to access the admin dashboard
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "sign-in"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setMode("sign-in");
              setErrorMessage(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              mode === "sign-up"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              setMode("sign-up");
              setErrorMessage(null);
            }}
          >
            Create account
          </button>
        </div>

        <form
          className="glass-strong w-full space-y-4 rounded-2xl border border-border/60 p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            setErrorMessage(null);
            setIsPending(true);

            try {
              if (mode === "sign-up") {
                const res = await authClient.signUp.email({
                  email,
                  password,
                  name: name.trim() || email.split("@")[0] || "User",
                  callbackURL: "/",
                });

                if (res.error) {
                  throw new Error(
                    res.error.message ?? "Unable to create account",
                  );
                }

                await createClientMutation.mutateAsync({
                  name:
                    clientName.trim() ||
                    name.trim() ||
                    email.split("@")[0] ||
                    "My Client",
                  createSource: clientSource,
                });
              } else {
                const res = await authClient.signIn.email({
                  email,
                  password,
                  callbackURL: "/dashboard",
                });

                if (res.error) {
                  throw new Error(
                    res.error.message ?? "Unable to sign in with email",
                  );
                }
              }

              await navigate({ to: "/dashboard", replace: true });
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Authentication failed. Please try again.";
              setErrorMessage(message);
            } finally {
              setIsPending(false);
            }
          }}
        >
          {mode === "sign-up" ? (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="clientName"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Client Name
                </label>
                <input
                  id="clientName"
                  type="text"
                  required
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Acme Store"
                  className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="clientSource"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Platform
                </label>
                <select
                  id="clientSource"
                  value={clientSource}
                  onChange={(event) => setClientSource(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring-2"
                >
                  <option value="shopify">Shopify</option>
                  <option value="custom">Custom</option>
                  <option value="wordpress">WordPress</option>
                </select>
              </div>
            </>
          ) : null}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring-2"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm outline-none ring-primary/30 transition focus:ring-2"
            />
          </div>

          {errorMessage ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMessage}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            disabled={isPending}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending
              ? mode === "sign-up"
                ? "Creating account..."
                : "Signing in..."
              : mode === "sign-up"
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="reveal-up delay-2 flex flex-col items-center gap-5">
      <div className="flex items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary ring-2 ring-primary/20">
          {session.user.name
            ? session.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U"}
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold tracking-tight">
            {session.user.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {session.user.email}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="rounded-lg"
          onClick={async () => {
            await navigate({ to: "/dashboard", replace: true });
          }}
        >
          Open Dashboard
        </Button>

        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          Admin Session Active
        </span>
      </div>

      <Button
        size="sm"
        variant="outline"
        className="mt-1 gap-2 rounded-lg border-border text-muted-foreground transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
        onClick={async () => {
          await authClient.signOut();
          await navigate({ to: "/", replace: true });
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Sign out</title>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" x2="9" y1="12" y2="12" />
        </svg>
        Sign out
      </Button>
    </div>
  );
}
