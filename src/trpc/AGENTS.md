# tRPC

End-to-end typesafe API layer using tRPC v11 + TanStack React Query v5.

## Architecture

```
src/trpc/
  init.ts          Context creation, router factory, base procedure
  client.tsx       Client provider + useTRPC hook ("use client")
  server.tsx       Server caller, prefetch helper, HydrateClient ("server-only")
  query-client.ts  QueryClient factory (shared between server and client)
  routers/
    _app.ts        Root router (merges all sub-routers)
    stats.ts       stats.getSummary procedure
    leaderboard.ts leaderboard.getTop procedure
```

## Key Files

### `init.ts` — Context and Procedures

- `createTRPCContext` is wrapped in React `cache()` — one context per server request
- Context type must be wired via `initTRPC.context<Context>().create()` so procedures have typed `ctx`
- Currently provides `{ db }` (Drizzle instance) — no auth (DevRoast is anonymous)
- No `transformer` (no superjson) — we don't use `Date`, `Map`, `Set` in responses

```ts
type Context = Awaited<ReturnType<typeof createTRPCContext>>;
const t = initTRPC.context<Context>().create();
```

### `server.tsx` — Server-Side Helpers

- `.tsx` extension required because it contains JSX (`<HydrationBoundary>`)
- Guarded with `import "server-only"` — build error if imported in client components
- Exports:
  - `trpc` — options proxy for building `queryOptions()` in server components
  - `caller` — direct server caller for `generateMetadata` and other server-only uses
  - `prefetch(queryOptions)` — prefetches a query into the request-scoped QueryClient
  - `HydrateClient` — wraps children with `<HydrationBoundary>` to pass prefetched data to client

### `client.tsx` — Client Provider

- `TRPCReactProvider` wraps children with `QueryClientProvider` + `TRPCProvider`
- Must be placed in `layout.tsx` around `{children}`
- `useTRPC()` hook gives client components access to typed tRPC procedures
- Uses `httpBatchLink` to batch multiple requests into one HTTP call
- QueryClient singleton on browser (new per request on server)

### `query-client.ts` — Shared Configuration

- `staleTime: 30s` — avoids refetch immediately after SSR hydration
- `shouldDehydrateQuery` includes `pending` status — enables streaming from server to client

## Patterns

### Adding a new procedure

1. Create or edit a router file in `src/trpc/routers/`
2. Use `baseProcedure` from `init.ts` — access `ctx.db` for database queries
3. Add the router to `_app.ts` root router
4. The procedure is automatically available via `trpc.routerName.procedureName` on both server and client

### Server prefetch + client consumption

The standard pattern for pages that need data:

```tsx
// page.tsx (server component)
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function Page() {
  prefetch(trpc.stats.getSummary.queryOptions());
  return (
    <HydrateClient>
      <ClientContent />
    </HydrateClient>
  );
}

// client-content.tsx ("use client")
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

function ClientContent() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.stats.getSummary.queryOptions());
  // data is available immediately from hydration — no loading state needed
}
```

### Parallel prefetches with `await Promise.all`

When a page needs multiple queries, use `await Promise.all` to execute prefetches concurrently on the server. The `prefetch()` helper returns a `Promise<void>` — without `await Promise.all`, prefetches still fire (they're non-blocking), but awaiting them together makes the intent explicit and guarantees both resolve before the shell is streamed to the client.

```tsx
// page.tsx (server component)
export default async function Page() {
  await Promise.all([
    prefetch(trpc.stats.getSummary.queryOptions()),
    prefetch(trpc.leaderboard.getTop.queryOptions({ limit: 3 })),
  ]);

  return (
    <HydrateClient>
      <PageContent />
    </HydrateClient>
  );
}
```

**Why not sequential?** Each `prefetch` hits the DB independently. Running them sequentially adds unnecessary latency — if query A takes 50ms and query B takes 40ms, sequential = 90ms, parallel = ~50ms.

### Parallel `useSuspenseQuery` in client components

When a client component needs data from multiple queries inside a single Suspense boundary, call all `useSuspenseQuery` hooks at the top level of the component. React Query batches them into one Suspense resolution — the component suspends until **all** queries resolve, avoiding sequential waterfalls.

```tsx
// component.tsx ("use client")
function MyComponent() {
  const trpc = useTRPC();
  const { data: entries } = useSuspenseQuery(
    trpc.leaderboard.getTop.queryOptions({ limit: 3 }),
  );
  const { data: stats } = useSuspenseQuery(
    trpc.stats.getSummary.queryOptions(),
  );
  // Both resolve together — no waterfall
}
```

### When NOT to use Suspense for data

For numeric stats displayed with `<NumberFlow>`, skip Suspense/skeletons entirely. Instead:

1. Use `useQuery` (not `useSuspenseQuery`)
2. Default values to `0` via `?? 0`
3. Let `NumberFlow` animate from 0 to real values
4. Use `IntersectionObserver` to trigger animation when visible

This avoids the problem where server prefetch resolves too fast for any animation to be visible.

## Gotchas

- `prefetch()` returns `Promise<void>` — use `await Promise.all([...])` when prefetching multiple queries to run them concurrently. Do NOT use `void` to discard the return value, or `Promise.all` won't actually wait for resolution.
- `initTRPC.create()` without `.context<Context>()` makes `ctx` typed as `{}` — procedures can't access `ctx.db`
- `server.tsx` must use `.tsx` extension for JSX — `.ts` causes parse errors
- `HydrationBoundary` must be a value import, not `import type` — it's used as a JSX component
- The fetch adapter at `app/api/trpc/[...trpc]/route.ts` uses the generic `@trpc/server/adapters/fetch`, not a Next.js-specific adapter (doesn't exist in tRPC v11)
