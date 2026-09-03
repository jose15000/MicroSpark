export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col justify-between p-8 sm:p-16">
      <header className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-orange-500 rounded-sm" />
          <span className="font-mono text-sm tracking-wider uppercase font-semibold text-zinc-300">
            MicroSpark // Anti-AI Engine
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
          v0.1.0-alpha
        </span>
      </header>

      <main className="my-auto max-w-4xl py-12">
        <div className="inline-block mb-4 px-3 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 font-mono text-xs uppercase tracking-widest">
          DevTool para IAs Generativas
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-50 mb-6 leading-tight">
          Front-ends autênticos. <br />
          <span className="text-zinc-500">Sem cara de template genérico de IA.</span>
        </h1>

        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          O MicroSpark fornece regras, componentes e restrições de design para que agentes e LLMs gerem interfaces com personalidade, tipografia expressiva e alta fidelidade visual.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
            <h3 className="font-mono text-sm font-semibold text-zinc-200 mb-2">01. Restrições Clichês</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Bloqueia automaticamente gradients roxos-neon genéricos e cartões repetitivos padrão SaaS.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
            <h3 className="font-mono text-sm font-semibold text-zinc-200 mb-2">02. Tokens de Personalidade</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Sistemas de layout e regras visuais com ritmo editorial, suporte a grid autêntico e tipografia apurada.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
            <h3 className="font-mono text-sm font-semibold text-zinc-200 mb-2">03. Context Engine</h3>
            <p className="text-xs text-zinc-400 leading-normal">
              Otimizado para injeção de contexto em agentes de código (Antigravity, Cursor, Copilot).
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-zinc-500 font-mono gap-4">
        <div>MicroSpark Anti-AI Front-End Engine</div>
        <div>Pronto para construção da nova arquitetura.</div>
      </footer>
    </div>
  );
}
