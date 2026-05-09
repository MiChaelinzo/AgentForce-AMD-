import { useEffect, useState, useRef } from 'react';
import { supabase, Agent } from '../lib/supabase';
import { executeAgentTask } from '../lib/agent-executor';
import { Bot, Plus, Play, Pause, Trash2, CreditCard as EditIcon, Search, X } from 'lucide-react';

const MODELS = ['llama3.2', 'deepseek-coder', 'qwen2.5', 'qwen-vl', 'mistral-7b', 'llama3.1-70b'];
const CAPABILITY_OPTIONS = [
  'web_search', 'summarization', 'extraction', 'code_generation', 'debugging',
  'rocm_optimization', 'data_analysis', 'statistics', 'charting',
];

function AgentModal({ initial, onSave, onClose }: {
  initial?: Agent;
  onSave: (d: Partial<Agent>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Partial<Agent>>({
    name: '', model: 'llama3.2', description: '', system_prompt: '', capabilities: [],
    ...initial,
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#111827] rounded-2xl border border-white/[0.08] shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <Bot size={16} className="text-blue-400" />
            <span className="font-semibold text-white text-sm">{initial?.id ? 'Edit Agent' : 'New Agent'}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ResearchAgent" className="w-full bg-slate-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Model</label>
              <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="w-full bg-slate-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50">
                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Description</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What this agent does" className="w-full bg-slate-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50" />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">System Prompt</label>
            <textarea rows={3} value={form.system_prompt} onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))} placeholder="You are an AI agent that..." className="w-full bg-slate-900 border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 resize-none font-mono" />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-2">Capabilities</label>
            <div className="flex flex-wrap gap-1.5">
              {CAPABILITY_OPTIONS.map(cap => {
                const active = form.capabilities?.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      capabilities: f.capabilities?.includes(cap)
                        ? f.capabilities.filter(c => c !== cap)
                        : [...(f.capabilities ?? []), cap],
                    }))}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all ${
                      active
                        ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                        : 'bg-slate-800 border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {cap}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-sm hover:bg-slate-700">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing?: Agent }>({ open: false });
  const [search, setSearch] = useState('');
  const [executing, setExecuting] = useState<string | null>(null);

  async function loadAgents() {
    const { data } = await supabase.from('agents').select('*').order('created_at', { ascending: false });
    setAgents(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadAgents();
    const sub = supabase.channel('agents-realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => loadAgents()).subscribe();
    return () => { sub.unsubscribe(); };
  }, []);

  async function handleSave(form: Partial<Agent>) {
    if (modal.editing?.id) {
      await supabase.from('agents').update({ ...form, updated_at: new Date().toISOString() }).eq('id', modal.editing.id);
    } else {
      await supabase.from('agents').insert([{ ...form, status: 'idle', tasks_completed: 0, avg_response_ms: 0, success_rate: 100 }]);
    }
    setModal({ open: false });
    loadAgents();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this agent?')) return;
    await supabase.from('agents').delete().eq('id', id);
    loadAgents();
  }

  async function handleExecute(agent: Agent) {
    setExecuting(agent.id);
    try {
      await executeAgentTask(agent, `Execute ${agent.name} task`, { timestamp: new Date().toISOString() });
      loadAgents();
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setExecuting(null);
    }
  }

  const filtered = agents.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.model.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agents..." className="w-full bg-[#111827] border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/40" />
        </div>
        <button onClick={() => setModal({ open: true })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium">
          <Plus size={14} /> New Agent
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-64 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(agent => (
            <div key={agent.id} className="rounded-2xl bg-[#111827] border border-white/[0.06] p-5 card-lift flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <Bot size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{agent.name}</div>
                    <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 mt-0.5">{agent.model}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{agent.description}</p>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] py-2 border-t border-white/[0.05]">
                <div><div className="text-white font-mono">{agent.tasks_completed}</div><div className="text-slate-600">Tasks</div></div>
                <div><div className="text-white font-mono">{agent.avg_response_ms}ms</div><div className="text-slate-600">Avg</div></div>
                <div><div className="text-white font-mono">{Number(agent.success_rate).toFixed(0)}%</div><div className="text-slate-600">Success</div></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleExecute(agent)} disabled={executing === agent.id} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 disabled:opacity-50">
                  <Play size={12} /> {executing === agent.id ? 'Running...' : 'Run'}
                </button>
                <button onClick={() => setModal({ open: true, editing: agent })} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
                  <EditIcon size={13} />
                </button>
                <button onClick={() => handleDelete(agent.id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-red-400/60 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && <AgentModal initial={modal.editing} onSave={handleSave} onClose={() => setModal({ open: false })} />}
    </div>
  );
}
