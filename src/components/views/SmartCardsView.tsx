import React from 'react';
import { Order, OrderStatus, STATUSES, ViewPreset, detectOrderType } from '../../types';
import { getOrderAura, AuraColorRule } from '../../theme/auraTheme';
import { OrderPictureCarousel } from '../OrderPictureCarousel';
import { MiniTimelineProgressBar } from '../MiniTimelineProgressBar';
import { 
  Diamond, 
  Medal, 
  Watch, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle,
  FileEdit
} from 'lucide-react';

interface SmartCardsViewProps {
  orders: Order[];
  getClientName: (id: string) => string;
  onOrderClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  preset?: ViewPreset;
  colorRule?: AuraColorRule;
  onUpdateOrder?: (orderId: string, updatedFields: Partial<Order>) => void;
}

export function SmartCardsView({
  orders,
  getClientName,
  onOrderClick,
  onStatusChange,
  preset = 'minimal'
}: SmartCardsViewProps) {
  // 1. Minimal (formerly ultra-minimal: Zen mode) vs 2. Basic (formerly intermediate: workflow progress)
  const isMinimal = preset === 'minimal' || (preset as string) === 'ultra-minimal';

  const getNextStatus = (curr: OrderStatus): OrderStatus => {
    const idx = STATUSES.indexOf(curr);
    return idx >= 0 && idx < STATUSES.length - 1 ? STATUSES[idx + 1] : STATUSES[0];
  };

  const getOrderTypeBadge = (order: Order) => {
    const type = detectOrderType(order);
    switch (type) {
      case 'Ring':
        return { label: 'Ring', icon: <Diamond size={11} className="text-[#ff943c]" />, badge: 'text-amber-950 bg-amber-200 border-amber-400 font-bold' };
      case 'Bracelet':
        return { label: 'Bracelet', icon: <Watch size={11} className="text-cyan-800" />, badge: 'text-cyan-950 bg-cyan-200 border-cyan-400 font-bold' };
      case 'Pendant':
        return { label: 'Pendant', icon: <Medal size={11} className="text-rose-800" />, badge: 'text-rose-950 bg-rose-200 border-rose-400 font-bold' };
      case 'Earring':
        return { label: 'Earring', icon: <Sparkles size={11} className="text-purple-800" />, badge: 'text-purple-950 bg-purple-200 border-purple-400 font-bold' };
    }
  };

  const gridClass = isMinimal
    ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4 overflow-y-auto pb-24"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 overflow-y-auto pb-24";

  return (
    <div className={gridClass}>
      {orders.map((order) => {
        const aura = getOrderAura(order);
        const typeInfo = getOrderTypeBadge(order);
        const nextStatus = getNextStatus(order.status);
        const isOverdue = new Date(order.dueDate) < new Date() && order.status !== 'Delivered';

        const complaintsCount = (order.designerMessages || []).filter(m => !m.resolved && (m.type === 'complaint' || m.type === 'anomaly')).length;
        const correctionsCount = (order.corrections?.length || 0) + (order.designerMessages || []).filter(m => !m.resolved && (m.type === 'change' || m.type === 'correction')).length;

        // ==========================================
        // 1. MINIMAL (Zen Ultra-Minimal Dashboard View)
        // ==========================================
        if (isMinimal) {
          return (
            <div
              key={order.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
              }}
              onClick={() => onOrderClick(order)}
              className={`group flex flex-col rounded-2xl ${aura.glassBg} ${aura.border} transition-all duration-200 ${aura.cardGlow} hover:scale-[1.01] overflow-hidden cursor-pointer select-none`}
            >
              {/* Vibrant Top Color Header with Category Icon */}
              <div className={`px-2.5 py-1.5 ${aura.headerBg} flex items-center justify-between text-[10px]`}>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${aura.dot} ${aura.glowDot}`} />
                  <span className="font-mono font-bold text-slate-900">{order.id}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span title={typeInfo.label}>{typeInfo.icon}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${aura.badge}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Photo Carousel */}
              <div onClick={(e) => e.stopPropagation()} className="p-2 pb-0">
                <OrderPictureCarousel 
                  images={order.images}
                  title={order.title}
                  compact={true}
                  allowZoom={true}
                  aspectRatio="square"
                />
              </div>

              {/* Footer details: Title, Client, Price, and Quick Alerts */}
              <div className="p-2.5 flex items-center justify-between gap-1.5">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-[#ff943c] transition-colors">
                    {order.title}
                  </h4>
                  <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                    {getClientName(order.clientId)}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  {order.value && (
                    <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                      ${(order.value / 1000).toFixed(1)}k
                    </span>
                  )}
                  {/* Icon-only colored pills for complaints & corrections */}
                  {(complaintsCount > 0 || correctionsCount > 0) && (
                    <div className="flex items-center gap-1">
                      {complaintsCount > 0 && (
                        <span 
                          title={`${complaintsCount} complaints requiring attention`} 
                          className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-100 text-rose-900 border border-rose-300"
                        >
                          <AlertTriangle size={9} className="text-rose-600" />
                          <span>{complaintsCount}</span>
                        </span>
                      )}
                      {correctionsCount > 0 && (
                        <span 
                          title={`${correctionsCount} spec changes / corrections`} 
                          className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                        >
                          <FileEdit size={9} className="text-amber-700" />
                          <span>{correctionsCount}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        // ==========================================
        // 2. BASIC (Balanced View with Timeline & Assignees)
        // ==========================================
        return (
          <div
            key={order.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
            }}
            onClick={() => onOrderClick(order)}
            className={`group flex flex-col rounded-2xl ${aura.glassBg} ${aura.border} transition-all duration-200 ${aura.cardGlow} hover:scale-[1.01] overflow-hidden cursor-pointer select-none`}
          >
            {/* Header Banner - Icon only for jewelry type to avoid clutter */}
            <div className={`px-3 py-2 ${aura.headerBg} flex items-center justify-between`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${aura.dot} ${aura.glowDot}`} />
                <span className="text-xs font-mono font-bold text-slate-900">{order.id}</span>
                <span 
                  title={typeInfo.label} 
                  className={`p-1 rounded-full border flex items-center justify-center ${typeInfo.badge}`}
                >
                  {typeInfo.icon}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {order.value && (
                  <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                    ${order.value.toLocaleString()}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${aura.badge}`}>
                  {order.status}
                </span>
              </div>
            </div>

            {/* Photo */}
            <div onClick={(e) => e.stopPropagation()} className="p-3 pb-0">
              <OrderPictureCarousel 
                images={order.images}
                title={order.title}
                compact={true}
                allowZoom={true}
                aspectRatio="video"
              />
            </div>

            {/* Body */}
            <div className="p-3.5 flex-1 flex flex-col justify-between gap-2.5">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#ff943c] transition-colors line-clamp-1">
                  {order.title}
                </h3>
                <div className="flex items-center justify-between mt-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                    {getClientName(order.clientId)}
                  </span>
                  <span className={`font-mono text-[10px] ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    Due {new Date(order.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <MiniTimelineProgressBar currentStatus={order.status} history={order.history} />
              </div>

              {/* Complaints / Corrections Quick Badge Indicators - Icon & Count Only */}
              {(complaintsCount > 0 || correctionsCount > 0) && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {complaintsCount > 0 && (
                    <span 
                      title={`${complaintsCount} complaints`} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300"
                    >
                      <AlertTriangle size={10} className="text-rose-600" />
                      <span>{complaintsCount}</span>
                    </span>
                  )}
                  {correctionsCount > 0 && (
                    <span 
                      title={`${correctionsCount} design changes`} 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300"
                    >
                      <FileEdit size={10} className="text-amber-700" />
                      <span>{correctionsCount}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Team Assignees & Advance Action (Icon Only Button) */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center text-[9px] font-bold" 
                    title={`CAD Designer: ${order.designer || 'Hamza'}`}
                  >
                    {(order.designer || 'H').charAt(0)}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    {order.designer || 'CAD'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(order.id, nextStatus);
                  }}
                  className="flex items-center justify-center w-6 h-6 rounded-full bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-300 transition-colors shadow-2xs cursor-pointer"
                  title={`Advance order to ${nextStatus}`}
                  aria-label={`Advance to ${nextStatus}`}
                >
                  <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
