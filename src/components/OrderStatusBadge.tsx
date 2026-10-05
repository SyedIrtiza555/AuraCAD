import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  order: Pick<Order, 'status' | 'dueDate' | 'createdAt'>;
  variant?: 'pill' | 'dot' | 'badge';
  size?: 'sm' | 'md' | 'xs';
  showCountdownHint?: boolean;
  className?: string;
}

export function OrderStatusBadge({
  order,
  variant = 'pill',
  size = 'md',
  showCountdownHint = false,
  className = ''
}: OrderStatusBadgeProps) {
  const { status, dueDate } = order;

  // Calculate time remaining relative to current date
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const isDelivered = status === 'Delivered';
  const isOverdue = !isDelivered && daysRemaining < 0;
  const isApproachingDueDate = !isDelivered && !isOverdue && daysRemaining <= 3;
  const isDueSoon = !isDelivered && !isOverdue && daysRemaining > 3 && daysRemaining <= 7;
  const isHealthy = !isDelivered && !isOverdue && daysRemaining > 7;

  // Status base color tones according to user specification:
  // - Inbox: Yellow
  // - In progress: Orange
  // - In Review: Blue
  // - Delivered: Green
  // - Backlog: Grey
  const getStatusColorConfig = (st: OrderStatus) => {
    switch (st) {
      case 'Inbox':
      case 'Inception':
        return {
          baseText: 'text-yellow-300',
          baseDot: 'bg-yellow-400',
          dotShadow: 'shadow-[0_0_8px_rgba(250,204,21,0.8)]',
          pillDefault: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25',
          pillApproaching: 'bg-yellow-500/25 text-yellow-200 border-yellow-400/50 shadow-[0_0_14px_rgba(250,204,21,0.35)]',
          pillOverdue: 'bg-red-500/20 text-red-300 border-red-500/40'
        };
      case 'In progress':
      case 'CAD Design':
      case 'Production':
        return {
          baseText: 'text-[#ff943c]',
          baseDot: 'bg-[#ff943c]',
          dotShadow: 'shadow-[0_0_8px_rgba(255,148,60,0.8)]',
          pillDefault: 'bg-[#ff943c]/10 text-[#ff943c] border-[#ff943c]/25',
          pillApproaching: 'bg-[#ff943c]/25 text-[#ff943c] border-[#ff943c]/50 shadow-[0_0_14px_rgba(255,148,60,0.35)]',
          pillOverdue: 'bg-red-500/20 text-red-300 border-red-500/40'
        };
      case 'In Review':
      case 'Review':
        return {
          baseText: 'text-blue-300',
          baseDot: 'bg-blue-400',
          dotShadow: 'shadow-[0_0_8px_rgba(96,165,250,0.8)]',
          pillDefault: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
          pillApproaching: 'bg-blue-500/25 text-blue-200 border-blue-400/50 shadow-[0_0_14px_rgba(96,165,250,0.35)]',
          pillOverdue: 'bg-red-500/20 text-red-300 border-red-500/40'
        };
      case 'Delivered':
        return {
          baseText: 'text-emerald-300',
          baseDot: 'bg-emerald-400',
          dotShadow: 'shadow-[0_0_8px_rgba(52,211,153,0.8)]',
          pillDefault: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          pillApproaching: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          pillOverdue: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        };
      case 'Backlog':
      default:
        return {
          baseText: 'text-zinc-300',
          baseDot: 'bg-zinc-400',
          dotShadow: 'shadow-[0_0_6px_rgba(161,161,170,0.6)]',
          pillDefault: 'bg-white/5 text-zinc-300 border-white/10',
          pillApproaching: 'bg-zinc-400/20 text-zinc-200 border-zinc-400/40 shadow-[0_0_12px_rgba(255,255,255,0.1)]',
          pillOverdue: 'bg-red-500/20 text-red-300 border-red-500/40'
        };
    }
  };

  const colors = getStatusColorConfig(status);

  // Compute tooltip for informative hover
  const getTooltip = () => {
    if (isDelivered) return 'Status: Delivered (Completed)';
    if (isOverdue) return `Overdue by ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'}`;
    if (isApproachingDueDate) return `Approaching due date: ${daysRemaining === 0 ? 'Due today' : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`}`;
    if (isDueSoon) return `Due in ${daysRemaining} days`;
    return `Healthy timeline • Due in ${daysRemaining} days`;
  };

  // Determine pulsating animation
  const isPulsating = isApproachingDueDate || isOverdue;
  const pulseClass = isOverdue 
    ? 'animate-pulse' 
    : isApproachingDueDate 
    ? 'animate-pulse-subtle' 
    : '';

  // DOT VARIANT (for Minimal / Ultra-Minimal view)
  if (variant === 'dot') {
    const dotSize = size === 'xs' ? 'w-1.5 h-1.5' : size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
    return (
      <span 
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        title={getTooltip()}
      >
        {isPulsating && (
          <span 
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isOverdue ? 'bg-red-400 animate-ping' : 'bg-[#ff943c] animate-ping'
            }`} 
            style={{ animationDuration: isOverdue ? '1.8s' : '3s' }}
          />
        )}
        <span 
          className={`relative inline-block rounded-full ${dotSize} ${
            isOverdue ? 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]' : colors.baseDot
          } ${colors.dotShadow} ${pulseClass}`} 
        />
      </span>
    );
  }

  // PILL / BADGE VARIANT
  const pillStyle = isOverdue
    ? colors.pillOverdue
    : isApproachingDueDate
    ? `${colors.pillApproaching} animate-glow-amber`
    : isDueSoon
    ? colors.pillApproaching
    : colors.pillDefault;

  const textSize = size === 'xs' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : size === 'sm' 
    ? 'text-[11px] px-2 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <div 
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-all select-none backdrop-blur-md ${pillStyle} ${textSize} ${pulseClass} ${className}`}
      title={getTooltip()}
    >
      {/* Glowing status dot with slow pulse when approaching due date */}
      <span className="relative flex h-2 w-2 shrink-0">
        {isPulsating && (
          <span 
            className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
              isOverdue ? 'bg-red-400 animate-ping' : 'bg-[#ff943c] animate-ping'
            }`}
            style={{ animationDuration: isOverdue ? '2s' : '3.2s' }}
          />
        )}
        <span 
          className={`relative inline-block h-2 w-2 rounded-full ${
            isOverdue ? 'bg-red-400' : colors.baseDot
          } ${colors.dotShadow}`} 
        />
      </span>

      <span className="truncate leading-none">
        {status}
      </span>

      {/* Optional subtle approaching countdown indicator */}
      {showCountdownHint && isApproachingDueDate && (
        <span className="text-[9px] font-mono font-bold tracking-tight opacity-90 pl-0.5">
          {daysRemaining === 0 ? 'Today' : `${daysRemaining}d`}
        </span>
      )}
    </div>
  );
}
