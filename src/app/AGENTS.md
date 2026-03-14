# App Router Pages

Next.js App Router pages and layouts.

## Structure

```
src/app/
  layout.tsx          Root layout (fonts, Navbar, TRPCReactProvider)
  globals.css         Tailwind v4 config + @theme design tokens
  page.tsx            Homepage (server component)
  home-content.tsx    Homepage UI (client component)
  api/trpc/[...trpc]/ tRPC fetch adapter route
  leaderboard/        Leaderboard page
  roast/[id]/         Roast result page
  components/         Component showcase (dev only)
```

## Server Page + Client Content Split

Pages that need server-side data prefetching follow this pattern:

1. **`page.tsx`** — async server component that prefetches data and wraps with `<HydrateClient>`
2. **`*-content.tsx`** — `"use client"` component with all the interactive UI, receives data-dependent sections via slot props

This split exists because `prefetch()` only works in server components, but most page UI needs client interactivity (state, events, hooks).

### Pattern

```tsx
// page.tsx (server component — no "use client")
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { PageContent } from "./page-content";

export default async function Page() {
  prefetch(trpc.someRouter.someQuery.queryOptions());

  return (
    <HydrateClient>
      <PageContent
        dataSlot={<SomeDataComponent />}
      />
    </HydrateClient>
  );
}
```

```tsx
// page-content.tsx ("use client")
type PageContentProps = {
  dataSlot: React.ReactNode;
};

function PageContent({ dataSlot }: PageContentProps) {
  // interactive UI here...
  return (
    <main>
      {/* ... */}
      {dataSlot}
    </main>
  );
}

export { PageContent, type PageContentProps };
```

### Slot Props

Data-dependent UI sections are passed as `React.ReactNode` slot props (e.g. `statsSlot`, `dataSlot`) rather than fetching inside the client component. This keeps the server prefetch in the server component and the rendering in the client component cleanly separated.

### When to use this pattern

- The page needs `prefetch()` (server-only) AND has client interactivity (`useState`, `useCallback`, etc.)
- The page has sections that depend on different data sources that could be independently composed

### When NOT to use this pattern

- Purely static pages with no data fetching — just use a regular server component
- Pages where all UI is server-rendered — no need for a client content split

## Animated Numbers (NumberFlow)

For numeric stats (counters, scores), use `@number-flow/react` instead of Suspense/skeleton loading:

1. Use `useQuery` (not `useSuspenseQuery`) — avoids Suspense boundary
2. Default to `0` with `?? 0`
3. Trigger animation with `IntersectionObserver` — numbers stay at `0` until the element is visible, then animate to the real value
4. Server prefetch still runs — data is ready by the time the observer fires

This creates a natural count-up animation that users actually see, rather than data appearing instantly from SSR hydration.

## Layout

`layout.tsx` wraps `{children}` with:
- `<Navbar />` — site navigation
- `<TRPCReactProvider>` — tRPC + React Query context for all pages

## Conventions

- Pages use `export default` (Next.js requirement) — the only exception to the named-exports rule
- Client content components use named exports (`export { HomeContent }`)
- File naming: `home-content.tsx`, `leaderboard-content.tsx` (kebab-case, matches the page)
