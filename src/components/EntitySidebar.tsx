import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Diamond, 
  Medal, 
  Watch, 
  Sparkles, 
  User, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Maximize2, 
  PanelRight, 
  PanelRightClose, 
  ExternalLink, 
  Clock, 
  Upload, 
  ChevronRight, 
  Check, 
  Plus, 
  FileText,
  Mail,
  Phone,
  Shield,
  Tag
} from 'lucide-react';
import { 
  Order, 
  Client, 
  OrderStatus, 
  OrderType, 
  STATUSES, 
  ORDER_TYPES, 
  SALES_AGENTS, 
  CAD_DESIGNERS, 
  PRODUCTION_FORGES, 
  detectOrderType,
  normalizeStatus
} from '../types';
import { OrderStatusBadge } from './OrderStatusBadge';
import { MiniTimelineProgressBar } from './MiniTimelineProgressBar';
import { OrderPictureCarousel } from './OrderPictureCarousel';
import { DesignerFeedbackHub } from './DesignerFeedbackHub';
import { AuraColorId, AURA_PALETTE, ALL_AURA_COLORS, getOrderAura } from '../theme/auraTheme';

export type PeekMode = 'sidebar' | 'center';

export interface ActiveEntity {
  type: 'order' | 'client';
  id?: string | null;
  isNew?: boolean;
}

interface EntitySidebarProps {
  activeEntity: ActiveEntity | null;
  onClose: () => void;
  orders: Order[];
  clients: Client[];
  onSaveOrder: (order: Partial<Order>) => void;
  onSaveClient: (client: Partial<Client>) => void;
  onSelectEntity: (entity: ActiveEntity) => void;
  peekMode?: PeekMode;
  onTogglePeekMode?: (mode: PeekMode) => void;
}

