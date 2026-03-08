import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { getAgents } from './agents';

export interface MemoryFile {
  name: string;
  path: string;
  relativePath: string;
  isDirectory: boolean;
  children?: MemoryFile[];
  size?: number;
  modified?: string;
}

export interface MemorySource {
  agentId: string;
  agentName: string;
  basePath: string;
  files: MemoryFile[];
}

function buildTree(dirPath: string, basePath: string): MemoryFile[] {
  if (!existsSync(dirPath)) return [];

  try {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith('.'))
      .sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      })
      .map((entry) => {
        const fullPath = join(dirPath, entry.name);
        const relPath = relative(basePath, fullPath);
        const stat = statSync(fullPath);

        if (entry.isDirectory()) {
          return {
            name: entry.name,
            path: fullPath,
            relativePath: relPath,
            isDirectory: true,
            children: buildTree(fullPath, basePath),
          };
        }

        return {
          name: entry.name,
          path: fullPath,
          relativePath: relPath,
          isDirectory: false,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      });
  } catch {
    return [];
  }
}

export function getMemorySources(): MemorySource[] {
  const agents = getAgents();
  return agents.map((agent) => {
    const memDir = join(agent.workspace, 'memory');
    return {
      agentId: agent.id,
      agentName: agent.name,
      basePath: memDir,
      files: buildTree(memDir, memDir),
    };
  });
}

export function readMemoryFile(filePath: string): string {
  if (!existsSync(filePath)) {
    throw new Error('File not found');
  }
  return readFileSync(filePath, 'utf-8');
}

export function searchMemoryFiles(
  query: string
): { agentId: string; file: string; matches: string[] }[] {
  const sources = getMemorySources();
  const results: { agentId: string; file: string; matches: string[] }[] = [];
  const lowerQuery = query.toLowerCase();

  function searchDir(agentId: string, files: MemoryFile[]) {
    for (const file of files) {
      if (file.isDirectory && file.children) {
        searchDir(agentId, file.children);
      } else if (file.name.endsWith('.md') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
        try {
          const content = readFileSync(file.path, 'utf-8');
          if (content.toLowerCase().includes(lowerQuery)) {
            const lines = content.split('\n');
            const matchingLines = lines.filter((l) =>
              l.toLowerCase().includes(lowerQuery)
            );
            results.push({
              agentId,
              file: file.relativePath,
              matches: matchingLines.slice(0, 3),
            });
          }
        } catch {
          // skip unreadable files
        }
      }
    }
  }

  for (const source of sources) {
    searchDir(source.agentId, source.files);
  }

  return results;
}
