# Next.js Dashboard + Express Monorepo

A full-stack TypeScript monorepo: a **Next.js 16** dashboard frontend backed by an **Express** API server, with a shared package for code used by both apps. It is a teaching/demo project (derived from the Vercel Next.js Learn "Dashboard" course) extended with a real Express + PostgreSQL backend and JWT cookie authentication.

## Prerequisites

- Node.js 18 or newer
- pnpm 11.x
- A PostgreSQL database (connection string required by the backend)

## Install

```bash
pnpm install
```

## Environment Variables

Both apps need a `.env` file (see `.env` files already present in each app for shape). Required variables:

**`apps/backend/.env`**

| Variable         | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `SERVER_PORT`    | Port the Express server listens on (required)       |
| `FRONTEND_URL`   | Allowed CORS origin, e.g. `http://localhost:3002`   |
| `POSTGRES_URL`   | PostgreSQL connection string (required)             |
| `JWT_SECRET`     | Secret used to sign JWTs (required)                 |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` (optional, defaults `7d`) |

**`apps/frontend/.env`**

| Variable   | Purpose                                                       |
| ---------- | ------------------------------------------------------------- |
| `API_URL`  | Backend base URL, e.g. `http://localhost:3000` (required)     |
| `NODE_ENV` | `production` toggles `secure`/`sameSite=none` cookie behavior |

## Scripts

Run from the repo root via Turborepo:

| Command            | Description                                        |
| ------------------ | -------------------------------------------------- |
| `pnpm dev`         | Start the frontend and backend in development mode |
| `pnpm build`       | Build all workspace packages and apps              |
| `pnpm lint`        | Lint all workspaces                                |
| `pnpm check-types` | Type-check all workspaces                          |
| `pnpm format`      | Format Markdown and TypeScript files with Prettier |

The frontend dev server runs on port **3002** (`next dev -p 3002`); the backend port comes from `SERVER_PORT`.

## Project Structure

```
.
├── apps/
│   ├── frontend/                 # Next.js 16 App Router dashboard app (port 3002)
│   │   ├── app/
│   │   │   ├── (dashboard)/...    # Protected dashboard area (overview, invoices, customers)
│   │   │   ├── login/             # Login page + form
│   │   │   ├── lib/               # Server-side data fetching, API client, server actions
│   │   │   └── ui/                # Presentational components (cards, charts, tables, forms)
│   │   ├── proxy.ts               # Next.js 16 Proxy (renamed from middleware) — route protection
│   │   ├── next.config.ts         # Config (transpilePackages: ["shared"])
│   │   └── postcss.config.mjs     # Tailwind CSS v4 plugin
│   └── backend/                  # Express API server (TypeScript)
│       ├── migrations/           # node-pg-migrate SQL migrations (schema + seed)
│       ├── node-pg-migrate.config.js  # migration config (POSTGRES_URL, schema public)
│       └── src/
│           ├── controllers/      # Request handlers (auth, invoices, revenue, customers)
│           ├── routes/            # Express routers
│           ├── middlewares/       # auth + zod request validation
│           ├── lib/               # db client, JWT generation, cookie/secret constants
│           ├── migrate.ts         # node-pg-migrate runner, called on startup
│           └── server.ts          # App entry point (runs migrations, then listens)
├── packages/
│   └── shared/                   # Shared types, helpers, and zod schemas (source-first)
├── package.json                  # Root workspace scripts
├── pnpm-workspace.yaml           # Workspace package globs
├── turbo.json                    # Turborepo pipeline configuration
└── tsconfig.json                 # Base TS config (shared by all packages)
```

## Workspace Packages

| Package    | Path              | Purpose                                                      |
| ---------- | ----------------- | ------------------------------------------------------------ |
| `frontend` | `apps/frontend`   | Next.js App Router UI for the dashboard                      |
| `backend`  | `apps/backend`    | Express REST API backed by PostgreSQL                        |
| `shared`   | `packages/shared` | Shared types, formatting helpers, and zod validation schemas |

## Database & Migrations

