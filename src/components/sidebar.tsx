'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  KanbanSquare,
  Building2,
  Bot,
  Clock,
  Calendar,
  Brain,
  Terminal,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: KanbanSquare },
  { href: '/office', label: 'Office', icon: Building2 },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/crons', label: 'Crons', icon: Clock },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/memory', label: 'Memory', icon: Brain },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 h-screen bg-bg-secondary border-r border-border flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-accent" />
          <h1 className="font-mono text-sm font-bold tracking-wide text-text-primary">
            Mission Control
          </h1>
        </div>
        <p className="text-[10px] font-mono text-text-muted mt-1 tracking-widest uppercase">
          OpenClaw
        </p>
      </div>

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-text-muted font-mono">System Online</span>
        </div>
      </div>
    </aside>
  );
}
