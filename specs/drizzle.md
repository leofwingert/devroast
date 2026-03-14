# Drizzle ORM — Especificação de Implementação

> Spec derivada das telas do design (`devroast.pen`) e do `README.md`.

---

## 1. Visão Geral

O DevRoast precisa de persistência para armazenar submissões de código, resultados de roast gerados pela IA e alimentar o **Shame Leaderboard**. A stack escolhida:

| Componente | Tecnologia |
|---|---|
| Banco de dados | PostgreSQL 16 (via Docker Compose) |
| ORM | Drizzle ORM (`drizzle-orm` + `drizzle-kit`) |
| Driver | `postgres` (postgres.js — recomendado pelo Drizzle para Node/edge) |
| Migrations | `drizzle-kit` (push/migrate) |

---

## 2. Enums

Derivados diretamente dos designs:

```ts
// src/db/schema.ts

import { pgEnum } from "drizzle-orm/pg-core";

/** Severity dos issues encontrados na análise (Screen 2 — Issue Cards) */
export const issueSeverityEnum = pgEnum("issue_severity", [
	"critical", // dot vermelha, accent-red
	"warning",  // dot âmbar, accent-amber
	"good",     // dot verde, accent-green
]);

/** Veredicto geral do roast (Screen 2 — roastBadge, Screen 4 — OG Image) */
export const verdictEnum = pgEnum("verdict", [
	"needs_serious_help",
	"rough_around_the_edges",
	"not_terrible",
	"actually_decent",
	"solid_code",
]);

/** Tipo de linha no diff sugerido (Screen 2 — Diff Section) */
export const diffLineTypeEnum = pgEnum("diff_line_type", [
	"added",
	"removed",
	"context",
]);
```

---

## 3. Tabelas

### 3.1 `submissions`

Representa o código enviado pelo usuário. Fonte: Screen 1 (Code Input) + Screen 3 (Leaderboard entries).

```ts
import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const submissions = pgTable("submissions", {
	id: uuid().defaultRandom().primaryKey(),

	/** Código-fonte enviado (textarea da Screen 1) */
	code: text().notNull(),

	/** Linguagem detectada ou informada (ex: "javascript", "typescript", "sql") */
	language: text().notNull(),

	/** Número de linhas do código (exibido em "3 lines", "7 lines") */
	lineCount: integer().notNull(),

	/** Se o roast mode estava ativado (toggle "maximum sarcasm enabled") */
	roastMode: boolean().notNull().default(false),

	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
```

**Campos derivados do design:**
- `language` — exibido nas Meta Rows do leaderboard (`javascript`, `typescript`, `sql`, `java`)
- `lineCount` — exibido como `"3 lines"`, `"7 lines"` nas entries e no OG image (`"lang: javascript · 7 lines"`)
- `roastMode` — toggle na Screen 1 (`"// maximum sarcasm enabled"`)

---

### 3.2 `roasts`

Resultado da análise de IA para cada submissão. Fonte: Screen 2 (Roast Results) + Screen 4 (OG Image).

```ts
export const roasts = pgTable("roasts", {
	id: uuid().defaultRandom().primaryKey(),

	submissionId: uuid()
		.notNull()
		.references(() => submissions.id, { onDelete: "cascade" })
		.unique(),

	/** Score de 0 a 10, com uma casa decimal (Score Ring: "3.5/10") */
	score: numeric({ precision: 3, scale: 1 }).notNull(),

	/** Frase de roast principal — quote do resultado */
	/** Ex: "this code looks like it was written during a power outage... in 2005." */
	roastComment: text().notNull(),

	/** Veredicto (badge abaixo do score ring) */
	/** Ex: "needs_serious_help" */
	verdict: verdictEnum().notNull(),

	/** Código sugerido (suggested_fix — a versão melhorada completa) */
	suggestedFix: text(),

	createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});
```

**Campos derivados do design:**
- `score` — Score Ring mostra `"3.5"` com `"/10"` (Screen 2, Screen 4)
- `roastComment` — Quote principal: `"this code looks like it was written during a power outage..."` (Screen 2 roastTitle, Screen 4 roastQuote)
- `verdict` — Badge: `"verdict: needs_serious_help"` (Screen 2 roastBadge, Screen 4 verdictRow)
- `suggestedFix` — Código completo da seção `suggested_fix` (Screen 2 Diff Section)

---

### 3.3 `roast_issues`

Issues individuais encontrados na análise. Fonte: Screen 2 — Analysis Section (Issue Cards, grid 2×2).

