# Workspace

## Overview

pnpm workspace monorepo using TypeScript. This is a freelance design studio client portal web app.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + shadcn/ui

## App: Design Studio Client Portal

A client-facing portal for a freelance design business with:
- **Dashboard**: summary stats and recent activity feed
- **Projects list**: searchable, filterable view of all projects
- **New Request form**: submit design project requests (title, type, priority, budget, deadline)
- **Project Detail**: status timeline, message thread with designer, file uploads

## Data Models

- **projects**: id, title, description, project_type, status, priority, client_name, client_email, budget, deadline, created_at, updated_at
- **project_files**: id, project_id, file_name, file_size, file_type, uploaded_by, url, uploaded_at
- **messages**: id, project_id, content, sender_name, sender_role, created_at
- **activity**: id, type, project_id, project_title, description, actor_name, actor_role, created_at

## Artifacts

- `artifacts/client-portal` — React+Vite frontend at `/`
- `artifacts/api-server` — Express 5 API server at `/api`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Notes

- `lib/api-spec/package.json` codegen script includes a post-step to fix `lib/api-zod/src/index.ts` to only re-export from `generated/api` (not `generated/types`) to avoid TS name collision
- Follow `pnpm-workspace` skill references for routing, DB, and server conventions
