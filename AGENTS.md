# DevRoast

AI-powered code roasting app. Paste code, get brutally honest feedback.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** with `@theme` tokens in `src/app/globals.css`
- **tailwind-variants** (`tv()`) for component variants — never use `tailwind-merge` directly
- **Base UI** (`@base-ui/react`) for accessible interactive primitives
- **Shiki** (vesper theme) for server-side syntax highlighting
- **Biome** for linting and formatting (tabs, double quotes)
- **tRPC v11** + **TanStack React Query v5** for end-to-end typesafe API (see `src/trpc/AGENTS.md`)
- **Drizzle ORM** with PostgreSQL (see `src/db/AGENTS.md`)
- **@number-flow/react** for animated number transitions

## Project Structure

```
src/
  app/           Pages and layouts (App Router) — see app/AGENTS.md
  components/    Shared components (ex: Navbar, StatsCounter)
    ui/          Reusable UI primitives — see ui/AGENTS.md
  trpc/          tRPC infrastructure — see trpc/AGENTS.md
  db/            Database layer (Drizzle) — see db/AGENTS.md
specs/           Feature specs written before implementation — see specs/AGENTS.md
```

## Key Patterns

1. **Named exports only** — never `export default` in components (pages use default per Next.js convention)
2. **Composition pattern** — components with sub-parts use composable children, not props (e.g. `<Card><CardTitle>...</CardTitle></Card>`)
3. **Design tokens** — all colors/spacing from `globals.css` `@theme` block, never hardcode
4. **Server components by default** — only add `"use client"` when hooks or browser APIs are needed
5. **`enabled:hover:`** — use on buttons so hover styles don't fire when disabled
6. **Server page + client content split** — pages that need server prefetch are async server components that delegate UI to a `"use client"` content component via slot props (see `app/AGENTS.md`)
7. **Animated numbers over skeletons** — for numeric stats, prefer rendering `0` immediately and animating to real values with `<NumberFlow>` triggered by `IntersectionObserver`, instead of Suspense/skeleton loading states. This gives a natural count-up effect.

## Design Tokens

Backgrounds: `bg-page`, `bg-surface`, `bg-elevated`, `bg-input`
Text: `text-primary`, `text-secondary`, `text-tertiary`
Borders: `border-primary`, `border-focus`
Accents: `accent-green`, `accent-red`, `accent-amber`, `accent-cyan`
Fonts: `--font-mono` (JetBrains Mono), `--font-sans` (system)

## Commands

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Biome check
npm run lint:fix   # Biome auto-fix
npm run format     # Biome format
```
