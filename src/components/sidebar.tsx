'use client';

import { useState } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen,
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
  // Default collapsed on mobile (< 768px)
  const [collapsed, setCollapsed] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  return (
    <aside
      className={`h-screen bg-bg-secondary border-r border-border flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <Terminal className="w-5 h-5 text-accent shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="font-mono text-sm font-bold tracking-wide text-text-primary">
                Mission Control
              </h1>
              <p className="text-[10px] font-mono text-text-muted tracking-widest uppercase">
                OpenClaw
              </p>
            </div>
          )}
        </div>
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
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md text-sm transition-colors ${
                collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
              } ${
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2 w-full rounded-md text-xs text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors ${
            collapsed ? 'justify-center px-2 py-2' : 'px-3 py-2'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center px-2' : 'px-3'}`}>
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          {!collapsed && (
            <span className="text-xs text-text-muted font-mono">System Online</span>
          )}
        </div>
      </div>
    </aside>
  );
}
