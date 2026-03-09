import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface AgentModel {
  primary: string;
  fallbacks?: string[];
}

export interface AgentHeartbeat {
  every: string;
}

export interface AgentDef {
  id: string;
  name: string;
  workspace: string;
  model: AgentModel;
  heartbeat?: AgentHeartbeat;
}

export interface AgentsConfig {
  defaults: {
    model: AgentModel;
    workspace: string;
    heartbeat?: AgentHeartbeat;
    maxConcurrent?: number;
  };
  list: AgentDef[];
}

export function getOpenClawConfig(): Record<string, unknown> {
  const configPath = join(homedir(), '.openclaw', 'openclaw.json');
  if (!existsSync(configPath)) {
    throw new Error(`OpenClaw config not found at ${configPath}`);
  }
  const raw = readFileSync(configPath, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('OpenClaw config file contains invalid JSON');
  }
}

export function getAgents(): AgentDef[] {
  const config = getOpenClawConfig();
  const agents = config.agents as AgentsConfig;
  const defaults = agents.defaults;

  // Build agents from the explicit list, applying defaults
  const listedAgents = agents.list.map((a) => ({
    ...a,
    workspace: (a.workspace || defaults.workspace).replace('~', homedir()),
    model: a.model || defaults.model,
    heartbeat: a.heartbeat || defaults.heartbeat,
  }));

  // If no agent in the list uses the default workspace, add a default agent
  const defaultWorkspace = defaults.workspace.replace('~', homedir());
  const hasDefault = listedAgents.some(
    (a) => a.workspace === defaultWorkspace && a.id !== 'smc'
  );

  if (hasDefault) {
    return listedAgents;
  }

  // Fallback: create a default agent entry
  const defaultAgent: AgentDef = {
    id: 'main',
    name: 'Cass',
    workspace: defaultWorkspace,
    model: defaults.model,
    heartbeat: defaults.heartbeat,
  };

  return [defaultAgent, ...listedAgents];
}
