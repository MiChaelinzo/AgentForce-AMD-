import { useEffect, useState } from 'react';
import { supabase, Agent, Task, Workflow } from '../lib/supabase';
import { generateReport } from '../lib/export';
import { Bot, GitBranch, ListChecks, TrendingUp, Clock, CheckCircle2, AlertCircle, Activity, Cpu, Download } from 'lucide-react';

function StatCard({ label, value, sub, icon: Icon, color, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <div className="animate-slide-up rounded-2xl bg-[#111827] border border-white/[0.06] p-5 card-lift" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <TrendingUp size={14} className="text-green-400 mt-1" />
      </div>
      <div className="text-2xl font-bold text-white tabular-nums">{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: ag }, { data: tk }, { data: wf }] = await Promise.all([
        supabase.from('agents').select('*'),
        supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('workflows').select('*'),
      ]);
      setAgents(ag ?? []);
      setTasks(tk ?? []);
      setWorkflows(wf ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const runningAgents = agents.filter(a => a.status === 'running').length;
  const totalTasks = agents.reduce((s, a) => s + a.tasks_completed, 0);
  const avgSuccess = agents.length ? (agents.reduce((s, a) => s + Number(a.success_rate), 0) / agents.length).toFixed(1) : '0';

  if (loading) {
    return (
      <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Performance Overview</h2>
        <button onClick={() => generateReport(agents, tasks, workflows)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-700 transition-colors">
          <Download size={12} /> Export Report
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Agents" value={agents.length} sub={`${runningAgents} running`} icon={Bot} color="bg-blue-600" delay={0} />
        <StatCard label="Active Workflows" value="4" sub="of 4 total" icon={GitBranch} color="bg-cyan-600" delay={60} />
        <StatCard label="Tasks Completed" value={totalTasks.toLocaleString()} sub="all-time" icon={ListChecks} color="bg-emerald-600" delay={120} />
        <StatCard label="Avg Success Rate" value={`${avgSuccess}%`} sub="across all agents" icon={TrendingUp} color="bg-[#e8001d]" delay={180} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#111827] border border-white/[0.06] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot size={15} className="text-blue-400" />
              <span className="text-sm font-semibold text-white">Agent Fleet</span>
            </div>
            <span className="text-[10px] text-slate-500">{agents.length}</span>
          </div>
          <div className="space-y-2">
            {agents.slice(0, 5).map(agent => (
              <div key={agent.id} className="flex items-center gap-3 py-1.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${agent.status === 'running' ? 'bg-green-400' : 'bg-slate-600'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-300 truncate">{agent.name}</div>
                  <div className="text-[10px] text-slate-600 font-mono">{agent.model}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#111827] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={15} className="text-cyan-400" />
            <span className="text-sm font-semibold text-white">GPU Status</span>
          </div>
          <div className="space-y-3 text-[11px]">
            {[
              { label: 'GPU Util', value: '72%' },
              { label: 'VRAM', value: '58%' },
              { label: 'Temp', value: '64°C' },
              { label: 'Power', value: '340W' },
            ].map(m => (
              <div key={m.label} className="flex justify-between">
                <span className="text-slate-400">{m.label}</span>
                <span className="text-slate-200 font-mono">{m.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-[#111827] border border-white/[0.06] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Recent Tasks</span>
          </div>
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-600">No tasks yet</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.slice(0, 4).map(task => {
                const StatusIcon = task.status === 'completed' ? CheckCircle2 : task.status === 'failed' ? AlertCircle : Activity;
                const colors = { completed: 'text-green-400', running: 'text-blue-400', pending: 'text-slate-400', failed: 'text-red-400' };
                return (
                  <div key={task.id} className="flex items-center gap-2">
                    <StatusIcon size={12} className={colors[task.status] || 'text-slate-400'} />
                    <span className="text-[10px] text-slate-300 truncate">{task.title}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
