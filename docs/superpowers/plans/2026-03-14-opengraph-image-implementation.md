# OpenGraph Image Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gerar imagens OpenGraph dinâmicas para resultados de roast usando Takumi.

**Architecture:** Criar route handler `/roast/[id]/opengraph-image.ts` que usa template Takumi para renderizar JSX → imagem PNG. Template extraído em arquivo separado para manutenibilidade.

**Tech Stack:** Next.js 16 (opengraph-image.ts), @takumi-rs/image-response

---

## Files Overview

| File | Ação | Responsabilidade |
|------|------|------------------|
| `package.json` | Modificar | Adicionar dependência @takumi-rs/image-response |
| `src/lib/takumi-og.tsx` | Criar | Template Takumi (componente JSX para imagem) |
| `src/app/roast/[id]/opengraph-image.ts` | Criar | Route handler que busca dados e retorna imagem |
| `src/app/roast/[id]/page.tsx` | Modificar | Adicionar og:image na metadata |

---

## Task 1: Instalar dependência Takumi

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Adicionar @takumi-rs/image-response ao package.json**

```json
{
  "dependencies": {
    "@takumi-rs/image-response": "^0.73.1"
  }
}
```

Rodar: `npm install @takumi-rs/image-response`

- [ ] **Step 2: Commit**

```bash
npm install @takumi-rs/image-response
git add package.json package-lock.json
git commit -m "feat: add @takumi-rs/image-response for OG images"
```

---

## Task 2: Criar template Takumi

**Files:**
- Create: `src/lib/takumi-og.tsx`

- [ ] **Step 1: Criar arquivo takumi-og.tsx com template**

```tsx
import { ComponentChildren } from "jsx-runtime";

interface RoastOGProps {
  score: string;
  verdict: string;
  language: string;
  lineCount: number;
  roastComment: string;
}

const colors = {
  bgPage: "#0a0a0a",
  textPrimary: "#fafafa",
  textTertiary: "#4b5563",
  accentGreen: "#10b981",
  accentAmber: "#f59e0b",
  accentRed: "#ef4444",
};

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

export function RoastOGTemplate({
  score,
  verdict,
  language,
  lineCount,
  roastComment,
}: RoastOGProps): ComponentChildren {
  const truncatedComment = truncateText(roastComment, 100);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
        padding: 64,
        backgroundColor: colors.bgPage,
      }}
    >
      {/* Logo Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            color: colors.accentGreen,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 24,
            fontWeight: 700,
          }}
        >
          {" >"}
        </span>
        <span
          style={{
            color: colors.textPrimary,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          devroast
        </span>
      </div>

      {/* Score Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <span
          style={{
            color: colors.accentAmber,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 160,
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {score}
        </span>
        <span
          style={{
            color: colors.textTertiary,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 56,
            fontWeight: 400,
            lineHeight: 1,
          }}
        >
          /10
        </span>
      </div>

      {/* Verdict Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: colors.accentRed,
          }}
        />
        <span
          style={{
            color: colors.accentRed,
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 20,
            fontWeight: 400,
          }}
        >
          {verdict}
        </span>
      </div>

      {/* Info Row */}
      <span
        style={{
          color: colors.textTertiary,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 16,
          fontWeight: 400,
        }}
      >
        lang: {language} · {lineCount} lines
      </span>

      {/* Roast Comment */}
      <span
        style={{
          color: colors.textPrimary,
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 22,
          fontWeight: 400,
          lineHeight: 1.5,
          textAlign: "center",
          maxWidth: "100%",
        }}
      >
        "{truncatedComment}"
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/takumi-og.tsx
git commit -m "feat: add Takumi OG template for roast results"
```

---

## Task 3: Criar route handler OpenGraph

**Files:**
- Create: `src/app/roast/[id]/opengraph-image.ts`

- [ ] **Step 1: Criar route handler opengraph-image.ts**

```ts
import { ImageResponse } from "@takumi-rs/image-response";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { roasts, submissions } from "@/db/schema";
import { RoastOGTemplate } from "@/lib/takumi-og";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [roast] = await db
    .select()
    .from(roasts)
    .where(eq(roasts.id, id))
    .limit(1);

  if (!roast) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#ef4444",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 24,
        }}
      >
        Roast not found
      </div>,
      { width: 1200, height: 630 }
    );
  }

  const [submission] = await db
    .select()
    .from(submissions)
    .where(eq(submissions.id, roast.submissionId))
    .limit(1);

  const score = parseFloat(roast.score).toFixed(1);
  const verdict = roast.verdict;
  const language = submission?.language ?? "unknown";
  const lineCount = submission?.lineCount ?? 0;
  const roastComment = roast.roastComment ?? "";

  return new ImageResponse(
    <RoastOGTemplate
      score={score}
      verdict={verdict}
      language={language}
      lineCount={lineCount}
      roastComment={roastComment}
    />,
    {
      width: 1200,
      height: 630,
      format: "png",
    }
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/roast/[id]/opengraph-image.ts
git commit -m "feat: add opengraph-image route for roast results"
```

---

## Task 4: Verificar integração

- [ ] **Step 1: Build do projeto**

Rodar: `npm run build`
Esperado: Build completa sem erros

- [ ] **Step 2: Testar rota**

Iniciar dev server: `npm run dev`
Acessar: `http://localhost:3000/roast/[id]/opengraph-image`
Esperado: Retorna imagem PNG

- [ ] **Step 3: Verificar meta tags**

Inspecionar página de roast e verificar que `<meta property="og:image">` aponta para a rota

- [ ] **Step 4: Commit final**

```bash
git commit -m "feat: verify OG image integration"
```

---

## Verificação Final

- [ ] Imagem gerada para roast existente
- [ ] Meta tags apontam paraog:image
- [ ] Diferentes scores e verdicts funcionam
- [ ] Comentários longos são truncados
- [ ] Performance aceitável (tempo de geração)

---

## Task 5: Adicionar meta tag na página de roast

**Files:**
- Modify: `src/app/roast/[id]/page.tsx:43-51`

- [ ] **Step 1: Atualizar generateMetadata para incluir og:image**

Modificar o retorno da função `generateMetadata` para incluir a propriedade `images`:

```ts
return {
  title: `Score: ${roast.score}/10 - DevRoast`,
  description: roast.roastComment,
  openGraph: {
    title: `Score: ${roast.score}/10 - DevRoast`,
    description: roast.roastComment,
    images: [`/roast/${id}/opengraph-image`],
  },
};
```

- [ ] **Step 2: Commit**

```bash
git add src/app/roast/[id]/page.tsx
git commit -m "feat: add OG image meta tag to roast page"
```