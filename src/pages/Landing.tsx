import { Cpu, Bot, GitBranch, ListChecks, Zap, ArrowRight, BarChart2, Globe } from 'lucide-react';

export default function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-[#080c18] grid-bg overflow-hidden">
      <nav className="border-b border-white/[0.04] backdrop-blur-md bg-[#080c18]/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e8001d] flex items-center justify-center">
              <Cpu size={15} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">AgentForge</span>
          </div>
          <button onClick={onEnter} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all">
            Launch App <ArrowRight size={12} />
          </button>
        </div>
      </nav>

      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e8001d]/10 border border-[#e8001d]/20 text-[11px] text-[#e8001d] font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e8001d] running-dot" />
            AMD Developer Hackathon 2025 — Track 1: AI Agents
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
            Build agentic AI
            <br />
            <span className="gradient-text">at GPU speed</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            AgentForge is a full-stack multi-agent orchestration platform running on AMD Instinct MI300X. Deploy, chain, and monitor LLM agents with real-time observability.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={onEnter} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all">
              Open Dashboard <ArrowRight size={15} />
            </button>
            <a href="https://developer.amd.com/developer-cloud/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.08] text-slate-300 text-sm font-medium">
              AMD Dev Cloud
            </a>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto rounded-2xl bg-[#0b1120] border border-white/[0.08] overflow-hidden shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-[#0d1525]">
            <div className="w-3 h-3 rounded-full bg-[#e8001d]/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-3 text-[11px] text-slate-600 font-mono">agent-forge</span>
          </div>
          <div className="p-5 font-mono text-[12px] space-y-1.5 text-slate-300">
            {[
              '$ agentforge init --model llama3.2 --gpu amd-mi300x',
              '> Loading model on AMD Instinct MI300X...',
              '> [OK] ResearchAgent ready — 1.3 PFLOPS',
              '$ agentforge run "Analyze GPU market trends"',
              '> Step 1/3: Research... (842ms)',
              '> Step 2/3: Analyze... (612ms)',
              '> Step 3/3: Report... (1.1s)',
              '[DONE] Workflow completed in 2.55s',
            ].map((line, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                {line}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/[0.04]">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Everything you need</h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">A complete platform for deploying and monitoring AI agents on AMD hardware.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Bot, title: 'Agent Management', desc: 'Deploy agents powered by Llama, DeepSeek, Mistral, and Qwen models.', color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { icon: GitBranch, title: 'Workflow Orchestration', desc: 'Chain agents together in pipelines with structured data flow.', color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
            { icon: ListChecks, title: 'Task Monitor', desc: 'Real-time task execution with full observability and error tracking.', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          ].map(f => (
            <div key={f.title} className="rounded-2xl bg-[#111827] border border-white/[0.05] p-5 card-lift">
              <div className={`w-9 h-9 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                <f.icon size={17} className={f.color} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-xs text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="rounded-3xl bg-gradient-to-br from-blue-600/10 via-[#111827] to-[#e8001d]/5 border border-white/[0.06] p-10 text-center">
          <Globe size={32} className="text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Ready to build?</h2>
          <button onClick={onEnter} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold mx-auto">
            Open Dashboard <ArrowRight size={15} />
          </button>
        </div>
      </section>

      <footer className="border-t border-white/[0.04] py-6 text-center">
        <p className="text-[11px] text-slate-700">AgentForge — AMD Developer Hackathon 2025</p>
      </footer>
    </div>
  );
}