export function EntitySidebar({
  activeEntity,
  onClose,
  orders,
  clients,
  onSaveOrder,
  onSaveClient,
  onSelectEntity,
  peekMode = 'sidebar',
  onTogglePeekMode
}: EntitySidebarProps) {
  // Local peek mode state with persistent storage
  const [currentPeekMode, setCurrentPeekMode] = useState<PeekMode>(() => {
    return (localStorage.getItem('aydieo_entity_peek_mode') as PeekMode) || peekMode || 'sidebar';
  });

  const handleSetPeekMode = (mode: PeekMode) => {
    setCurrentPeekMode(mode);
    localStorage.setItem('aydieo_entity_peek_mode', mode);
    if (onTogglePeekMode) onTogglePeekMode(mode);
  };

  // Find active data
  const currentOrder = activeEntity?.type === 'order' && activeEntity.id
    ? orders.find(o => o.id === activeEntity.id) || null
    : null;

  const currentClient = activeEntity?.type === 'client' && activeEntity.id
    ? clients.find(c => c.id === activeEntity.id) || null
    : null;

  const isNewOrder = activeEntity?.type === 'order' && activeEntity.isNew;
  const isNewClient = activeEntity?.type === 'client' && activeEntity.isNew;

  // Order form state
  const [orderForm, setOrderForm] = useState<Partial<Order>>({
    title: '',
    clientId: '',
    closer: 'Alex',
    designer: 'Abdullah',
    production: 'Marcus Forge',
    status: 'Inbox',
    orderType: 'Ring',
    priority: 'Medium',
    value: 5000,
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    notes: '',
    images: []
  });

  // Client form state
  const [clientForm, setClientForm] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    status: 'Active',
    notes: ''
  });

  // Drag and drop for images
  const [isDragging, setIsDragging] = useState(false);

  // Sync form when active entity changes
  useEffect(() => {
    if (activeEntity?.type === 'order') {
      if (currentOrder) {
        setOrderForm({
          ...currentOrder,
          status: normalizeStatus(currentOrder.status),
          orderType: detectOrderType(currentOrder),
          dueDate: (currentOrder.dueDate || '').split('T')[0],
          color: currentOrder.color
        });
      } else {
        setOrderForm({
          title: '',
          clientId: clients[0]?.id || '',
          closer: 'Alex',
          designer: 'Abdullah',
          production: 'Marcus Forge',
          status: 'Inbox',
          orderType: 'Ring',
          priority: 'Medium',
          value: 6500,
          dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          notes: '',
          images: [
            'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
          ]
        });
      }
    } else if (activeEntity?.type === 'client') {
      if (currentClient) {
        setClientForm({ ...currentClient });
      } else {
        setClientForm({
          name: '',
          email: '',
          phone: '',
          status: 'Active',
          notes: ''
        });
      }
    }
  }, [activeEntity, currentOrder, currentClient]);

  if (!activeEntity) return null;

  const handleDropFiles = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files) as File[];
      const newImages = files
        .filter(f => f.type.startsWith('image/'))
        .map(f => URL.createObjectURL(f));
      setOrderForm(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newImages]
      }));
    }
  };

  const handleSaveOrderSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderForm.title?.trim()) return;
    onSaveOrder({
      ...orderForm,
      status: normalizeStatus(orderForm.status),
      orderType: orderForm.orderType || 'Ring'
    });
    onClose();
  };

  const handleSaveClientSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!clientForm.name?.trim()) return;
    onSaveClient(clientForm);
    onClose();
  };

  // Connected orders for client
  const clientOrders = currentClient ? orders.filter(o => o.clientId === currentClient.id) : [];

  // Order type metadata
  const getOrderTypeOption = (type: OrderType) => {
    switch (type) {
      case 'Ring': return { icon: <Diamond size={13} className="text-[#ff943c]" />, color: 'text-[#ff943c] border-[#ff943c]/40 bg-[#ff943c]/10' };
      case 'Bracelet': return { icon: <Watch size={13} className="text-blue-400" />, color: 'text-blue-300 border-blue-500/40 bg-blue-500/10' };
      case 'Pendant': return { icon: <Medal size={13} className="text-amber-400" />, color: 'text-amber-300 border-amber-500/40 bg-amber-500/10' };
      case 'Earring': return { icon: <Sparkles size={13} className="text-purple-400" />, color: 'text-purple-300 border-purple-500/40 bg-purple-500/10' };
    }
  };

  // Status color styles matching user specification:
  // Inbox: Yellow, In progress: Orange, In Review: Blue, Delivered: Green, Backlog: Grey
  const getStatusOptionStyle = (st: OrderStatus) => {
    switch (st) {
      case 'Inbox':
        return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/30';
      case 'In progress':
        return 'text-[#ff943c] bg-[#ff943c]/10 border-[#ff943c]/30';
      case 'In Review':
        return 'text-blue-300 bg-blue-500/10 border-blue-500/30';
      case 'Delivered':
        return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';
      case 'Backlog':
      default:
        return 'text-zinc-300 bg-white/5 border-white/10';
    }
  };

  const isCenterPeek = currentPeekMode === 'center';

  const entityAura = activeEntity.type === 'order'
    ? getOrderAura({ ...(currentOrder || {}), ...orderForm } as Order, orderForm.color ? 'manual' : 'status')
    : (clientForm.color && AURA_PALETTE[clientForm.color as AuraColorId] ? AURA_PALETTE[clientForm.color as AuraColorId] : AURA_PALETTE.blue);

  return (
    <AnimatePresence>
      <div 
        className={
          isCenterPeek
            ? "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            : "fixed inset-0 z-50 pointer-events-none"
        }
      >
        {/* Backdrop: Only visible in center peek or subtle on mobile */}
        {isCenterPeek ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
          />
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/25 backdrop-blur-[1px] md:hidden pointer-events-auto"
          />
        )}

        {/* Panel Container: Docked on Right in Sidebar Mode, Centered Dialog in Center Peek Mode */}
        <div 
          className={
            isCenterPeek 
              ? "relative w-full max-w-2xl max-h-[90vh] pointer-events-auto z-10" 
              : "fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 pointer-events-auto z-10"
          }
        >
          <motion.div 
            initial={isCenterPeek ? { opacity: 0, scale: 0.96 } : { x: '100%' }}
            animate={isCenterPeek ? { opacity: 1, scale: 1 } : { x: 0 }}
            exit={isCenterPeek ? { opacity: 0, scale: 0.96 } : { x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`flex flex-col h-full bg-white/95 backdrop-blur-3xl border-l border-slate-200/90 ${entityAura.cardGlow} overflow-hidden ${
              isCenterPeek 
                ? "rounded-3xl border border-slate-200 shadow-2xl max-h-[88vh]" 
                : "w-screen max-w-md md:max-w-lg xl:max-w-xl 2xl:max-w-2xl"
            }`}
          >
            {/* Header: Entity Meta, Peek Mode Switcher, Close Button */}
            <div className={`flex items-center justify-between p-4 px-5 border-b border-slate-100 ${entityAura.glassBg} shrink-0`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`p-2 rounded-xl ${entityAura.badge} shadow-xs flex items-center justify-center`}>
                  {activeEntity.type === 'order' ? <Diamond size={15} /> : <User size={15} />}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">
                      {activeEntity.type === 'order' ? 'Order Details' : 'Client Profile'}
                    </span>
                    {activeEntity.id && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-slate-700">
                        {activeEntity.id}
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                    {activeEntity.type === 'order' 
                      ? (isNewOrder ? 'Create New Order' : orderForm.title || currentOrder?.title || 'Order Inspector')
                      : (isNewClient ? 'Create New Client' : clientForm.name || currentClient?.name || 'Client Details')
                    }
                  </h2>
                </div>
              </div>

              {/* Action Controls: Peek Mode Toggle & Close */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Peek Mode Switcher: Dock to Sidebar vs Center Peek */}
                <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSetPeekMode('sidebar')}
                    className={`p-1.5 rounded-md transition-all ${
                      !isCenterPeek 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Docked Sidebar (Side Peek) - Set as persistent default"
                  >
                    <PanelRight size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetPeekMode('center')}
                    className={`p-1.5 rounded-md transition-all ${
                      isCenterPeek 
                        ? 'bg-white text-slate-900 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Center Peek (Modal)"
                  >
                    <Maximize2 size={13} />
                  </button>
                </div>

                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
              {/* ========================================================= */}
              {/* ORDER ENTITY FORM & VIEWER */}
              {/* ========================================================= */}
              {activeEntity.type === 'order' && (
                <form onSubmit={handleSaveOrderSubmit} className="space-y-5">
                  {/* Title & Order Type */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Design Brief / Title *
                      </label>
                      <input 
                        type="text"
                        required
                        value={orderForm.title || ''}
                        onChange={e => setOrderForm({ ...orderForm, title: e.target.value })}
                        placeholder="e.g. Diamond Solitaire Engagement Ring"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Order Type Selector: Ring, Bracelet, Pendant, Earring */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        [Order Type]
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {ORDER_TYPES.map(type => {
                          const opt = getOrderTypeOption(type);
                          const isSelected = (orderForm.orderType || 'Ring') === type;
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => setOrderForm({ ...orderForm, orderType: type })}
                              className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected 
                                  ? `${opt.color} ring-1 ring-slate-300 shadow-xs scale-[1.01]` 
                                  : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              {opt.icon}
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Order Status Selector with Exact Specified Colors */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        [Order Status]
                      </label>
                      {currentOrder && (
                        <OrderStatusBadge 
                          order={{ 
                            status: orderForm.status || 'Inbox', 
                            dueDate: orderForm.dueDate || currentOrder.dueDate, 
                            createdAt: currentOrder.createdAt 
                          }}
                          variant="pill"
                          size="xs"
                          showCountdownHint={true}
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {STATUSES.map(st => {
                        const isSelected = (orderForm.status || 'Inbox') === st;
                        const styleClass = getStatusOptionStyle(st);
                        return (
                          <button
                            type="button"
                            key={st}
                            onClick={() => setOrderForm({ ...orderForm, status: st })}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                              isSelected 
                                ? `${styleClass} ring-2 ring-slate-400 shadow-sm scale-[1.02]` 
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {isSelected && <Check size={11} strokeWidth={3} />}
                              <span>{st}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mini Timeline Stage Relative to Total Flow */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                    <MiniTimelineProgressBar 
                      currentStatus={orderForm.status || 'Inbox'} 
                      history={orderForm.history}
                    />
                  </div>

                  {/* Aura Liquid Glass Tint (Custom Manual or Rule-Based) */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                        <Sparkles size={12} className="text-[#ff943c]" />
                        <span>Aura Tint Preset</span>
                      </label>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {orderForm.color && AURA_PALETTE[orderForm.color as AuraColorId] 
                          ? AURA_PALETTE[orderForm.color as AuraColorId].name 
                          : 'Auto (By Rule)'}
                      </span>
                    </div>

                    <select
                      value={orderForm.color || ''}
                      onChange={e => setOrderForm({ ...orderForm, color: e.target.value || undefined })}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff943c] cursor-pointer transition-colors"
                    >
                      <option value="">Auto (Follows Active Rule)</option>
                      {ALL_AURA_COLORS.map(cId => {
                        const pal = AURA_PALETTE[cId];
                        return (
                          <option key={cId} value={cId}>
                            {pal.name}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Client Select & Quick Jump */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Client *
                        </label>
                        {orderForm.clientId && (
                          <button
                            type="button"
                            onClick={() => onSelectEntity({ type: 'client', id: orderForm.clientId })}
                            className="text-[10px] text-[#ff943c] hover:underline flex items-center gap-0.5 font-medium"
                          >
                            <span>View Profile</span>
                            <ExternalLink size={9} />
                          </button>
                        )}
                      </div>
                      <select
                        value={orderForm.clientId || ''}
                        onChange={e => setOrderForm({ ...orderForm, clientId: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff943c]"
                      >
                        <option value="">Select Client</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Target Due Date
                      </label>
                      <input 
                        type="date"
                        value={orderForm.dueDate || ''}
                        onChange={e => setOrderForm({ ...orderForm, dueDate: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#ff943c]"
                      />
                    </div>
                  </div>

                  {/* Value & Value Fluctuations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Order Value ($)
                      </label>
                      <div className="relative">
                        <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="number"
                          value={orderForm.value || ''}
                          onChange={e => setOrderForm({ ...orderForm, value: Number(e.target.value) })}
                          placeholder="e.g. 8500"
                          className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-mono font-semibold text-emerald-700 focus:outline-none focus:border-[#ff943c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Value Fluctuation (%)
                      </label>
                      <input 
                        type="number"
                        step="0.1"
                        value={orderForm.valueTrend?.percentage ?? 0}
                        onChange={e => setOrderForm({ 
                          ...orderForm, 
                          valueTrend: { 
                            percentage: Number(e.target.value),
                            direction: Number(e.target.value) >= 0 ? 'up' : 'down',
                            reason: orderForm.valueTrend?.reason || 'Scope variation'
                          } 
                        })}
                        placeholder="e.g. 5.2"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-[#ff943c]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Priority Level
                      </label>
                      <select
                        value={orderForm.priority || 'Medium'}
                        onChange={e => setOrderForm({ ...orderForm, priority: e.target.value as any })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff943c]"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Team Assignees */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Sales Closer
                      </label>
                      <select
                        value={orderForm.closer || ''}
                        onChange={e => setOrderForm({ ...orderForm, closer: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        {SALES_AGENTS.map(agent => (
                          <option key={agent} value={agent}>{agent}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        CAD Designer
                      </label>
                      <select
                        value={orderForm.designer || ''}
                        onChange={e => setOrderForm({ ...orderForm, designer: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        {CAD_DESIGNERS.map(designer => (
                          <option key={designer} value={designer}>{designer}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Production Forge
                      </label>
                      <select
                        value={orderForm.production || ''}
                        onChange={e => setOrderForm({ ...orderForm, production: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                      >
                        {PRODUCTION_FORGES.map(forge => (
                          <option key={forge} value={forge}>{forge}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* CAD Images Carousel & Dropzone */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Visual Assets & Renders ({orderForm.images?.length || 0})
                    </label>

                    {orderForm.images && orderForm.images.length > 0 && (
                      <div className="mb-3 rounded-2xl overflow-hidden border border-slate-200">
                        <OrderPictureCarousel 
                          images={orderForm.images}
                          title={orderForm.title || 'Preview'}
                          aspectRatio="video"
                          compact={false}
                          allowZoom={true}
                        />
                      </div>
                    )}

                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDropFiles}
                      className={`p-4 rounded-xl border border-dashed text-center transition-all cursor-pointer ${
                        isDragging ? 'border-[#ff943c] bg-amber-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <Upload size={18} className="mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-semibold text-slate-700">Drag & drop CAD renders here</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WebP supported</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Production Notes & Client Specifications
                    </label>
                    <textarea 
                      rows={3}
                      value={orderForm.notes || ''}
                      onChange={e => setOrderForm({ ...orderForm, notes: e.target.value })}
                      placeholder="Specify carat weight, gold alloy, ring size, or custom engravings..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:bg-white resize-none"
                    />
                  </div>

                  {/* ========================================================= */}
                  {/* UNIFIED 1 CARD UNDER THE ORDER ENTITY: */}
                  {/* [Corrections] Input Box (drag-drop) + All other messages */}
                  {/* ========================================================= */}
                  <div className="pt-2">
                    <DesignerFeedbackHub 
                      order={{ ...(currentOrder || {}), ...orderForm } as Order}
                      onUpdateOrder={(fields) => {
                        setOrderForm(prev => ({ ...prev, ...fields }));
                        if (activeEntity.id) {
                          onSaveOrder(fields);
                        }
                      }}
                    />
                  </div>

                  {/* Bottom Save Action */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button 
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>{isNewOrder ? 'Create Order' : 'Save Changes'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* CLIENT ENTITY FORM & VIEWER */}
              {/* ========================================================= */}
              {activeEntity.type === 'client' && (
                <form onSubmit={handleSaveClientSubmit} className="space-y-5">
                  {/* Name & Status */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Client Full Name *
                      </label>
                      <input 
                        type="text"
                        required
                        value={clientForm.name || ''}
                        onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                        placeholder="e.g. Julian Vance"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="email"
                            value={clientForm.email || ''}
                            onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                            placeholder="julian@example.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                            type="tel"
                            value={clientForm.phone || ''}
                            onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                            placeholder="+1 (555) 019-2834"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Client Status
                      </label>
                      <div className="flex items-center gap-2">
                        {(['Active', 'Lead', 'Inactive'] as const).map(st => (
                          <button
                            type="button"
                            key={st}
                            onClick={() => setClientForm({ ...clientForm, status: st })}
                            className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                              clientForm.status === st
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Client Aura VIP Glass Tint */}
                    <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          <Sparkles size={12} className="text-[#ff943c]" />
                          <span>Client VIP Tint</span>
                        </label>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {clientForm.color && AURA_PALETTE[clientForm.color as AuraColorId] 
                            ? AURA_PALETTE[clientForm.color as AuraColorId].name 
                            : 'Default Sapphire'}
                        </span>
                      </div>

                      <select
                        value={clientForm.color || ''}
                        onChange={e => setClientForm({ ...clientForm, color: e.target.value || undefined })}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff943c] cursor-pointer transition-colors"
                      >
                        <option value="">Default Sapphire</option>
                        {ALL_AURA_COLORS.map(cId => {
                          const pal = AURA_PALETTE[cId];
                          return (
                            <option key={cId} value={cId}>
                              {pal.name}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Notes & Style Preferences */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Client Preferences & History Notes
                    </label>
                    <textarea 
                      rows={3}
                      value={clientForm.notes || ''}
                      onChange={e => setClientForm({ ...clientForm, notes: e.target.value })}
                      placeholder="e.g. Loves Art Deco geometries, prefers lab-grown diamonds, ring size 6.5..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:bg-white resize-none"
                    />
                  </div>

                  {/* Connected Orders for this Client */}
                  {currentClient && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Connected Jewelry Orders ({clientOrders.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectEntity({ type: 'order', isNew: true });
                          }}
                          className="text-[10px] text-[#ff943c] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <Plus size={10} />
                          <span>New Order for Client</span>
                        </button>
                      </div>

                      {clientOrders.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                          No orders on record for this client yet.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {clientOrders.map(ord => (
                            <div 
                              key={ord.id}
                              onClick={() => onSelectEntity({ type: 'order', id: ord.id })}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {ord.images && ord.images[0] ? (
                                  <img src={ord.images[0]} alt="cad" className="w-8 h-8 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500">
                                    <Diamond size={13} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-semibold text-slate-900 block truncate group-hover:text-[#ff943c] transition-colors">
                                    {ord.title}
                                  </span>
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                                    <span>{ord.id}</span>
                                    <span>•</span>
                                    <span className="text-slate-700">{ord.status}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {ord.value && (
                                  <span className="font-mono text-emerald-600 font-semibold text-xs">
                                    ${ord.value.toLocaleString()}
                                  </span>
                                )}
                                <ChevronRight size={13} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bottom Save Action */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    <button 
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check size={13} strokeWidth={3} />
                      <span>{isNewClient ? 'Create Client' : 'Save Client'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
