# Design: OpenGraph Image para Resultados de Roast

## Visão Geral

Gerar imagens OpenGraph dinamicamente para cada resultado de roast, usando Takumi para renderização JSX → imagem. Quando um usuário compartilha o link de um roast, a imagem mostra score, verdict e comentário.

## Arquitetura

```
/roast/[id]/opengraph-image.tsx  (route handler - Next.js og-image)
        ↓
src/lib/takumi-og.tsx           (template Takumi - componente JSX)
        ↓
@takumi-rs/image-response       (engine - renderiza para PNG/WebP)
```

## Fluxo de Dados

1. `/roast/[id]/opengraph-image.ts` é chamado pelo Next.js
2. Busca dados do roast do banco (score, verdict, roastComment, language, lineCount)
3. Passa dados para componente Takumi
4. `ImageResponse` do Takumi renderiza o JSX para imagem
5. Retorna imagem para meta tags (og:image)

## Template Takumi

### Dimensões
- Largura: 1200px
- Altura: 630px
- Formato: PNG (padrão OG)

### Estrutura Visual

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   > devroast                                            │
│                                                          │
│                    3.5/10                                │
│                                                          │
│           ● needs_serious_help                           │
│                                                          │
│          lang: javascript · 7 lines                      │
│                                                          │
│     "this code was written during a power outage..."     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Elementos

| Elemento | Fonte de Dados | Estilo |
|----------|-----------------|--------|
| Logo prompt `>` |固定" | Verde (`#22c55e`), JetBrains Mono, 24px, bold |
| Logo texto |固定"devroast" | Primário (`#fafafa`), JetBrains Mono, 20px |
| Score número | `roast.score` | Âmbar (`#f59e0b`), 160px, bold 900 |
| Score "/10" |固定 | Terciário (`#71717a`), 56px |
| Verdict círculo |固定 | Vermelho (`#ef4444`), 12px círculo |
| Verdict texto | `roast.verdict` → texto | Vermelho (`#ef4444`), 20px |
| Info lang | `submission.language` + `submission.lineCount` | Terciário (`#71717a`), JetBrains Mono, 16px |
| Quote | `roast.roastComment` | Primário (`#fafafa`), 22px, centralizado, max 2 linhas |

### Cores do Tema

O template usa as variáveis do globals.css:
- `$bg-page`: Fundo da imagem
- `$text-primary`: Texto principal
- `$text-tertiary`: Texto secundário
- `$accent-green`: Logo prompt
- `$accent-amber`: Score
- `$accent-red`: Verdict

## Tratamento de Dados

### Score
- Formatar com 1 casa decimal (ex: "3.5", não "3.50")
- Mostrar "0" como fallback se null

### Verdict
Mapeamento do banco para texto:
- `needs_serious_help` → "needs_serious_help"
- `rough_around_the_edges` → "rough_around_the_edges"
- `not_terrible` → "not_terrible"
- `actually_decent` → "actually_decent"
- `solid_code` → "solid_code"

### Comentário (Quote)
- Limitar a ~100 caracteres com "..." se muito longo
- Truncar em palavra completa (não no meio)

### Language
- Fallback: "unknown" se null

## Tratamento de Erros

- Se roast não encontrado: renderizar imagem de erro simples
- Se banco não acessível: retornar imagem estática fallback

## Stack

- **@takumi-rs/image-response**: Engine de renderização
- **Next.js**: `opengraph-image.ts` route paraog:image

## Testes

1. Verificar que imagem é gerada para roast existente
2. Verificar que meta tags apontam paraog:image
3. Testar diferentes scores e verdicts
4. Testar comentários longos (truncamento)
5. Verificar performance (tempo de geração)

## Alternativas Consideradas

1. **Satori**: engine similar, Takumi preferido por performance e portabilidade
2. **Gerar no momento do roast**: adicionaria latência à criação, preferimos dinâmico
3. **Servir imagem estática do banco**: ocupa mais espaço, menos flexível