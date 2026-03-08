import { NextResponse } from 'next/server';

export async function GET() {
  // Placeholder cron data - will connect to OpenClaw's cron API later
  const crons = [
    {
      id: '1',
      name: 'Heartbeat Check',
      schedule: '0 * * * *',
      lastRun: new Date(Date.now() - 3600000).toISOString(),
      nextRun: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
    },
    {
      id: '2',
      name: 'Memory Compaction',
      schedule: '0 0 * * *',
      lastRun: new Date(Date.now() - 86400000).toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      status: 'active',
    },
    {
      id: '3',
      name: 'Discord Sync',
      schedule: '*/5 * * * *',
      lastRun: new Date(Date.now() - 300000).toISOString(),
      nextRun: new Date(Date.now() + 300000).toISOString(),
      status: 'active',
    },
    {
      id: '4',
      name: 'Project Backup',
      schedule: '0 2 * * *',
      lastRun: new Date(Date.now() - 172800000).toISOString(),
      nextRun: new Date(Date.now() + 86400000).toISOString(),
      status: 'paused',
    },
    {
      id: '5',
      name: 'Agent Health Monitor',
      schedule: '*/15 * * * *',
      lastRun: new Date(Date.now() - 900000).toISOString(),
      nextRun: new Date(Date.now() + 900000).toISOString(),
      status: 'active',
    },
  ];

  return NextResponse.json(crons);
}
