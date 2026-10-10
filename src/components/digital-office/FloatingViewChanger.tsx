import React from 'react';
import { 
  LayoutGrid, 
  Table as TableIcon, 
  Kanban, 
  CalendarDays, 
  History 
} from 'lucide-react';
import { Tooltip } from '@mantine/core';

export type ViewMode = 'cards' | 'table' | 'kanban' | 'calendar' | 'time-machine';

interface FloatingViewChangerProps {
  currentView: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function FloatingViewChanger({ currentView, onChange }: FloatingViewChangerProps) {
  const views: { id: ViewMode; icon: React.ReactNode; label: string }[] = [
    { id: 'cards', icon: <LayoutGrid size={16} strokeWidth={2.5} />, label: 'Card Grid' },
    { id: 'table', icon: <TableIcon size={16} strokeWidth={2.5} />, label: 'Data Table' },
    { id: 'kanban', icon: <Kanban size={16} strokeWidth={2.5} />, label: 'Kanban Board' },
    { id: 'calendar', icon: <CalendarDays size={16} strokeWidth={2.5} />, label: 'Calendar View' },
    { id: 'time-machine', icon: <History size={16} strokeWidth={2.5} />, label: 'Time Machine' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center p-1.5 rounded-full bg-white/30 dark:bg-black/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] z-50">
      {views.map((view) => {
        const isActive = currentView === view.id;
        return (
          <Tooltip key={view.id} label={view.label} position="top" withArrow fz="xs" fw={700}>
            <button
              onClick={() => onChange(view.id)}
              className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 cursor-pointer overflow-hidden ${
                isActive 
                  ? 'text-white' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/20 dark:hover:bg-white/5'
              }`}
            >
              {/* Active state liquid background */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-br from-[#83dd24] to-[#29aae0] opacity-90 blur-[1px]" />
              )}
              
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                {view.icon}
              </div>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
