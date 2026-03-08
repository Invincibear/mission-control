'use client';

import { useEffect, useState } from 'react';
import {
  FolderOpen,
  File,
  Search,
  ChevronRight,
  ChevronDown,
  Brain,
  X,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MemoryFile {
  name: string;
  path: string;
  relativePath: string;
  isDirectory: boolean;
  children?: MemoryFile[];
  size?: number;
  modified?: string;
}

interface MemorySource {
  agentId: string;
  agentName: string;
  basePath: string;
  files: MemoryFile[];
}

interface SearchResult {
  agentId: string;
  file: string;
  matches: string[];
}

function FileTree({
  files,
  agentId,
  onSelect,
  depth = 0,
}: {
  files: MemoryFile[];
  agentId: string;
  onSelect: (agentId: string, path: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  return (
    <div>
      {files.map((file) => (
        <div key={file.relativePath}>
          {file.isDirectory ? (
            <>
              <button
                onClick={() => toggle(file.relativePath)}
                className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-bg-hover rounded text-sm text-text-secondary"
                style={{ paddingLeft: `${depth * 16 + 8}px` }}
              >
                {expanded.has(file.relativePath) ? (
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                )}
                <FolderOpen className="w-3.5 h-3.5 text-warning shrink-0" />
                <span className="truncate">{file.name}</span>
              </button>
              {expanded.has(file.relativePath) && file.children && (
                <FileTree
                  files={file.children}
                  agentId={agentId}
                  onSelect={onSelect}
                  depth={depth + 1}
                />
              )}
            </>
          ) : (
            <button
              onClick={() => onSelect(agentId, file.relativePath)}
              className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-bg-hover rounded text-sm text-text-secondary"
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
            >
              <File className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="truncate font-mono text-xs">{file.name}</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default function MemoryPage() {
  const [sources, setSources] = useState<MemorySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{ content: string; path: string } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('/api/memory')
      .then((r) => r.json())
      .then(setSources)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectFile = async (agentId: string, relativePath: string) => {
    setFileLoading(true);
    try {
      const res = await fetch(`/api/memory/${agentId}/${relativePath}`);
      const data = await res.json();
      setSelectedFile({ content: data.content, path: data.path });
    } catch {
      setSelectedFile({ content: 'Failed to load file', path: '' });
    }
    setFileLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/memory?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results);
    } catch {
      setSearchResults([]);
    }
    setSearching(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-bg-tertiary rounded" />
          <div className="h-[500px] bg-bg-tertiary rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 h-[calc(100vh-0px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Memory</h1>
        <p className="text-text-secondary text-sm mt-1">Browse and search agent memory files</p>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search across all memory files..."
            className="w-full pl-9 pr-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-hover transition-colors"
        >
          Search
        </button>
        {searchResults !== null && (
          <button
            onClick={() => setSearchResults(null)}
            className="px-3 py-2 bg-bg-secondary border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-hover"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {searchResults !== null ? (
        <div className="flex-1 overflow-y-auto bg-bg-secondary border border-border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-3">
            {searching ? 'Searching...' : `${searchResults.length} results`}
          </h3>
          {searchResults.map((result, i) => (
            <div key={i} className="mb-3 p-3 bg-bg-tertiary rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                  {result.agentId}
                </span>
                <button
                  onClick={() => selectFile(result.agentId, result.file)}
                  className="text-sm font-mono text-accent hover:underline"
                >
                  {result.file}
                </button>
              </div>
              {result.matches.map((match, j) => (
                <p key={j} className="text-xs text-text-muted truncate pl-2 border-l border-border">
                  {match}
                </p>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0">
          {/* File Tree */}
          <div className="w-72 bg-bg-secondary border border-border rounded-lg overflow-y-auto shrink-0">
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Memory Files</span>
              </div>
            </div>
            <div className="p-2">
              {sources.map((source) => (
                <div key={source.agentId} className="mb-2">
                  <div className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-mono text-text-muted uppercase tracking-wide">
                    <FolderOpen className="w-3.5 h-3.5" />
                    {source.agentName}
                  </div>
                  <FileTree
                    files={source.files}
                    agentId={source.agentId}
                    onSelect={selectFile}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Content Viewer */}
          <div className="flex-1 bg-bg-secondary border border-border rounded-lg overflow-y-auto">
            {fileLoading ? (
              <div className="p-8 text-center text-text-muted">Loading...</div>
            ) : selectedFile ? (
              <div className="p-6">
                <div className="text-xs font-mono text-text-muted mb-4 pb-2 border-b border-border truncate">
                  {selectedFile.path}
                </div>
                <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-text-primary [&_h2]:text-text-primary [&_h3]:text-text-primary [&_p]:text-text-secondary [&_li]:text-text-secondary [&_a]:text-accent [&_code]:bg-bg-tertiary [&_code]:px-1 [&_code]:rounded [&_pre]:bg-bg-tertiary [&_pre]:p-3 [&_pre]:rounded-lg [&_blockquote]:border-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedFile.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">
                Select a file to view its contents
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
