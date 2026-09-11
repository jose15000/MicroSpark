# Microspark Aesthetic Manifesto // Anti-AI Design System

O Microspark foi concebido para erradicar o "AI visual slop" (estética clichê e pasteurizada gerada por LLMs) e restaurar o artesanato de front-end com princípios de design editorial, brutalismo industrial e interatividade física fundamentada em WebGL.

---

## 1. Princípios Fundamentais de Design

### 1.1 Assimetria Intencional (Adeus aos 3 Cards Iguais e Heros Centralizados)
- **Problema:** IAs quase sempre geram seções com 3 cards idênticos lado a lado (`grid-cols-3`), heros 100% centralizados sem contrapeso ou splits binários 50/50 com mockup estático.
- **Solução:** Introduza pontos focais claros e grids assimétricos (ex: um item largo ocupando 2 colunas com telemetria/dados ao vivo, acompanhado de dois cartões técnicos compactos). Quebre a centralização monótona com ancoragem lateral ou estágios WebGL assimétricos.

### 1.2 Tipografia Monumental e Editorial
- **Problema:** Títulos tímidos (`text-4xl` ou `text-5xl`), linear text-fades (`bg-clip-text text-transparent from-white to-zinc-500`) e métricas arbitrárias de IA nos títulos ("10x", "99%", "em minutos", "supercharge").
- **Solução:** O título primário (`h1`) deve comandar a página com escala monumental (`text-7xl`, `text-8xl`, `text-9xl` ou unidades responsivas `text-[clamp(...)]`). Combine fontes mono para dados técnicos/metadados com tipografia sem serifa geométrica sólida ou serifas de alto contraste editorial. Use redação técnica precisa e problemas reais de engenharia.

### 1.3 Iluminação Física & Shaders vs. Blur-Blobs e Glassmorphism Barrento
- **Problema:** Círculos roxos com desfoque extremo (`absolute rounded-full blur-3xl bg-purple-500/20`), glassmorphism lamacento repetido em todos os cards (`backdrop-blur-md bg-white/5 border-white/10`) e neons artificiais sem física.
- **Solução:** Rejeite os "blur blobs" e neons falsos. Utilize shaders WebGL em canvas dedicados, granulação orgânica de ruído SVG (`feTurbulence`), iluminação pontual arquitetural com atenuação física ou materiais opacos de alto contraste.

### 1.4 Paleta Cromática e Contraste em Dark Mode
- **Problema:** Gradientes roxo/índigo/rosa (`from-purple-500 to-indigo-500`), divisores de 1px com gradiente transparente (`bg-gradient-to-r from-transparent via-zinc-700 to-transparent`) e sombras difusas pesadas (`shadow-2xl`) que deixam o fundo escuro turvo e desbotado.
- **Solução:** Use pretos e cinzas profundos de verdade (`#09090b`, `#000000`, `zinc-950`). Defina profundidade não com sombras difusas, mas com bordas de 1px translúcidas e precisas (`border border-white/10` ou `border-zinc-800`). Acentue com tons quentes de engenharia (âmbar, ferrugem, fósforo verde ou cromo).

### 1.5 Fim dos "Announcement Pills", Caixas de Ícone e CTAs Glued
- **Problema:** Badges arredondados `rounded-full px-3 py-1 text-xs` tipo "v2.0 is now live ✨" imediatamente acima do `h1`, caixinhas com cantos arredondados contendo só um ícone SVG (`rounded-lg bg-*/10 p-3`), inputs de newsletter com botão colado no mesmo wrapper, e tabelas de preço de 3 colunas com a do meio inflada.
- **Solução:** Elimine o anúncio clichê ou ancore metadados técnicos de forma autêntica usando estilo monospaçado industrial (ex: `[01 // SYSTEM STATUS: ACTIVE]`). Integre ícones na tipografia ou use notações mono. Use formulários com divisões arquiteturais claras.

