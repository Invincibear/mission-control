import { NextResponse } from 'next/server';
import { getAgents } from '@/lib/agents';
import { getDb, type Project } from '@/lib/db';
import { getMemorySources } from '@/lib/memory';
import { getCronSummary } from '@/lib/crons';

export async function GET() {
  try {
    const agents = getAgents();

    let projects: Project[] = [];
    try {
      const db = getDb();
      projects = db.prepare('SELECT * FROM projects').all() as Project[];
    } catch {
      // DB might not exist yet
    }

    const memorySources = getMemorySources();
    const totalMemoryFiles = memorySources.reduce((acc, source) => {
      function countFiles(files: typeof source.files): number {
        return files.reduce((sum, f) => {
          if (f.isDirectory && f.children) return sum + countFiles(f.children);
          return sum + 1;
        }, 0);
      }
      return acc + countFiles(source.files);
    }, 0);

    const statusCounts = projects.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const recentProjects = projects
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    return NextResponse.json({
      agentCount: agents.length,
      projectCount: projects.length,
      memoryFileCount: totalMemoryFiles,
      activeTasks: statusCounts['active'] || 0,
      projectsByStatus: statusCounts,
      recentProjects,
      agents: agents.map((a) => ({ id: a.id, name: a.name })),
      cronsSummary: getCronSummary(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load overview', details: String(error) },
      { status: 500 }
    );
  }
}
