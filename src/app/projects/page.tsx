'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  X,
  GripVertical,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  created_at: string;
  updated_at: string;
  position: number;
}

const COLUMNS = [
  { id: 'concept', label: 'Concept', color: 'border-info' },
  { id: 'todo', label: 'TODO', color: 'border-warning' },
  { id: 'active', label: 'Active', color: 'border-accent' },
  { id: 'in-review', label: 'In Review', color: 'border-purple-500' },
  { id: 'done', label: 'Done', color: 'border-success' },
];

const priorityIcons: Record<string, React.ReactNode> = {
  high: <ArrowUp className="w-3 h-3 text-error" />,
  medium: <Minus className="w-3 h-3 text-warning" />,
  low: <ArrowDown className="w-3 h-3 text-info" />,
};

function ProjectCard({
  project,
  onDelete,
  isDragging,
}: {
  project: Project;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: project.id,
    data: { status: project.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-bg-primary border border-border rounded-lg p-3 group hover:border-border-light transition-colors"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-text-muted hover:text-text-secondary cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium truncate">{project.title}</h3>
            <button
              onClick={() => onDelete(project.id)}
              className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-error transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {project.description && (
            <p className="text-xs text-text-muted mt-1 line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1">
              {priorityIcons[project.priority]}
            </span>
            {project.assignee && (
              <span className="text-[10px] font-mono bg-bg-tertiary px-1.5 py-0.5 rounded text-text-secondary">
                {project.assignee}
              </span>
            )}
            <span className="text-[10px] text-text-muted ml-auto">
              {new Date(project.updated_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddProjectForm({
  status,
  onAdd,
  onCancel,
}: {
  status: string;
  onAdd: (data: { title: string; description: string; priority: string; status: string }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description, priority, status });
    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-bg-primary border border-accent/50 rounded-lg p-3 space-y-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Project title"
        className="w-full bg-transparent text-sm focus:outline-none placeholder:text-text-muted"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full bg-transparent text-xs text-text-secondary focus:outline-none placeholder:text-text-muted resize-none"
      />
      <div className="flex items-center justify-between">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-bg-tertiary text-xs border border-border rounded px-2 py-1 focus:outline-none"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-1 text-xs text-text-muted hover:text-text-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover"
          >
            Add
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchProjects = useCallback(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = async (data: { title: string; description: string; priority: string; status: string }) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const project = await res.json();
      setProjects((prev) => [...prev, project]);
      setAddingTo(null);
    }
  };

  const deleteProject = async (id: string) => {
    await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeProject = projects.find((p) => p.id === active.id);
    if (!activeProject) return;

    // Check if dragging over a column
    const overColumn = COLUMNS.find((c) => c.id === over.id);
    const overProject = projects.find((p) => p.id === over.id);
    const targetStatus = overColumn?.id || overProject?.status;

    if (targetStatus && activeProject.status !== targetStatus) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === active.id ? { ...p, status: targetStatus } : p
        )
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active } = event;
    setActiveId(null);

    const project = projects.find((p) => p.id === active.id);
    if (project) {
      updateProject(project.id, { status: project.status });
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-bg-tertiary rounded" />
          <div className="flex gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-96 w-64 bg-bg-tertiary rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeProject = activeId ? projects.find((p) => p.id === activeId) : null;

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-text-secondary text-sm mt-1">Manage your projects with drag-and-drop</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((column) => {
            const columnProjects = projects.filter((p) => p.status === column.id);
            return (
              <div
                key={column.id}
                className="w-64 shrink-0 flex flex-col"
              >
                <div className={`flex items-center justify-between mb-3 pb-2 border-b-2 ${column.color}`}>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium">{column.label}</h3>
                    <span className="text-xs font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 rounded">
                      {columnProjects.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setAddingTo(addingTo === column.id ? null : column.id)}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <SortableContext
                  id={column.id}
                  items={columnProjects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 space-y-2 min-h-[100px]">
                    {addingTo === column.id && (
                      <AddProjectForm
                        status={column.id}
                        onAdd={addProject}
                        onCancel={() => setAddingTo(null)}
                      />
                    )}
                    {columnProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onDelete={deleteProject}
                        isDragging={activeId === project.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activeProject ? (
            <div className="bg-bg-primary border border-accent rounded-lg p-3 shadow-lg shadow-accent/20 rotate-2 w-64">
              <div className="flex items-start gap-2">
                <GripVertical className="w-3.5 h-3.5 text-text-muted mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">{activeProject.title}</h3>
                  {activeProject.description && (
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">
                      {activeProject.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {projects.length === 0 && !addingTo && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-text-muted mx-auto mb-2" />
            <p className="text-text-muted text-sm">No projects yet. Click + to add one.</p>
          </div>
        </div>
      )}
    </div>
  );
}
