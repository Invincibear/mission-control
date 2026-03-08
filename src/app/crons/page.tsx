'use client';

import { useEffect, useState } from 'react';
import { Clock, Play, Pause, RefreshCw } from 'lucide-react';
import { SkeletonRow } from '@/components/skeleton';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours}h`;
  return `in ${Math.floor(hours / 24)}d`;
}

export default function CronsPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/crons')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setCrons)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Cron Jobs</h1>
        <p className="text-text-secondary text-sm mt-1">Scheduled tasks and automation</p>
      </div>

      <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Schedule</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Last Run</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Next Run</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <tr><td colSpan={5}><SkeletonRow /></td></tr>
                <tr><td colSpan={5}><SkeletonRow /></td></tr>
                <tr><td colSpan={5}><SkeletonRow /></td></tr>
                <tr><td colSpan={5}><SkeletonRow /></td></tr>
              </>
            ) : (
              crons.map((cron) => (
                <tr key={cron.id} className="border-b border-border last:border-b-0 hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="text-sm font-medium">{cron.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono bg-bg-tertiary px-2 py-1 rounded text-text-secondary">
                      {cron.schedule}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 text-text-muted" />
                      <span className="text-sm text-text-secondary">{timeAgo(cron.lastRun)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-text-secondary">{timeUntil(cron.nextRun)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {cron.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                        <Play className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
                        <Pause className="w-3 h-3" />
                        Paused
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
