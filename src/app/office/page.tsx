'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Building2, Loader2 } from 'lucide-react';

const OfficeScene = dynamic(() => import('@/components/office/scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bg-primary">
      <div className="flex items-center gap-3 text-text-muted">
        <Loader2 className="w-5 h-5 animate-spin" />
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
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
];

export default function OfficePage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/agents')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setAgents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading agents...</span>
        </div>
      </div>
    );
  }

  const agentData = agents.map((agent, i) => ({
    id: agent.id,
    name: agent.name,
    color: AGENT_COLORS[i % AGENT_COLORS.length],
    isWorking: Math.random() > 0.4, // Random working state for now
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
            {agents.length} agents in the office — drag to orbit, scroll to zoom
          </p>
        </div>
        <div className="flex gap-2">
          {agentData.map((agent) => (
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
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <OfficeScene agents={agentData} />
      </div>
    </div>
  );
}
