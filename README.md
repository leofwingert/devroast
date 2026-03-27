# DevRoast

**Cole seu código. Leve um roast.**

DevRoast é um app de code review com IA. Você envia um trecho de código e recebe feedback técnico em dois estilos:

- `Roast mode`: sarcástico e sem dó
- `Constructive mode`: direto, mas mais gentil

Além disso, cada análise recebe score (`0-10`), issues por severidade e sugestões de diff.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript (strict)
- Tailwind CSS v4 + `tailwind-variants`
- tRPC v11 + TanStack React Query v5
- Drizzle ORM + PostgreSQL
- Shiki para syntax highlight server-side
- Biome para lint e formatação

## Funcionalidades

- Editor de código na home
- Toggle entre roast e feedback construtivo
- Score com veredito
- Diff sugerido para melhorias
- Leaderboard com os piores códigos enviados

## Pré-requisitos

- Node.js 20+
- npm 10+
- PostgreSQL (local, Docker, Supabase ou equivalente)
- Chave de API da Groq

## Variáveis de ambiente

Crie um `.env.local` na raiz:

```bash
DATABASE_URL="postgresql://..."
GROQ_API_KEY="gsk_..."
```

`DATABASE_URL` é obrigatória para a aplicação e para os comandos do Drizzle.

## Rodando localmente

1. Instale dependências:

```bash
npm install
```

2. Suba o banco (opcional via Docker):

```bash
docker compose up -d
```

3. Aplique o schema no banco:

```bash
npm run db:push
```

4. Inicie o app:

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts úteis

```bash
npm run dev         # desenvolvimento
npm run build       # build de produção
npm run start       # servidor de produção
npm run lint        # biome check
npm run lint:fix    # corrige problemas de lint
npm run format      # formata o projeto
npm run db:generate # gera artefatos do Drizzle
npm run db:migrate  # roda migrações
npm run db:push     # sincroniza schema com o banco
npm run db:studio   # abre Drizzle Studio
npm run db:seed     # popula banco com dados de exemplo
```

## Estrutura do projeto

```text
src/
  app/         # páginas e layouts (App Router)
  components/  # componentes compartilhados
  db/          # schema, conexão e seed do banco
  lib/         # integrações e utilitários (AI, cache, etc.)
  trpc/        # cliente/servidor tRPC
specs/         # especificações de features
docs/          # documentação complementar
```

## Licença

MIT
