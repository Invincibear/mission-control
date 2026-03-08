'use client';

import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput } from '@fullcalendar/core';

interface CronJob {
  id: string;
  name: string;
  schedule: string;
  nextRun: string;
  status: string;
}

interface Project {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function cronToEvents(crons: CronJob[]): EventInput[] {
  return crons
    .filter((c) => c.status === 'active')
    .map((cron) => ({
      id: `cron-${cron.id}`,
      title: cron.name,
      start: cron.nextRun,
      backgroundColor: '#6366f1',
      borderColor: '#6366f1',
      extendedProps: { type: 'cron', schedule: cron.schedule },
    }));
}

function projectToEvents(projects: Project[]): EventInput[] {
  return projects.map((p) => ({
    id: `project-${p.id}`,
    title: p.title,
    start: p.updated_at,
    backgroundColor: p.status === 'done' ? '#22c55e' : p.status === 'active' ? '#f59e0b' : '#3b82f6',
    borderColor: 'transparent',
    extendedProps: { type: 'project', status: p.status },
  }));
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/crons').then((r) => r.json()),
      fetch('/api/projects').then((r) => r.json()),
    ])
      .then(([crons, projects]) => {
        const allEvents = [
          ...cronToEvents(crons),
          ...projectToEvents(Array.isArray(projects) ? projects : []),
        ];
        setEvents(allEvents);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 bg-bg-tertiary rounded" />
          <div className="h-[600px] bg-bg-tertiary rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-text-secondary text-sm mt-1">Scheduled events and project timelines</p>
      </div>

      <div className="bg-bg-secondary border border-border rounded-lg p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          height="auto"
          editable={false}
          selectable={true}
          dayMaxEvents={3}
        />
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent" />
          <span>Cron Jobs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning" />
          <span>Active Projects</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-info" />
          <span>Other</span>
        </div>
      </div>
    </div>
  );
}
