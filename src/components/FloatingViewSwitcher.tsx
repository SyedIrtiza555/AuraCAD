import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { LayoutGrid, Table2, Kanban as KanbanIcon, Calendar as CalendarIcon, Users } from 'lucide-react';

interface FloatingViewSwitcherProps {
  currentView: 'cards' | 'table' | 'kanban' | 'calendar' | 'team';
  onViewChange: (view: 'cards' | 'table' | 'kanban' | 'calendar' | 'team') => void;
}

const VIEWS: Array<{
  id: 'cards' | 'table' | 'kanban' | 'calendar' | 'team';
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'cards', label: 'Cards', icon: <LayoutGrid size={15} strokeWidth={2} /> },
  { id: 'table', label: 'Table', icon: <Table2 size={15} strokeWidth={2} /> },
  { id: 'kanban', label: 'Board', icon: <KanbanIcon size={15} strokeWidth={2} /> },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon size={15} strokeWidth={2} /> },
  { id: 'team', label: 'Team', icon: <Users size={15} strokeWidth={2} /> },
];

export function FloatingViewSwitcher({ currentView, onViewChange }: FloatingViewSwitcherProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
      <Tabs.Root 
        value={currentView} 
        onValueChange={(val) => onViewChange(val as any)}
      >
        <Tabs.List className="flex items-center bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-full p-1 shadow-[0_8px_30px_rgba(0,0,0,0.1)] gap-1">
          {VIEWS.map((view) => {
            const isActive = currentView === view.id;
            return (
              <Tabs.Trigger
                key={view.id}
                value={view.id}
                title={view.label}
                aria-label={view.label}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{view.icon}</span>
                {isActive && (
                  <span className="text-[11px] font-medium tracking-wide animate-in fade-in duration-150">
                    {view.label}
                  </span>
                )}
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
}
