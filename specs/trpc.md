# tRPC — Camada de API com Server Components

> Spec para integrar tRPC v11 como camada de API do DevRoast, com suporte a prefetch em React Server Components via TanStack React Query. Substitui a abordagem de API routes manuais prevista na spec do Drizzle.

---

## 1. Contexto

O DevRoast tem 3 páginas que consomem dados do banco mas estão usando dados hardcoded:

| Página | Dados necessários | Tipo |
|---|---|---|
| `/` (homepage) | Stats do footer (total roasts + avg score), preview do leaderboard (top 3) | Server prefetch → client |
| `/leaderboard` | Top 50 piores códigos com score, language, code | Server prefetch → client |
| `/roast/[id]` | Roast completo (score, verdict, comment, issues, diff lines, código original) | Server prefetch → client |

Além disso, a homepage precisa de uma mutation para submeter código (`roast_my_code`), que futuramente chamará a IA.

---

## 2. Decisão

### Por que tRPC e não API routes manuais?

| Critério | API Routes (Next.js) | tRPC |
|---|---|---|
| Type safety end-to-end | Manual (tipos duplicados) | Automático (inferido do router) |
| Validação de input | Manual (parse do body) | Built-in com Zod |
| Server Components | `fetch()` manual | `prefetch` + hydration nativo |
| Client calls | `fetch()` + tipos manuais | Hooks tipados via TanStack React Query |
| Boilerplate | Alto | Baixo |

### Stack escolhida

| Componente | Pacote | Versão |
|---|---|---|
| Server | `@trpc/server` | ^11 |
| Client | `@trpc/client` | ^11 |
| React Query integration | `@trpc/tanstack-react-query` | ^11 |
| Data fetching | `@tanstack/react-query` | ^5 |
| Validação | `zod` | ^3 |
| Server-only guard | `server-only` | ^0.0.1 |
| Client-only guard | `client-only` | ^0.0.0 |

### Não usar

- **superjson** — não temos `Date`, `Map`, `Set` nos responses (scores são `string` do Drizzle `numeric`). JSON nativo é suficiente.
- **tRPC Next.js adapter (`@trpc/nextjs`)** — não existe no v11. Usamos o fetch adapter genérico.
- **Server Actions** — não é o padrão que queremos. tRPC procedures são mais explícitas e testáveis.

---

## 3. Arquitetura

```
src/
├── trpc/
│   ├── init.ts              Inicialização do tRPC (context, router factory, procedures)
│   ├── client.tsx           Client provider + hooks ("use client")
│   ├── server.ts            Server caller + prefetch helpers ("server-only")
│   ├── query-client.ts      Factory do QueryClient (compartilhado server/client)
│   └── routers/
│       ├── _app.ts          Root router (merge de todos os sub-routers)
│       ├── roast.ts         Procedures: getById, submit
│       ├── leaderboard.ts   Procedures: getTop
│       └── stats.ts         Procedures: getSummary
├── app/
│   ├── layout.tsx           Wrappa {children} com TRPCReactProvider
│   └── api/
│       └── trpc/
│           └── [...trpc]/
│               └── route.ts   Fetch adapter (GET + POST)
```

---

## 4. Especificação

### 4.1 `src/trpc/init.ts` — Inicialização

Cria o contexto (acesso ao `db`), o router factory e as procedures base.

```ts
import { initTRPC } from "@trpc/server";
import { cache } from "react";
import { db } from "@/db";

export const createTRPCContext = cache(async () => {
	return { db };
});

const t = initTRPC.create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
```

**Decisões:**
- `cache()` do React garante que o contexto é criado uma única vez por request no server
- Sem auth no contexto (DevRoast é anônimo)
- Sem `transformer` (não usamos superjson)

---

### 4.2 `src/trpc/query-client.ts` — Factory do QueryClient

Compartilhado entre server e client. Configura `staleTime` para evitar refetch imediato após SSR e `shouldDehydrateQuery` para hidratar queries pendentes.

```ts
import {
	defaultShouldDehydrateQuery,
	QueryClient,
} from "@tanstack/react-query";

export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30 * 1000,
			},
			dehydrate: {
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) ||
					query.state.status === "pending",
			},
		},
	});
}
```

**Decisões:**
- `staleTime: 30s` — dados do DevRoast não mudam frequentemente; evita refetch desnecessário no client
- `shouldDehydrateQuery` inclui `pending` — permite streaming de dados do server pro client via RSC

---

### 4.3 `src/trpc/client.tsx` — Client Provider

Entrypoint para consumir a API em client components. Cria o provider de contexto do tRPC + React Query.

