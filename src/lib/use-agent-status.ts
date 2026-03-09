'use client';

import { useEffect, useState, useCallback } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  isWorking: boolean;
}

export function useAgentStatus(pollIntervalMs = 3000) {
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/agents/status');
      if (!res.ok) return;
      const data = await res.json();
      setStatuses(
        (data.agents || []).map((a: { id: string; name: string; status: string }) => ({
          id: a.id,
          name: a.name,
          isWorking: a.status === 'working',
        }))
      );
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchStatus, pollIntervalMs]);

  return statuses;
}
