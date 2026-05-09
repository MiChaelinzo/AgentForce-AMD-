/*
  # Add helper function for updating agent statistics

  Creates a database function to atomically increment agent task counts and update metrics.
  This ensures consistent stats across concurrent executions.
*/

CREATE OR REPLACE FUNCTION increment_agent_stats(
  p_agent_id uuid,
  p_duration_ms integer
)
RETURNS void AS $$
BEGIN
  UPDATE agents
  SET
    tasks_completed = tasks_completed + 1,
    avg_response_ms = ROUND((avg_response_ms + p_duration_ms) / 2),
    success_rate = ROUND(((tasks_completed * success_rate / 100) + 100) / (tasks_completed + 1) * 100, 2),
    updated_at = now()
  WHERE id = p_agent_id;
END;
$$ LANGUAGE plpgsql;
