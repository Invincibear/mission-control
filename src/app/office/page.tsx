'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Building2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/skeleton';

const OfficeScene = dynamic(() => import('@/components/office/scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="flex flex-col items-center gap-3 text-text-muted">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm">Loading 3D scene...</span>
      </div>
    </div>
  ),
});

interface Agent {
  id: string;
  name: string;
}

const AGENT_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444',
  '#3b82f6', '#a855f7', '#ec4899', '#14b8a6',
];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => r.json())
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const agentData = agents.map((agent, i) => ({
    id: agent.id,
    name: agent.name,
    color: AGENT_COLORS[i % AGENT_COLORS.length],
    isWorking: Math.random() > 0.4,
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 pb-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Building2 className="w-6 h-6 text-accent" />
            Virtual Office
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            {loading ? (
              <Skeleton className="h-3 w-56 inline-block" />
            ) : (
              <>{agents.length} agents in the office — drag to orbit, scroll to zoom</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {loading ? (
            <>
              <Skeleton className="h-7 w-24 rounded" />
              <Skeleton className="h-7 w-24 rounded" />
            </>
          ) : (
            agentData.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-1.5 px-2 py-1 bg-bg-secondary border border-border rounded text-xs"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: agent.color }}
                />
                <span className="font-mono text-text-secondary">{agent.name}</span>
                {agent.isWorking && (
                  <span className="text-[9px] text-success uppercase tracking-wider">working</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-bg-primary">
            <div className="flex flex-col items-center gap-3 text-text-muted">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Loading agents...</span>
            </div>
          </div>
        ) : (
          <OfficeScene agents={agentData} />
        )}
      </div>
    </div>
  );
}
