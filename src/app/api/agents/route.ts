import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/agents';
import { safeErrorMessage } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const agents = getAgents();
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load agents', details: safeErrorMessage(error) },
      { status: 500 }
    );
  }
}