```ts
"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { useState } from "react";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient;

function getQueryClient() {
	if (typeof window === "undefined") {
		return makeQueryClient();
	}
	if (!browserQueryClient) browserQueryClient = makeQueryClient();
	return browserQueryClient;
}

function getUrl() {
	const base = (() => {
		if (typeof window !== "undefined") return "";
		if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
		return "http://localhost:3000";
	})();
	return `${base}/api/trpc`;
}

export function TRPCReactProvider({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const queryClient = getQueryClient();
	const [trpcClient] = useState(() =>
		createTRPCClient<AppRouter>({
			links: [
				httpBatchLink({
					url: getUrl(),
				}),
			],
		}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
				{children}
			</TRPCProvider>
		</QueryClientProvider>
	);
}
```

**Decisões:**
- Singleton do `QueryClient` no browser para não recriar durante re-renders
- `httpBatchLink` agrupa múltiplas requests em uma só (ex: stats + leaderboard na homepage)
- `VERCEL_URL` para deploy na Vercel (se aplicável)

---

### 4.4 `src/trpc/server.ts` — Server Caller + Helpers

Usado em Server Components para prefetch de queries. Também exporta um `caller` direto para quando precisamos dos dados no server sem hidratar pro client.

```ts
import "server-only";

import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { TRPCQueryOptions } from "@trpc/tanstack-react-query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cache } from "react";
import { createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

export const getQueryClient = cache(makeQueryClient);

export const trpc = createTRPCOptionsProxy({
	ctx: createTRPCContext,
	router: appRouter,
	queryClient: getQueryClient,
});

export const caller = appRouter.createCaller(createTRPCContext);

export function HydrateClient({ children }: { children: React.ReactNode }) {
	const queryClient = getQueryClient();
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{children}
		</HydrationBoundary>
	);
}

export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
	queryOptions: T,
) {
	const queryClient = getQueryClient();
	if (queryOptions.queryKey[1]?.type === "infinite") {
		void queryClient.prefetchInfiniteQuery(queryOptions as any);
	} else {
		void queryClient.prefetchQuery(queryOptions);
	}
}
```

**Decisões:**
- `import "server-only"` — garante erro de build se importado em client component
- `cache(makeQueryClient)` — singleton por request no server (não vaza entre requests)
- `HydrateClient` e `prefetch` são helpers que simplificam o padrão de prefetch + hydration (recomendados pela doc oficial do tRPC v11)
- `caller` direto para `generateMetadata` e outros usos server-only onde não precisamos hidratar

---

### 4.5 `src/app/api/trpc/[...trpc]/route.ts` — Fetch Adapter

Route handler do Next.js que expõe o tRPC router como API HTTP.

```ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";

const handler = (req: Request) =>
	fetchRequestHandler({
		endpoint: "/api/trpc",
		req,
		router: appRouter,
		createContext: createTRPCContext,
	});

export { handler as GET, handler as POST };
```

> **Nota:** Catch-all `[...trpc]` captura todas as procedures no path `/api/trpc/*`.

---

### 4.6 Routers

#### `src/trpc/routers/_app.ts` — Root Router

```ts
import { createTRPCRouter } from "../init";
import { leaderboardRouter } from "./leaderboard";
import { roastRouter } from "./roast";
import { statsRouter } from "./stats";

export const appRouter = createTRPCRouter({
	roast: roastRouter,
	leaderboard: leaderboardRouter,
	stats: statsRouter,
});

export type AppRouter = typeof appRouter;
```

---

#### `src/trpc/routers/roast.ts` — Roast Procedures

Derivado da query de referência da spec do Drizzle (seção 11) e da página `/roast/[id]`.

```ts
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { submissions, roasts, roastIssues, diffLines } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "../init";

export const roastRouter = createTRPCRouter({
	/** Busca o resultado completo de um roast pelo submissionId (Screen 2) */
	getById: baseProcedure
		.input(z.object({ id: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const [roast] = await ctx.db
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
				.where(eq(roasts.submissionId, input.id));

			if (!roast) return null;

			const [issues, diff] = await Promise.all([
				ctx.db
					.select()
					.from(roastIssues)
					.where(eq(roastIssues.roastId, roast.roastId))
					.orderBy(asc(roastIssues.sortOrder)),
				ctx.db
					.select()
					.from(diffLines)
					.where(eq(diffLines.roastId, roast.roastId))
					.orderBy(asc(diffLines.lineNumber)),
			]);

			return { ...roast, issues, diffLines: diff };
		}),

	/** Submete código para roast (Screen 1 — botão roast_my_code) */
	submit: baseProcedure
		.input(
			z.object({
				code: z.string().min(1).max(2000),
				language: z.string(),
				roastMode: z.boolean().default(false),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const lineCount = input.code.split("\n").length;

			const [submission] = await ctx.db
				.insert(submissions)
				.values({
					code: input.code,
					language: input.language,
					lineCount,
					roastMode: input.roastMode,
				})
				.returning({ id: submissions.id });

			// TODO: chamar IA para gerar o roast e salvar em roasts/roast_issues/diff_lines
			// Por enquanto retorna só o submissionId para redirect
			return { submissionId: submission.id };
		}),
});
```

