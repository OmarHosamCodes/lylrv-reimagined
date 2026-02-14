import { Button } from "@lylrv/ui/button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, getSession } from "~/auth/server";

type AuthAction = "sign-in" | "sign-up";

export async function AuthShowcase() {
  const session = await getSession();

  if (!session) {
    return (
      <form className="mx-auto flex w-full max-w-sm flex-col gap-4">
        <div className="space-y-2 text-center">
          <h3 className="text-xl font-semibold tracking-tight">
            Continue with email
          </h3>
          <p className="text-sm text-muted-foreground">
            Sign in to your account or create a new one.
          </p>
        </div>

        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none ring-0 transition focus:border-primary/50 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="submit"
            name="intent"
            value="sign-in"
            size="lg"
            className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            formAction={async (formData) => {
              "use server";

              const email = String(formData.get("email") ?? "").trim();
              const password = String(formData.get("password") ?? "");
              const intent = String(
                formData.get("intent") ?? "sign-in",
              ) as AuthAction;

              if (!email || !password) {
                throw new Error("Email and password are required");
              }

              if (intent === "sign-up") {
                await auth.api.signUpEmail({
                  body: {
                    email,
                    password,
                    name: email.split("@")[0] || "User",
                  },
                  headers: await headers(),
                });
              } else {
                await auth.api.signInEmail({
                  body: {
                    email,
                    password,
                  },
                  headers: await headers(),
                });
              }

              redirect("/dashboard");
            }}
          >
            Sign in
          </Button>

          <Button
            type="submit"
            name="intent"
            value="sign-up"
            size="lg"
            variant="outline"
            className="h-11 rounded-xl border-border font-semibold"
            formAction={async (formData) => {
              "use server";

              const email = String(formData.get("email") ?? "").trim();
              const password = String(formData.get("password") ?? "");
              const intent = String(
                formData.get("intent") ?? "sign-up",
              ) as AuthAction;

              if (!email || !password) {
                throw new Error("Email and password are required");
              }

              if (intent === "sign-up") {
                await auth.api.signUpEmail({
                  body: {
                    email,
                    password,
                    name: email.split("@")[0] || "User",
                  },
                  headers: await headers(),
                });
              } else {
                await auth.api.signInEmail({
                  body: {
                    email,
                    password,
                  },
                  headers: await headers(),
                });
              }

              redirect("/dashboard");
            }}
          >
            Create account
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our terms and privacy policy.
        </p>
      </form>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-5">
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
        <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
            <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
          </span>
          Session Active
        </span>
      </div>

      <form>
        <Button
          size="sm"
          variant="outline"
          className="mt-1 gap-2 rounded-lg border-border text-muted-foreground transition-all duration-200 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
          formAction={async () => {
            "use server";
            await auth.api.signOut({
              headers: await headers(),
            });
            redirect("/");
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
      </form>
    </div>
  );
}
