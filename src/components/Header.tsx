import { Bell, Search, Settings } from 'lucide-react';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your AI agent platform' },
  agents: { title: 'Agents', subtitle: 'Manage and deploy AI agents' },
  workflows: { title: 'Workflows', subtitle: 'Multi-agent orchestration pipelines' },
  tasks: { title: 'Task Monitor', subtitle: 'Real-time task execution feed' },
};

export default function Header({ page }: { page: string }) {
  const info = PAGE_TITLES[page] ?? PAGE_TITLES.dashboard;

  return (
    <header className="h-14 border-b border-white/[0.05] bg-[#0b1120]/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
      <div>
        <h1 className="text-sm font-semibold text-white leading-none">{info.title}</h1>
        <p className="text-[11px] text-slate-500 mt-0.5">{info.subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors">
          <Search size={15} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#e8001d]" />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors">
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
