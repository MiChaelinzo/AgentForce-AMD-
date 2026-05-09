import { useEffect, useState } from 'react';
import { supabase, Task } from '../lib/supabase';
import { executeAgentTask } from '../lib/agent-executor';
import { ListChecks, Plus, CheckCircle2, AlertCircle, Clock, Activity, Search, Trash2, RefreshCw, X } from 'lucide-react';

function NewTaskModal({ agents, onSave, onClose }: {
  agents: any[];
  onSave: (title: string, agentId: string) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [agentId, setAgentId] = useState(agents[0]?.id ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(title, agentId);
    setSaving(false);
    setTitle('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#111827] rounded-2xl border border-white/[0.08] animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Plus size={15} className="text-blue-400" />
            <span className="font-semibold text-white text-sm">New Task</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Task Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize quarterly report..." className="w-full bg-slate-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Assign to Agent</label>
            <select value={agentId} onChange={e => setAgentId(e.target.value)} className="w-full bg-slate-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
              {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Submitting...' : 'Submit Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState('');

  async function load() {
    const [{ data: tk }, { data: ag }] = await Promise.all([
      supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('agents').select('*'),
    ]);
    setTasks(tk ?? []);
    setAgents(ag ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const sub = supabase.channel('tasks-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => load()).subscribe();
    return () => { sub.unsubscribe(); };
  }, []);

  async function handleNewTask(title: string, agentId: string) {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;

    setModal(false);
    await executeAgentTask(agent, title, { user_input: title });
    load();
  }

  async function handleDelete(id: string) {
    await supabase.from('tasks').delete().eq('id', id);
    load();
  }

  const filtered = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
  const counts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    running: tasks.filter(t => t.status === 'running').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    failed: tasks.filter(t => t.status === 'failed').length,
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className="rounded-xl bg-[#111827] border border-white/[0.06] p-3 cursor-pointer hover:border-white/10 transition-colors">
            <div className="text-lg font-bold text-white tabular-nums">{count}</div>
            <div className="text-[10px] text-slate-500 capitalize">{status}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="w-full bg-[#111827] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40" />
        </div>
        <button onClick={() => load()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#111827] border border-white/[0.06] text-slate-400 hover:text-slate-200">
          <RefreshCw size={13} />
        </button>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">
          <Plus size={14} /> New Task
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16">
          <ListChecks size={36} className="text-slate-700 mb-3" />
          <p className="text-slate-400 text-sm">No tasks yet</p>
          <button onClick={() => setModal(true)} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-sm hover:bg-blue-600/20">
            <Plus size={14} /> Submit first task
          </button>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#111827] border border-white/[0.06] p-4">
          <div className="space-y-1">
            {filtered.map(task => {
              const StatusIcon = task.status === 'completed' ? CheckCircle2 : task.status === 'failed' ? AlertCircle : Activity;
              const colors = { completed: 'text-green-400', running: 'text-blue-400', pending: 'text-slate-400', failed: 'text-red-400' };
              const since = (() => {
                const diff = Date.now() - new Date(task.created_at).getTime();
                if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
                if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                return `${Math.floor(diff / 3600000)}h ago`;
              })();

              return (
                <div key={task.id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0 group hover:bg-white/[0.01]">
                  <StatusIcon size={14} className={`${colors[task.status]} ${task.status === 'running' ? 'running-dot' : ''}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-200 truncate">{task.title}</div>
                  </div>
                  <span className={`text-[10px] font-medium uppercase ${colors[task.status]}`}>{task.status}</span>
                  {task.duration_ms && <span className="text-[10px] font-mono text-slate-500 w-12 text-right">{task.duration_ms}ms</span>}
                  <span className="text-[10px] text-slate-600 w-14 text-right">{since}</span>
                  <button onClick={() => handleDelete(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {modal && <NewTaskModal agents={agents} onSave={handleNewTask} onClose={() => setModal(false)} />}
    </div>
  );
}
