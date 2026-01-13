# lylrv-reimagined

A production-grade T3 Turbo monorepo for a SaaS platform with embeddable widgets. Built with pnpm workspaces and Turborepo, featuring Next.js 16, TanStack Start, tRPC v11, Better Auth, Drizzle ORM, and Tailwind v4.

## Prerequisites

> [!NOTE]
>
> Confirm system requirements in [package.json](package.json#L4) before starting.
>
> - Node.js ^22.21.0
> - pnpm ^10.19.0
> - Git (for workspace + Turborepo caching)

## Overview

This monorepo uses [Turborepo](https://turborepo.com) with pnpm workspaces and internal packages under the `@lylrv` scope. It is organized into three apps (`saas`, `admin`, `widgets`) and shared packages (`api`, `auth`, `db`, `ui`, `validators`) plus tooling for Tailwind and TypeScript.

### Workspace Structure

```text
.github
  └─ workflows
        └─ CI with pnpm cache setup
.vscode
  └─ Recommended extensions and settings for VSCode users
apps
  ├─ saas
  │   ├─ Next.js 16
  │   ├─ React 19
  │   ├─ Tailwind CSS v4
  │   └─ E2E Typesafe API Server & Client
  ├─ admin
  │   ├─ TanStack Start v1
  │   ├─ React 19
  │   ├─ Tailwind CSS v4
  │   └─ E2E Typesafe API Server & Client
  └─ widgets
      ├─ Embeddable widgets built with Vite
      ├─ React 19
      └─ Loyalty, Reviews, and Product Reviews widgets
packages
  ├─ api
  │   └─ tRPC v11 router definition
  ├─ auth
  │   └─ Authentication using Better Auth
  ├─ db
  │   └─ Typesafe db calls using Drizzle & Vercel Postgres
  ├─ ui
  │   └─ UI components using shadcn/ui
  └─ validators
      └─ Shared Zod validation schemas
tooling
  ├─ tailwind
  │   └─ Shared Tailwind theme and configuration
  └─ typescript
      └─ Shared tsconfig to extend from
```

> The `@lylrv` scope prefix is used for all internal packages.

### Key Technology Stack
- Monorepo: Turborepo + pnpm workspaces (catalog versions in [pnpm-workspace.yaml](pnpm-workspace.yaml))
- API: tRPC v11 with SuperJSON transformer ([packages/api](packages/api))
- Auth: Better Auth with Drizzle adapter ([packages/auth](packages/auth))
- Database: Drizzle ORM + Vercel Postgres (edge-compatible) ([packages/db](packages/db))
- UI: shadcn/ui components in `@lylrv/ui` ([packages/ui](packages/ui))
- Styling: Tailwind v4 with shared theme ([tooling/tailwind](tooling/tailwind))
- Linting/Formatting: Biome
- Widgets: Vite-bundled React components ([apps/widgets](apps/widgets))

## Quick Start

> [!NOTE]
> The [packages/db](packages/db) package targets Vercel Postgres and is edge-compatible. If using another database, update [packages/db/src/schema.ts](packages/db/src/schema.ts), [packages/db/src/client.ts](packages/db/src/client.ts), and [packages/db/drizzle.config.ts](packages/db/drizzle.config.ts).

### 1) Setup Dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# Use the root .env file. See .env.example for required keys
cp .env.example .env

# Push the Drizzle schema to the database
pnpm db:push
```

### 2) Generate Better Auth Schema

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth schema needs to be generated using the Better Auth CLI:

```bash
pnpm auth:generate
```

This runs the Better Auth CLI with:
- Config file: [packages/auth/script/auth-cli.ts](packages/auth/script/auth-cli.ts)
- Output: [packages/db/src/auth-schema.ts](packages/db/src/auth-schema.ts)

> The CLI lives in `script/` (not `src/`) to avoid accidental runtime imports. For runtime auth, use [packages/auth/src/index.ts](packages/auth/src/index.ts).

### 3) Start Development

```bash
# Run all apps
pnpm dev

# Run only the SaaS app (Next.js)
pnpm dev:next

# Run widgets in watch mode
pnpm dev:widgets
```

## Essential Commands

```bash
pnpm dev              # Run all apps in watch mode
pnpm dev:next         # Run only Next.js app with dependencies
pnpm dev:widgets      # Run widgets in watch mode
pnpm build            # Build all apps
pnpm build:widgets    # Build widgets only
pnpm db:push          # Push Drizzle schema to database
pnpm db:studio        # Open Drizzle Studio
pnpm auth:generate    # Regenerate Better Auth schema
pnpm check:write      # Biome lint + format with auto-fix
pnpm ui-add           # Add shadcn/ui component to @lylrv/ui
pnpm typecheck        # Run TypeScript type checking

> Use `pnpm dev:next` to boot the SaaS app with dependencies, ensuring shared packages rebuild as needed.
```

## Development Guide

### Environment Variables
- Type-safe env via `@t3-oss/env-*`.
- Root `.env` is shared; apps load via app-specific `with-env` scripts.
- Auth env extends from [packages/auth/env.ts](packages/auth/env.ts).

### tRPC Router Pattern
Routers use the `TRPCRouterRecord satisfies` pattern (see [packages/api/src/router/post.ts](packages/api/src/router/post.ts)):

```ts
export const postRouter = {
  all: publicProcedure.query(({ ctx }) => { /* ... */ }),
  create: protectedProcedure.input(Schema).mutation(({ ctx, input }) => { /* ... */ }),
} satisfies TRPCRouterRecord;
```

Current routers included in [packages/api/src/root.ts](packages/api/src/root.ts): `auth`, `post`, `widget`.

### Auth Initialization
Each app initializes auth with app-specific plugins in `src/auth/server.ts`:
- Next.js (`saas`): `nextCookies()`
- TanStack Start (`admin`): `reactStartCookies()`
- Both use shared `initAuth()` from `@lylrv/auth`.

### Tailwind v4
Shared theme lives in [tooling/tailwind/theme.css](tooling/tailwind/theme.css). PostCSS config is in [tooling/tailwind/postcss-config.js](tooling/tailwind/postcss-config.js).

### Biome
Biome handles linting and formatting. Prefer tabs for indentation and double quotes as per the repo conventions.

## Adding New Features

### New tRPC Router
1. Create router in `packages/api/src/router/[name].ts`
2. Add to `appRouter` in `packages/api/src/root.ts`
3. Use `publicProcedure` or `protectedProcedure` from `../trpc`

### New Database Table
1. Add table definition in `packages/db/src/schema.ts`
2. Create Zod schema with `createInsertSchema` from `drizzle-zod`
3. Run `pnpm db:push` to apply changes

### New UI Component
Run `pnpm ui-add` and select component, or add manually to [packages/ui/src](packages/ui/src) and export in the package `exports` map.

### New Package
Run `pnpm turbo gen init` in the monorepo root to create a new package with proper configuration.

## Apps Overview

### SaaS (Next.js 16)
- Location: [apps/saas](apps/saas)
- App Router with React 19
- Auth via Better Auth
- tRPC API client configured under `src/trpc`

### Admin (TanStack Start)
- Location: [apps/admin](apps/admin)
- SSR/SPA hybrid with route tree generation
- Auth via Better Auth
- tRPC client in `src/lib/trpc.ts`

### Widgets (Vite)
- Location: [apps/widgets](apps/widgets)
- Embeddable widgets (Loyalty, Reviews, Product Reviews)
- Distributed bundles surfaced in [apps/saas/public/widgets](apps/saas/public/widgets)

## Deployment

### Next.js (SaaS App)

Deploy to [Vercel](https://vercel.com):

1. Create a new project on Vercel, select the `apps/saas` folder as the root directory
2. Add your `POSTGRES_URL` environment variable
3. Done!

See the [official Turborepo guide](https://vercel.com/docs/concepts/monorepos/turborepo) for more details.

## CI/CD
- GitHub Actions setup under [tooling/github/setup/action.yml](tooling/github/setup/action.yml)
- Leverages pnpm cache and workspace build graph via Turborepo

## Agent Support
This repository includes agent instructions for VS Code Copilot, Cursor, and Google's Antigent. See:
- [Multi-Agent Instructions](.github/agent-instructions.md)
- Copilot-specific reference: [.github/copilot-instructions.md](.github/copilot-instructions.md)

Agents should follow repository conventions, use minimal patches, and prefer existing patterns (tRPC satisfies, Biome formatting, Tailwind theme). When making changes, validate with `pnpm typecheck` and `pnpm check:write`.

## Troubleshooting
- Missing environment vars: verify `.env` and app-specific env loader scripts.
- Auth schema out of date: run `pnpm auth:generate`.
- Drizzle schema changes not applied: run `pnpm db:push` then `pnpm db:studio` to inspect.
- Widgets not updating: ensure `pnpm dev:widgets` is running and consuming apps rebuild.

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app) and [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo).