**Campos derivados do design:**
- `getById` — alimenta toda a Screen 2 (Score Ring, verdict badge, roast comment, issue cards, diff section, código original)
- `submit.input.code` — textarea da Screen 1 (max 2000 chars — constante `MAX_CODE_LENGTH` na homepage)
- `submit.input.roastMode` — toggle "maximum sarcasm enabled" da Screen 1

---

#### `src/trpc/routers/leaderboard.ts` — Leaderboard Procedures

Derivado da query de referência da spec do Drizzle (seção 11) e das páginas `/` (preview) e `/leaderboard` (full).

```ts
import { z } from "zod";
import { eq, asc, sql } from "drizzle-orm";
import { submissions, roasts } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "../init";

export const leaderboardRouter = createTRPCRouter({
	/** Top N piores códigos — menor score = pior (Screen 1 preview + Screen 3) */
	getTop: baseProcedure
		.input(z.object({ limit: z.number().min(1).max(50).default(50) }))
		.query(async ({ ctx, input }) => {
			return ctx.db
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
				.limit(input.limit);
		}),
});
```

**Campos derivados do design:**
- `rank` — coluna `#` da tabela do leaderboard (Screen 1 e Screen 3)
- `score` — coluna `score` em vermelho (Screen 1 e Screen 3)
- `code` — preview do código na tabela (Screen 1) e bloco completo (Screen 3)
- `language` — label de linguagem (Screen 1 coluna `lang`, Screen 3 meta row)
- `lineCount` — `"3 lines"` na meta row do Screen 3

---

#### `src/trpc/routers/stats.ts` — Stats Procedures

Derivado da query de referência da spec do Drizzle (seção 11) e do footer da homepage.

```ts
import { count, avg } from "drizzle-orm";
import { roasts } from "@/db/schema";
import { createTRPCRouter, baseProcedure } from "../init";

export const statsRouter = createTRPCRouter({
	/** Total de roasts + média de score (Screen 1 — footer stats) */
	getSummary: baseProcedure.query(async ({ ctx }) => {
		const [result] = await ctx.db
			.select({
				totalRoasts: count(),
				avgScore: avg(roasts.score),
			})
			.from(roasts);

		return {
			totalRoasts: result.totalRoasts,
			avgScore: result.avgScore ? Number.parseFloat(result.avgScore) : 0,
		};
	}),
});
```

**Campos derivados do design (Screen 1 — footer):**
- `totalRoasts` — `"2,847 codes roasted"`
- `avgScore` — `"avg score: 4.2/10"`

---

## 5. Integração com as Páginas

### 5.1 `layout.tsx` — Provider

Wrappa `{children}` com o `TRPCReactProvider`:

```tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { TRPCReactProvider } from "@/trpc/client";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
	variable: "--font-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "DevRoast",
	description: "DevRoast — paste your code. get roasted.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${jetbrainsMono.variable} bg-bg-page antialiased`}>
				<Navbar />
				<TRPCReactProvider>{children}</TRPCReactProvider>
			</body>
		</html>
	);
}
```

---

### 5.2 Padrão de uso — Server prefetch + Client consume

O padrão para todas as páginas:

1. **Server Component** (page.tsx) chama `prefetch()` para iniciar o fetch no servidor
2. Wrappa o conteúdo com `<HydrateClient>` para hidratar os dados no client
3. **Client Component** consome via `useTRPC()` + `useQuery()` / `useSuspenseQuery()`

Exemplo com a página de leaderboard:

```tsx
// src/app/leaderboard/page.tsx (Server Component)
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { LeaderboardContent } from "./leaderboard-content";

