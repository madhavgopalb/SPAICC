# SprintPark AI Command Center (SAICC)

SprintPark AI Command Center, shortened as SAICC, is a multi-tenant enterprise AI governance and operations platform. This repository starts with Milestone 1: a runnable vertical slice that demonstrates the command center without waiting for live external AI platform integrations.

## Milestone 1 Included

- Demo login with role-based navigation
- Seeded SprintPark Industries tenant
- Executive AI dashboard with PostgreSQL-backed KPIs
- Live command center with synthetic AI usage events
- AI usage event filters
- Security alerts that can be converted into incidents
- Incident resolution workflow
- AI tools registry with approve, block, and under-review actions
- AI agent health page
- Cost and license overview
- Audit logs for sensitive governance actions
- Prisma service layer for tenant-aware reads and writes

## Local Setup

1. Run the SAICC setup workflow:

```bash
npm run dev:setup
```

2. Start the app:

```bash
npm run dev:start
```

3. Open:

http://localhost:3000/login

Docker Desktop must be running and the `docker` command must be available on PATH.

## Manual Setup

```bash
npm install
docker compose up -d
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev:start
```

The local database uses:

- Database: `saicc`
- Username: `saicc`
- Port: `5432`

## Demo Credentials

All demo users use this password:

```text
SprintPark!2026
```

- `admin@saicc.local` - Platform Admin
- `executive@saicc.local` - Executive
- `security@saicc.local` - Security
- `finance@saicc.local` - Finance
- `department@saicc.local` - Department Head

## Validation Commands

```bash
npm run typecheck
npm run test
npm run build
```

## Privacy Position

SAICC Milestone 1 stores metadata, risk classifications, costs, tool status, incidents, and audit records. It does not store full prompt content by default.

## Next Phase

Recommended Milestone 2: policy creation/versioning, recommendations with supporting metrics, scheduled executive reports, CSV import, and generic webhook ingestion.