```ts
export const roastIssues = pgTable("roast_issues", {
	id: uuid().defaultRandom().primaryKey(),

	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),

	/** Severity do issue (dot colorida + label) */
	severity: issueSeverityEnum().notNull(),

	/** Título curto do issue */
	/** Ex: "using var instead of const/let", "imperative loop pattern" */
	title: text().notNull(),

	/** Descrição detalhada do issue */
	/** Ex: "var is function-scoped and leads to hoisting bugs..." */
	description: text().notNull(),

	/** Ordem de exibição (para manter a ordem do grid) */
	sortOrder: integer().notNull().default(0),
});
```

**Campos derivados do design (Screen 2 — Issue Cards):**
- `severity` — `"critical"` (vermelho), `"warning"` (âmbar), `"good"` (verde)
- `title` — `"using var instead of const/let"`, `"imperative loop pattern"`, `"clear naming conventions"`, `"single responsibility"`
- `description` — Texto explicativo abaixo do título de cada card

---

### 3.4 `diff_lines`

Linhas do diff sugerido. Fonte: Screen 2 — Diff Section (linhas com prefixo `+`, `-`, ou contexto).

```ts
export const diffLines = pgTable("diff_lines", {
	id: uuid().defaultRandom().primaryKey(),

	roastId: uuid()
		.notNull()
		.references(() => roasts.id, { onDelete: "cascade" }),

	/** Tipo da linha no diff */
	type: diffLineTypeEnum().notNull(),

	/** Conteúdo da linha */
	content: text().notNull(),

	/** Número da linha no diff (ordem de exibição) */
	lineNumber: integer().notNull(),
});
```

**Campos derivados do design (Screen 2 — Diff Section):**
- `type` — `"removed"` (prefixo `- `, fundo vermelho), `"added"` (prefixo `+ `, fundo verde), `"context"` (sem prefixo, neutro)
- `content` — Código de cada linha: `"  var total = 0;"`, `"  return items.reduce(...)"`

---

## 4. Indexes

Apenas indexes que realmente importam. PKs e UNIQUE já criam indexes automáticos. FKs no Postgres **não** criam indexes automáticos, mas com o volume esperado do DevRoast, a única query que precisa de um index explícito é o leaderboard (ORDER BY score):

```ts
import { index } from "drizzle-orm/pg-core";

// Dentro da definição de roasts (3o argumento do pgTable):
// Index para o leaderboard — ordenar por score ASC ("pior código primeiro")
export const roasts = pgTable(
	"roasts",
	{ /* ... colunas ... */ },
	(t) => [index("roasts_score_idx").on(t.score)],
);
```

> **Nota:** Se o volume crescer e queries por `roastId` nas tabelas filhas ficarem lentas, adicionar indexes em `roast_issues.roastId` e `diff_lines.roastId` depois. Não criar preventivamente.

---

## 5. Docker Compose

```yaml
# docker-compose.yml (raiz do projeto)
services:
  postgres:
    image: postgres:16-alpine
    container_name: devroast-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 6. Configuração do Drizzle

### 6.1 `drizzle.config.ts`

> **Gotcha:** `drizzle-kit` não lê `.env.local` automaticamente. Precisamos do `dotenv` (devDep) para carregar as variáveis antes do `defineConfig`.

```ts
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "postgresql",
	casing: "snake_case",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
```

### 6.2 `src/db/index.ts`

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { casing: "snake_case" });
```

### 6.3 `.env.example`

```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## 7. Dependências Instaladas

```
# runtime
drizzle-orm
postgres          # postgres.js driver

