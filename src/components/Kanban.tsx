import React from 'react';
import { Order, OrderStatus, STATUSES, detectOrderType } from '../types';
import { Diamond, Medal, Watch, Lock, Sparkles, Calendar, User, UserCheck, Hammer, MoreVertical, Clock, AlertTriangle, FileEdit } from 'lucide-react';
import { motion } from 'motion/react';
import { OrderPictureCarousel } from './OrderPictureCarousel';
import { OrderStatusBadge } from './OrderStatusBadge';
import { AuraColorRule, getOrderAura } from '../theme/auraTheme';

interface KanbanProps { 
  getClientName: (id: string) => string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onAssignTeamMember: (orderId: string, role: string, name: string) => void;
  colorRule?: AuraColorRule;
  onUpdateOrder?: (orderId: string, updatedFields: Partial<Order>) => void;
}

export function KanbanBoard({ orders, onOrderClick, onStatusChange, getClientName, onAssignTeamMember, colorRule = 'status', onUpdateOrder }: KanbanProps) {
  return (
    <div className="flex h-full w-full gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300">
      {STATUSES.map((status) => (
        <Column 
          key={status} 
          status={status} 
          orders={orders.filter(o => o.status === status)}
          onOrderClick={onOrderClick}
          onStatusChange={onStatusChange}
          getClientName={getClientName}
          onAssignTeamMember={onAssignTeamMember}
          colorRule={colorRule}
          onUpdateOrder={onUpdateOrder}
        />
      ))}
    </div>
  );
}

interface ColumnProps {
  key?: React.Key;
  getClientName: (id: string) => string;
  status: OrderStatus;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onAssignTeamMember: (orderId: string, role: string, name: string) => void;
  colorRule?: AuraColorRule;
  onUpdateOrder?: (orderId: string, updatedFields: Partial<Order>) => void;
}

