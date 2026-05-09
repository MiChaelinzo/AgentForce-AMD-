import { Bot, GitBranch, LayoutDashboard, ListChecks, Cpu, ChevronRight, Zap } from 'lucide-react';

type Page = 'dashboard' | 'agents' | 'workflows' | 'tasks';

interface SidebarProps {
  current: Page;
  onChange: (page: Page) => void;
}

const nav = [
  { id: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agents' as Page, label: 'Agents', icon: Bot },
  { id: 'workflows' as Page, label: 'Workflows', icon: GitBranch },
  { id: 'tasks' as Page, label: 'Task Monitor', icon: ListChecks },
];

export default function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <aside className="w-60 min-h-screen bg-[#0b1120] border-r border-white/[0.05] flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#e8001d] flex items-center justify-center">
            <Cpu size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-none">AgentForge</div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">powered by AMD</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Navigation</div>
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              current === id
                ? 'nav-active'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border-l-2 border-transparent'
            }`}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1 text-left">{label}</span>
            {current === id && <ChevronRight size={12} className="text-blue-400" />}
          </button>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="rounded-xl bg-gradient-to-br from-[#e8001d]/10 to-blue-600/10 border border-white/[0.06] p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={12} className="text-[#e8001d]" />
            <span className="text-xs font-semibold text-white">AMD MI300X</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-relaxed">Running on AMD Instinct GPU</div>
          <div className="mt-2 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 running-dot" />
            <span className="text-[10px] text-green-400 font-medium">Connected</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
