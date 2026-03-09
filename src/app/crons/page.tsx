'use client';

import { useEffect, useState } from 'react';
import {
  Clock,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Timer,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { SkeletonRow } from '@/components/skeleton';

interface CronJob {
  id: string;
  name: string;
  agentId: string;
  enabled: boolean;
  schedule: string;
  scheduleKind: string;
  sessionTarget: string;
  payloadKind: string;
  payloadPreview: string;
  lastRun: string | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
  lastError: string | null;
  nextRun: string | null;
  consecutiveErrors: number;
  createdAt: string;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function timeUntil(dateStr: string | null): string {
  if (!dateStr) return '—';
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff < 0) return 'overdue';
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `in ${hours}h`;
  return `in ${Math.floor(hours / 24)}d`;
}

function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function StatusBadge({ status, enabled }: { status: string | null; enabled: boolean }) {
  if (!enabled) {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-bg-tertiary text-text-muted px-2 py-0.5 rounded-full">
        <Pause className="w-3 h-3" />
        Disabled
      </span>
    );
  }
  if (status === 'ok') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
        <CheckCircle className="w-3 h-3" />
        OK
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="inline-flex items-center gap-1 text-xs bg-error/20 text-error px-2 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />
        Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs bg-warning/20 text-warning px-2 py-0.5 rounded-full">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  );
}

export default function CronsPage() {
  const [crons, setCrons] = useState<CronJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const activeCrons = crons.filter((c) => c.enabled);
  const disabledCrons = crons.filter((c) => !c.enabled);

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Cron Jobs</h1>
        <p className="text-text-secondary text-sm mt-1">
          Scheduled tasks from <code className="text-xs bg-bg-tertiary px-1.5 py-0.5 rounded font-mono">~/.openclaw/cron/jobs.json</code>
        </p>
      </div>

      {!loading && (
        <div className="flex gap-3 mb-6">
          <div className="bg-bg-secondary border border-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-2xl font-mono font-semibold">{crons.length}</span>
            <span className="text-xs text-text-muted">Total</span>
          </div>
          <div className="bg-bg-secondary border border-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-2xl font-mono font-semibold text-success">{activeCrons.length}</span>
            <span className="text-xs text-text-muted">Active</span>
          </div>
          <div className="bg-bg-secondary border border-border rounded-lg px-4 py-2 flex items-center gap-2">
            <span className="text-2xl font-mono font-semibold text-text-muted">{disabledCrons.length}</span>
            <span className="text-xs text-text-muted">Disabled</span>
          </div>
          {crons.filter((c) => c.consecutiveErrors > 0).length > 0 && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-error" />
              <span className="text-sm text-error">
                {crons.filter((c) => c.consecutiveErrors > 0).length} with errors
              </span>
            </div>
          )}
        </div>
      )}

      {/* Active Jobs */}
      <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-success" />
            Active Jobs
          </h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide w-8" />
              <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Name</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Schedule</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Last Run</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Next Run</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <>
                <tr><td colSpan={6}><SkeletonRow /></td></tr>
                <tr><td colSpan={6}><SkeletonRow /></td></tr>
                <tr><td colSpan={6}><SkeletonRow /></td></tr>
              </>
            ) : activeCrons.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-text-muted text-sm">
                  No active cron jobs
                </td>
              </tr>
            ) : (
              activeCrons.map((cron) => (
                <CronRow
                  key={cron.id}
                  cron={cron}
                  expanded={expanded === cron.id}
                  onToggle={() => setExpanded(expanded === cron.id ? null : cron.id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Disabled Jobs */}
      {!loading && disabledCrons.length > 0 && (
        <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden opacity-70">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-medium flex items-center gap-2">
              <Pause className="w-3.5 h-3.5 text-text-muted" />
              Disabled Jobs ({disabledCrons.length})
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide w-8" />
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Schedule</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Last Run</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Next Run</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-text-muted uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {disabledCrons.map((cron) => (
                <CronRow
                  key={cron.id}
                  cron={cron}
                  expanded={expanded === cron.id}
                  onToggle={() => setExpanded(expanded === cron.id ? null : cron.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CronRow({
  cron,
  expanded,
  onToggle,
}: {
  cron: CronJob;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-border last:border-b-0 hover:bg-bg-hover transition-colors cursor-pointer"
      >
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{cron.name}</span>
            <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
              {cron.agentId}
            </span>
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
          <StatusBadge status={cron.lastStatus} enabled={cron.enabled} />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border last:border-b-0">
          <td colSpan={6} className="px-4 py-3 bg-bg-primary/50">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wide">Session Target</span>
                <p className="text-sm font-mono mt-0.5">{cron.sessionTarget}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wide">Payload Type</span>
                <p className="text-sm font-mono mt-0.5">{cron.payloadKind}</p>
              </div>
              <div>
                <span className="text-xs text-text-muted uppercase tracking-wide">Last Duration</span>
                <p className="text-sm font-mono mt-0.5 flex items-center gap-1">
                  <Timer className="w-3 h-3 text-text-muted" />
                  {formatDuration(cron.lastDurationMs)}
                </p>
              </div>
            </div>
            {cron.payloadPreview && (
              <div className="mb-3">
                <span className="text-xs text-text-muted uppercase tracking-wide">Payload Preview</span>
                <p className="text-xs text-text-secondary mt-1 bg-bg-tertiary rounded p-2 font-mono leading-relaxed">
                  {cron.payloadPreview}
                </p>
              </div>
            )}
            {cron.lastError && (
              <div className="bg-error/10 border border-error/20 rounded p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3 h-3 text-error" />
                  <span className="text-xs text-error font-medium">Last Error</span>
                </div>
                <p className="text-xs text-error/80 font-mono">{cron.lastError}</p>
              </div>
            )}
            <div className="mt-2 text-[10px] text-text-muted font-mono">
              ID: {cron.id} · Created: {new Date(cron.createdAt).toLocaleDateString()}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
