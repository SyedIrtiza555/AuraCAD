import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Order, DesignerMessage, DesignerMessageType, DesignerMessageComment, CAD_DESIGNERS } from '../../types';
import { 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle2, 
  Archive, 
  Send, 
  X, 
  Search, 
  Sparkles, 
  ShieldAlert, 
  Eye,
  EyeOff,
  Inbox,
  CornerDownLeft,
  Check,
  Hash,
  FileEdit,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ComplaintsViewProps {
  orders: Order[];
  getClientName: (id: string) => string;
  onUpdateOrder: (orderId: string, updatedFields: Partial<Order>) => void;
  onSelectOrder: (order: Order) => void;
}

export function ComplaintsView({
  orders,
  getClientName,
  onUpdateOrder,
  onSelectOrder
}: ComplaintsViewProps) {
  const [selectedDesigner, setSelectedDesigner] = useState<string>('All');
  const [triageFilter, setTriageFilter] = useState<'all' | 'unread' | 'complaints' | 'changes' | 'anomalies' | 'resolved' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Composer state for bottom chat bar
  const [composerOrderId, setComposerOrderId] = useState<string>(orders[0]?.id || '');
  const [composerType, setComposerType] = useState<DesignerMessageType>('complaint');
  const [composerText, setComposerText] = useState('');
  const [composerSender, setComposerSender] = useState('Client via Closer');

  // In-thread reply inputs
  const [replyInputId, setReplyInputId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Flatten all messages across orders with order context
  const allMessages = useMemo(() => {
    const list: Array<{
      order: Order;
      message: DesignerMessage;
    }> = [];

    orders.forEach(order => {
      const existingTexts = new Set((order.designerMessages || []).map(m => m.text));

      (order.designerMessages || []).forEach(msg => {
        list.push({ order, message: msg });
      });

      // Wrap legacy corrections
      (order.corrections || []).forEach((corr, idx) => {
        if (!existingTexts.has(corr)) {
          list.push({
            order,
            message: {
              id: `corr-${order.id}-${idx}`,
              type: 'correction',
              text: corr,
              sender: 'Studio Spec',
              createdAt: order.createdAt || new Date().toISOString(),
              resolved: false,
              isUnread: false,
              severity: 'normal'
            }
          });
        }
      });
    });

    // Chronological order: oldest to newest for standard single chat thread stream
    return list.sort((a, b) => new Date(a.message.createdAt).getTime() - new Date(b.message.createdAt).getTime());
  }, [orders]);

  // Filtered thread
  const filteredMessages = useMemo(() => {
    return allMessages.filter(({ order, message }) => {
      // Designer filter
      if (selectedDesigner !== 'All' && order.designer !== selectedDesigner) {
        return false;
      }

      // Triage status filter
      if (triageFilter === 'unread') {
        if (message.isArchived || !message.isUnread) return false;
      } else if (triageFilter === 'complaints') {
        if (message.isArchived || message.type !== 'complaint') return false;
      } else if (triageFilter === 'changes') {
        if (message.isArchived || (message.type !== 'change' && message.type !== 'correction')) return false;
      } else if (triageFilter === 'anomalies') {
        if (message.isArchived || message.type !== 'anomaly') return false;
      } else if (triageFilter === 'resolved') {
        if (!message.resolved || message.isArchived) return false;
      } else if (triageFilter === 'archived') {
        if (!message.isArchived) return false;
      } else {
        // 'all' hides archived by default
        if (message.isArchived) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientName = getClientName(order.clientId).toLowerCase();
        return (
          order.id.toLowerCase().includes(q) ||
          order.title.toLowerCase().includes(q) ||
          clientName.includes(q) ||
          message.text.toLowerCase().includes(q) ||
          message.sender.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [allMessages, selectedDesigner, triageFilter, searchQuery, getClientName]);

  const unreadCount = allMessages.filter(m => !m.message.isArchived && m.message.isUnread).length;
  const complaintsCount = allMessages.filter(m => !m.message.isArchived && !m.message.resolved && m.message.type === 'complaint').length;

  // Actions
  const handleToggleUnread = (order: Order, messageId: string) => {
    const updated = (order.designerMessages || []).map(m => {
      if (m.id === messageId) {
        return { ...m, isUnread: !m.isUnread };
      }
      return m;
    });
    onUpdateOrder(order.id, { designerMessages: updated });
  };

  const handleToggleArchive = (order: Order, messageId: string) => {
    const updated = (order.designerMessages || []).map(m => {
      if (m.id === messageId) {
        return { ...m, isArchived: !m.isArchived };
      }
      return m;
    });
    onUpdateOrder(order.id, { designerMessages: updated });
  };

  const handleToggleResolved = (order: Order, messageId: string) => {
    const updated = (order.designerMessages || []).map(m => {
      if (m.id === messageId) {
        return { ...m, resolved: !m.resolved, isUnread: false };
      }
      return m;
    });
    onUpdateOrder(order.id, { designerMessages: updated });
  };

  const handleSendReply = (order: Order, messageId: string) => {
    if (!replyText.trim()) return;

    const newComment: DesignerMessageComment = {
      id: uuidv4(),
      author: `${order.designer || 'CAD Modeler'}`,
      text: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = (order.designerMessages || []).map(m => {
      if (m.id === messageId) {
        return {
          ...m,
          isUnread: false,
          comments: [...(m.comments || []), newComment]
        };
      }
      return m;
    });

    onUpdateOrder(order.id, { designerMessages: updated });
    setReplyText('');
    setReplyInputId(null);
  };

  const handlePostNewMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!composerText.trim() || !composerOrderId) return;

    const targetOrder = orders.find(o => o.id === composerOrderId);
    if (!targetOrder) return;

    const newMsg: DesignerMessage = {
      id: uuidv4(),
      type: composerType,
      severity: composerType === 'complaint' ? 'critical' : 'normal',
      sender: composerSender.trim() || 'Client via Closer',
      text: composerText.trim(),
      createdAt: new Date().toISOString(),
      resolved: false,
      isUnread: true,
      comments: []
    };

    onUpdateOrder(targetOrder.id, {
      designerMessages: [...(targetOrder.designerMessages || []), newMsg]
    });

    setComposerText('');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Colored Pill Tags and Icons configuration
  const getTypeTag = (type: DesignerMessageType) => {
    switch (type) {
      case 'complaint':
        return { 
          label: 'Complaint', 
          pill: 'bg-rose-100 text-rose-800 border-rose-300 font-bold', 
          icon: <AlertTriangle size={11} className="text-rose-600" /> 
        };
      case 'change':
        return { 
          label: 'Change', 
          pill: 'bg-amber-100 text-amber-800 border-amber-300 font-bold', 
          icon: <Sparkles size={11} className="text-amber-600" /> 
        };
      case 'anomaly':
        return { 
          label: 'Anomaly', 
          pill: 'bg-purple-100 text-purple-800 border-purple-300 font-bold', 
          icon: <ShieldAlert size={11} className="text-purple-600" /> 
        };
      case 'query':
        return { 
          label: 'Query', 
          pill: 'bg-sky-100 text-sky-800 border-sky-300 font-bold', 
          icon: <MessageSquare size={11} className="text-sky-600" /> 
        };
      case 'correction':
      default:
        return { 
          label: 'Correction', 
          pill: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold', 
          icon: <FileEdit size={11} className="text-emerald-600" /> 
        };
    }
  };

  const triageTabs = [
    { id: 'all', label: 'All', icon: null, badge: null },
    { id: 'unread', label: 'Unread', icon: <EyeOff size={11} />, badge: unreadCount > 0 ? unreadCount : null },
    { id: 'complaints', label: 'Complaints', icon: <AlertTriangle size={11} className="text-rose-500" />, badge: complaintsCount > 0 ? complaintsCount : null },
    { id: 'changes', label: 'Changes', icon: <Sparkles size={11} className="text-amber-500" />, badge: null },
    { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 size={11} className="text-emerald-500" />, badge: null },
    { id: 'archived', label: 'Archived', icon: <Archive size={11} className="text-slate-400" />, badge: null },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm max-w-5xl mx-auto overflow-hidden text-slate-800">
      {/* Chat Header & Triage Bar */}
      <div className="p-3 sm:px-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
            <AlertTriangle size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                Complaints & Changes Thread
              </h2>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-500 text-white shadow-2xs">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              Live chronological message thread & CAD handoff
            </span>
          </div>
        </div>

        {/* Triage & Designer Quick Filter Icons / Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-200/80 text-[11px]">
            {triageTabs.map(tab => {
              const active = triageFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTriageFilter(tab.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-semibold ${
                    active ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Filter by ${tab.label}`}
                >
                  {tab.icon}
                  <span className="capitalize">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1 py-0.1 text-[9px] font-mono rounded-full bg-rose-100 text-rose-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Designer Selector */}
          <select
            value={selectedDesigner}
            onChange={e => setSelectedDesigner(e.target.value)}
            className="bg-white border border-slate-200 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-700 focus:outline-none focus:border-[#ff943c] cursor-pointer shadow-2xs"
            title="Filter by CAD Modeler"
          >
            <option value="All">All Modelers</option>
            {CAD_DESIGNERS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Quick search input */}
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search thread..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-28 sm:w-36 pl-6 pr-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c]"
            />
          </div>
        </div>
      </div>

      {/* Chat Messages Stream (Single Thread) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-gradient-to-b from-[#FAFBFD] to-white">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <Inbox size={32} className="text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-700">No Messages in this Thread</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the chat composer below to post a complaint, change request, or spec note.</p>
          </div>
        ) : (
          filteredMessages.map(({ order, message }) => {
            const tag = getTypeTag(message.type);
            const clientName = getClientName(order.clientId);
            const isUnread = !!message.isUnread;
            const isResolved = !!message.resolved;

            return (
              <div 
                key={message.id}
                className={`group flex items-start gap-3 p-3.5 rounded-2xl border transition-all ${
                  isUnread
                    ? 'bg-[#FFFDF4] border-2 border-amber-400/90 shadow-xs'
                    : isResolved
                    ? 'bg-slate-50/70 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Sender Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs mt-0.5">
                  <User size={14} />
                </div>

                {/* Message Content & Bubble */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Top Line: Sender, Colored Pill Tag, Order Link, Time, Triage Icons */}
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-slate-900">
                        {message.sender}
                      </span>

                      {/* Colored Pill Tag with Icon */}
                      <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] border ${tag.pill}`}>
                        {tag.icon}
                        <span>{tag.label}</span>
                      </span>

                      {/* Order Pill Button */}
                      <button 
                        type="button"
                        onClick={() => onSelectOrder(order)}
                        className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-colors cursor-pointer"
                        title={`Jump to order ${order.id}`}
                      >
                        <Hash size={10} className="text-slate-400" />
                        <span>{order.id}</span>
                        <span className="font-sans font-medium text-slate-500">· {order.title}</span>
                      </button>

                      {/* Designer Monogram / Pill */}
                      <span className="text-[10px] font-semibold text-slate-500 font-mono">
                        CAD: <span className="text-slate-800 font-bold">{order.designer || 'Unassigned'}</span>
                      </span>
                    </div>

                    {/* Time & Icon-only Triage Toolbar */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-mono text-slate-400 mr-1">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {/* One-click Triage Icons with Tooltips */}
                      <button
                        type="button"
                        onClick={() => handleToggleResolved(order, message.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isResolved 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'text-slate-400 hover:text-emerald-700 hover:bg-slate-100'
                        }`}
                        title={isResolved ? "Mark Unresolved" : "Mark Resolved"}
                        aria-label="Toggle resolved"
                      >
                        <Check size={13} strokeWidth={isResolved ? 3 : 2} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleUnread(order, message.id)}
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isUnread 
                            ? 'bg-amber-100 text-amber-900' 
                            : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                        }`}
                        title={isUnread ? "Mark as Read" : "Mark as Unread"}
                        aria-label="Toggle unread"
                      >
                        {isUnread ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleArchive(order, message.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        title={message.isArchived ? "Unarchive message" : "Archive message"}
                        aria-label="Toggle archive"
                      >
                        <Archive size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Chat Bubble Body */}
                  <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-2.5 text-xs text-slate-800 font-medium leading-relaxed">
                    {message.text}
                  </div>

                  {/* Nested Comments / Replies in Chat Thread */}
                  {(message.comments && message.comments.length > 0) && (
                    <div className="space-y-1.5 pl-3 border-l-2 border-[#ff943c]/60 pt-1">
                      {message.comments.map(c => (
                        <div key={c.id} className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-2 text-xs">
                          <div className="flex items-center justify-between text-[10px] mb-0.5">
                            <span className="font-bold text-amber-950">{c.author}</span>
                            <span className="text-slate-400 font-mono">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-800 font-medium">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inline Reply Trigger or Composer */}
                  {replyInputId === message.id ? (
                    <div className="flex items-center gap-1.5 pt-1.5">
                      <input 
                        type="text"
                        placeholder={`Reply as ${order.designer || 'CAD Modeler'}...`}
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleSendReply(order, message.id);
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c]"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(order, message.id)}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                        title="Send reply"
                        aria-label="Send reply"
                      >
                        <Send size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReplyInputId(null); setReplyText(''); }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Cancel"
                        aria-label="Cancel reply"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setReplyInputId(message.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-900 pt-0.5 cursor-pointer"
                    >
                      <CornerDownLeft size={10} />
                      <span>Reply</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Chat Composer Bar */}
      <form onSubmit={handlePostNewMessage} className="p-2.5 sm:p-3 border-t border-slate-200 bg-slate-50 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          {/* Order Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">Order:</span>
            <select
              value={composerOrderId}
              onChange={e => setComposerOrderId(e.target.value)}
              className="bg-white border border-slate-200 rounded-full px-2.5 py-1 text-[11px] font-semibold text-slate-800 focus:outline-none focus:border-[#ff943c] cursor-pointer shadow-2xs max-w-xs"
            >
              {orders.map(o => (
                <option key={o.id} value={o.id}>
                  {o.id} — {o.title}
                </option>
              ))}
            </select>
          </div>

          {/* Colored Pill Type Selector */}
          <div className="flex items-center gap-1">
            {(['complaint', 'change', 'anomaly', 'query', 'correction'] as const).map(t => {
              const cfg = getTypeTag(t);
              const isSelected = composerType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setComposerType(t)}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] transition-all cursor-pointer ${
                    isSelected 
                      ? `${cfg.pill} shadow-xs` 
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                  title={`Select ${cfg.label}`}
                >
                  {cfg.icon}
                  <span className="capitalize">{cfg.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar with Send Button */}
        <div className="flex items-center gap-2">
          <input 
            type="text"
            required
            placeholder="Type a complaint, design change, or client note into the thread... (Press Enter)"
            value={composerText}
            onChange={e => setComposerText(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] focus:ring-1 focus:ring-[#ff943c] shadow-2xs"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#ff943c] hover:bg-[#e07d2c] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer active:scale-95"
            title="Post to complaints thread"
            aria-label="Post message"
          >
            <Send size={13} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
}
