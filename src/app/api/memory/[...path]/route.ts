import { NextRequest, NextResponse } from 'next/server';
import { readMemoryFile, getMemorySources } from '@/lib/memory';
import { resolve } from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathParts } = await params;
    const agentId = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    // Reject path segments that attempt traversal
    if (pathParts.some((p) => p === '..' || p === '.')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const sources = getMemorySources();
    const source = sources.find((s) => s.agentId === agentId);

    if (!source) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Use resolve() to normalize the path, preventing traversal via encoded segments
    const resolvedBase = resolve(source.basePath);
    const fullPath = resolve(source.basePath, filePath);

    // Security: ensure the resolved path is within the memory directory
    if (!fullPath.startsWith(resolvedBase + '/') && fullPath !== resolvedBase) {
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