### 1.6 Transições com Curvas Autorais
- **Problema:** A dependência cega de `transition-all duration-300 ease-in-out`.
- **Solução:** Especifique as propriedades exatas que animam (`transition-colors`, `transition-transform`) e utilize curvas cúbicas mais agressivas e responsivas (ex: `cubic-bezier(0.16, 1, 0.3, 1)`).

---

## 2. Catálogo de Vícios & Regras Ativas do Linter

| Regra do Linter | Vício / Anti-Padrão AI Detectado |
| --- | --- |
| `anti-ai/banned-centered-hero` | Hero 100% centralizado em coluna única sem assimetria |
| `anti-ai/hero-split-cliche` | Split mecânico 50/50 (texto de um lado, mockup isolado do outro) |
| `anti-ai/lazy-symmetry` | Grid de 3 colunas com cartões e classes 100% idênticas |
| `anti-ai/strict-no-uniform-steps` | Sequência de passos ("Passo 1, 2, 3") uniforme e sem fluxo cinemático |
| `anti-ai/repetitive-card-pattern` | Fórmula repetitiva [Ícone] -> [H3] -> [Parágrafo] |
| `anti-ai/banned-three-tier-pricing` | Tabela tríplice de preços com destaque clichê na coluna do meio |
| `anti-ai/banned-card-testimonials` | Grid de 3 depoimentos com 5 estrelas amarelas e avatar circular |
| `anti-ai/default-accordion-stack` | Acordeão de FAQ vertical isolado e colado de bibliotecas |
| `anti-ai/generic-purple-gradient` | Gradientes roxos/violetas/índigos/rosas |
| `anti-ai/lazy-blur-blob` | Círculos absolutos rounded-full com blur-3xl simulando luz |
| `anti-ai/fake-cyberpunk-neon` | Neons saturados (cyan/fuchsia/emerald) com shadow pontual |
| `anti-ai/muddy-shadows` | Sombras difusas pesadas (shadow-xl/2xl) em fundos escuros |
| `anti-ai/muddy-glassmorphism` | Backdrop-blur repetido com fundos lavados bg-white/5 |
| `anti-ai/sterile-canvas` | Fundo preto puro sólido sem ruído SVG, textura ou shader |
| `anti-ai/gradient-divider-line` | Linha divisória de 1px com gradiente desvanecendo nas pontas |
| `anti-ai/monumental-typography` | Títulos principais tímidos (menores que text-6xl/text-7xl) |
| `anti-ai/linear-fade-cliche` | Fade linear do branco ao cinza no texto do heading |
| `anti-ai/lazy-copy-metrics` | Métricas arbitrárias de prompt em headings ("10x", "99%", "em minutos") |
| `anti-ai/generic-hero-pill` | Badge pílula rounded-full colado imediatamente antes do H1 |
| `anti-ai/banned-icon-box` | Caixinhas rounded-lg p-3 bg-*/10 envolvendo ícones SVG soltos |
| `anti-ai/embedded-input-cta` | Campo de email colado ao botão de CTA no mesmo contêiner |
| `anti-ai/static-pill-tabs` | Agrupamento de botões rounded-full imitando abas sem estado |
| `anti-ai/lazy-transitions` | Animações genéricas transition-all duration-300 ease-in-out |
| `anti-ai/minimal-boilerplate-footer` | Rodapé raso de 1 linha com <= 3 links e baixa densidade |

---

## 3. Checklist de Validação Obrigatória

Antes de finalizar qualquer interface no ecossistema Microspark:
1. O elemento `h1` possui escala monumental (`text-7xl` ou superior)?
2. A macroestrutura do Hero possui assimetria ou contrapeso lateral?
3. Não há gradientes roxos/índigos, blur-blobs ou glassmorphism barrento?
4. O background possui textura tátil, ruído SVG ou canvas WebGL ativo?
5. As regras do `@microspark/linter` foram executadas sem violações?
