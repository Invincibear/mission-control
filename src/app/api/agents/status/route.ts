import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';
import { safeErrorMessage } from '@/lib/errors';

export const dynamic = 'force-dynamic';

const OPENCLAW_DIR = path.join(homedir(), '.openclaw');
const AGENTS_DIR = path.join(OPENCLAW_DIR, 'agents');
// Consider "working" if activity within last 15 seconds
const ACTIVE_THRESHOLD_MS = 15_000;

interface AgentStatus {
  id: string;
  name: string;
  status: 'working' | 'idle' | 'offline';
  lastActivity: number | null;
  currentSession: string | null;
}

export async function GET() {
  try {
    // Read agent config
    const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const agentsList = config.agents?.list || [];

    const now = Date.now();
    const statuses: AgentStatus[] = [];

    for (const agent of agentsList) {
      const agentId = agent.id;
      const agentName = agent.name || agentId;
      const sessionsFile = path.join(AGENTS_DIR, agentId, 'sessions', 'sessions.json');

      let status: 'working' | 'idle' | 'offline' = 'offline';
      let lastActivity: number | null = null;
      let currentSession: string | null = null;

      try {
        const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf-8'));
        let sessionLogFile: string | null = null;

        // Find the most recent session activity
        for (const [key, session] of Object.entries(sessions)) {
          const sess = session as Record<string, unknown>;
          const updatedAt = sess.updatedAt as number;
          if (updatedAt && (!lastActivity || updatedAt > lastActivity)) {
            lastActivity = updatedAt;
            currentSession = key;
            sessionLogFile = sess.sessionFile as string || null;
          }
        }

        // Check session log file mtime — most accurate for "currently working"
        if (sessionLogFile) {
          try {
            const stat = fs.statSync(sessionLogFile);
            const logMtime = stat.mtimeMs;
            if (logMtime > (lastActivity || 0)) {
              lastActivity = logMtime;
            }
          } catch {
            // Session log file might not exist yet
          }
        }

        if (lastActivity) {
          const timeSince = now - lastActivity;
          if (timeSince < ACTIVE_THRESHOLD_MS) {
            status = 'working';
          } else {
            status = 'idle';
          }
        }
      } catch {
        // No sessions file = offline
        status = 'offline';
      }

      statuses.push({
        id: agentId,
        name: agentName,
        status,
        lastActivity,
        currentSession,
      });
    }

    return NextResponse.json({ agents: statuses, timestamp: now });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read agent status', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}
