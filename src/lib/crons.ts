import { readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CRON_JOBS_PATH = join(homedir(), '.openclaw', 'cron', 'jobs.json');

interface CronSchedule {
  kind: 'at' | 'every' | 'cron';
  at?: string;
  everyMs?: number;
  anchorMs?: number;
  expr?: string;
  tz?: string;
}

interface CronState {
  nextRunAtMs?: number;
  lastRunAtMs?: number;
  lastStatus?: string;
  lastDurationMs?: number;
  lastError?: string;
  consecutiveErrors?: number;
}

interface CronJobRaw {
  id: string;
  agentId?: string;
  name?: string;
  enabled: boolean;
  deleteAfterRun?: boolean;
  createdAtMs: number;
  updatedAtMs?: number;
  schedule: CronSchedule;
  sessionTarget: string;
  wakeMode?: string;
  payload: {
    kind: string;
    text?: string;
    message?: string;
    timeoutSeconds?: number;
  };
  delivery?: {
    mode: string;
    channel?: string;
  };
  state?: CronState;
}

export interface CronJob {
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

function formatSchedule(schedule: CronSchedule): string {
  switch (schedule.kind) {
    case 'cron':
      return schedule.expr || 'unknown';
    case 'every': {
      const ms = schedule.everyMs || 0;
      if (ms >= 3600000) return `every ${Math.round(ms / 3600000)}h`;
      if (ms >= 60000) return `every ${Math.round(ms / 60000)}m`;
      return `every ${Math.round(ms / 1000)}s`;
    }
    case 'at':
      return schedule.at ? `once @ ${new Date(schedule.at).toLocaleString()}` : 'once';
    default:
      return 'unknown';
  }
}

function getPayloadPreview(payload: CronJobRaw['payload']): string {
  const text = payload.text || payload.message || '';
  return text.length > 100 ? text.slice(0, 100) + '…' : text;
}

export function getCronJobs(): CronJob[] {
  const raw = readFileSync(CRON_JOBS_PATH, 'utf-8');
  const data = JSON.parse(raw) as { version: number; jobs: CronJobRaw[] };

  return data.jobs.map((job) => ({
    id: job.id,
    name: job.name || job.id.slice(0, 8),
    agentId: job.agentId || 'main',
    enabled: job.enabled,
    schedule: formatSchedule(job.schedule),
    scheduleKind: job.schedule.kind,
    sessionTarget: job.sessionTarget,
    payloadKind: job.payload.kind,
    payloadPreview: getPayloadPreview(job.payload),
    lastRun: job.state?.lastRunAtMs
      ? new Date(job.state.lastRunAtMs).toISOString()
      : null,
    lastStatus: job.state?.lastStatus || null,
    lastDurationMs: job.state?.lastDurationMs || null,
    lastError: job.state?.lastError || null,
    nextRun: job.state?.nextRunAtMs
      ? new Date(job.state.nextRunAtMs).toISOString()
      : null,
    consecutiveErrors: job.state?.consecutiveErrors || 0,
    createdAt: new Date(job.createdAtMs).toISOString(),
  }));
}

export function getCronSummary(): { total: number; active: number; paused: number } {
  const jobs = getCronJobs();
  const active = jobs.filter((j) => j.enabled).length;
  return {
    total: jobs.length,
    active,
    paused: jobs.length - active,
  };
}
