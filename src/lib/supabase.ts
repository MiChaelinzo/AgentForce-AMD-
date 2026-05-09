import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Agent = {
  id: string;
  name: string;
  description: string;
  model: string;
  system_prompt: string;
  capabilities: string[];
  status: 'idle' | 'running' | 'error';
  tasks_completed: number;
  avg_response_ms: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused';
  trigger_type: 'manual' | 'webhook' | 'scheduled';
  runs_total: number;
  runs_success: number;
  avg_duration_ms: number;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  agent_id: string;
  workflow_run_id: string | null;
  step_id: string | null;
  title: string;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
};
