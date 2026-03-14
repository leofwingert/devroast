# DevRoast

AI-powered code roasting app. Paste code, get brutally honest feedback.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** with `@theme` tokens in `src/app/globals.css`
- **tailwind-variants** (`tv()`) for component variants — never use `tailwind-merge` directly
- **Base UI** (`@base-ui/react`) for accessible interactive primitives
- **Shiki** (vesper theme) for server-side syntax highlighting
- **Biome** for linting and formatting (tabs, double quotes)

## Project Structure

```
src/
  app/           Pages e layouts (App Router)
  components/    Componentes compartilhados (ex: Navbar)
    ui/          Componentes UI reutilizaveis (ver ui/AGENTS.md)
```

## Key Patterns

1. **Named exports only** — never `export default` in components (pages use default per Next.js convention)
2. **Composition pattern** — components with sub-parts use composable children, not props (e.g. `<Card><CardTitle>...</CardTitle></Card>`)
3. **Design tokens** — all colors/spacing from `globals.css` `@theme` block, never hardcode
4. **Server components by default** — only add `"use client"` when hooks or browser APIs are needed
5. **`enabled:hover:`** — use on buttons so hover styles don't fire when disabled

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
