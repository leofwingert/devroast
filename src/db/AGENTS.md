# Database (Drizzle)

Database layer using Drizzle ORM with PostgreSQL.

## Architecture

```
src/db/
  index.ts    Connection singleton — exports `db`
  schema.ts   All table definitions, enums, indexes
  seed.ts     Seed script with realistic fake data (run with tsx)
```

## Connection

- Driver: `postgres` (postgres.js)
- ORM: `drizzle-orm/postgres-js`
- Casing: `{ casing: "snake_case" }` — Drizzle auto-converts camelCase fields to snake_case columns
- Connection string from `DATABASE_URL` env var (`.env.local`)
- Single `db` export used everywhere — passed into tRPC context via `init.ts`

## Schema Conventions

- **UUIDs** for all primary keys (`uuid().defaultRandom().primaryKey()`)
- **Timestamps** with timezone (`timestamp({ withTimezone: true }).defaultNow().notNull()`)
- **Enums** defined as `pgEnum` and named exports (e.g. `issueSeverityEnum`, `verdictEnum`)
- **Cascade deletes** on foreign keys that represent ownership (e.g. roast issues → roast)
- **Indexes** defined in the third argument of `pgTable` (e.g. `roasts_score_idx`)
- Column names in TypeScript are camelCase — Drizzle handles the snake_case mapping

## Tables

| Table | Purpose |
|---|---|
| `submissions` | Raw code submitted by users |
| `roasts` | AI-generated analysis (score, comment, verdict, suggested fix) |
| `roastIssues` | Individual issues found in the code (severity, title, description) |
| `diffLines` | Suggested fix diff lines (added/removed/context) |

## Usage in tRPC Procedures

Import tables from `@/db/schema` and use Drizzle query builders:

```ts
import { avg, count } from "drizzle-orm";
import { roasts } from "@/db/schema";

// inside a tRPC procedure
const [result] = await ctx.db
  .select({ totalRoasts: count(), avgScore: avg(roasts.score) })
  .from(roasts);
```

## Seed Script

Run with: `npx tsx src/db/seed.ts`

Creates its own connection (not the singleton) and uses `@faker-js/faker` for realistic data. Truncates tables before seeding.

## Migrations

Managed by Drizzle Kit. Config at `drizzle.config.ts` (root).

```bash
npx drizzle-kit generate   # Generate migration from schema changes
npx drizzle-kit migrate    # Apply pending migrations
npx drizzle-kit studio     # Open Drizzle Studio GUI
```
