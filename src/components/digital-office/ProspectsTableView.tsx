// src/components/digital-office/ProspectsTableView.tsx
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Building2, 
  Mail, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  Trash2,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { Prospect, Order } from '../../types';

interface ProspectsTableViewProps {
  prospects: Prospect[];
  orders: Order[];
  onOpenNewProspectModal: () => void;
  onSelectOrder?: (order: Order) => void;
  onDeleteProspect?: (prospectId: string) => void;
  onCreateOrderForProspect?: (prospect: Prospect) => void;
}

export function ProspectsTableView({
  prospects,
  orders,
  onOpenNewProspectModal,
  onSelectOrder,
  onDeleteProspect,
  onCreateOrderForProspect
}: ProspectsTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered prospects
  const filteredProspects = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return prospects.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.company.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  }, [prospects, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProspects.length / itemsPerPage));
  const paginatedProspects = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProspects.slice(start, start + itemsPerPage);
  }, [filteredProspects, currentPage]);

  const handleExport = () => {
    const rows = filteredProspects.map(p => {
      const clientOrders = orders.filter(o => o.prospect_id === p.id);
      const totalSpend = clientOrders.reduce((sum, o) => sum + o.order_value, 0);
      return {
        Name: p.name,
        Company: p.company,
        Email: p.email,
        Phone: p.phone,
        TotalOrders: clientOrders.length,
        TotalSpend: `$${totalSpend.toFixed(2)}`
      };
    });
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-office-prospects-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Clients & Prospects Portfolio
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {filteredProspects.length} clients
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            1:N Relationship: One customer/prospect can commission multiple custom bespoke jewelry orders
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={onOpenNewProspectModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Add Prospect</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Export JSON</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Table & Cards Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Search */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search client name, company, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono text-right">
            Showing {paginatedProspects.length} of {filteredProspects.length}
          </div>
        </div>

        {/* 1. Mobile Adaptive Client Cards (< md) */}
        <div className="p-3 space-y-3 block md:hidden">
          {paginatedProspects.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No prospects match the search query.
            </div>
          ) : (
            paginatedProspects.map((prospect) => {
              const clientOrders = orders.filter(o => o.prospect_id === prospect.id);
              const totalSpend = clientOrders.reduce((sum, o) => sum + o.order_value, 0);

              return (
                <div
                  key={prospect.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm border border-emerald-300 dark:border-emerald-700 shrink-0">
                        {prospect.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {prospect.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/20 shrink-0">
                            {prospect.code}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          <Building2 size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate">{prospect.company}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteProspect?.(prospect.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Client"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Contact Shortcuts */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <a
                      href={`mailto:${prospect.email}`}
                      className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 truncate py-1"
                    >
                      <Mail size={12} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{prospect.email}</span>
                    </a>
                    <a
                      href={`tel:${prospect.phone}`}
                      className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 truncate py-1"
                    >
                      <Phone size={12} className="text-emerald-500 shrink-0" />
                      <span className="truncate">{prospect.phone}</span>
                    </a>
                  </div>

                  {/* Pipeline Metrics & Commission CTA */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Lifetime Pipeline</span>
                      <span className="font-mono text-sm font-extrabold text-[#83dd24]">
                        ${totalSpend.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5 font-mono">
                        ({clientOrders.length} order{clientOrders.length !== 1 ? 's' : ''})
                      </span>
                    </div>

                    <button
                      onClick={() => onCreateOrderForProspect?.(prospect)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-all shadow-xs"
                    >
                      <Plus size={12} />
                      <span>New Order</span>
                    </button>
                  </div>

                  {/* Commissioned Orders Chips */}
                  {clientOrders.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {clientOrders.slice(0, 3).map(o => (
                        <button
                          key={o.id}
                          onClick={() => onSelectOrder?.(o)}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:underline cursor-pointer"
                        >
                          {o.order_code}
                        </button>
                      ))}
                      {clientOrders.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{clientOrders.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Full Table (>= md) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 font-medium">
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Client / Prospect</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Company & Entity</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Direct Contact</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Commissioned Orders (1:N)</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Lifetime Pipeline</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedProspects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No prospects match the search query.
                  </td>
                </tr>
              ) : (
                paginatedProspects.map((prospect) => {
                  const clientOrders = orders.filter(o => o.prospect_id === prospect.id);
                  const totalSpend = clientOrders.reduce((sum, o) => sum + o.order_value, 0);

                  return (
                    <tr
                      key={prospect.id}
                      className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs border border-emerald-300 dark:border-emerald-700">
                            {prospect.name.charAt(0)}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">
                                {prospect.name}
                              </span>
                              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-400/20">
                                {prospect.code}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              Code: {prospect.code} • ID: {prospect.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Building2 size={12} className="text-slate-400" />
                          <span>{prospect.company}</span>
                        </div>
                      </td>

                      {/* Direct Contact */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Mail size={11} className="text-slate-400" />
                            <span>{prospect.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Phone size={11} className="text-slate-400" />
                            <span>{prospect.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Commissioned Orders */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {clientOrders.length} order{clientOrders.length !== 1 ? 's' : ''}
                          </span>
                          {clientOrders.map(o => (
                            <button
                              key={o.id}
                              onClick={() => onSelectOrder?.(o)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:underline cursor-pointer"
                              title={o.name}
                            >
                              {o.order_code}
                            </button>
                          ))}
                        </div>
                      </td>

                      {/* Lifetime Pipeline */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                        ${totalSpend.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onCreateOrderForProspect?.(prospect)}
                            className="px-2 py-1 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold cursor-pointer"
                            title="New Bespoke Order for this Client"
                          >
                            + Order
                          </button>
                          <button
                            onClick={() => onDeleteProspect?.(prospect.id)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete Prospect"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
          <div>
            Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
