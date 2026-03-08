'use client';

import { useEffect, useState, useRef } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  isWorking: boolean;
  currentTask?: string;
}

export function useAgentStatus() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/agents/status?stream=true');
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatuses(data);
      } catch {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // Reconnect after 5 seconds on error
      es.close();
      setTimeout(() => {
        const newEs = new EventSource('/api/agents/status?stream=true');
        eventSourceRef.current = newEs;
        newEs.onmessage = es.onmessage;
        newEs.onerror = es.onerror;
      }, 5000);
    };

    return () => {
      es.close();
    };
  }, []);

  return statuses;
}
