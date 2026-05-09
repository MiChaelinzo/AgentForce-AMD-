import { supabase, Task, Agent } from './supabase';

export async function executeAgentTask(agent: Agent, title: string, inputData: Record<string, unknown>): Promise<Task> {
  // Create task record in pending state
  const { data: task, error: createError } = await supabase
    .from('tasks')
    .insert([{
      agent_id: agent.id,
      title,
      input_data: inputData,
      status: 'pending',
      created_at: new Date().toISOString(),
    }])
    .select()
    .maybeSingle();

  if (createError || !task) throw new Error('Failed to create task');

  // Update to running
  await supabase
    .from('tasks')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', task.id);

  try {
    // Call edge function for agent execution
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/execute-agent-task`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent.id,
        title,
        input_data: inputData,
        model: agent.model,
      }),
    });

    const result = await response.json();
    const now = new Date().toISOString();

    if (result.success) {
      // Update task as completed
      await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: now,
          duration_ms: result.duration_ms,
          output_data: result.output ?? {},
        })
        .eq('id', task.id);

      // Update agent stats
      await supabase.rpc('increment_agent_stats', {
        p_agent_id: agent.id,
        p_duration_ms: result.duration_ms,
      });
    } else {
      // Update task as failed
      await supabase
        .from('tasks')
        .update({
          status: 'failed',
          completed_at: now,
          duration_ms: result.duration_ms,
          error_message: result.error ?? 'Unknown error',
        })
        .eq('id', task.id);
    }

    // Fetch and return updated task
    const { data: updated } = await supabase
      .from('tasks')
      .select()
      .eq('id', task.id)
      .maybeSingle();

    return updated as Task;
  } catch (error) {
    const now = new Date().toISOString();
    await supabase
      .from('tasks')
      .update({
        status: 'failed',
        completed_at: now,
        error_message: `Execution error: ${String(error)}`,
      })
      .eq('id', task.id);

    throw error;
  }
}
