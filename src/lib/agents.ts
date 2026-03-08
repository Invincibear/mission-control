import { readFileSync } from 'fs';
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
  const raw = readFileSync(configPath, 'utf-8');
  return JSON.parse(raw);
}

export function getAgents(): AgentDef[] {
  const config = getOpenClawConfig();
  const agents = config.agents as AgentsConfig;
  const defaults = agents.defaults;

  // Default agent (Cass)
  const defaultAgent: AgentDef = {
    id: 'cass',
    name: 'Cass',
    workspace: defaults.workspace.replace('~', homedir()),
    model: defaults.model,
    heartbeat: defaults.heartbeat,
  };

  // Additional agents from list
  const listedAgents = agents.list.map((a) => ({
    ...a,
    workspace: a.workspace.replace('~', homedir()),
    model: a.model || defaults.model,
    heartbeat: a.heartbeat || defaults.heartbeat,
  }));

  return [defaultAgent, ...listedAgents];
}
