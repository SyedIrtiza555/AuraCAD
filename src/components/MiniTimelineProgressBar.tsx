import React from 'react';
import { OrderStatus, STATUSES, OrderHistoryEvent } from '../types';
import { Check } from 'lucide-react';

interface MiniTimelineProgressBarProps {
  currentStatus: OrderStatus;
  history?: OrderHistoryEvent[];
  className?: string;
}

const STAGE_SHORT_NAMES: Record<string, string> = {
  'Inbox': 'Inbox',
  'In progress': 'In Prog',
  'In Review': 'Review',
  'Delivered': 'Done',
  'Backlog': 'Backlog',
  'Inception': 'Inbox',
  'CAD Design': 'In Prog',
  'Review': 'Review',
  'Production': 'In Prog'
};

export function MiniTimelineProgressBar({
  currentStatus,
  history,
  className = ''
}: MiniTimelineProgressBarProps) {
  const currentIdx = Math.max(0, STATUSES.indexOf(currentStatus));
  const totalStages = STATUSES.length;
  // Flow percentage: 20%, 40%, 60%, 80%, 100%
  const progressPercent = Math.round(((currentIdx + 1) / totalStages) * 100);

  return (
    <div className={`p-2.5 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-md select-none ${className}`}>
      {/* Top micro-bar: stage step count & percentage */}
      <div className="flex items-center justify-between text-[10px] font-mono mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">
            Process Flow:
          </span>
          <span className="text-zinc-300 font-semibold truncate">
            {currentStatus}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-zinc-400">
            {currentIdx + 1}/{totalStages}
          </span>
        </div>

        <span className={`text-[10px] font-bold tabular-nums ${
          progressPercent === 100 ? 'text-emerald-400' : 'text-[#ff943c]'
        }`}>
          {progressPercent}%
        </span>
      </div>

      {/* Condensed Horizontal Timeline Track */}
      <div className="relative py-1">
        {/* Background track */}
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          {/* Animated Gradient Fill */}
          <div 
            className="h-full rounded-full bg-gradient-to-r from-[#ff943c] via-amber-400 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(255,148,60,0.6)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Node Dots */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none px-0.5">
          {STATUSES.map((stage, idx) => {
            const isPassed = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isDelivered = currentStatus === 'Delivered';

            return (
              <div 
                key={stage}
                className="relative flex items-center justify-center pointer-events-auto"
                title={`${stage} (Stage ${idx + 1} of ${totalStages})`}
              >
                {/* Active pulsating beacon */}
                {isCurrent && !isDelivered && (
                  <span className="absolute -inset-1 rounded-full bg-[#ff943c]/40 animate-ping" />
                )}

                <div 
                  className={`w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCurrent
                      ? 'bg-[#ff943c] ring-2 ring-black border border-white shadow-[0_0_8px_rgba(255,148,60,1)] scale-110 z-10'
                      : isPassed
                      ? 'bg-emerald-400 ring-1 ring-black shadow-[0_0_4px_rgba(52,211,153,0.8)]'
                      : 'bg-zinc-700 ring-1 ring-zinc-900'
                  }`}
                >
                  {isPassed && (
                    <Check size={7} strokeWidth={3} className="text-black" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage labels micro-grid */}
      <div className="flex items-center justify-between mt-1 text-[9px] font-mono leading-none">
        {STATUSES.map((stage, idx) => {
          const isPassed = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <span 
              key={stage}
              className={`transition-colors ${
                isCurrent
                  ? 'text-white font-bold'
                  : isPassed
                  ? 'text-zinc-400'
                  : 'text-zinc-600'
              }`}
            >
              {STAGE_SHORT_NAMES[stage]}
            </span>
          );
        })}
      </div>
    </div>
  );
}
