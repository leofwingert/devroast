# UI Component Patterns

Standards and patterns for creating components inside `src/components/ui/`.

## Stack

- **Tailwind CSS v4** — utility-first styling via `@theme` tokens in `globals.css`
- **tailwind-variants (`tv`)** — variant API with built-in class merging via `tailwind-merge` (installed as dependency but never imported directly in our code)
- **TypeScript** — strict typing, extend native element props
- **Biome** — linting and formatting (tabs, double quotes)
- **Base UI (`@base-ui/react`)** — behavioral primitives for interactive components (Toggle uses Switch)
- **Shiki** — syntax highlighting for server-side code blocks (vesper theme)

## Rules

### 1. Named exports only

Never use `export default`. Always use named exports for components, types, and variant definitions.

```tsx
// correct
export { Button, type ButtonProps, type ButtonVariants, buttonVariants };

// wrong
export default function Button() { ... }
```

### 2. Extend native element props

Every component must extend the native HTML element props via `React.ComponentProps<"element">`. This gives consumers full access to native attributes (`onClick`, `disabled`, `aria-*`, etc.) without manual forwarding.

```tsx
type ButtonProps = React.ComponentProps<"button"> &
  ButtonVariants & {
    className?: string;
  };
```

### 3. Use `tailwind-variants` for all variant logic

Define a `tv()` call that exports both the variant function (for external use) and the component itself. Do NOT use `tailwind-merge` — `tv()` handles class merging internally when you pass `className` as a parameter.

```tsx
const buttonVariants = tv({
  base: "...",
  variants: {
    variant: { primary: "...", secondary: "..." },
    size: { sm: "...", md: "...", lg: "..." },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
```

### 4. Pass `className` through `tv()`, never with `twMerge`

The `className` prop must be passed directly to the `tv()` call so it merges and resolves conflicts automatically.

```tsx
// correct — tv handles the merge
function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  );
}

// wrong — don't use tailwind-merge
className={twMerge(buttonVariants({ variant, size }), className)}
```

### 5. Export the variant function alongside the component

Always export the `tv()` result (e.g. `buttonVariants`) so it can be reused in compound components or external styling.

```tsx
export { Button, type ButtonProps, type ButtonVariants, buttonVariants };
```

### 6. Extract `VariantProps` for type safety

Use `VariantProps<typeof variantFn>` from `tailwind-variants` to derive the variant types and compose them into the component props.

```tsx
import { type VariantProps, tv } from "tailwind-variants";

type ButtonVariants = VariantProps<typeof buttonVariants>;
```

### 7. Use design tokens from `globals.css`

Never hardcode colors or spacing. Use the tokens defined in `@theme` (e.g. `bg-accent-green`, `text-text-primary`, `border-border-primary`). The only exception is one-off values that truly don't belong in the design system.

Available token prefixes:
- `bg-page`, `bg-surface`, `bg-elevated`, `bg-input` — backgrounds
- `text-primary`, `text-secondary`, `text-tertiary` — text colors
- `border-primary`, `border-focus` — borders
- `accent-green`, `accent-red`, `accent-amber`, `accent-cyan` — accent colors

### 8. File structure

One component per file. File name matches the component name in kebab-case. Components with sub-parts use the **composition pattern** — sub-components are exported from the same file.

```
src/components/ui/
  button.tsx       ← Button (4 variants, 3 sizes)
  badge.tsx        ← Badge (critical/warning/good)
  toggle.tsx       ← Toggle + ToggleLabel (Base UI Switch, client component)
  card.tsx         ← Card + CardTitle + CardDescription (generic container)
  code-block.tsx   ← CodeBlock + CodeBlockHeader + CodeBlockBody (async RSC, Shiki + vesper)
  diff-line.tsx    ← DiffLine (added/removed/context)
  score-ring.tsx   ← ScoreRing (SVG progress ring)
  AGENTS.md        ← this file
```

### 9. Client vs server components

- **Server components (default)**: Most components are React Server Components. No `"use client"` directive needed. Can be `async` (e.g., CodeBlockBody uses `await codeToHtml()`).
- **Client components**: Only add `"use client"` when the component uses hooks (`useState`, `useEffect`, etc.), event handlers as state, or browser-only APIs. Example: Toggle uses Base UI's Switch which requires client-side interactivity.
- **Base UI**: Use `@base-ui/react` for components that need accessible interactive behavior (switches, dialogs, etc.). These always require `"use client"` since they use hooks internally.

### 10. Composition pattern

When a component has distinct sub-parts (title, description, header, body, label), split them into sub-components exported from the same file. Consumers compose them as children instead of passing props.

```tsx
// correct — composition pattern
<Card>
  <CardTitle>title</CardTitle>
  <CardDescription>description</CardDescription>
</Card>

<Toggle defaultChecked>
  <ToggleLabel>roast mode</ToggleLabel>
</Toggle>

<CodeBlock>
  <CodeBlockHeader>file.ts</CodeBlockHeader>
  <CodeBlockBody code={code} language="typescript" />
</CodeBlock>

// wrong — prop-based pattern
<Card title="title" description="description" />
<Toggle label="roast mode" defaultChecked />
<CodeBlock code={code} language="typescript" filename="file.ts" />
```

Each sub-component should:
- Have its own `tv()` variant function (e.g. `cardTitleVariants`)
- Extend native element props (`React.ComponentProps<"p">`, etc.)
- Accept and merge `className` through `tv()`
- Be a named export from the same file as the root component

Don't split into sub-components when:
- The internal structure is mathematically coupled to props (e.g. ScoreRing SVG)
- The sub-part is a visual detail, not a semantic concern (e.g. Badge dot)
- The prefix/decoration is tightly coupled to a variant (e.g. DiffLine `+`/`-`)

## Component template

```tsx
import { type VariantProps, tv } from "tailwind-variants";

const myComponentVariants = tv({
  base: "...",
  variants: {
    variant: { ... },
    size: { ... },
  },
  defaultVariants: {
    variant: "...",
    size: "...",
  },
});

type MyComponentVariants = VariantProps<typeof myComponentVariants>;

type MyComponentProps = React.ComponentProps<"div"> &
  MyComponentVariants & {
    className?: string;
  };

function MyComponent({ variant, size, className, ...props }: MyComponentProps) {
  return (
    <div
      className={myComponentVariants({ variant, size, className })}
      {...props}
    />
  );
}

export {
  MyComponent,
  type MyComponentProps,
  type MyComponentVariants,
  myComponentVariants,
};
```
