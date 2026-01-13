# Multi-Agent Instructions (VS Code, Cursor, Google Antigent)

These instructions guide engineering agents (VS Code Copilot, Cursor, and Google's Antigent) to work safely and effectively in the `lylrv-reimagined` monorepo.

## Repository Summary
- **Monorepo**: Turborepo + pnpm workspaces, internal scope `@lylrv`
- **Apps**: `apps/saas` (Next.js 16), `apps/admin` (TanStack Start), `apps/widgets` (Vite React widgets)
- **Packages**: `api` (tRPC v11), `auth` (Better Auth), `db` (Drizzle + Vercel Postgres), `ui` (shadcn/ui), `validators` (Zod v4)
- **Styling**: Tailwind v4 with shared theme in `tooling/tailwind`
- **Formatting/Linting**: Biome

## Critical Patterns
- **tRPC Routers**: `TRPCRouterRecord satisfies` pattern; see `packages/api/src/router/post.ts` and `packages/api/src/root.ts`
- **Auth**: `initAuth()` from `@lylrv/auth`; per-app cookies plugin in `src/auth/server.ts`
- **DB**: Drizzle schemas in `packages/db/src/schema.ts` and generated Better Auth schema in `packages/db/src/auth-schema.ts`
- **Env**: Type-safe env via `@t3-oss/env-*`; root `.env` with app loaders
- **UI**: Shared components in `@lylrv/ui` with exports map

## Agent Operating Principles
- **Precision-first**: Make minimal, targeted changes that follow existing patterns.
- **No unrelated fixes**: Only address the requested scope.
- **Formatting**: Use Biome conventions (tabs, double quotes). Prefer `pnpm check:write` after edits.
- **Type safety**: Run `pnpm typecheck` to validate types after changes.
- **Schema changes**: When editing DB schemas, also update Zod via drizzle helpers and run `pnpm db:push`.
- **Auth schema**: If auth config changes, run `pnpm auth:generate`.

## Tooling Guidelines
- **Planning**: Outline non-trivial work into clear steps before changes.
- **Preambles**: Before executing tool calls (code edits, searches, etc.), announce a short, single-sentence intent.
- **Patch Edits**: Use atomic patches; avoid broad reformatting.
- **Documentation**: Update README or relevant docs when you introduce new commands, envs, or patterns.
- **Testing**: Prefer specific validations (typecheck, building affected apps). Avoid running full unrelated test suites.

## File Conventions
- **Imports**: Use `@lylrv/[package]` for internal packages and `~/` for app-relative paths.
- **Exports**: Keep package exports updated when adding components or utilities.
- **Router Types**: Prefer `RouterInputs`/`RouterOutputs` for tRPC inference.
- **Zod v4**: Import from `zod/v4`.

## Common Tasks
- **Add tRPC router**:
  1. Create `packages/api/src/router/[name].ts`
  2. Register in `packages/api/src/root.ts`
  3. Use `publicProcedure` / `protectedProcedure`
- **Add DB table**:
  1. Define in `packages/db/src/schema.ts`
  2. Create Zod schema via `drizzle-zod`
  3. Run `pnpm db:push`
- **Add UI component**:
  1. Create in `packages/ui/src/`
  2. Export via `packages/ui/package.json` `exports`
- **Build widgets**:
  - `pnpm dev:widgets` for watch, `pnpm build:widgets` for distribution bundles

## Agent Integrations

### VS Code Copilot (Chat)
- Prefer surgical code patches and maintainers’ conventions stated above.
- When changing multiple files, batch related edits together and summarize progress.
- After edits, suggest running:
  ```bash
  pnpm typecheck
  pnpm check:write
  ```
- For Next.js 16 runtime diagnostics, prefer standard dev server logs; MCP tools may be used when available, but avoid assumptions.

### Cursor
- Cursor reads repo context from the workspace; ensure paths and commands match the monorepo structure.
- Follow the same planning, preambles, and patching rules.
- Provide concise, actionable diffs and avoid bulk, unrelated edits.
- Recommend validations with:
  ```bash
  pnpm dev:next
  pnpm typecheck
  pnpm check:write
  ```

### Google Antigent
- Operate under the same safety and precision rules.
- Provide short preambles before actions and keep changes scoped.
- Validate affected apps or packages with:
  ```bash
  pnpm build
  pnpm typecheck
  ```

## Commands Reference
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

## Troubleshooting
- **Env issues**: Ensure root `.env` exists and app env loaders are in sync.
- **Schema mismatch**: Run `pnpm db:push` and verify in `pnpm db:studio`.
- **Auth errors**: Regenerate with `pnpm auth:generate`.
- **Widgets not updating**: Ensure `pnpm dev:widgets` is running; check bundle outputs in `apps/saas/public/widgets`.

## References
- See root README for architecture and app/package details.
- Copilot-specific guide: `.github/copilot-instructions.md`.
