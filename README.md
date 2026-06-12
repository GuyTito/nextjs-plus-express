# Next.js Dashboard + Express Monorepo

A full-stack dashboard application built as a pnpm Turborepo monorepo, sharing TypeScript types between a Next.js frontend and an Express backend.

## Prerequisites

- Node.js ≥ 18.17
- pnpm 9.12.0 (specified via `packageManager` field)

## Installation

```bash
pnpm install
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode (via Turborepo) |
| `pnpm build` | Build all packages and apps, respecting dependency order |
| `pnpm lint` | Lint all workspaces |
| `pnpm check-types` | Run TypeScript type checking across all workspaces |
| `pnpm format` | Format code with Prettier |

## Project Structure

```
.
├── apps/
│   ├── frontend/          # Next.js 16 + React 19 dashboard
│   └── backend/           # Express.js API server
│
├── packages/
│   └── shared/            # Shared TypeScript types and interfaces
│
├── package.json           # Root workspace config
├── pnpm-workspace.yaml    # Workspace package globs
└── turbo.json             # Turborepo pipeline configuration
```

### Workspaces

| Package | Path | Purpose |
|---------|------|---------|
| `frontend` | `apps/frontend` | Next.js web application |
| `backend` | `apps/backend` | Express REST API server |
| `shared` | `packages/shared` | Common TypeScript types (e.g. `User`) |

## Mono-repo Tooling

- **pnpm** manages dependencies and workspace linking
- **Turborepo** orchestrates tasks (`dev`, `build`, `lint`, `check-types`) across workspaces with caching
- **TypeScript project references** ensure `shared` builds before apps that depend on it

## Development

```bash
# Start frontend (Next.js) and backend (Express) together
pnpm dev

# Type-check everything
pnpm check-types

# Lint everything
pnpm lint
```

## Notes

- The `shared` package defines source-of-truth types consumed by both frontend and backend
- Frontend uses `tsconfig.json` `references` to resolve `shared` types
- Backend depends on `shared` via `workspace:*` protocol in its `package.json`
