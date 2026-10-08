// src/components/digital-office/NewOrderModal.tsx
import React, { useState } from 'react';
import { X, Sparkles, Plus, AlertCircle, DollarSign, User, Building2, Flame } from 'lucide-react';
import { Designer, Prospect, OrderStatus, EffortLevel, ORDER_STATUSES, EFFORT_LEVELS } from '../../types';

interface NewOrderModalProps {
  isOpen: boolean;
  designers: Designer[];
  prospects: Prospect[];
  preselectedProspect?: Prospect | null;
  onClose: () => void;
  onSubmit: (orderData: {
    order_code: string;
    name: string;
    status: OrderStatus;
    effort_level: EffortLevel;
    order_value: number;
    created_at: string;
    designer_id: string;
    prospect_id: string;
  }) => void;
}

export function NewOrderModal({
  isOpen,
  designers,
  prospects,
  preselectedProspect,
  onClose,
  onSubmit
}: NewOrderModalProps) {
  if (!isOpen) return null;

  const defaultCode = `ORD-${Math.floor(10400 + Math.random() * 500)}`;
  const [orderCode, setOrderCode] = useState(defaultCode);
  const [name, setName] = useState('');
  const [orderValue, setOrderValue] = useState('7500');
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [effortLevel, setEffortLevel] = useState<EffortLevel>('High');
  const [designerId, setDesignerId] = useState(designers[0]?.id || '');
  const [prospectId, setProspectId] = useState(preselectedProspect?.id || prospects[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      order_code: orderCode.trim() || defaultCode,
      name: name.trim(),
      status,
      effort_level: effortLevel,
      order_value: parseFloat(orderValue) || 5000,
      created_at: new Date().toISOString().split('T')[0],
      designer_id: designerId,
      prospect_id: prospectId
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-150 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Create New Bespoke Order
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Code
              </label>
              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                required
                className="w-full font-mono px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Value ($ USD)
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={orderValue}
                onChange={(e) => setOrderValue(e.target.value)}
                required
                className="w-full font-mono px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bespoke Jewelry Piece Name & Brief
            </label>
            <input
              type="text"
              placeholder="e.g. 2.5ct Cushion Cut Halo Engagement Ring in Platinum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Customer (Prospect) Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Client / Prospect (1:N Relation)
            </label>
            <select
              value={prospectId}
              onChange={(e) => setProspectId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {prospects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.company}
                </option>
              ))}
            </select>
          </div>

          {/* Designer Selector */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned CAD Designer (1:N Relation)
            </label>
            <select
              value={designerId}
              onChange={(e) => setDesignerId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {designers.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} — {d.specialty || 'General CAD'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Effort Level
              </label>
              <select
                value={effortLevel}
                onChange={(e) => setEffortLevel(e.target.value as EffortLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {EFFORT_LEVELS.map(eff => (
                  <option key={eff} value={eff}>{eff}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="Pending">Pending (Queue)</option>
                <option value="Designing">Designing (Active Bench)</option>
              </select>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              Create Order & Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
