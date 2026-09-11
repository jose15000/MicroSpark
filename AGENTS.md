# AGENTS.md — Regras de Engenharia & Design do Microspark

Todo agente de IA (Claude, Windsurf, Cursor, Antigravity) que gerar ou editar código neste projeto **DEVE** seguir estritamente as diretrizes abaixo para evitar "AI Visual Slop" (vícios e clichês de templates gerados por IA).

---

## 1. Manifesto de Design Obrigatório

Consulte sempre o manifesto completo em [DESIGN.md](file:///home/jooj/Documentos/projects/MicroSpark/DESIGN.md).

### Regras Críticas de Geração de Código:

1. **Escala Tipográfica Monumental**:
   - O `h1` **NUNCA** pode ser tímido (`text-4xl` ou `text-5xl`). Use `text-7xl`, `text-8xl`, `text-9xl` ou `text-[clamp(...)]`.
   - **PROIBIDO**: Gradientes de texto do branco para cinza (`bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500`).
   - **PROIBIDO**: Métricas forçadas de IA em títulos ("10x", "99%", "em minutos", "supercharge your workflow"). Use linguagem técnica autêntica.

2. **Assimetria Estrutural no Hero & Grids**:
   - **PROIBIDO**: Heros 100% centralizados (`text-center` monótono alinhando badge + H1 + subtítulo + botão em 1 coluna).
   - **PROIBIDO**: Splits mecânicos 50/50 (coluna de texto de um lado, imagem/mockup estático isolado do outro). Introduza sobreposição, recortes e camadas.
   - **PROIBIDO**: Grids de 3 cards com classes 100% idênticas (`lazy-symmetry`). Destaque um item com `col-span-2`, dados ao vivo ou densidade distinta.
   - **PROIBIDO**: Repetição da fórmula `[Ícone SVG em caixinha] -> [H3] -> [Parágrafo de 2 linhas]`.

3. **Iluminação Física e Superfícies Autênticas**:
   - **PROIBIDO**: Círculos flutuantes com `rounded-full` e `blur-3xl` com gradiente roxo/índigo (`bg-purple-500/20`).
   - **PROIBIDO**: Gradientes roxo/índigo/rosa/ciano (`from-purple-500 to-indigo-500`).
   - **PROIBIDO**: Sombras lamacentas (`shadow-xl`, `shadow-2xl`) em fundos escuros. Use bordas nítidas de 1px com transparência (`border border-white/10`).
   - **PROIBIDO**: Glassmorphism barrento e indiscriminado (`backdrop-blur-md bg-white/5 border border-white/10`) aplicado em repetição.
   - **PROIBIDO**: Superfícies pretas puras sólidas sem textura de ruído SVG (`feTurbulence`), grain ou canvas WebGL ativo.

4. **Microdetalhes & Componentes**:
   - **PROIBIDO**: Badge em pílula (`rounded-full`) imediatamente acima do `h1` ("v2.0 is live ✨").
   - **PROIBIDO**: Caixinhas arredondadas (`rounded-lg bg-*/10 p-3`) envolvendo exclusivamente um ícone SVG.
   - **PROIBIDO**: Input de email com botão colado no mesmo invólucro no hero.
   - **PROIBIDO**: Tabela tríplice de preços com coluna central inflada ("Mais Popular").
   - **PROIBIDO**: 3 cards de depoimentos com 5 estrelas amarelas e avatar redondo.
   - **PROIBIDO**: Transições preguiçosas (`transition-all duration-300 ease-in-out`). Especifique propriedades e curvas cúbicas.

---

## 2. Validação Contínua com `@microspark/linter`

Antes de salvar alterações em componentes React/Next.js:
1. Sempre execute ou consulte o linter do Microspark via MCP (`audit_code` / `audit_file`).
2. Garanta zero violações de severidade `error`.
