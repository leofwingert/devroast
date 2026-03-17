# Specs

Especificações de features escritas **antes** da implementação. Cada spec é um arquivo `.md` nesta pasta.

## Formato

1. **Título (`#`)** — nome da feature
2. **Contexto** — blockquote ou parágrafo curto explicando o porquê
3. **Seções numeradas (`## N. Nome`)** — organizar em:
   - Pesquisa / decisões (com tabelas comparativas quando houver alternativas)
   - Especificação detalhada (schemas, props, contratos de hooks)
   - Arquitetura (file tree dos arquivos que serão criados)
   - Dependências (pacotes npm novos com justificativa)
   - Gotchas (problemas reais encontrados durante pesquisa)
   - Tasks (checklist `- [ ]` com os passos de implementação)
4. **Código production-ready** — blocos TypeScript completos e copiáveis, não pseudocódigo
5. **Rastreabilidade ao design** — cada campo/prop deve indicar de qual tela ou elemento vem
6. **Escopo explícito** — declarar o que **não** será feito

## Regras

- Escrever em português
- Named exports only (sem `export default`)
- Usar design tokens do projeto (`globals.css`), nunca hardcode de cores/spacing