The database schema is versioned with [`node-pg-migrate`](https://github.com/salsita/node-pg-migrate). Migrations live in `apps/backend/migrations/`; the config (`apps/backend/node-pg-migrate.config.js`) reads `POSTGRES_URL` and targets the `public` schema.

### Scripts

Run from `apps/backend` (or with `pnpm --filter backend …` from the root):

| Command             | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `pnpm db:migrate`   | Apply pending migrations (up) — also runs on `pnpm dev`   |
| `pnpm db:migrate:down` | Roll back the most recently applied migration         |

`src/server.ts` runs migrations automatically on startup (before the server listens), gated by the `RUN_MIGRATIONS` env var (on by default in dev; set `RUN_MIGRATIONS=false` in production so migrations never auto-run there).

### Schema & seed

- Tables: `users` (with `is_verified`), `customers`, `invoices` (`customer_id` has **no** foreign key), `revenue` (`month` is the only unique key — there is **no** primary key), and `verification_tokens` (active; used by OTP email verification flow). UUIDs are generated with the `uuid-ossp` extension.
- Seed data (1 user, 6 customers, 13 invoices, 12 revenue months) is applied by the seed migration. Amounts are stored in **cents**.

After a fresh `pnpm db:migrate`, log in with:

| Email              | Password |
| ------------------ | -------- |
| `user@nextmail.com` | `123456` |

### Changing the schema

`node-pg-migrate` is **imperative** — there is no single schema file to edit. To make a change, **add a new timestamped migration file** (never edit an existing one), then re-run `pnpm db:migrate`. Example, adding a column:

```js
// apps/backend/migrations/20240101000002-add-users-phone.js
exports.up = (pgm) => {
  pgm.addColumn("users", { phone: { type: "varchar(255)" } });
};
exports.down = (pgm) => {
  pgm.dropColumn("users", "phone");
};
```

After applying, sync the affected type in `packages/shared/src/types.ts` by hand (there is no codegen) and update any controller that uses the column.

To reset: run `pnpm db:migrate:down` once per applied migration (then `pnpm db:migrate` to re-apply), or `DROP DATABASE` + recreate and run `pnpm db:migrate` to rebuild schema and seed from scratch.

## Architecture

```
Browser ──► Next.js (Server Components + Server Actions)
              │  forwards JWT cookie
              ▼
          Express API ──► PostgreSQL (postgres client)
```

- **Frontend (Next.js 16)** uses the App Router. Server Components fetch data through `app/lib/data.ts`, which calls `app/lib/api.ts`. `api()` attaches the JWT cookie (read via `next/headers` `cookies()`) to backend requests and throws on non-OK responses. Mutations (create/update/delete invoice, login, logout) are handled by **Server Actions** in `app/lib/actions.ts` (`"use server"`).
- **Backend (Express)** exposes a REST API. All `/api/revenue`, `/api/invoices`, and `/api/customers` routes sit behind `authMiddleware`, which verifies the JWT, loads the user from the DB, and attaches it to `req.user`. Invoice create/update routes additionally run `validateRequest(InvoiceSchema)` (zod validation from `shared`).
- **Shared package** is the single source of truth for code used by both apps: domain types, formatting helpers (`formatCurrency`, `formatDateToLocal`), the JWT cookie name/max-age constants, and the `InvoiceSchema` zod schema (plus a re-export of `z` from zod).

### Authentication model

- Passwords are hashed with `bcryptjs`.
- On login, `generateToken` signs a JWT (`{ userId }`) and sets an **httpOnly** cookie named `jwt` (`JWT_COOKIE_NAME`).
- Cookie `sameSite` is `lax` in dev and `none` in production; `secure` is set only in production.
- `authenticate` (server action) posts credentials to the backend, parses the backend's `Set-Cookie` header, and re-sets the cookie on the Next.js response so the browser holds it. Subsequent server-side fetches forward the cookie to the API.
- Logout clears the cookie on both sides.
- Login requires `is_verified=true` in the DB. Unverified users get a `403` from `/api/auth/login` and are bounced to `/verify-otp?email=...` by the `authenticate` server action.
- Register does not auto-login (`generateToken` is intentionally commented out in `registerUser`); new users are redirected to `/verify-otp?email=...`.
- OTP verification uses the active `verification_tokens` table with an `attempts` column to track wrong-code budget. `MAX_OTP_ATTEMPTS = 5` (backend constant). Exhausted attempts delete the token and return `429`.

### Proxy / route protection

In Next.js 16 the old `middleware` convention was deprecated and renamed to **Proxy**. `apps/frontend/proxy.ts` is that convention file (placed at the app root, exporting a named `proxy` function), so it **runs automatically** for the paths in its `matcher`:

- `/dashboard/:path*` — protected area.
- `/login`, `/register`, `/verify-otp` — auth routes.

Logic:
- Unauthenticated requests to a protected route are redirected to `/login?redirect=<path>` (so the user returns after logging in).
- Authenticated requests hitting `/login`, `/register`, or `/verify-otp` are redirected to `/dashboard`.

The Proxy only reads the `jwt` cookie; it does not contact the backend. Note from the Next.js docs that a Proxy matcher that excludes a path also skips Server Function calls on that path, so authorization should still be verified server-side (the backend `authMiddleware` does this for the API).

| Method | Path                      | Auth | Description                                  |
| ------ | ------------------------- | ---- | -------------------------------------------- |
| POST   | `/api/auth/register`      | —    | Register a user (hashes password)            |
| POST   | `/api/auth/login`         | —    | Authenticate, set JWT cookie                 |
| POST   | `/api/auth/logout`        | —    | Clear JWT cookie                             |
| POST   | `/api/auth/verify-otp`    | —    | Verify email/OTP code                        |
| POST   | `/api/auth/resend-otp`    | —    | Resend verification code                     |
| GET    | `/api/auth/me`            | ✅   | Return current user (attached by middleware) |
| GET    | `/api/revenue`            | ✅   | Monthly revenue rows                         |
| GET    | `/api/invoices/latest`    | ✅   | 5 latest invoices (joined with customers)    |
| GET    | `/api/invoices/card-data` | ✅   | Counts + paid/pending totals                 |
| GET    | `/api/invoices/pages`     | ✅   | Total page count for a query                 |
| GET    | `/api/invoices`           | ✅   | Filtered/paginated invoice list              |
| GET    | `/api/invoices/:id`       | ✅   | Single invoice by id                         |
| POST   | `/api/invoices`           | ✅   | Create invoice (zod-validated)               |
| PUT    | `/api/invoices/:id`       | ✅   | Update invoice (zod-validated)               |
| DELETE | `/api/invoices/:id`       | ✅   | Delete invoice                               |
| GET    | `/api/customers`          | ✅   | Customer id + name list                      |
| GET    | `/api/hello`              | —    | Health/echo endpoint                         |

### Frontend pages

- `/` — marketing landing page.
- `/login` — email/password login form (client component using `useActionState`).
- `/verify-otp` — email verification form for OTP codes; accepts `?email=` and optional `?type=` query params; unverified users are redirected here from login.
- `/register` — registration form (name, email, password, confirm password) that posts to the backend and redirects to `/verify-otp?email=...` on success; uses the shared `RegisterSchema` for client + server-side validation.
- `/dashboard` — overview: summary cards, revenue bar chart, latest invoices. Uses `Suspense` streaming with skeleton fallbacks.
- `/dashboard/invoices` — searchable, paginated invoice table (6 per page) with create/edit/delete actions.
- `/dashboard/invoices/create` and `/dashboard/invoices/[id]/edit` — invoice forms (client components using `useActionState`).
- `/dashboard/customers` — placeholder page.
- Error boundary (`error.tsx`) and loading states (`loading.tsx`, skeletons) are wired in.

## Technology Stack

| Layer      | Choice                                                        |
| ---------- | ------------------------------------------------------------- |
| Monorepo   | pnpm workspaces + Turborepo                                   |
| Frontend   | Next.js 16 (App Router), React 19, TypeScript                 |
| Styling    | Tailwind CSS v4 (`@tailwindcss/postcss`), Heroicons, `clsx`   |
| Backend    | Express 4, TypeScript, `ts-node-dev` (dev)                    |
| Database   | PostgreSQL via the `postgres` (porsager) client               |
| Migrations | `node-pg-migrate` (schema versioned via SQL migrations)      |
| Validation | Zod v4 (shared `InvoiceSchema`, `RegisterSchema`)        |
| Auth       | `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `dotenv` |
| Misc UI    | `use-debounce` (search input), `cookie` (Set-Cookie parsing)  |

## How Shared Code Works

The `shared` package is source-first: edit files in `packages/shared/src` directly and import them from `shared`. It is consumed by both apps via a workspace dependency (`"shared": "workspace:*"`) and `transpilePackages: ["shared"]` in the Next.js config. Entry points are re-exported from `packages/shared/src/index.ts`.

```ts
// packages/shared/src/index.ts
export * from "./types";
export * from "./helpers";
export { z } from "zod";
export { InvoiceSchema, RegisterSchema, VerifyOtpSchema, ResendOtpSchema } from "./schemas";
```

```ts
import {
  formatCurrency,
  InvoiceSchema,
  JWT_COOKIE_NAME,
  type Invoice,
} from "shared";
```

If a file is only used by one app, keep it inside that app instead of moving it into shared.

## Adding New Shared Code

1. Add the new file under `packages/shared/src`.
2. Export it from `packages/shared/src/index.ts` if you want to import it from `shared`.
3. Import it in the frontend or backend with `from "shared"`.

Example:

```ts
// packages/shared/src/formatDate.ts
export const formatDate = (date: string) => new Date(date).toISOString();
```

```ts
// packages/shared/src/index.ts
export * from "./types";
export * from "./helpers";
export * from "./formatDate";
```

```ts
import { formatDate } from "shared";
```

### Adding shared dependencies

To add a dependency used by both apps through `shared` (e.g. a validation or utility lib):

```bash
pnpm add <package-name> --filter shared
```

This installs the package in `packages/shared` and makes it available to both `frontend` and `backend` via the workspace dependency. For example:

```bash
pnpm add zod --filter shared
```

After installation, add it to `packages/shared/src/index.ts` to re-export if needed:

```ts
export * from "./types";
export * from "./helpers";
export { z } from "zod";
```

Both apps can then import it via:

```ts
import { z } from "shared";
```

App-specific dependencies install directly in each app:

```bash
pnpm add <package-name> --filter frontend
pnpm add <package-name> --filter backend
```

## Development

```bash
pnpm dev
pnpm check-types
pnpm lint
```

## Notes & Known Gaps

- **`apps/frontend/proxy.ts` is the Next.js 16 Proxy (formerly `middleware`).** It is wired up automatically (it sits at the app root and exports a named `proxy` function) and guards `/dashboard/*`, `/login`, `/register`, and `/verify-otp`. It only checks for the presence of the `jwt` cookie — it does not validate the token — so backend authorization (via `authMiddleware`) remains the real enforcement.
- **`fetchCurrentUser()` calls `/auth/user`** in `app/lib/data.ts`, but the backend only exposes `GET /api/auth/me`. That fetch will 404 — align the path (or add the route) before using it.
- **Register does not auto-login.** `generateToken` is intentionally commented out in `registerUser`, so new users must verify their email and then log in separately.
- **Initial login:** after a fresh `pnpm db:migrate`, sign in with `user@nextmail.com` / `123456` (seeded user). DB passwords are bcrypt-hashed; `123456` is the seeded demo password.
- **Stale sessions redirect instead of crashing:** `apps/frontend/app/lib/api.ts` sends unauthenticated/stale requests (backend `401` or a `404` "User not found") to `/login?session=expired`, so an old JWT cookie bounces you to login rather than erroring the dashboard.
- The revenue endpoint includes an artificial 3-second delay for demo/loading-state purposes.
- Several UI blocks contain commented "Uncomment in Chapter X" markers left over from the original course scaffolding.
