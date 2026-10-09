// src/components/digital-office/InvoicesTableView.tsx
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  FileText, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  EllipsisVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ArrowRight
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Invoice, Order, Prospect, InvoiceStatus, INVOICE_STATUSES } from '../../types';

interface InvoicesTableViewProps {
  invoices: Invoice[];
  orders: Order[];
  prospects: Prospect[];
  onSelectOrder?: (order: Order) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
}

export function InvoicesTableView({
  invoices,
  orders,
  prospects,
  onSelectOrder,
  onUpdateInvoiceStatus
}: InvoicesTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | InvoiceStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Enriched rows
  const tableData = useMemo(() => {
    return invoices.map(inv => {
      const linkedOrder = orders.find(o => o.id === inv.order_id);
      const linkedProspect = linkedOrder ? prospects.find(p => p.id === linkedOrder.prospect_id) : undefined;

      return {
        ...inv,
        orderCode: linkedOrder?.order_code || 'Unlinked',
        orderName: linkedOrder?.name || 'Bespoke Order',
        customerName: linkedProspect?.name || 'Direct Client',
        customerCompany: linkedProspect?.company || 'Private',
        linkedOrder
      };
    });
  }, [invoices, orders, prospects]);

  const filteredInvoices = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return tableData.filter(inv => {
      const matchesSearch = 
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.orderCode.toLowerCase().includes(q) ||
        inv.orderName.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerCompany.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tableData, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage]);

  const totalBilled = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  const handleExport = () => {
    const rows = filteredInvoices.map(inv => ({
      InvoiceNumber: inv.invoice_number,
      OrderCode: inv.orderCode,
      Piece: inv.orderName,
      Customer: `${inv.customerName} (${inv.customerCompany})`,
      Amount: `$${inv.amount.toFixed(2)}`,
      Status: inv.status,
      DueDate: inv.due_date || 'N/A'
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-office-invoices-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Paid
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Sent
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Draft
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Overdue
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Metric Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Invoices & Financial Records
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              {filteredInvoices.length} invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            1:1 Relationship: Exactly one invoice is bound to each bespoke order
          </p>
        </div>

        {/* Global Financial Tally */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase block">Paid Received</span>
            <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              ${totalPaid.toLocaleString()}
            </div>
          </div>
          <div className="text-left sm:text-right border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-4">
            <span className="text-[10px] text-slate-400 uppercase block">Total Invoiced</span>
            <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              ${totalBilled.toLocaleString()}
            </div>
          </div>

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
        {/* Table Search & Status Filters */}
        <div className="p-3 sm:p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search invoice #, order code, customer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar py-1">
            {(['All', 'Paid', 'Sent', 'Draft', 'Overdue'] as const).map(st => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* 1. Mobile Adaptive Invoice Cards (< md) */}
        <div className="p-3 space-y-3 block md:hidden">
          {paginatedInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No invoices match the filter criteria.
            </div>
          ) : (
            paginatedInvoices.map((inv) => (
              <div
                key={inv.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs space-y-2.5"
              >
                {/* Top Row: Invoice # & Status */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    <FileText size={14} className="text-amber-500 shrink-0" />
                    <span>{inv.invoice_number}</span>
                  </div>

                  <div>
                    {getStatusBadge(inv.status)}
                  </div>
                </div>

                {/* Linked Order & Customer */}
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Linked Order:</span>
                    {inv.linkedOrder ? (
                      <button
                        onClick={() => onSelectOrder?.(inv.linkedOrder!)}
                        className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {inv.orderCode}
                      </button>
                    ) : (
                      <span className="text-slate-400 italic">None</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate">
                    {inv.orderName}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Building2 size={11} className="text-slate-400 shrink-0" />
                    <span className="truncate">{inv.customerName} ({inv.customerCompany})</span>
                  </div>
                </div>

                {/* Amount, Due Date & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Amount / Due</span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-slate-100">
                        ${inv.amount.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Due: {inv.due_date || 'Net 14'}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button 
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <span>Change Status</span>
                        <EllipsisVertical size={12} />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content 
                        className="min-w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xl text-xs z-50 animate-in fade-in-50"
                        sideOffset={5}
                      >
                        <DropdownMenu.Label className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Mark Invoice Status
                        </DropdownMenu.Label>
                        {INVOICE_STATUSES.map((st) => (
                          <DropdownMenu.Item
                            key={st}
                            onClick={() => onUpdateInvoiceStatus(inv.id, st)}
                            className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none"
                          >
                            <span>{st}</span>
                            {inv.status === st && <Check size={12} className="text-emerald-600" />}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 2. Desktop Full Table (>= md) */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 font-medium">
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Invoice Number</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Linked Bespoke Order (1:1)</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Client / Company</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Due Date</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Amount</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-center w-20">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No invoices match the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="group hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors"
                  >
                    {/* Invoice Number */}
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <FileText size={13} className="text-amber-500" />
                        <span>{inv.invoice_number}</span>
                      </div>
                    </td>

                    {/* Linked Order */}
                    <td className="p-3.5">
                      {inv.linkedOrder ? (
                        <button
                          onClick={() => onSelectOrder?.(inv.linkedOrder!)}
                          className="text-left group/ord cursor-pointer"
                        >
                          <div className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            {inv.orderCode}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {inv.orderName}
                          </div>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic">No linked order</span>
                      )}
                    </td>

                    {/* Client / Company */}
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {inv.customerName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {inv.customerCompany}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Due Date */}
                    <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                      {inv.due_date || 'Net 14'}
                    </td>

                    {/* Amount */}
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                      ${inv.amount.toLocaleString()}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-center">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button 
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Update Invoice Status"
                          >
                            <EllipsisVertical size={13} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content 
                            className="min-w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg text-xs z-50 animate-in fade-in-50 zoom-in-95"
                            sideOffset={5}
                          >
                            <DropdownMenu.Label className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                              Mark Invoice Status
                            </DropdownMenu.Label>
                            {INVOICE_STATUSES.map((st) => (
                              <DropdownMenu.Item
                                key={st}
                                onClick={() => onUpdateInvoiceStatus(inv.id, st)}
                                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none"
                              >
                                <span>{st}</span>
                                {inv.status === st && <Check size={12} className="text-emerald-600" />}
                              </DropdownMenu.Item>
                            ))}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))
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