export default function LeaderboardPage() {
	prefetch(trpc.leaderboard.getTop.queryOptions({ limit: 50 }));
	prefetch(trpc.stats.getSummary.queryOptions());

	return (
		<HydrateClient>
			<LeaderboardContent />
		</HydrateClient>
	);
}
```

```tsx
// src/app/leaderboard/leaderboard-content.tsx (Client Component)
"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export function LeaderboardContent() {
	const trpc = useTRPC();
	const { data: entries } = useSuspenseQuery(
		trpc.leaderboard.getTop.queryOptions({ limit: 50 }),
	);
	const { data: stats } = useSuspenseQuery(
		trpc.stats.getSummary.queryOptions(),
	);

	// ... render
}
```

### 5.3 `generateMetadata` — Caller direto

Para metadata dinâmica (ex: `/roast/[id]`), usar o `caller` diretamente sem passar pelo React Query:

```tsx
import { caller } from "@/trpc/server";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const roast = await caller.roast.getById({ id });

	if (!roast) return { title: "Roast not found - DevRoast" };

	return {
		title: `Roast ${id.slice(0, 8)}… - DevRoast`,
		description: roast.roastComment,
	};
}
```

---

## 6. Fora de Escopo

- **Integração com IA** — a mutation `roast.submit` só salva a submission e retorna o ID. A chamada à IA será implementada em uma spec separada.
- **Auth / rate limiting** — DevRoast é anônimo. Rate limiting pode ser adicionado depois via middleware do tRPC.
- **WebSockets / subscriptions** — não temos features real-time.
- **superjson / data transformer** — desnecessário com os tipos de dados atuais.
- **Refactor das páginas para client components** — essa spec cobre apenas a infraestrutura do tRPC. O wiring das páginas existentes (substituir dados hardcoded) será feito junto com a implementação.

---

## 7. Dependências

```
# runtime
@trpc/server          # core do tRPC server (router, procedures, adapters)
@trpc/client          # client vanilla (httpBatchLink)
@trpc/tanstack-react-query  # integração tRPC + TanStack React Query
@tanstack/react-query # data fetching + cache + hydration
zod                   # validação de input das procedures
server-only           # guard: erro se importado em client component
client-only           # guard: erro se importado em server component

# já instalados (sem alteração)
drizzle-orm           # ORM (já no projeto)
postgres              # driver (já no projeto)
```

---

## 8. Gotchas

1. **`createTRPCContext` com `cache()` do React** — O `cache()` do React garante que o contexto é criado uma vez por request no server. Sem isso, cada procedure call cria uma nova instância do contexto.

2. **`getQueryClient` no server também precisa de `cache()`** — Sem `cache(makeQueryClient)`, cada chamada a `prefetch()` criaria um novo `QueryClient` e os dados prefetchados se perderiam.

3. **`shouldDehydrateQuery` com `pending`** — Por padrão, o React Query só desidrata queries com status `success`. Para streaming (prefetch sem `await`), precisamos também desidratar queries `pending` para que o client possa receber os dados quando chegarem.

4. **Singleton do `QueryClient` no browser** — O `let browserQueryClient` fora do componente garante que o React não recria o client se o componente suspender durante o render inicial. Sem isso, perdemos o cache.

5. **`[...trpc]` vs `[trpc]`** — O catch-all `[...trpc]` é necessário porque o tRPC usa paths como `/api/trpc/roast.getById`. Com `[trpc]` (sem spread), o Next.js não captura paths com pontos.

6. **Import `type` no client** — O `AppRouter` deve ser importado como `import type` no `client.tsx` para não puxar código server-side para o bundle do client.

---

## 9. Tarefas

### Setup
- [ ] Instalar dependências: `npm install @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod server-only client-only`
- [ ] Criar `src/trpc/init.ts` (contexto + router factory + baseProcedure)
- [ ] Criar `src/trpc/query-client.ts` (factory do QueryClient)
- [ ] Criar `src/trpc/client.tsx` (provider + hooks)
- [ ] Criar `src/trpc/server.ts` (prefetch helpers + caller)
- [ ] Criar `src/app/api/trpc/[...trpc]/route.ts` (fetch adapter)

### Routers
- [ ] Criar `src/trpc/routers/_app.ts` (root router)
- [ ] Criar `src/trpc/routers/roast.ts` (getById + submit)
- [ ] Criar `src/trpc/routers/leaderboard.ts` (getTop)
- [ ] Criar `src/trpc/routers/stats.ts` (getSummary)

### Integração
- [ ] Alterar `src/app/layout.tsx` para wrappar com `TRPCReactProvider`
- [ ] Refatorar `/leaderboard` para usar prefetch + client component
- [ ] Refatorar `/roast/[id]` para usar prefetch + client component + caller no `generateMetadata`
- [ ] Refatorar homepage para usar `stats.getSummary` + `leaderboard.getTop` (preview)
- [ ] Conectar botão `roast_my_code` à mutation `roast.submit`

### Validação
- [ ] Build sem erros (`npm run build`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Verificar prefetch funcionando (dados no HTML do server, sem loading flash no client)
- [ ] Testar mutation de submit (salva no DB, retorna submissionId)
