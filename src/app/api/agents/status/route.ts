import { getAgents } from '@/lib/agents';
import { execSync } from 'child_process';

interface AgentStatus {
  id: string;
  name: string;
  isWorking: boolean;
  currentTask?: string;
}

function getAgentStatuses(): AgentStatus[] {
  const agents = getAgents();

  // Check for active sessions/subagents via openclaw
  let activeSessions: string[] = [];
  try {
    const output = execSync('ps aux', { timeout: 3000 }).toString();
    activeSessions = output.split('\n');
  } catch {
    // fallback: no process info
  }

  return agents.map((agent) => {
    // Check if there are active claude/codex processes in the agent's workspace
    const isWorking = activeSessions.some(
      (line) =>
        (line.includes('claude') || line.includes('codex') || line.includes('opencode')) &&
        line.includes(agent.workspace)
    );

    return {
      id: agent.id,
      name: agent.name,
      isWorking,
    };
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const stream = url.searchParams.get('stream');

  // Non-streaming: return current status
  if (stream !== 'true') {
    return Response.json(getAgentStatuses());
  }

  // SSE streaming
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      // Send initial status
      const initial = getAgentStatuses();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initial)}\n\n`)
      );

      // Poll every 3 seconds
      const interval = setInterval(() => {
        try {
          const statuses = getAgentStatuses();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(statuses)}\n\n`)
          );
        } catch {
          // ignore errors in poll
        }
      }, 3000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
