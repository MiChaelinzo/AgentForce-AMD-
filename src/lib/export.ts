import { Agent, Task, Workflow } from './supabase';

export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(h => {
          const val = row[h];
          if (typeof val === 'object') return JSON.stringify(val);
          if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
          return val ?? '';
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: any[], filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateReport(agents: Agent[], tasks: Task[], workflows: Workflow[]) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const successRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : '0.00';

  const avgResponseMs = agents.length > 0
    ? (agents.reduce((s, a) => s + a.avg_response_ms, 0) / agents.length).toFixed(0)
    : '0';

  const report = `
# AgentForge Report
Generated: ${new Date().toISOString()}

## Summary
- Total Agents: ${agents.length}
- Total Workflows: ${workflows.length}
- Total Tasks: ${totalTasks}
- Completed: ${completedTasks}
- Failed: ${failedTasks}
- Success Rate: ${successRate}%
- Avg Response Time: ${avgResponseMs}ms

## Agent Performance
${agents.map(a => `- ${a.name} (${a.model}): ${a.tasks_completed} tasks, ${Number(a.success_rate).toFixed(1)}% success`).join('\n')}

## Workflow Status
${workflows.map(w => `- ${w.name}: ${w.status}, ${w.runs_success}/${w.runs_total} successful runs`).join('\n')}

## Recent Tasks (Last 10)
${tasks.slice(0, 10).map(t => `- ${t.title}: ${t.status} (${t.duration_ms}ms)`).join('\n')}
  `.trim();

  const blob = new Blob([report], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `agentforge-report-${Date.now()}.md`;
  a.click();
  URL.revokeObjectURL(url);
}
