export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
  position: number;
}

export interface Agent {
  id: string;
  name: string;
  workspace: string;
  model: { primary: string; fallbacks?: string[] };
  heartbeat?: { every: string };
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: string;
}

export interface MemoryFile {
  name: string;
  path: string;
  relativePath: string;
  isDirectory: boolean;
  children?: MemoryFile[];
  size?: number;
  modified?: string;
}

export interface MemorySource {
  agentId: string;
  agentName: string;
  basePath: string;
  files: MemoryFile[];
}
