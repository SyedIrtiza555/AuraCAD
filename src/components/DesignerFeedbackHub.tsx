import React, { useState } from 'react';
import { Order, DesignerMessage, DesignerMessageType } from '../types';
import { 
  Sparkles, 
  MessageSquare, 
  AlertTriangle, 
  RefreshCw, 
  HelpCircle, 
  CheckCircle2, 
  Plus, 
  X, 
  Send, 
  User, 
  CornerDownLeft, 
  Check, 
  ChevronRight,
  ShieldAlert,
  Flame,
  FileEdit
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DesignerFeedbackHubProps {
  order: Order;
  onUpdateOrder: (updatedFields: Partial<Order>) => void;
  compact?: boolean;
}

const MESSAGE_TYPE_CONFIG: Record<DesignerMessageType, { label: string; icon: React.ReactNode; badge: string; border: string }> = {
  complaint: {
    label: 'Complaint',
    icon: <AlertTriangle size={12} className="text-rose-600" />,
    badge: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
    border: 'border-rose-200 bg-rose-50/40'
  },
  correction: {
    label: 'Correction',
    icon: <FileEdit size={12} className="text-emerald-600" />,
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    border: 'border-emerald-200 bg-emerald-50/40'
  },
  change: {
    label: 'Change',
    icon: <RefreshCw size={12} className="text-amber-600" />,
    badge: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
    border: 'border-amber-200 bg-amber-50/40'
  },
  anomaly: {
    label: 'Anomaly',
    icon: <Flame size={12} className="text-purple-600" />,
    badge: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
    border: 'border-purple-200 bg-purple-50/40'
  },
  query: {
    label: 'Query',
    icon: <HelpCircle size={12} className="text-sky-600" />,
    badge: 'bg-sky-100 text-sky-800 border-sky-300 font-bold',
    border: 'border-sky-200 bg-sky-50/40'
  }
};

const QUICK_CORRECTION_SUGGESTIONS = [
  'Resize shank diameter to 52mm',
  'Thicken prong tips to 0.8mm for safe diamond claw',
  'Change pavé to bezel setting',
  'Reduce gallery hollow by 15% for casting integrity',
  'Add 0.2mm tolerance for center stone culet'
];

export function DesignerFeedbackHub({ order, onUpdateOrder, compact = false }: DesignerFeedbackHubProps) {
  const [activeTab, setActiveTab] = useState<'all' | DesignerMessageType>('all');
  const [newCorrectionInput, setNewCorrectionInput] = useState('');
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);

  // New message form state
  const [isAddingMessage, setIsAddingMessage] = useState(false);
  const [newMsgType, setNewMsgType] = useState<DesignerMessageType>('query');
  const [newMsgText, setNewMsgText] = useState('');
  const [newMsgSender, setNewMsgSender] = useState(order.closer || 'Studio Lead');

  const corrections = order.corrections || [];
  const messages = order.designerMessages || [];

  // Drag and drop handlers for text
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDropTargetActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTargetActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropTargetActive(false);
    
    // Extract dragged text
    const droppedText = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
    if (droppedText && droppedText.trim()) {
      addCorrection(droppedText.trim());
    }
  };

  const addCorrection = (text: string) => {
    if (!text.trim()) return;
    const updated = [...corrections, text.trim()];
    
    // Also log as a formal designer message for direct traceability
    const newMsg: DesignerMessage = {
      id: uuidv4(),
      type: 'correction',
      text: text.trim(),
      sender: order.closer ? `Closer (${order.closer})` : 'Studio Lead',
      createdAt: new Date().toISOString(),
      resolved: false
    };

    onUpdateOrder({
      corrections: updated,
      designerMessages: [newMsg, ...messages]
    });
    setNewCorrectionInput('');
  };

  const removeCorrection = (index: number) => {
    const updated = corrections.filter((_, i) => i !== index);
    onUpdateOrder({ corrections: updated });
  };

  const handleCreateMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;

    const newMsg: DesignerMessage = {
      id: uuidv4(),
      type: newMsgType,
      text: newMsgText.trim(),
      sender: newMsgSender.trim() || 'Studio Team',
      createdAt: new Date().toISOString(),
      resolved: false
    };

    // If it's a correction, also sync to corrections list
    const updatedCorrections = newMsgType === 'correction' 
      ? Array.from(new Set([...corrections, newMsgText.trim()]))
      : corrections;

    onUpdateOrder({
      designerMessages: [newMsg, ...messages],
      corrections: updatedCorrections
    });

    setNewMsgText('');
    setIsAddingMessage(false);
  };

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const toggleMessageResolved = (msgId: string) => {
    const updated = messages.map(m => {
      if (m.id === msgId) {
        return { ...m, resolved: !m.resolved };
      }
      return m;
    });
    onUpdateOrder({ designerMessages: updated });
  };

  const toggleMessageUnread = (msgId: string) => {
    const updated = messages.map(m => {
      if (m.id === msgId) {
        return { ...m, isUnread: !m.isUnread };
      }
      return m;
    });
    onUpdateOrder({ designerMessages: updated });
  };

  const toggleMessageArchive = (msgId: string) => {
    const updated = messages.map(m => {
      if (m.id === msgId) {
        return { ...m, isArchived: !m.isArchived };
      }
      return m;
    });
    onUpdateOrder({ designerMessages: updated });
  };

  const handleAddComment = (msgId: string) => {
    const text = (commentInputs[msgId] || '').trim();
    if (!text) return;

    const newComment = {
      id: uuidv4(),
      author: `${order.designer || 'Designer'} (CAD)`,
      text,
      createdAt: new Date().toISOString()
    };

    const updated = messages.map(m => {
      if (m.id === msgId) {
        return {
          ...m,
          comments: [...(m.comments || []), newComment]
        };
      }
      return m;
    });

    onUpdateOrder({ designerMessages: updated });
    setCommentInputs(prev => ({ ...prev, [msgId]: '' }));
  };

  const filteredMessages = (activeTab === 'all' 
    ? messages 
    : messages.filter(m => m.type === activeTab)).filter(m => !m.isArchived);

  const unresolvedCount = messages.filter(m => !m.resolved).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4 select-none">
      {/* Card Header: Designer Assignment & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs shadow-xs">
            {order.designer ? order.designer.charAt(0) : 'D'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900 tracking-tight">
                Designer Hub & Corrections
              </h4>
              {unresolvedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                  {unresolvedCount} pending
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">
              Assigned Modeler: <span className="font-semibold text-slate-700">{order.designer || 'Not Assigned'}</span> · Direct CAD channel
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingMessage(!isAddingMessage)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={12} strokeWidth={2.5} />
          <span>Add Note</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. [CORRECTIONS] DRAG & DROP TEXT INPUT BOX */}
      {/* Shown directly to the designer */}
      {/* ========================================================= */}
      <div className="rounded-xl border border-amber-300/80 bg-gradient-to-b from-amber-500/[0.06] via-amber-50/40 to-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-800 border border-amber-300">
              <FileEdit size={12} />
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-amber-950 font-mono">
              [Corrections] Drag & Drop Box
            </label>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-300">
              Direct to Designer ({order.designer || 'Unassigned'})
            </span>
          </div>

          <span className="text-[10px] font-mono text-slate-500 font-medium">
            {corrections.length} {corrections.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Drag & Drop Dropzone Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed p-3 transition-all ${
            isDropTargetActive
              ? 'border-amber-500 bg-amber-100/70 scale-[1.01] shadow-md ring-2 ring-amber-400/40'
              : 'border-amber-300/80 bg-white/90 hover:border-amber-400 hover:bg-amber-50/40'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newCorrectionInput}
                onChange={(e) => setNewCorrectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCorrection(newCorrectionInput);
                  }
                }}
                placeholder="Drag & drop highlighted text here, or type correction for designer..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>

            <button
              type="button"
              onClick={() => addCorrection(newCorrectionInput)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Add Correction</span>
            </button>
          </div>

          {/* Prompt Hint */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-amber-200/60 text-[10px] text-amber-800">
            <span className="flex items-center gap-1">
              <CornerDownLeft size={10} className="text-amber-600" />
              <span>Tip: Highlight text in specifications/notes and drag it directly into this box</span>
            </span>
          </div>
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold text-slate-500">Quick CAD Prompts:</span>
          {QUICK_CORRECTION_SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => addCorrection(sug)}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
            >
              + {sug}
            </button>
          ))}
        </div>

        {/* Active Corrections Chips */}
        {corrections.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
              Active Correction Items for Modeler:
            </span>
            <div className="space-y-1">
              {corrections.map((corr, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white border border-amber-200 shadow-xs text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span className="text-slate-800 font-medium truncate">{corr}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCorrection(idx)}
                    className="text-slate-400 hover:text-rose-500 p-0.5 transition-colors cursor-pointer shrink-0"
                    title="Remove item"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. ALL OTHER MESSAGES SECTION */}
      {/* (Complaints, Changes, Anomalities, Queries, Corrections) */}
      {/* ========================================================= */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Messages & Anomaly Log
          </span>
          <span className="text-[10px] text-slate-400">
            {messages.length} total recorded
          </span>
        </div>

        {/* Inline Add Message Drawer */}
        {isAddingMessage && (
          <form onSubmit={handleCreateMessage} className="mb-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Log New Note for Designer
              </span>
              <button
                type="button"
                onClick={() => setIsAddingMessage(false)}
                className="text-slate-400 hover:text-slate-600 text-[10px]"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Type</label>
                <select
                  value={newMsgType}
                  onChange={(e) => setNewMsgType(e.target.value as DesignerMessageType)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-400"
                >
                  <option value="correction">Correction (Adjustment)</option>
                  <option value="complaint">Complaint (Client Issue)</option>
                  <option value="change">Change (Specification Alteration)</option>
                  <option value="anomaly">Anomaly (Casting/Design Flag)</option>
                  <option value="query">Query (Question / Inquiry)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Sender</label>
                <input
                  type="text"
                  value={newMsgSender}
                  onChange={(e) => setNewMsgSender(e.target.value)}
                  placeholder="e.g. Closer Alex"
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Message Text</label>
              <textarea
                required
                rows={2}
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Describe detail, complaint, tolerance anomaly, or question for modeler..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Send size={11} />
              <span>Post to Designer Card</span>
            </button>
          </form>
        )}

        {/* Message Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
              activeTab === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
          >
            All ({messages.length})
          </button>

          {(['correction', 'complaint', 'change', 'anomaly', 'query'] as const).map(typeKey => {
            const cfg = MESSAGE_TYPE_CONFIG[typeKey];
            const count = messages.filter(m => m.type === typeKey).length;
            const isSelected = activeTab === typeKey;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setActiveTab(typeKey)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
                  isSelected
                    ? `${cfg.badge} shadow-xs font-bold`
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cfg.icon}
                <span>{cfg.label}</span>
                <span className="font-mono text-[9px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Unified Messages Feed */}
        <div className="space-y-2 mt-2">
          {filteredMessages.length === 0 ? (
            <div className="py-6 px-4 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <MessageSquare size={18} className="mx-auto text-slate-300 mb-1" />
              <p className="text-xs font-medium text-slate-600">No {activeTab === 'all' ? '' : activeTab} messages</p>
              <p className="text-[10px] text-slate-400">All designer communications will appear here</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const cfg = MESSAGE_TYPE_CONFIG[msg.type] || MESSAGE_TYPE_CONFIG.query;
              return (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border transition-all ${
                    msg.resolved 
                      ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                      : `${cfg.border} shadow-xs`
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badge}`}>
                        {cfg.icon}
                        <span>{cfg.label}</span>
                      </span>

                      <span className="text-[11px] font-semibold text-slate-800">
                        {msg.sender}
                      </span>

                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Designer Acknowledge / Resolve Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleMessageResolved(msg.id)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all border cursor-pointer ${
                        msg.resolved
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                      title={msg.resolved ? 'Mark unresolved' : 'Acknowledge as modeler'}
                    >
                      <Check size={10} strokeWidth={msg.resolved ? 3 : 2} className={msg.resolved ? 'text-emerald-700' : 'text-slate-400'} />
                      <span>{msg.resolved ? 'Resolved' : 'Acknowledge'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed pl-1">
                    {msg.text}
                  </p>

                  {/* Comments Thread */}
                  {(msg.comments && msg.comments.length > 0) && (
                    <div className="mt-2 space-y-1.5 pl-2.5 border-l-2 border-amber-300">
                      {msg.comments.map(c => (
                        <div key={c.id} className="text-xs bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                            <span className="font-bold text-slate-800">{c.author}</span>
                            <span className="font-mono">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-700 text-xs">{c.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add comment + triage actions */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text"
                        placeholder="Reply / add designer note..."
                        value={commentInputs[msg.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleAddComment(msg.id);
                          }
                        }}
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                      />
                      <button 
                        type="button"
                        onClick={() => handleAddComment(msg.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>

                    <div className="flex items-center justify-end gap-2 text-[10px] pt-1">
                      <button 
                        type="button"
                        onClick={() => toggleMessageUnread(msg.id)}
                        className="text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
                      >
                        {msg.isUnread ? 'Mark Read' : 'Mark Unread'}
                      </button>
                      <span>•</span>
                      <button 
                        type="button"
                        onClick={() => toggleMessageArchive(msg.id)}
                        className="text-slate-500 hover:text-rose-600 font-medium cursor-pointer"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
