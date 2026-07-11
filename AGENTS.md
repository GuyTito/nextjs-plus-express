<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `apps/frontend/node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Project: Next.js Dashboard + Express Monorepo

pnpm + Turborepo monorepo with three workspace packages. Read the relevant Next.js guide (above) before editing frontend code.

## Packages

- `apps/frontend` — Next.js 16 App Router dashboard UI (dev port 3002). See `apps/frontend/package.json`.
- `apps/backend` — Express 4 REST API in TypeScript (`src/server.ts` is the entry; run with `ts-node-dev`).
- `packages/shared` — source-first shared code: domain types, formatting helpers, and zod schemas. Consumed via `"shared": "workspace:*"` + `transpilePackages: ["shared"]`.

## Conventions

- Frontend data flow: Server Components call `app/lib/data.ts` → `app/lib/api.ts` (forwards the `jwt` cookie from `next/headers`). Mutations go through Server Actions in `app/lib/actions.ts` (`"use server"`).
- Backend: routes in `src/routes/*` → controllers in `src/controllers/*`. All `/api/revenue`, `/api/invoices`, `/api/customers` routes are guarded by `src/middlewares/authMiddleware.ts`. Invoice create/update also run `validateRequest(InvoiceSchema)` from `src/middlewares/validateRequest.ts`.
- DB access uses the `postgres` (porsager) client from `src/lib/db.ts` with tagged template SQL. Amounts are stored in cents.
- Auth: `bcryptjs` for passwords, `jsonwebtoken` for the `jwt` httpOnly cookie. Cookie name/max-age come from `shared` (`JWT_COOKIE_NAME`, `COOKIE_MAX_AGE_MS`). Secrets (`JWT_SECRET`, `POSTGRES_URL`, `SERVER_PORT`) are required env vars — fail fast if missing.

## Database & Migrations

Schema is versioned with **node-pg-migrate** (pinned to **v7** — v8 is ESM-only and throws `ERR_REQUIRE_ESM` under this CJS + `ts-node-dev` backend, so v8 must NOT be used). Migration files live in `apps/backend/migrations/`; config is `apps/backend/node-pg-migrate.config.js` (reads `POSTGRES_URL`, targets schema `public`).

- `src/migrate.ts` wraps `node-pg-migrate`'s `runner` and is invoked from `src/server.ts` **before** `app.listen`. It is gated by `RUN_MIGRATIONS`: it runs unless `RUN_MIGRATIONS=false` (default on in dev; set `false` in prod so migrations never auto-run there).
- Each migration file is named `YYYYMMDDHHMMSS-description.js` and exports `up` and `down`. The `pgmigrations` table tracks what has run; re-running is a no-op (idempotent). The harmless `Can't determine timestamp …` log lines come from node-pg-migrate's logger probing filename prefixes — ignore them.

### Current schema (matches the captured `pg_dump`)
- Extension `uuid-ossp`; enum `verification_type` (`EMAIL_VERIFICATION`, `PASSWORD_RESET`, `MFA_LOGIN`).
- `users` (uuid PK, name, email `text` UNIQUE, password, `is_verified` bool default `false`).
- `verification_tokens` (serial PK, `user_id` uuid FK→users `ON DELETE CASCADE`, hashed_code, type enum, target, expires_at, created_at) — **created but not referenced by app code yet; keep inert**.
- `customers` (uuid PK, name, email, image_url).
- `invoices` (uuid PK, `customer_id` uuid **with NO foreign key** to customers, amount int, `status` `varchar(255)` — app only uses `'pending' | 'paid'`, date).
- `revenue` (month `varchar(4)`, revenue int, `UNIQUE(month)` — **no primary key**).
- Index `idx_verification_lookup` on `verification_tokens(user_id, type)`.

Do NOT "improve" the schema in migrations: no FK on `invoices.customer_id`, no enum on `status`, no PK on `revenue` — match the dump exactly.

### Seed data
Seeded by `migrations/20240101000001-seed-data.js` (runs after the schema migration): 1 user, 6 customers, 13 invoices, 12 revenue months. Amounts are stored in **cents** (e.g. `15795` → `$157.95`).

Initial login after a fresh migrate:

| Email | Password |
| ----- | -------- |
| `user@nextmail.com` | `123456` |

### How to alter the schema
`node-pg-migrate` is **imperative** — there is NO central schema file to edit; the ordered migration files *are* the schema. To change the schema, create a NEW timestamped migration; do NOT edit existing ones (it breaks reproducibility and the migration history).

```js
// apps/backend/migrations/20240101000002-add-users-phone.js
exports.up = (pgm) => {
  pgm.addColumn("users", { phone: { type: "varchar(255)" } });
};
exports.down = (pgm) => {
  pgm.dropColumn("users", "phone");
};
```

Then apply and sync:
1. `pnpm --filter backend db:migrate` — or just restart `pnpm dev`; the startup hook runs it automatically.
2. Update the relevant type in `packages/shared/src/types.ts` by hand (there is no codegen).
3. Touch any controller that reads/writes the new column.

Useful `pgm` helpers: `addColumn`, `dropColumn`, `renameColumn`, `alterColumn` (with `type`/`using`), `addConstraint`, and `pgm.sql(\`…\`)` for raw DDL.

### Resetting the database
- Roll back one step: `pnpm --filter backend db:migrate:down` (runs the last applied migration's `down`).
- Full wipe from a running DB: run `db:migrate:down` once per applied migration, then `db:migrate` to re-apply.
- From an empty DB (or after `DROP DATABASE` + recreate): `pnpm --filter backend db:migrate` recreates the full schema + seed.

## Things to know before changing code

- `apps/frontend/proxy.ts` is the Next.js 16 **Proxy** convention (the `middleware` file was renamed to `proxy` in v16). It lives at the app root and exports a named `proxy` function, so it runs automatically for `/dashboard/:path*`, `/login`, and `/register`. It only checks for the `jwt` cookie's presence (no token validation) — the backend `authMiddleware` is the real authorization enforcement. Do not delete/rename it expecting it to be unused.
- `fetchCurrentUser()` in `app/lib/data.ts` calls `auth/user`, but the backend only exposes `GET /api/auth/me`. Align these before relying on it.
- Register does not auto-login (`generateToken` is commented out in `registerUser`).
- Shared zod schemas are zod **v4**; `InvoiceSchema` and `RegisterSchema` are exported from `shared`. `InvoiceSchema` is used by both the frontend action and the backend validator; `RegisterSchema` is used by the `register` server action and the register form.
- `apps/frontend/app/lib/api.ts` redirects to `/login?session=expired` on `401` or a `404` "User not found" (instead of throwing and crashing the dashboard). This handles stale/invalid JWT cookies that pass `proxy.ts`'s presence-only check. Don't revert it to a plain throw without re-adding a redirect.
