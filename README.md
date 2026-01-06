# lylrv-reimagined

A **T3 Turbo monorepo** for building a SaaS platform with embeddable widgets, using pnpm workspaces and Turborepo.

## Prerequisites

> [!NOTE]
>
> Make sure to follow the system requirements specified in [`package.json#engines`](./package.json#L4) before proceeding.
>
> - Node.js ^22.21.0
> - pnpm ^10.19.0

## About

This is a monorepo built with [Turborepo](https://turborepo.com) containing:

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

## Quick Start

> **Note**
> The [db](./packages/db) package is preconfigured to use Vercel Postgres and is **edge-bound**. If you're using something else, make the necessary modifications to the [schema](./packages/db/src/schema.ts), [client](./packages/db/src/client.ts), and [drizzle config](./packages/db/drizzle.config.ts).

### 1. Setup Dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env

# Push the Drizzle schema to the database
pnpm db:push
```

### 2. Generate Better Auth Schema

This project uses [Better Auth](https://www.better-auth.com) for authentication. The auth schema needs to be generated using the Better Auth CLI:

```bash
pnpm auth:generate
```

This runs the Better Auth CLI with:
- **Config file**: `packages/auth/script/auth-cli.ts`
- **Output**: `packages/db/src/auth-schema.ts`

> **Note**: The `auth-cli.ts` file is in `script/` (not `src/`) to prevent accidental imports. For runtime authentication, use `packages/auth/src/index.ts`.

### 3. Start Development

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
```

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
Run `pnpm ui-add` and select component, or add manually to `packages/ui/src/`.

### New Package
Run `pnpm turbo gen init` in the monorepo root to create a new package with proper configuration.

## Deployment

### Next.js (SaaS App)

Deploy to [Vercel](https://vercel.com):

1. Create a new project on Vercel, select the `apps/saas` folder as the root directory
2. Add your `POSTGRES_URL` environment variable
3. Done!

See the [official Turborepo guide](https://vercel.com/docs/concepts/monorepos/turborepo) for more details.

## References

The stack originates from [create-t3-app](https://github.com/t3-oss/create-t3-app) and [create-t3-turbo](https://github.com/t3-oss/create-t3-turbo).
