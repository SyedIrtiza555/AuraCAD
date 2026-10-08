// src/components/digital-office/OrderDetailDrawer.tsx
import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  DollarSign, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Paperclip, 
  Plus, 
  ArrowRight, 
  Calendar, 
  FileText,
  Flame,
  Send,
  AlertCircle
} from 'lucide-react';
import { 
  Order, 
  Designer, 
  Prospect, 
  Invoice, 
  Correction, 
  OrderStatusHistory, 
  OrderStatus, 
  ORDER_STATUSES,
  InvoiceStatus,
  INVOICE_STATUSES
} from '../../types';

interface OrderDetailDrawerProps {
  order: Order | null;
  designers: Designer[];
  prospects: Prospect[];
  invoices: Invoice[];
  corrections: Correction[];
  statusHistory: OrderStatusHistory[];
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateDesigner: (orderId: string, designerId: string) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onAddCorrection: (orderId: string, message: string, authorName: string, imageUrl?: string) => void;
}

export function OrderDetailDrawer({
  order,
  designers,
  prospects,
  invoices,
  corrections,
  statusHistory,
  onClose,
  onUpdateStatus,
  onUpdateDesigner,
  onUpdateInvoiceStatus,
  onAddCorrection
}: OrderDetailDrawerProps) {
  if (!order) return null;

  // Resolve relationships
  const designer = designers.find(d => d.id === order.designer_id);
  const prospect = prospects.find(p => p.id === order.prospect_id);
  const invoice = invoices.find(inv => inv.order_id === order.id);
  const orderCorrections = corrections
    .filter(c => c.order_id === order.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const orderHistory = statusHistory
    .filter(sh => sh.order_id === order.id)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

  // Correction Form State
  const [correctionMsg, setCorrectionMsg] = useState('');
  const [correctionAuthor, setCorrectionAuthor] = useState(prospect?.name ? `${prospect.name} (Client)` : 'Client');
  const [correctionImageUrl, setCorrectionImageUrl] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  const handleAddCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctionMsg.trim()) return;

    setIsSubmittingCorrection(true);
    onAddCorrection(
      order.id, 
      correctionMsg.trim(), 
      correctionAuthor, 
      correctionImageUrl.trim() ? correctionImageUrl.trim() : undefined
    );

    setCorrectionMsg('');
    setCorrectionImageUrl('');
    setIsSubmittingCorrection(false);
  };

  // Duration Helper: format interval nicely
  const formatDuration = (startDateStr: string, endDateStr: string | null) => {
    const start = new Date(startDateStr).getTime();
    const end = endDateStr ? new Date(endDateStr).getTime() : Date.now();
    const diffMs = end - start;

    if (diffMs <= 0) return '< 1 hour';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffHours / 24);
    const hours = diffHours % 24;

    if (days === 0 && hours === 0) return 'Just started';
    if (days === 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
    if (hours === 0) return `${days} day${days > 1 ? 's' : ''}`;
    return `${days}d ${hours}h`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                {order.order_code}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Effort: {order.effort_level}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
              {order.name}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Created on {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-slate-900 dark:text-slate-100">
              ${order.order_value.toLocaleString()}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Interactive Status Transition Flow */}
        <div className="p-3 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          {(['Pending', 'Designing', 'Review', 'Completed'] as OrderStatus[]).map((st, idx, arr) => {
            const isActive = order.status === st;
            return (
              <React.Fragment key={st}>
                <button
                  onClick={() => onUpdateStatus(order.id, st)}
                  className={`flex-1 min-w-24 px-2 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-400/50' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {isActive && <CheckCircle2 size={12} />}
                  <span>{st}</span>
                </button>
                {idx < arr.length - 1 && (
                  <ArrowRight size={12} className="text-slate-400 shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          
          {/* Relational Entity Cards (Designer, Prospect, Invoice) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* 1. Designer Card (1:N) */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <User size={12} className="text-purple-500" />
                  Assigned Designer (1:N)
                </span>
                <select
                  value={order.designer_id}
                  onChange={(e) => onUpdateDesigner(order.id, e.target.value)}
                  className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {designers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {designer ? (
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {designer.name}
                  </div>
                  <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                    {designer.specialty || 'General Bespoke CAD'}
                  </div>
                  <div className="pt-1 text-slate-500 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} className="text-slate-400" />
                      <span>{designer.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} className="text-slate-400" />
                      <span>{designer.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic">No designer assigned.</div>
              )}
            </div>

            {/* 2. Prospect / Client Card (1:N) */}
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Building2 size={12} className="text-emerald-500" />
                  Client / Prospect (1:N)
                </span>
                <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  VIP Direct
                </span>
              </div>

              {prospect ? (
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {prospect.name}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    {prospect.company}
                  </div>
                  <div className="pt-1 text-slate-500 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} className="text-slate-400" />
                      <span>{prospect.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} className="text-slate-400" />
                      <span>{prospect.phone}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 italic">No prospect profile attached.</div>
              )}
            </div>
          </div>

          {/* 3. 1:1 Invoice & Billing Summary */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <FileText size={12} className="text-amber-500" />
                Linked Invoice (1:1 with Order)
              </span>
              {invoice && (
                <select
                  value={invoice.status}
                  onChange={(e) => onUpdateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
                  className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {INVOICE_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              )}
            </div>

            {invoice ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <div>
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {invoice.invoice_number}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Due: {invoice.due_date || 'Within 14 days'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase">Amount Due</span>
                    <div className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                      ${invoice.amount.toLocaleString()}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    invoice.status === 'Paid' 
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : invoice.status === 'Sent'
                      ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  }`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 italic">No invoice generated for this order yet.</div>
            )}
          </div>

          {/* 4. Status History Timeline (Duration Analysis) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Clock size={12} className="text-blue-500" />
                Status History Timeline (Stage Duration)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {orderHistory.length} recorded stages
              </span>
            </div>

            <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {orderHistory.length === 0 ? (
                <div className="text-slate-400 italic">No transition logs yet.</div>
              ) : (
                orderHistory.map((sh, idx) => {
                  const isCurrent = sh.end_date === null;
                  const duration = formatDuration(sh.start_date, sh.end_date);

                  return (
                    <div key={sh.id} className="relative">
                      {/* Timeline dot */}
                      <span 
                        className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          isCurrent ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.8)]' : 'bg-slate-400'
                        }`} 
                      />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {sh.status}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-600 font-bold animate-pulse">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Calculated Stage Duration */}
                        <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {isCurrent ? `Active for ${duration}` : `Took ${duration}`}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(sh.start_date).toLocaleString('en-GB', { 
                          month: 'short', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        {sh.end_date ? (
                          <> → {new Date(sh.end_date).toLocaleString('en-GB', { 
                            month: 'short', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}</>
                        ) : (
                          <> → Ongoing</>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 5. Corrections & Change Requests (1:N) */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <MessageSquare size={12} className="text-orange-500" />
                Corrections & Feedback Requests (1:N)
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                {orderCorrections.length} comments
              </span>
            </div>

            {/* List of Corrections */}
            <div className="space-y-3 mb-4">
              {orderCorrections.length === 0 ? (
                <div className="text-slate-400 italic text-center py-2">
                  No corrections recorded yet. The client or designer can submit change requests below.
                </div>
              ) : (
                orderCorrections.map((cor) => (
                  <div 
                    key={cor.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {cor.author_name || 'Staff'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(cor.created_at).toLocaleString('en-GB', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {cor.message}
                    </p>

                    {/* Attachments */}
                    {cor.attachments && cor.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {cor.attachments.map(att => (
                          <a
                            key={att.id}
                            href={att.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:underline text-[11px]"
                          >
                            <Paperclip size={11} />
                            <span>{att.file_name || 'Attachment'}</span>
                            {att.file_size && <span className="text-slate-400 text-[10px]">({att.file_size})</span>}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add Correction Form */}
            <form onSubmit={handleAddCorrectionSubmit} className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">
                Submit New Change Request / Correction
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Author (e.g. Sarah Jenkins (Client))"
                  value={correctionAuthor}
                  onChange={(e) => setCorrectionAuthor(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Attachment URL (optional)"
                  value={correctionImageUrl}
                  onChange={(e) => setCorrectionImageUrl(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <textarea
                placeholder="Describe correction (e.g. 'Thicken prong tips to 0.85mm for diamond retention safety guarantee')..."
                value={correctionMsg}
                onChange={(e) => setCorrectionMsg(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!correctionMsg.trim() || isSubmittingCorrection}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={12} />
                  <span>Post Correction</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
