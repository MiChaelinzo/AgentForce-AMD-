import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { GitBranch, Plus, Play, Pause, Trash2, CreditCard as Edit3, Search, Activity, CheckCircle2, Clock } from 'lucide-react';

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('workflows').select('*').order('created_at', { ascending: false });
      setWorkflows(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = workflows.filter(w => w.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search workflows..."
            className="w-full bg-[#111827] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">
          <Plus size={14} /> New Workflow
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(wf => (
            <div key={wf.id} className="rounded-2xl bg-[#111827] border border-white/[0.06] p-5 card-lift">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center">
                  <GitBranch size={17} className="text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-white">{wf.name}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{wf.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-3 text-[10px]">
                <div><Activity size={11} className="text-slate-500 mx-auto mb-1" /><div className="text-white font-mono">{wf.runs_total}</div><div className="text-slate-600">Runs</div></div>
                <div><CheckCircle2 size={11} className="text-slate-500 mx-auto mb-1" /><div className="text-white font-mono">{wf.runs_success}</div><div className="text-slate-600">Success</div></div>
                <div><Clock size={11} className="text-slate-500 mx-auto mb-1" /><div className="text-white font-mono">{(wf.avg_duration_ms / 1000).toFixed(1)}s</div><div className="text-slate-600">Time</div></div>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium bg-blue-600/10 text-blue-400 hover:bg-blue-600/20">
                  <Play size={12} /> Run
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
                  <Edit3 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
