# SPAICC - SprintPark AI Command Center

SPAICC is the SprintPark AI Command Center: a multi-tenant enterprise AI governance and operations platform for visibility, security monitoring, tool governance, agent health, cost analytics, and auditability.

This repository contains Milestone 1: a runnable vertical slice with database-backed dashboards, synthetic AI usage events, security alerts, incident workflow, AI tools registry, agent health, costs, audit logs, demo login, and role-based navigation.

GitHub repository: https://github.com/madhavgopalb/SPAICC

## Stack

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- Netlify deployment target

## Local Setup

Docker Desktop must be running and the `docker` command must be available on PATH.

```bash
npm install
npm run dev:setup
npm run dev:start
```

Open:

```text
http://localhost:3000/login
```

## Local Demo Users

Local seed data creates development-only demo users for the seeded SprintPark tenant:

- `admin@saicc.local` - Platform Admin
- `executive@saicc.local` - Executive
- `security@saicc.local` - Security
- `finance@saicc.local` - Finance
- `department@saicc.local` - Department Head

The shared local demo password is used only for development seed data. Do not seed demo accounts into production unless explicitly intended.

## Environment Variables

Create `.env` locally from `.env.example`. Do not commit real values.

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `SAICC_SESSION_SECRET` - long random session secret

Recommended for production:

- `DIRECT_URL` - direct PostgreSQL URL for migrations when the provider requires one
- `APP_URL` - production base URL, for example `https://spaicc.com`

Local Docker-only:

- `SAICC_DB_PORT` - host port for local PostgreSQL, defaults to `5432`

## Database

Local development uses PostgreSQL through Docker Compose.

Production must use managed PostgreSQL such as Neon, Supabase PostgreSQL, AWS RDS PostgreSQL, or Azure Database for PostgreSQL. Do not use `localhost:5432` in Netlify production.

Generate Prisma Client:

```bash
npm run db:generate
```

Apply production migrations:

```bash
npm run db:deploy
```

Local development seeding:

```bash
npm run db:seed
```

## Netlify Deployment

Netlify should build from GitHub repository `madhavgopalb/SPAICC` on branch `main`.

Build command:

```bash
npm run build
```

Node version is pinned in `netlify.toml`:

```text
20
```

Configure production environment variables in Netlify, not in source code:

- `DATABASE_URL`
- `DIRECT_URL` if required by the database provider
- `SAICC_SESSION_SECRET`
- `APP_URL`

After `DATABASE_URL` is configured, run production migrations with `npm run db:deploy` or Netlify's configured migration workflow. Never run `prisma migrate dev` against production.

## Health Check

SPAICC exposes:

```text
/api/health
```

It returns `200` when the database is reachable and `503` when the database is unavailable. It does not expose credentials.

## Validation

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Safe Troubleshooting

- If `npm run doctor` reports Docker missing, install/start Docker Desktop and ensure `docker` is on PATH.
- If PostgreSQL port `5432` is already used locally, set `SAICC_DB_PORT` in `.env` and update `DATABASE_URL` to match.
- If Netlify deployment fails with Prisma connectivity errors, verify production `DATABASE_URL` is a managed PostgreSQL URL with SSL enabled where required.
- If authentication fails in production, verify `SAICC_SESSION_SECRET` and `APP_URL` are configured in Netlify.

## Privacy Position

SPAICC Milestone 1 stores metadata, risk classifications, costs, tool status, incidents, and audit records. It does not store full prompt content by default.

## Next Phase

Recommended Milestone 2: policy creation/versioning, recommendations with supporting metrics, scheduled executive reports, CSV import, generic webhook ingestion, and managed production database provisioning.
