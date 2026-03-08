import { NextRequest, NextResponse } from 'next/server';
import { getMemorySources, searchMemoryFiles } from '@/lib/memory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (query) {
      const results = searchMemoryFiles(query);
      return NextResponse.json({ results });
    }

    const sources = getMemorySources();
    return NextResponse.json(sources);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load memory', details: String(error) },
      { status: 500 }
    );
  }
}
