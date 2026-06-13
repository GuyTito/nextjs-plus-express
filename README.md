# Next.js Dashboard + Express Monorepo

This is a pnpm Turborepo monorepo with a Next.js frontend, an Express backend, and a small shared package for code used by both apps.

## Prerequisites

- Node.js 18 or newer
- pnpm 11.x

## Install

```bash
pnpm install
```

## Scripts

| Command            | Description                                        |
| ------------------ | -------------------------------------------------- |
| `pnpm dev`         | Start the frontend and backend in development mode |
| `pnpm build`       | Build all workspace packages and apps              |
| `pnpm lint`        | Lint all workspaces                                |
| `pnpm check-types` | Type-check all workspaces                          |
| `pnpm format`      | Format Markdown and TypeScript files with Prettier |

## Project Structure

```
.
├── apps/
│   ├── frontend/          # Next.js 16 dashboard app
│   └── backend/           # Express API server
├── packages/
│   └── shared/            # Shared helpers, types, and other reusable code
├── package.json           # Root workspace scripts
├── pnpm-workspace.yaml    # Workspace package globs
└── turbo.json             # Turborepo pipeline configuration
```

## Workspace Packages

| Package    | Path              | Purpose                          |
| ---------- | ----------------- | -------------------------------- |
| `frontend` | `apps/frontend`   | Next.js app for the dashboard UI |
| `backend`  | `apps/backend`    | Express API for data and routes  |
| `shared`   | `packages/shared` | Shared code used by both apps    |

## How Shared Code Works

The `shared` package is the single home for code that belongs in both apps. It is source-first, so you edit the files in `packages/shared/src` directly and import them from `shared`.

For example:

```ts
import { formatCurrency, Revenue } from "shared";
```

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

If a file is only used by one app, keep it inside that app instead of moving it into shared.

## Development

```bash
pnpm dev
pnpm check-types
pnpm lint
```
