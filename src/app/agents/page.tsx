'use client';

import { useEffect, useState } from 'react';
import { Bot, Cpu, Clock, FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/skeleton';

interface Agent {
  id: string;
  name: string;
  workspace: string;
  model: { primary: string; fallbacks?: string[] };
  heartbeat?: { every: string };
}

function AgentCardSkeleton() {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

const agentColors = ['bg-accent', 'bg-success', 'bg-warning', 'bg-error', 'bg-info'];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [memoryFiles, setMemoryFiles] = useState<Record<string, string[]>>({});

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

  const toggleExpand = async (agentId: string) => {
    if (expanded === agentId) {
      setExpanded(null);
      return;
    }
    setExpanded(agentId);

    if (!memoryFiles[agentId]) {
      try {
        const res = await fetch('/api/memory');
        const sources = await res.json();
        const source = sources.find((s: { agentId: string }) => s.agentId === agentId);
        if (source) {
          const files = flattenFiles(source.files);
          setMemoryFiles((prev) => ({ ...prev, [agentId]: files }));
        }
      } catch {
        // ignore
      }
    }
  };

  function flattenFiles(files: { name: string; isDirectory: boolean; children?: typeof files }[]): string[] {
    const result: string[] = [];
    for (const f of files) {
      if (f.isDirectory && f.children) {
        result.push(...flattenFiles(f.children));
      } else {
        result.push(f.name);
      }
    }
    return result;
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Agents</h1>
        <p className="text-text-secondary text-sm mt-1">Registered AI agents and their configurations</p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <>
            <AgentCardSkeleton />
            <AgentCardSkeleton />
            <AgentCardSkeleton />
          </>
        ) : (
          agents.map((agent, i) => (
            <div key={agent.id} className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleExpand(agent.id)}
                aria-expanded={expanded === agent.id}
                aria-label={`${expanded === agent.id ? 'Collapse' : 'Expand'} ${agent.name} details`}
                className="w-full p-4 flex items-center gap-4 hover:bg-bg-hover transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-lg ${agentColors[i % agentColors.length]} flex items-center justify-center`}>
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{agent.name}</h3>
                    <span className="text-xs font-mono text-text-muted bg-bg-tertiary px-2 py-0.5 rounded">
                      {agent.id}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary truncate">{agent.workspace}</p>
                </div>
                <div className="flex items-center gap-4 text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono">{agent.model.primary.split('/').pop()}</span>
                  </div>
                  {agent.heartbeat && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-mono">{agent.heartbeat.every}</span>
                    </div>
                  )}
                  {expanded === agent.id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>

              {expanded === agent.id && (
                <div className="border-t border-border p-4 bg-bg-primary/50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-xs text-text-muted uppercase tracking-wide">Model</span>
                      <p className="text-sm font-mono mt-1">{agent.model.primary}</p>
                      {agent.model.fallbacks && agent.model.fallbacks.length > 0 && (
                        <p className="text-xs text-text-muted mt-0.5">
                          Fallbacks: {agent.model.fallbacks.join(', ')}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-text-muted uppercase tracking-wide">Workspace</span>
                      <p className="text-sm font-mono mt-1">{agent.workspace}</p>
                    </div>
                    {agent.heartbeat && (
                      <div>
                        <span className="text-xs text-text-muted uppercase tracking-wide">Heartbeat</span>
                        <p className="text-sm font-mono mt-1">Every {agent.heartbeat.every}</p>
                      </div>
                    )}
                  </div>

                  {memoryFiles[agent.id] ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <FolderOpen className="w-3.5 h-3.5 text-text-muted" />
                        <span className="text-xs text-text-muted uppercase tracking-wide">
                          Memory Files ({memoryFiles[agent.id].length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {memoryFiles[agent.id].slice(0, 20).map((file) => (
                          <span
                            key={file}
                            className="text-xs bg-bg-tertiary px-2 py-1 rounded font-mono text-text-secondary"
                          >
                            {file}
                          </span>
                        ))}
                        {memoryFiles[agent.id].length > 20 && (
                          <span className="text-xs text-text-muted px-2 py-1">
                            +{memoryFiles[agent.id].length - 20} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-24" />
                      <div className="flex flex-wrap gap-1.5">
                        {[...Array(6)].map((_, i) => (
                          <Skeleton key={i} className="h-6 w-24 rounded" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
