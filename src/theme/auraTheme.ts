// src/theme/auraTheme.ts
import { Order, OrderStatus } from '../types';

export type AuraColorId = 
  | 'amber'   // Pending
  | 'orange'  // Designing
  | 'blue'    // Review
  | 'emerald' // Completed
  | 'slate'   // Default
  | 'purple'  // Urgent / Custom
  | 'rose'    // Cancelled
  | 'cyan';

export type AuraColorRule = 'status' | 'effort' | 'minimal';

export interface AuraColorStyle {
  id: AuraColorId;
  name: string;
  hex: string;
  dot: string;
  glowDot: string;
  border: string;
  glassBg: string;
  cardGlow: string;
  badge: string;
  calChip: string;
  text: string;
  headerBg: string;
  accentBar: string;
}

export const AURA_PALETTE: Record<AuraColorId, AuraColorStyle> = {
  amber: {
    id: 'amber',
    name: 'Sunburst Gold',
    hex: '#f59e0b',
    dot: 'bg-amber-500',
    glowDot: 'shadow-[0_0_8px_rgba(245,158,11,0.9)]',
    border: 'border-2 border-amber-400/90 hover:border-amber-500',
    glassBg: 'bg-[#FFFDF4]',
    cardGlow: 'shadow-[0_6px_22px_rgba(245,158,11,0.2),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-amber-950 bg-amber-200/90 border border-amber-400/80 font-bold',
    calChip: 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200',
    text: 'text-amber-800',
    headerBg: 'bg-gradient-to-r from-amber-200/90 via-amber-100/80 to-amber-50/60 border-b border-amber-300/80',
    accentBar: 'bg-amber-500'
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    hex: '#ff943c',
    dot: 'bg-[#ff943c]',
    glowDot: 'shadow-[0_0_8px_rgba(255,148,60,0.9)]',
    border: 'border-2 border-[#ff943c]/90 hover:border-[#ff943c]',
    glassBg: 'bg-[#FFF9F3]',
    cardGlow: 'shadow-[0_6px_22px_rgba(255,148,60,0.22),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-orange-950 bg-orange-200/90 border border-[#ff943c]/80 font-bold',
    calChip: 'bg-orange-100 text-orange-950 border border-orange-300 hover:bg-orange-200',
    text: 'text-orange-800',
    headerBg: 'bg-gradient-to-r from-orange-200/90 via-orange-100/80 to-orange-50/60 border-b border-orange-300/80',
    accentBar: 'bg-[#ff943c]'
  },
  blue: {
    id: 'blue',
    name: 'Electric Sapphire',
    hex: '#3b82f6',
    dot: 'bg-blue-500',
    glowDot: 'shadow-[0_0_8px_rgba(59,130,246,0.9)]',
    border: 'border-2 border-blue-400/90 hover:border-blue-500',
    glassBg: 'bg-[#F4F9FF]',
    cardGlow: 'shadow-[0_6px_22px_rgba(59,130,246,0.2),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-blue-950 bg-blue-200/90 border border-blue-400/80 font-bold',
    calChip: 'bg-blue-100 text-blue-950 border border-blue-300 hover:bg-blue-200',
    text: 'text-blue-800',
    headerBg: 'bg-gradient-to-r from-blue-200/90 via-blue-100/80 to-blue-50/60 border-b border-blue-300/80',
    accentBar: 'bg-blue-600'
  },
  emerald: {
    id: 'emerald',
    name: 'Mint Emerald',
    hex: '#10b981',
    dot: 'bg-emerald-500',
    glowDot: 'shadow-[0_0_8px_rgba(16,185,129,0.9)]',
    border: 'border-2 border-emerald-400/90 hover:border-emerald-500',
    glassBg: 'bg-[#F2FCF7]',
    cardGlow: 'shadow-[0_6px_22px_rgba(16,185,129,0.2),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-emerald-950 bg-emerald-200/90 border border-emerald-400/80 font-bold',
    calChip: 'bg-emerald-100 text-emerald-950 border border-emerald-300 hover:bg-emerald-200',
    text: 'text-emerald-800',
    headerBg: 'bg-gradient-to-r from-emerald-200/90 via-emerald-100/80 to-emerald-50/60 border-b border-emerald-300/80',
    accentBar: 'bg-emerald-600'
  },
  purple: {
    id: 'purple',
    name: 'Imperial Amethyst',
    hex: '#8b5cf6',
    dot: 'bg-purple-500',
    glowDot: 'shadow-[0_0_8px_rgba(139,92,246,0.9)]',
    border: 'border-2 border-purple-400/90 hover:border-purple-500',
    glassBg: 'bg-[#FAF5FF]',
    cardGlow: 'shadow-[0_6px_22px_rgba(139,92,246,0.2),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-purple-950 bg-purple-200/90 border border-purple-400/80 font-bold',
    calChip: 'bg-purple-100 text-purple-950 border border-purple-300 hover:bg-purple-200',
    text: 'text-purple-800',
    headerBg: 'bg-gradient-to-r from-purple-200/90 via-purple-100/80 to-purple-50/60 border-b border-purple-300/80',
    accentBar: 'bg-purple-600'
  },
  rose: {
    id: 'rose',
    name: 'Ruby Rose',
    hex: '#f43f5e',
    dot: 'bg-rose-500',
    glowDot: 'shadow-[0_0_8px_rgba(244,63,94,0.9)]',
    border: 'border-2 border-rose-400/90 hover:border-rose-500',
    glassBg: 'bg-[#FFF1F2]',
    cardGlow: 'shadow-[0_6px_22px_rgba(244,63,94,0.2),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-rose-950 bg-rose-200/90 border border-rose-400/80 font-bold',
    calChip: 'bg-rose-100 text-rose-950 border border-rose-300 hover:bg-rose-200',
    text: 'text-rose-800',
    headerBg: 'bg-gradient-to-r from-rose-200/90 via-rose-100/80 to-rose-50/60 border-b border-rose-300/80',
    accentBar: 'bg-rose-600'
  },
  slate: {
    id: 'slate',
    name: 'Moon Slate',
    hex: '#64748b',
    dot: 'bg-slate-500',
    glowDot: 'shadow-[0_0_8px_rgba(100,116,139,0.7)]',
    border: 'border-2 border-slate-300 hover:border-slate-400',
    glassBg: 'bg-slate-50',
    cardGlow: 'shadow-[0_4px_16px_rgba(100,116,139,0.12),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-slate-800 bg-slate-200 border border-slate-300 font-bold',
    calChip: 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200',
    text: 'text-slate-700',
    headerBg: 'bg-gradient-to-r from-slate-200/90 via-slate-100/80 to-slate-50/60 border-b border-slate-300/80',
    accentBar: 'bg-slate-600'
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Turquoise',
    hex: '#06b6d4',
    dot: 'bg-cyan-500',
    glowDot: 'shadow-[0_0_8px_rgba(6,182,212,0.9)]',
    border: 'border-2 border-cyan-400/90 hover:border-cyan-500',
    glassBg: 'bg-[#F0FDFA]',
    cardGlow: 'shadow-[0_6px_22px_rgba(6,182,212,0.2),0_1px_3px_rgba(0,0,0,0.05)]',
    badge: 'text-cyan-950 bg-cyan-200/90 border border-cyan-400/80 font-bold',
    calChip: 'bg-cyan-100 text-cyan-950 border border-cyan-300 hover:bg-cyan-200',
    text: 'text-cyan-800',
    headerBg: 'bg-gradient-to-r from-cyan-200/90 via-cyan-100/80 to-cyan-50/60 border-b border-cyan-300/80',
    accentBar: 'bg-cyan-600'
  }
};

export function getStatusAura(status: OrderStatus): AuraColorStyle {
  switch (status) {
    case 'Pending':
      return AURA_PALETTE.amber;
    case 'Designing':
      return AURA_PALETTE.orange;
    case 'Review':
      return AURA_PALETTE.blue;
    case 'Completed':
      return AURA_PALETTE.emerald;
    case 'Cancelled':
      return AURA_PALETTE.rose;
    default:
      return AURA_PALETTE.slate;
  }
}

export function getOrderAura(order: Order): AuraColorStyle {
  return getStatusAura(order.status);
}
