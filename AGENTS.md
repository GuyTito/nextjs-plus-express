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

## Things to know before changing code

- `apps/frontend/proxy.ts` is the Next.js 16 **Proxy** convention (the `middleware` file was renamed to `proxy` in v16). It lives at the app root and exports a named `proxy` function, so it runs automatically for `/dashboard/:path*`, `/login`, and `/register`. It only checks for the `jwt` cookie's presence (no token validation) — the backend `authMiddleware` is the real authorization enforcement. Do not delete/rename it expecting it to be unused.
- `fetchCurrentUser()` in `app/lib/data.ts` calls `auth/user`, but the backend only exposes `GET /api/auth/me`. Align these before relying on it.
- Register does not auto-login (`generateToken` is commented out in `registerUser`).
- Shared zod schemas are zod **v4**; `InvoiceSchema` and `RegisterSchema` are exported from `shared`. `InvoiceSchema` is used by both the frontend action and the backend validator; `RegisterSchema` is used by the `register` server action and the register form.
