# Editor com Syntax Highlight

Especificacao para o editor de codigo da homepage com syntax highlighting em tempo real e deteccao automatica de linguagem. Escopo simplificado: so paste/type + highlight, sem keyboard handling avancado.

## Pesquisa

### Como o ray-so faz

O ray-so (https://github.com/raycast/ray-so) **nao usa nenhuma lib de editor** (nao usa CodeMirror, Monaco, etc.). Eles construiram um editor custom usando o padrao **textarea transparente sobre codigo highlighted**:

- Uma `<textarea>` invisivel (texto transparente, caret visivel) recebe todo o input do usuario
- Um `<div>` com `dangerouslySetInnerHTML` renderiza o codigo highlighted por baixo
- Os dois elementos ficam empilhados via CSS grid (`grid-area: 1/1/2/2`)
- **Shiki** pra syntax highlighting (via `codeToHtml` com tema CSS variables)
- **highlight.js** (`highlightAuto`) apenas pra deteccao de linguagem
- Estado inteiro gerenciado com **Jotai** (atoms), sincronizado com URL hash

### Opcoes avaliadas

| Opcao | Bundle (gzip) | Qualidade | Setup | Veredicto |
|-------|---------------|-----------|-------|-----------|
| **CodeMirror 6** | 78-119 KB | Excelente (Lezer) | Medio-Alto | Overkill — editor completo de IDE |
| **Monaco Editor** | ~992 KB | Excelente (VS Code) | Medio | Absurdamente pesado |
| **Shiki textarea (DIY)** | 0 KB novo | Excelente (TextMate) | Medio | Controle total, zero deps novas |
| **react-simple-code-editor + Shiki** | 3.4 KB | Excelente (TextMate) | Baixo | Leve, mas desnecessario pro nosso escopo |
| **prism-code-editor** | 2.6 KB + langs | Bom (PrismJS) | Baixo | Highlighter diferente do Shiki |

### Deteccao de linguagem

| Opcao | Bundle | Precisao | Nota |
|-------|--------|----------|------|
| **highlight.js `highlightAuto`** | ~80-100 KB (common) | Boa pra linguagens distintas, fraca pra JS vs TS | Melhor opcao client-side, mesmo approach do ray-so |
| **Heuristicas manuais** | 0 KB | Fragil | Shebangs, keywords — nao confiavel |
| **Server-side (AI)** | 0 KB | Excelente | Sem custo no bundle, mas so funciona no submit |

## Decisao

### Abordagem: textarea overlay simples + Shiki + highlight.js

Seguir o padrao do ray-so com escopo simplificado: textarea transparente sobre codigo highlighted, **sem keyboard handling avancado**. O usuario simplesmente digita ou cola codigo e ve o highlighting em tempo real.

**Sem implementar:**
- Tab indent/dedent
- Auto-bracket (`{`, `[`, `(`)
- Auto-dedent no `}`, `]`, `)`
- Enter com auto-indent
- `document.execCommand` hacks

**Motivos da simplificacao:**
1. O uso principal e **paste** de codigo, nao edicao
2. Features de editor adicionam complexidade significativa sem beneficio real
3. Se precisarmos de editor features no futuro, podemos adotar CodeMirror

### Nao usar

- **CodeMirror/Monaco** — overkill, bundle enorme
- **react-simple-code-editor** — desnecessario pro escopo simples
- **PrismJS** — highlighter diferente do que ja usamos

## Especificacao

### Arquitetura

```
src/components/
  editor/
    code-editor.tsx        Editor principal ("use client")
    language-selector.tsx  Seletor manual de linguagem ("use client")
    use-highlighter.ts     Hook pra instancia singleton do Shiki
    use-language-detect.ts Hook pra deteccao automatica com highlight.js
    languages.ts           Mapa de linguagens suportadas (nome, shiki key, hljs key)
```

### Componentes

#### `CodeEditor` (client component)

O editor principal. Duas layers empilhadas via CSS grid:

1. **Layer de highlight** — `<div>` renderiza HTML do Shiki via `dangerouslySetInnerHTML`
2. **Layer de input** — `<textarea>` transparente recebe toda interacao

Props:
- `value: string` — codigo atual
- `onChange: (code: string) => void` — callback quando o codigo muda
- `language?: string` — linguagem forcada (quando usuario seleciona manualmente)
- `placeholder?: string`
- `className?: string`

Estado interno:
- Linguagem detectada (via `useLanguageDetect`)
- Instancia do highlighter Shiki (via `useHighlighter`)
- HTML highlighted (memoizado com `useMemo`)

Estilos:
- Textarea: `color: transparent`, `caret-color: var(--color-text-primary)`, `background: transparent`
- Grid overlap: ambas layers na mesma grid area (`grid-area: 1/1`)
- Font: `var(--font-mono)`, mesmo `font-size`, `line-height` e `padding` nas duas layers
- Scroll sync: textarea controla o scroll, highlight layer acompanha via ref sync
- `white-space: pre`, `overflow-wrap: normal` — sem line wrapping

#### `LanguageSelector` (client component)

Dropdown pra selecao manual de linguagem. Mostra a linguagem detectada como default ("auto: javascript"). Quando o usuario seleciona manualmente, sobrescreve a deteccao automatica.

Props:
- `detectedLanguage: string` — linguagem detectada automaticamente
- `selectedLanguage: string | null` — linguagem selecionada manualmente (null = auto)
- `onSelect: (language: string | null) => void`

Opcoes:
- "Auto-detect" (default, reseta pra null)
- Lista de linguagens suportadas

#### `useHighlighter` hook

Singleton do Shiki highlighter. Inicializa uma vez com `createHighlighter()`, carrega linguagens sob demanda.

```ts
import { createHighlighter } from "shiki/bundle/web";

// Carrega com tema vesper + linguagens basicas
const highlighter = await createHighlighter({
  themes: ["vesper"],
  langs: ["javascript", "typescript", "python", "html", "css"],
});

// Lazy-load de outras linguagens
await highlighter.loadLanguage("rust");
```

Retorna: `{ highlighter, isLoading, loadLanguage }`

#### `useLanguageDetect` hook

Deteccao automatica com highlight.js. Debounce de ~300ms pra nao rodar em cada keystroke.

```ts
import hljs from "highlight.js/lib/common";
const result = hljs.highlightAuto(code);
// result.language -> "javascript", "python", etc.
```

Retorna: `{ detectedLanguage: string, isDetecting: boolean }`

#### `languages.ts`

Mapa central de linguagens suportadas com keys pro Shiki e pro highlight.js:

```ts
export const LANGUAGES = {
  javascript: { label: "JavaScript", shiki: "javascript", hljs: "javascript" },
  typescript: { label: "TypeScript", shiki: "typescript", hljs: "typescript" },
  python: { label: "Python", shiki: "python", hljs: "python" },
  // ...
} as const;
```

### Integracao na homepage

O `page.tsx` atual tem um `<textarea>` simples dentro do Code Editor section. Substituir o textarea + LineNumbers por `<CodeEditor>`. O `LanguageSelector` fica na actions bar.

### Performance

- **Shiki highlighting e sincrono** depois que o highlighter ta inicializado
- **Debounce na deteccao** (highlight.js) — 300ms apos parar de digitar
- **Lazy loading de linguagens** — so carrega a grammar do Shiki quando a linguagem e detectada
- **Memoizacao** — nao re-highlight se o codigo e a linguagem nao mudaram

### Dependencias novas

| Pacote | Versao | Tamanho | Motivo |
|--------|--------|---------|--------|
| `highlight.js` | ^11.x | ~80-100 KB gzip (common) | Deteccao automatica de linguagem |

Shiki ja esta no projeto (^4.0.2). Nenhuma outra dependencia nova.

## Tarefas

- [ ] Instalar `highlight.js`
- [ ] Criar `languages.ts` com mapa de linguagens
- [ ] Criar `useHighlighter` hook (singleton Shiki client-side)
- [ ] Criar `useLanguageDetect` hook (highlight.js auto-detect com debounce)
- [ ] Criar `CodeEditor` component (textarea overlay, sem keyboard handling)
- [ ] Criar `LanguageSelector` component
- [ ] Integrar `CodeEditor` na homepage (`page.tsx`)
- [ ] Integrar `LanguageSelector` na actions bar da homepage
- [ ] Testar: paste de codigo detecta linguagem corretamente
- [ ] Testar: scroll sync entre textarea e highlight layer
- [ ] Testar: selecao manual de linguagem sobrescreve auto-detect
- [ ] Build e lint sem erros
