'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  KanbanSquare,
  Brain,
  Clock,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Skeleton, SkeletonCard } from '@/components/skeleton';

interface OverviewData {
  agentCount: number;
  projectCount: number;
  memoryFileCount: number;
  activeTasks: number;
  projectsByStatus: Record<string, number>;
  recentProjects: {
    id: string;
    title: string;
    status: string;
    updated_at: string;
  }[];
  agents: { id: string; name: string }[];
  cronsSummary: { total: number; active: number; paused: number };
}

const statusColors: Record<string, string> = {
  concept: 'bg-info/20 text-info',
  todo: 'bg-warning/20 text-warning',
  active: 'bg-accent/20 text-accent',
  'in-review': 'bg-purple-500/20 text-purple-400',
  done: 'bg-success/20 text-success',
};

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 hover:border-border-light transition-colors">
      <div className="flex items-center justify-between mb-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className="text-xs text-text-muted font-mono uppercase">{label}</span>
      </div>
      <div className="text-3xl font-semibold font-mono">{value}</div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-bg-secondary border border-border rounded-lg p-5">
          <Skeleton className="h-4 w-24 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full rounded" />
            <Skeleton className="h-12 w-full rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/overview')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const stats = data
    ? [
        { label: 'Agents', value: data.agentCount, icon: Bot, color: 'text-accent' },
        { label: 'Projects', value: data.projectCount, icon: KanbanSquare, color: 'text-warning' },
        { label: 'Active Tasks', value: data.activeTasks, icon: Activity, color: 'text-success' },
        { label: 'Memory Files', value: data.memoryFileCount, icon: Brain, color: 'text-info' },
      ]
    : [];

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-text-secondary text-sm mt-1">System status and recent activity</p>
      </div>

      {error ? (
        <div className="text-error text-sm">Failed to load overview data</div>
      ) : loading ? (
        <>
          <StatsSkeleton />
          <GridSkeleton />
        </>
      ) : data ? (
        <>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-medium">Cron Jobs</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-bg-tertiary rounded">
                  <div className="text-xl font-mono font-semibold">{data.cronsSummary.total}</div>
                  <div className="text-xs text-text-muted mt-1">Total</div>
                </div>
                <div className="text-center p-3 bg-bg-tertiary rounded">
                  <div className="text-xl font-mono font-semibold text-success">{data.cronsSummary.active}</div>
                  <div className="text-xs text-text-muted mt-1">Active</div>
                </div>
                <div className="text-center p-3 bg-bg-tertiary rounded">
                  <div className="text-xl font-mono font-semibold text-warning">{data.cronsSummary.paused}</div>
                  <div className="text-xs text-text-muted mt-1">Paused</div>
                </div>
              </div>
            </div>

            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <KanbanSquare className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-medium">Projects by Status</h2>
              </div>
              {Object.keys(data.projectsByStatus).length === 0 ? (
                <p className="text-text-muted text-sm">No projects yet</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.projectsByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          statusColors[status] || 'bg-bg-tertiary text-text-secondary'
                        }`}
                      >
                        {status}
                      </span>
                      <span className="font-mono text-sm">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-medium">Agents</h2>
              </div>
              <div className="space-y-2">
                {data.agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center gap-3 p-2 bg-bg-tertiary rounded"
                  >
                    <div className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-sm font-mono">{agent.name}</span>
                    <span className="text-xs text-text-muted ml-auto">{agent.id}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-secondary border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-text-secondary" />
                <h2 className="text-sm font-medium">Recent Activity</h2>
              </div>
              {data.recentProjects.length === 0 ? (
                <p className="text-text-muted text-sm">No recent activity</p>
              ) : (
                <div className="space-y-2">
                  {data.recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-2 p-2 bg-bg-tertiary rounded"
                    >
                      <ArrowRight className="w-3 h-3 text-text-muted" />
                      <span className="text-sm truncate">{project.title}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded capitalize ml-auto ${
                          statusColors[project.status] || 'bg-bg-tertiary'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
