import { NextResponse } from 'next/server';
import { getCronJobs } from '@/lib/crons';
import { safeErrorMessage } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jobs = getCronJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load cron jobs', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}