function Column({ status, orders, onOrderClick, onStatusChange, getClientName, onAssignTeamMember, colorRule = 'status', onUpdateOrder }: ColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case 'Inbox':
      case 'Inception':
        return 'text-amber-800 border-amber-300 bg-amber-100/80';
      case 'In progress':
      case 'CAD Design':
      case 'Production':
        return 'text-orange-800 border-orange-300 bg-orange-100/80';
      case 'In Review':
      case 'Review':
        return 'text-blue-800 border-blue-300 bg-blue-100/80';
      case 'Delivered':
        return 'text-emerald-800 border-emerald-300 bg-emerald-100/80';
      case 'Backlog':
      default:
        return 'text-slate-700 border-slate-300 bg-slate-100';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'order' && data.id) {
        onStatusChange(data.id, status);
      }
    } catch (err) {
      // Ignore
    }
  };

  return (
    <div 
      className={`flex flex-col min-w-[285px] max-w-[285px] shrink-0 bg-slate-50/80 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3 transition-colors shadow-xs ${
        isDragOver ? 'bg-amber-50/90 border-[#ff943c]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-slate-800 font-bold">{status}</span>
        </div>
        <span className={`text-[10px] font-mono py-0.5 px-2.5 border rounded-full font-bold ${getStatusColor(status)}`}>
          {orders.length}
        </span>
      </div>
      
      <div className="flex flex-col gap-3 overflow-y-auto pr-1 pb-1 scrollbar-thin scrollbar-thumb-slate-300">
        {orders.map((order, idx) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            idx={idx}
            onClick={() => onOrderClick(order)}
            getClientName={getClientName} 
            onAssignTeamMember={onAssignTeamMember}
            colorRule={colorRule}
            onUpdateOrder={onUpdateOrder}
          />
        ))}
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center p-6 text-slate-400 border border-dashed border-slate-200 rounded-xl h-24">
            <span className="text-[10px] uppercase font-bold tracking-widest">No orders</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface OrderCardProps {
  key?: React.Key;
  getClientName: (id: string) => string;
  order: Order;
  idx: number;
  onClick: () => void;
  onAssignTeamMember: (orderId: string, role: string, name: string) => void;
  colorRule?: AuraColorRule;
  onUpdateOrder?: (orderId: string, updatedFields: Partial<Order>) => void;
}

function OrderCard({ order, idx, onClick, getClientName, onAssignTeamMember, colorRule = 'status', onUpdateOrder }: OrderCardProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [isDropTextActive, setIsDropTextActive] = React.useState(false);
  const isOverdue = new Date(order.dueDate) < new Date() && order.status !== 'Delivered';
  const aura = getOrderAura(order, colorRule);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.type === 'team_member') {
          e.stopPropagation();
          onAssignTeamMember(order.id, data.role, data.name);
        }
      }
    } catch (err) {}
  };

  // Drag-and-drop text directly into [Corrections]
  const handleDropText = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropTextActive(false);
    const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
    if (droppedText && droppedText.trim() && onUpdateOrder) {
      const updatedCorrections = [...(order.corrections || []), droppedText.trim()];
      onUpdateOrder(order.id, {
        corrections: updatedCorrections
      });
    }
  };

  const getOrderTypeBadge = (ord: Order) => {
    const type = detectOrderType(ord);
    switch (type) {
      case 'Ring':
        return { label: 'Ring', icon: <Diamond size={11} className="text-[#ff943c]" />, badge: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'Bracelet':
        return { label: 'Bracelet', icon: <Watch size={11} className="text-cyan-700" />, badge: 'text-cyan-800 bg-cyan-50 border-cyan-200' };
      case 'Pendant':
        return { label: 'Pendant', icon: <Medal size={11} className="text-rose-700" />, badge: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'Earring':
        return { label: 'Earring', icon: <Sparkles size={11} className="text-purple-700" />, badge: 'text-purple-800 bg-purple-50 border-purple-200' };
    }
  };

  const typeInfo = getOrderTypeBadge(order);
  const correctionsCount = order.corrections?.length || 0;
  const complaintsCount = (order.designerMessages || []).filter(m => !m.resolved && (m.type === 'complaint' || m.type === 'anomaly')).length;

  return (
    <motion.div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, delay: idx * 0.03 }}
      onClick={onClick}
      className={`group flex flex-col p-3 border transition-all cursor-pointer active:cursor-grabbing rounded-2xl ${aura.glassBg} gap-2 select-none shadow-xs hover:shadow-md ${
        isDragOver ? 'border-[#ff943c] bg-amber-50' : `${aura.border} ${aura.cardGlow}`
      }`}
    >
      {/* Top Header: ID & Category Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${aura.dot} ${aura.glowDot}`} />
          <span className="text-slate-700 font-mono font-bold uppercase tracking-wider text-[10px]">
            {order.id}
          </span>
          <span 
            title={typeInfo.label} 
            className={`p-1 rounded-full border ${typeInfo.badge} flex items-center justify-center`}
          >
            {typeInfo.icon}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {order.value && (
            <span className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">
              ${order.value.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Picture Carousel on Kanban Card */}
      <div onClick={e => e.stopPropagation()}>
        <OrderPictureCarousel 
          images={order.images}
          title={order.title}
          compact={true}
          allowZoom={true}
        />
      </div>
      
      {/* Title */}
      <h4 className="text-xs font-bold tracking-tight uppercase group-hover:text-[#ff943c] transition-colors leading-snug text-slate-900 line-clamp-2">
        {order.title}
      </h4>

      {/* Colored Pill Tags for Complaints & Corrections */}
      {(complaintsCount > 0 || correctionsCount > 0) && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {complaintsCount > 0 && (
            <div 
              title={`${complaintsCount} complaints`} 
              className="px-2 py-0.5 rounded-full border text-[10px] bg-rose-100 border-rose-300 text-rose-900 flex items-center gap-1 font-bold shadow-2xs"
            >
              <AlertTriangle size={10} className="text-rose-600" />
              <span>{complaintsCount}</span>
            </div>
          )}

          <div 
            onClick={e => e.stopPropagation()}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDropTextActive(true); }}
            onDragLeave={() => setIsDropTextActive(false)}
            onDrop={handleDropText}
            className={`px-2 py-0.5 rounded-full border text-[10px] transition-all flex items-center gap-1 cursor-copy font-bold ${
              isDropTextActive 
                ? 'border-amber-500 bg-amber-100 ring-2 ring-amber-300' 
                : 'border-amber-300 bg-amber-100/90 text-amber-900'
            }`}
            title="Drop text here to hand off corrections directly to designer"
          >
            <FileEdit size={10} className="text-amber-700" />
            <span>{correctionsCount}</span>
          </div>
        </div>
      )}

      {/* Client Name & Team Assignees */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[10px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <User size={11} className="text-slate-400 shrink-0" />
          <span className="text-slate-700 font-medium truncate max-w-[110px]">
            {getClientName(order.clientId)}
          </span>
        </div>

        <div className="flex items-center -space-x-1.5 shrink-0">
          {order.closer && (
            <div 
              title={`Sales Closer: ${order.closer}`}
              className="w-5 h-5 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center text-[9px] font-bold shadow-xs"
            >
              {order.closer.charAt(0)}
            </div>
          )}
          {order.designer && (
            <div 
              title={`CAD Designer: ${order.designer}`}
              className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center text-[9px] font-bold shadow-xs"
            >
              {order.designer.charAt(0)}
            </div>
          )}
        </div>
      </div>
      
      {/* Due Date & Revision Pill with OrderStatusBadge */}
      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
        <div className="flex items-center gap-1.5">
          <OrderStatusBadge order={order} variant="dot" size="xs" />
          <span className={`tabular-nums ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}`}>
            {new Date(order.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {order.cadRevisions !== undefined && (
          <span className="text-[9px] px-1 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            R{order.cadRevisions}
          </span>
        )}
      </div>
    </motion.div>
  );
}