# dev
drizzle-kit
dotenv            # carregar .env.local no drizzle.config.ts
@faker-js/faker   # geração de dados fictícios para seed
tsx               # executar scripts .ts diretamente (seed, etc.)
```

---

## 8. Estrutura de Arquivos

```
devroast/
├── docker-compose.yml        # Postgres 16 Alpine
├── drizzle.config.ts         # Drizzle Kit config (casing + dotenv)
├── .env.example              # Template: DATABASE_URL
├── .env.local                # Credenciais locais (gitignored)
├── drizzle/                  # Migrations geradas pelo drizzle-kit
├── src/
│   └── db/
│       ├── schema.ts         # 3 enums + 4 tabelas + 1 index
│       ├── index.ts          # Instância do Drizzle (db export)
│       └── seed.ts           # Seed script (100 roasts, usa faker-js)
```

---

## 9. To-dos de Implementação

### Infra & Setup
- [x] Criar `docker-compose.yml` na raiz com Postgres 16
- [x] Criar `.env.example` com `DATABASE_URL`
- [x] Criar `.env.local` (gitignored) com credenciais locais
- [x] Instalar dependências: `npm install drizzle-orm postgres`
- [x] Instalar dev deps: `npm install -D drizzle-kit dotenv`
- [x] Criar `drizzle.config.ts` na raiz com `casing: "snake_case"` + `dotenv`
- [x] Adicionar scripts ao `package.json`:
  - `"db:generate": "drizzle-kit generate"`
  - `"db:migrate": "drizzle-kit migrate"`
  - `"db:push": "drizzle-kit push"`
  - `"db:studio": "drizzle-kit studio"`
  - `"db:seed": "tsx src/db/seed.ts"`

### Schema & DB
- [x] Criar `src/db/schema.ts` com enums (`issue_severity`, `verdict`, `diff_line_type`)
- [x] Criar tabela `submissions`
- [x] Criar tabela `roasts` com FK para `submissions` e index em `score`
- [x] Criar tabela `roast_issues` com FK para `roasts`
- [x] Criar tabela `diff_lines` com FK para `roasts`
- [x] Criar `src/db/index.ts` com instância do Drizzle (`casing: "snake_case"`)
- [x] Criar `src/db/seed.ts` com dados fictícios (100 roasts, faker-js, tsx)

### Validação
- [x] Subir Postgres via `docker compose up -d`
- [x] Rodar `npm run db:push --force` para criar as tabelas
- [x] Rodar `npm run db:seed` para popular com 100 roasts de teste
- [ ] Verificar schema no `drizzle-kit studio`

### Próximos Passos
- [ ] Criar API route `POST /api/roast` (receber código, chamar IA, salvar resultado)
- [ ] Criar API route `GET /api/leaderboard` (buscar top N piores códigos)
- [ ] Criar API route `GET /api/stats` (total de roasts + média de score)
- [ ] Integrar IA para gerar roasts (OpenAI/Anthropic)
- [ ] Conectar frontend — wiring do botão `roast_my_code` com a API
- [ ] Criar página `/leaderboard` (referenciada na Navbar mas não existe)
- [ ] Substituir dados hardcoded do footer por dados reais do DB
- [ ] Implementar geração de OG image (Screen 4)

---

## 10. Gotchas & Descobertas

1. **`drizzle-kit` não lê `.env.local`** — O CLI do Drizzle Kit não carrega automaticamente arquivos `.env.local`. Solução: instalar `dotenv` como devDep e chamar `config({ path: ".env.local" })` no topo do `drizzle.config.ts`.

2. **Nomes de constraints usam camelCase** — Com `casing: "snake_case"`, o Drizzle gera a coluna corretamente como `submission_id`, mas o nome automático da unique constraint fica `roasts_submissionId_unique` (camelCase). Isso é puramente cosmético e não afeta funcionalidade — a constraint funciona normalmente sobre a coluna `submission_id`.

3. **`db:push --force`** — Na primeira execução, `drizzle-kit push` pode pedir confirmação interativa. Usar `--force` pula isso (útil em scripts/CI).

---

## 11. Queries Importantes (Referência)

Sem `db.query` / Relations API. Todas as queries usam `db.select().from()` com joins explícitos.

### Leaderboard (Screen 1 preview + Screen 3 full)

```ts
import { asc, eq, sql, count, avg } from "drizzle-orm";
import { submissions, roasts } from "./schema";

// Top N piores códigos (menor score = pior)
const leaderboard = await db
	.select({
		rank: sql<number>`ROW_NUMBER() OVER (ORDER BY ${roasts.score} ASC)`,
		score: roasts.score,
		code: submissions.code,
		language: submissions.language,
		lineCount: submissions.lineCount,
	})
	.from(roasts)
	.innerJoin(submissions, eq(roasts.submissionId, submissions.id))
	.orderBy(asc(roasts.score))
	.limit(50);
```

### Stats do Footer (Screen 1)

```ts
// "2,847 codes roasted" + "avg score: 4.2/10"
const [stats] = await db
	.select({
		totalRoasts: count(),
		avgScore: avg(roasts.score),
	})
	.from(roasts);
```

### Resultado completo de um roast (Screen 2)

```ts
import { roastIssues, diffLines } from "./schema";

// 1. Buscar roast + submission
const [roast] = await db
	.select({
		roastId: roasts.id,
		score: roasts.score,
		roastComment: roasts.roastComment,
		verdict: roasts.verdict,
		suggestedFix: roasts.suggestedFix,
		code: submissions.code,
		language: submissions.language,
		lineCount: submissions.lineCount,
		roastMode: submissions.roastMode,
	})
	.from(roasts)
	.innerJoin(submissions, eq(roasts.submissionId, submissions.id))
	.where(eq(roasts.submissionId, submissionId));

// 2. Buscar issues do roast
const issues = await db
	.select()
	.from(roastIssues)
	.where(eq(roastIssues.roastId, roast.roastId))
	.orderBy(asc(roastIssues.sortOrder));

// 3. Buscar diff lines do roast
const diff = await db
	.select()
	.from(diffLines)
	.where(eq(diffLines.roastId, roast.roastId))
	.orderBy(asc(diffLines.lineNumber));
```
