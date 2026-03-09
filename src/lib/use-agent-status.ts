'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface AgentStatus {
  id: string;
  name: string;
  isWorking: boolean;
  currentTask?: string;
}

export function useAgentStatus() {
  const [statuses, setStatuses] = useState<AgentStatus[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    // Clean up any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

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
      es.close();
      eventSourceRef.current = null;
      // Reconnect after 5 seconds
      reconnectTimerRef.current = setTimeout(connect, 5000);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [connect]);

  return statuses;
}
