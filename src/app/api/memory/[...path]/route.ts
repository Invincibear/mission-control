import { NextRequest, NextResponse } from 'next/server';
import { readMemoryFile, getMemorySources } from '@/lib/memory';
import { join } from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;
    const agentId = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    const sources = getMemorySources();
    const source = sources.find((s) => s.agentId === agentId);

    if (!source) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const fullPath = join(source.basePath, filePath);

    // Security: ensure the path is within the memory directory
    if (!fullPath.startsWith(source.basePath)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const content = readMemoryFile(fullPath);
    return NextResponse.json({ content, path: fullPath });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to read file', details: String(error) },
      { status: 500 }
    );
  }
}
