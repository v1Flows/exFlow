# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JustFlow is a workflow automation platform. Users define workflows as DAGs of steps; the backend orchestrates execution; runners pick up jobs and execute action plugins.

## Monorepo Structure

```
apps/backend/       # Go API (Gin + PostgreSQL via Bun ORM)
apps/frontend/      # Next.js 15 + React 19 web UI
apps/runner/        # Go execution engine
pkg/contracts/      # Shared Go types between runner and plugins
runner-plugins/     # HashiCorp go-plugin action plugins (15+)
```

Go workspaces (`go.work`) link backend, runner, plugins, and contracts. Frontend is standalone with pnpm.

## Development Commands

### Frontend (`apps/frontend/`)
```bash
pnpm install
pnpm dev          # Dev server on port 4000
pnpm build
pnpm lint
pnpm lint:fix
```

### Backend (`apps/backend/`)
```bash
go mod download
go run main.go --config config/config.yaml
```

### Runner (`apps/runner/`)
```bash
go mod download
go run ./cmd/runner --config config/config.yaml
```

### Full Stack (Docker)
```bash
docker compose up   # Starts PostgreSQL + JustFlow on port 3000
```

## Architecture

**Request flow:**
1. User builds workflows in the frontend (DAG editor using dnd-kit + CodeMirror)
2. Frontend calls the backend REST API
3. Backend stores workflows/executions in PostgreSQL
4. Runners register via heartbeat and poll for pending jobs
5. Runner executes steps by spawning action plugins (HashiCorp plugin system over gRPC)
6. Results streamed back to backend; frontend polls for updates

**Backend structure** (`apps/backend/`):
- `handlers/` — HTTP route handlers (Gin)
- `middleware/` — Auth, logging, CORS
- `router/` — Route registration
- `db/` — Bun ORM models and queries
- `config/` — YAML-based config loading

**Frontend key directories** (`apps/frontend/src/`):
- `app/` — Next.js App Router pages
- `components/` — Shared UI components (HeroUI-based)
- `stores/` — Zustand state management
- `hooks/` — React hooks including `useExecution` for polling
- `lib/` — API client and utilities

**Plugin system:** Each plugin in `runner-plugins/action-plugins/` is a standalone Go binary implementing the HashiCorp plugin interface. The runner discovers and spawns them over gRPC.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4, HeroUI, Zustand |
| Backend | Go 1.24, Gin, Bun ORM, PostgreSQL, gRPC |
| Runner | Go 1.24, HashiCorp go-plugin |
| Observability | OpenTelemetry, Prometheus, Logrus |

## Configuration

Both backend and runner use YAML config files. See `apps/backend/config/` and `apps/runner/config/` for structure. A root-level `config.yaml` (gitignored) is used for runner configuration.

## Releases & CI

- Releases triggered by git tags: `justflow-v*.*.*` (backend+frontend image), `runner-v*.*.*` (runner image)
- GitHub Actions workflows in `.github/workflows/`
- Images are multi-stage Docker builds; PostgreSQL is external (not bundled)
