# SAICC Architecture

```mermaid
flowchart LR
  User["Demo user"] --> Next["Next.js App Router"]
  Next --> Actions["Server actions and route handlers"]
  Actions --> Services["Tenant-aware service layer"]
  Services --> Prisma["Prisma ORM"]
  Prisma --> Postgres["PostgreSQL"]
  Actions --> Audit["Audit logging"]
```

Milestone 1 keeps the platform modular: UI routes call server actions or service functions, service functions enforce tenant-scoped database access, and sensitive actions emit audit logs.

## Core Entities

- Tenant
- User
- Session
- AI Tool
- AI Usage Event
- Security Alert
- Incident
- AI Agent
- Cost Record
- Audit Log
