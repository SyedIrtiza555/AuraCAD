import React from 'react';
import { Order, OrderStatus, STATUSES, detectOrderType } from '../../types';
import { MoreHorizontal, ArrowUp, ArrowDown, Diamond, Medal, Watch, Sparkles, Clock, User } from 'lucide-react';
import { OrderPictureCarousel } from '../OrderPictureCarousel';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { AuraColorRule, getOrderAura } from '../../theme/auraTheme';

interface OrderTableProps {
  getClientName: (id: string) => string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  sortConfig: { key: keyof Order; direction: 'asc' | 'desc' } | null;
  onSort: (key: keyof Order) => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  colorRule?: AuraColorRule;
}

export function OrderTable({ orders, onOrderClick, sortConfig, onSort, getClientName, onStatusChange, colorRule = 'status' }: OrderTableProps) {
  const getStatusDotColor = (status: OrderStatus) => {
    switch(status) {
      case 'Inbox':
      case 'Inception':
        return 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)]';
      case 'In progress':
      case 'CAD Design':
      case 'Production':
        return 'bg-[#ff943c] shadow-[0_0_6px_rgba(255,148,60,0.8)]';
      case 'In Review':
      case 'Review':
        return 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.8)]';
      case 'Delivered':
        return 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]';
      case 'Backlog':
      default:
        return 'bg-zinc-400';
    }
  };

  const getOrderTypeBadge = (order: Order) => {
    const type = detectOrderType(order);
    switch (type) {
      case 'Ring':
        return { label: 'Ring', icon: <Diamond size={11} className="text-[#ff943c]" />, badge: 'text-[#ff943c] bg-[#ff943c]/10 border-[#ff943c]/25' };
      case 'Bracelet':
        return { label: 'Bracelet', icon: <Watch size={11} className="text-blue-400" />, badge: 'text-blue-300 bg-blue-500/10 border-blue-500/25' };
      case 'Pendant':
        return { label: 'Pendant', icon: <Medal size={11} className="text-amber-400" />, badge: 'text-amber-300 bg-amber-500/10 border-amber-500/25' };
      case 'Earring':
        return { label: 'Earring', icon: <Sparkles size={11} className="text-purple-400" />, badge: 'text-purple-300 bg-purple-500/10 border-purple-500/25' };
    }
  };

  const getCategoryIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('bracelet') || t.includes('bangle')) return <Watch size={12} className="text-blue-400" />;
    if (t.includes('pendant') || t.includes('necklace') || t.includes('choker')) return <Medal size={12} className="text-amber-400" />;
    if (t.includes('earring') || t.includes('hoop') || t.includes('drop')) return <Sparkles size={12} className="text-purple-400" />;
    return <Diamond size={12} className="text-[#ff943c]" />;
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Order }) => {
    if (sortConfig?.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <ArrowUp size={11} className="inline ml-1 text-[#ff943c]" /> : <ArrowDown size={11} className="inline ml-1 text-[#ff943c]" />;
  };

  const thClass = "py-2.5 px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none";

  return (
    <div className="w-full overflow-x-auto pb-4 rounded-2xl border border-white/10 bg-zinc-900/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.12)]">
      <table className="w-full text-left border-collapse min-w-[950px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.02]">
            <th className="py-2.5 px-3 w-24 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">CAD Visual</th>
            <th className={thClass} onClick={() => onSort('id')}>ID <SortIcon columnKey="id" /></th>
            <th className={thClass} onClick={() => onSort('title')}>Design Brief <SortIcon columnKey="title" /></th>
            <th className={thClass} onClick={() => onSort('clientId')}>Client <SortIcon columnKey="clientId" /></th>
            <th className="py-2.5 px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Assignees</th>
            <th className={thClass} onClick={() => onSort('status')}>Stage <SortIcon columnKey="status" /></th>
            <th className={thClass} onClick={() => onSort('value')}>Value <SortIcon columnKey="value" /></th>
            <th className={thClass} onClick={() => onSort('dueDate')}>Due <SortIcon columnKey="dueDate" /></th>
            <th className="py-2.5 px-3 text-right w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {orders.map(order => {
            const isOverdue = new Date(order.dueDate) < new Date() && order.status !== 'Delivered';
            const currentStageIdx = STATUSES.indexOf(order.status);

            return (
              <tr 
                key={order.id} 
                onClick={() => onOrderClick(order)} 
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
                  e.dataTransfer.effectAllowed = 'move';
                }}
                className="hover:bg-white/[0.04] transition-colors cursor-pointer group active:cursor-grabbing"
              >
                {/* Visual Thumbnail */}
                <td className="py-2 px-3 align-middle" onClick={e => e.stopPropagation()}>
                  <div className="w-20">
                    <OrderPictureCarousel 
                      images={order.images}
                      title={order.title}
                      compact={true}
                      allowZoom={true}
                    />
                  </div>
                </td>

                {/* ID with revision indicator and OrderType badge */}
                <td className="py-2 px-3 align-middle font-mono text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-zinc-300">{order.id}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${getOrderTypeBadge(order).badge}`}>
                      {getOrderTypeBadge(order).label}
                    </span>
                    {order.cadRevisions !== undefined && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        R{order.cadRevisions}
                      </span>
                    )}
                  </div>
                </td>

                {/* Title with Category Icon */}
                <td className="py-2 px-3 align-middle max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 p-1 rounded bg-white/5 border border-white/10">
                      {getCategoryIcon(order.title)}
                    </span>
                    <span className="text-xs font-semibold text-white group-hover:text-[#ff943c] transition-colors line-clamp-1">
                      {order.title}
                    </span>
                  </div>
                </td>

                {/* Client */}
                <td className="py-2 px-3 align-middle text-xs font-medium text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <User size={12} className="text-zinc-500 shrink-0" />
                    <span className="truncate max-w-[120px]">{getClientName(order.clientId)}</span>
                  </div>
                </td>

                {/* Assignees Visual Avatars Stack */}
                <td className="py-2 px-3 align-middle">
                  <div className="flex items-center -space-x-1.5">
                    {order.closer && (
                      <div 
                        className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 flex items-center justify-center text-[9px] font-bold shadow-sm"
                        title={`Sales Closer: ${order.closer}`}
                      >
                        {order.closer.charAt(0)}
                      </div>
                    )}
                    {order.designer && (
                      <div 
                        className="w-5 h-5 rounded-full bg-[#ff943c]/20 border border-[#ff943c]/50 text-[#ff943c] flex items-center justify-center text-[9px] font-bold shadow-sm"
                        title={`CAD Designer: ${order.designer}`}
                      >
                        {order.designer.charAt(0)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Stage with Visual Progress Track */}
                <td className="py-2 px-3 align-middle">
                  <div className="flex flex-col gap-1 min-w-[110px]">
                    <OrderStatusBadge order={order} variant="pill" size="xs" showCountdownHint={true} />
                    {/* Micro 5-step track */}
                    <div className="flex items-center gap-0.5 w-16 mt-0.5">
                      {STATUSES.map((_, i) => (
                        <div 
                          key={i} 
                          className={`h-0.5 flex-1 rounded-full ${
                            i === currentStageIdx ? 'bg-[#ff943c]' : i < currentStageIdx ? 'bg-white/40' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </td>

                {/* Value */}
                <td className="py-2 px-3 align-middle text-xs font-mono font-bold text-white tabular-nums">
                  {order.value ? `$${order.value.toLocaleString()}` : '—'}
                </td>

                {/* Due Date with Visual Urgency */}
                <td className="py-2 px-3 align-middle">
                  <div className="flex items-center gap-1.5">
                    {isOverdue ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping shrink-0" />
                    ) : (
                      <Clock size={11} className="text-zinc-500 shrink-0" />
                    )}
                    <span className={`text-xs font-mono ${isOverdue ? 'text-red-400 font-semibold' : 'text-zinc-400'}`}>
                      {new Date(order.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-2 px-3 align-middle text-right">
                  <button className="text-zinc-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                    <MoreHorizontal size={14} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
          <span className="text-xs font-semibold">No orders found</span>
        </div>
      )}
    </div>
  );
}
