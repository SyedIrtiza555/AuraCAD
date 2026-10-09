// src/components/creative-tim/blocks/orders-table.tsx
import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  Download, 
  EllipsisVertical, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Check, 
  Sparkles,
  ArrowUpDown,
  Eye,
  Copy,
  ExternalLink,
  Flame,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  Building2,
  ArrowRight
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Order, OrderStatus, EffortLevel } from '../../../types';

export interface CreativeTimOrderItem {
  id: string;
  orderNumber: string;
  name: string;
  date: string;
  status: OrderStatus;
  effortLevel: EffortLevel;
  customerName: string;
  customerCompany: string;
  designerName: string;
  orderValue: number;
  originalOrder: Order;
}

interface OrdersTableProps {
  orders?: Order[];
  onSelectOrder?: (order: Order) => void;
  onUpdateStatus?: (orderId: string, status: OrderStatus) => void;
  hideFinancials?: boolean;
}

export function OrdersTable({ 
  orders = [], 
  onSelectOrder, 
  onUpdateStatus,
  hideFinancials = false
}: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileViewMode, setMobileViewMode] = useState<'cards' | 'table'>('cards');

  const itemsPerPage = 6;

  // Map Digital Office orders into Creative Tim table items
  const tableData: CreativeTimOrderItem[] = useMemo(() => {
    return orders.map((o) => {
      const prospectName = o.prospect?.name || 'Private Client';
      const prospectCompany = o.prospect?.company || 'Direct';
      const designerName = o.designer?.name || 'Unassigned';

      return {
        id: o.id,
        orderNumber: o.order_code,
        name: o.name,
        date: new Date(o.created_at || Date.now()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        status: o.status,
        effortLevel: o.effort_level,
        customerName: prospectName,
        customerCompany: prospectCompany,
        designerName: designerName,
        orderValue: o.order_value,
        originalOrder: o
      };
    });
  }, [orders]);

  // Filter & Search
  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        item.orderNumber.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.customerName.toLowerCase().includes(query) ||
        item.customerCompany.toLowerCase().includes(query) ||
        item.designerName.toLowerCase().includes(query);
      
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [tableData, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map(i => i.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleExport = () => {
    const rows = filteredData.map(i => ({
      OrderCode: i.orderNumber,
      PieceName: i.name,
      CreatedDate: i.date,
      Status: i.status,
      EffortLevel: i.effortLevel,
      Customer: `${i.customerName} (${i.customerCompany})`,
      AssignedDesigner: i.designerName,
      OrderValue: `$${i.orderValue.toFixed(2)}`
    }));

    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracad-orders-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'Designing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-500/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff943c]" />
            Designing
          </span>
        );
      case 'Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Review
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const getEffortBadge = (effort: EffortLevel) => {
    switch (effort) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-400/20">
            <Flame size={11} className="text-rose-500" />
            Urgent
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-400/20">
            High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/20">
            Medium
          </span>
        );
      case 'Low':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-400/20">
            Low
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner / Metric Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Bespoke Studio Orders
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {filteredData.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital office pipeline • Tap any order to inspect designer, client, invoice, and corrections
          </p>
        </div>

        {/* Global Toolbar & Mobile View Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mobile Cards vs Table Toggle (visible on < md) */}
          <div className="flex md:hidden items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setMobileViewMode('cards')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                mobileViewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Card View"
            >
              <LayoutGrid size={12} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setMobileViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                mobileViewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon size={12} />
              <span>Table</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showFilters || statusFilter !== 'All'
                  ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter size={13} />
              <span>Filter</span>
              {statusFilter !== 'All' && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
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
      </div>

      {/* Filter Ribbon */}
      {showFilters && (
        <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-xs overflow-x-auto no-scrollbar py-2">
          <span className="text-slate-500 font-medium shrink-0 mr-1">Status:</span>
          {(['All', 'Pending', 'Designing', 'Review', 'Completed', 'Cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      )}

      {/* Search & Records Bar */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="p-3 sm:p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search code, piece, customer, designer..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono flex items-center justify-between sm:justify-end gap-2">
            {selectedIds.size > 0 ? (
              <span className="text-blue-600 font-semibold">{selectedIds.size} selected</span>
            ) : (
              <span>Showing {paginatedData.length} of {filteredData.length}</span>
            )}
          </div>
        </div>

        {/* 1. Mobile Adaptive Card Feed (shown on < md when mobileViewMode === 'cards') */}
        <div className={`p-3 space-y-3 ${mobileViewMode === 'cards' ? 'block md:hidden' : 'hidden'}`}>
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No bespoke orders match the current filter or search criteria.
            </div>
          ) : (
            paginatedData.map((item) => {
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectOrder?.(item.originalOrder)}
                  className={`p-3.5 rounded-xl border transition-all active:scale-[0.99] cursor-pointer ${
                    isSelected 
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-400/50 dark:border-blue-700/50' 
                      : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-blue-400/40'
                  } shadow-xs space-y-2.5`}
                >
                  {/* Top Row: Order Code & Effort */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate hover:text-blue-600">
                        {item.orderNumber}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(item.orderNumber, item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Copy Code"
                      >
                        {copiedId === item.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      </button>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {getEffortBadge(item.effortLevel)}
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  {/* Middle Row: Piece Name & Creation Date */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Created {item.date}
                    </div>
                  </div>

                  {/* Meta Strip: Client & Designer */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-0">
                      <Building2 size={12} className="text-[#83dd24] shrink-0" />
                      <span className="truncate">{item.customerName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 min-w-0">
                      <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {item.designerName.charAt(0)}
                      </span>
                      <span className="truncate">{item.designerName}</span>
                    </div>
                  </div>

                  {/* Bottom Row: Order Value & Action Button */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">
                        {hideFinancials ? 'Type' : 'Value'}
                      </span>
                      <span className="font-mono text-sm font-extrabold text-[#29aae0]">
                        {hideFinancials ? 'Bespoke Mount' : `$${item.orderValue.toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button 
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <span>Status</span>
                            <EllipsisVertical size={12} />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content 
                            className="min-w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-xl text-xs z-50 animate-in fade-in-50"
                            sideOffset={5}
                          >
                            {(['Pending', 'Designing', 'Review', 'Completed', 'Cancelled'] as OrderStatus[]).map((st) => (
                              <DropdownMenu.Item
                                key={st}
                                onClick={() => onUpdateStatus?.(item.id, st)}
                                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none"
                              >
                                <span>{st}</span>
                                {item.status === st && <Check size={12} className="text-blue-600" />}
                              </DropdownMenu.Item>
                            ))}
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>

                      <button
                        onClick={() => onSelectOrder?.(item.originalOrder)}
                        className="px-3 py-1 bg-[#29aae0] hover:bg-[#1f8ec0] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop & Tablet Full Table (shown on >= md, or when mobileViewMode === 'table') */}
        <div className={`overflow-x-auto ${mobileViewMode === 'table' ? 'block' : 'hidden md:block'}`}>
          <table className="w-full min-w-[760px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 font-medium">
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 cursor-pointer">
                    <span>Order Code</span>
                    <ArrowUpDown size={11} className="text-slate-400" />
                  </div>
                </th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Bespoke Jewelry Piece</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Customer / Prospect</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Assigned Designer</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Effort</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                {!hideFinancials && (
                  <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-right">Value</th>
                )}
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-center w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={hideFinancials ? 8 : 9} className="p-8 text-center text-slate-400">
                    No bespoke orders match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isSelected = selectedIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      onClick={() => onSelectOrder?.(item.originalOrder)}
                      className={`group transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 dark:bg-blue-950/30' : ''
                      }`}
                    >
                      <td 
                        className="p-3.5 text-center" 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectRow(item.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Order Code */}
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="hover:text-blue-600 underline-offset-2 hover:underline">
                            {item.orderNumber}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.orderNumber, item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-opacity"
                            title="Copy Order Code"
                          >
                            {copiedId === item.id ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>

                      {/* Piece Name & Creation Date */}
                      <td className="p-3.5 font-medium text-slate-900 dark:text-slate-100">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Created {item.date}
                          </div>
                        </div>
                      </td>

                      {/* Prospect / Customer */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {item.customerCompany}
                          </div>
                        </div>
                      </td>

                      {/* Designer */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-[10px] font-bold">
                            {item.designerName.charAt(0)}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {item.designerName}
                          </span>
                        </div>
                      </td>

                      {/* Effort Level */}
                      <td className="p-3.5">
                        {getEffortBadge(item.effortLevel)}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Order Value */}
                      {!hideFinancials && (
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ${item.orderValue.toLocaleString()}
                        </td>
                      )}

                      {/* Actions */}
                      <td 
                        className="p-3.5 text-center" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectOrder?.(item.originalOrder)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                            title="Inspect Order Details & History"
                          >
                            <Eye size={13} />
                          </button>

                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                              <button 
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Change Status"
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
                                  Quick Status Change
                                </DropdownMenu.Label>
                                {(['Pending', 'Designing', 'Review', 'Completed', 'Cancelled'] as OrderStatus[]).map((st) => (
                                  <DropdownMenu.Item
                                    key={st}
                                    onClick={() => onUpdateStatus?.(item.id, st)}
                                    className="flex items-center justify-between px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none"
                                  >
                                    <span>{st}</span>
                                    {item.status === st && <Check size={12} className="text-blue-600" />}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
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
