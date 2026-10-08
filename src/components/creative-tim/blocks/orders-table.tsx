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
  ExternalLink
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Order } from '../../../types';

export interface CreativeTimOrderItem {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Paid' | 'Refunded' | 'Cancel' | 'In progress' | 'In Review';
  customerEmail: string;
  customerAvatar?: string;
  product: string;
  revenue: number;
  originalOrder?: Order;
}

// Sample catalog from Creative Tim orders-table demo
const DEMO_ORDERS: CreativeTimOrderItem[] = [
  {
    id: 'ct-1',
    orderNumber: '#10421',
    date: '01 Nov 2023, 10:20 AM',
    status: 'Paid',
    customerEmail: 'alex.rivera@example.com',
    product: 'Nike Sport 2 (Titanium Edition)',
    revenue: 140.20,
  },
  {
    id: 'ct-2',
    orderNumber: '#10422',
    date: '01 Nov 2023, 10:53 AM',
    status: 'Paid',
    customerEmail: 'sarah.connor@cyberdyne.co',
    product: 'Velvet Diamond Ring Cushion',
    revenue: 42.00,
  },
  {
    id: 'ct-3',
    orderNumber: '#10423',
    date: '01 Nov 2023, 11:13 AM',
    status: 'Refunded',
    customerEmail: 'david.wright@atelier.luxury',
    product: 'Handmade Alligator Leather Case',
    revenue: 25.50,
  },
  {
    id: 'ct-4',
    orderNumber: '#10424',
    date: '01 Nov 2023, 12:20 AM',
    status: 'Paid',
    customerEmail: 'julian.v@vancecap.com',
    product: 'Platinum Tennis Bracelet Onu-Lino',
    revenue: 190.40,
  },
  {
    id: 'ct-5',
    orderNumber: '#10425',
    date: '01 Nov 2023, 01:40 PM',
    status: 'Cancel',
    customerEmail: 'elena.rostova@designhaus.co',
    product: 'Jewelry Loupe 40x Gold Plated x2',
    revenue: 200.90,
  },
  {
    id: 'ct-6',
    orderNumber: '#10426',
    date: '02 Nov 2023, 09:15 AM',
    status: 'Paid',
    customerEmail: 'marcus.vance@crownforge.com',
    product: 'Custom 18K Bezel Setting Mount',
    revenue: 840.00,
  },
  {
    id: 'ct-7',
    orderNumber: '#10427',
    date: '02 Nov 2023, 02:30 PM',
    status: 'In progress',
    customerEmail: 'maya.lin@geoart.studio',
    product: 'Art Deco Sapphire Choker Links',
    revenue: 1250.00,
  },
  {
    id: 'ct-8',
    orderNumber: '#10428',
    date: '03 Nov 2023, 04:10 PM',
    status: 'In Review',
    customerEmail: 'emily.chen@gemstone.org',
    product: 'Brilliant Cut Solitaire Diamond 1.5ct',
    revenue: 4200.00,
  }
];

interface OrdersTableProps {
  orders?: Order[];
  onSelectOrder?: (order: Order) => void;
}

export function OrdersTable({ orders = [], onSelectOrder }: OrdersTableProps) {
  const [dataSource, setDataSource] = useState<'auracad' | 'demo'>('auracad');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | string>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const itemsPerPage = 5;

  // Map AuraCAD orders into Creative Tim table items
  const tableData: CreativeTimOrderItem[] = useMemo(() => {
    if (dataSource === 'demo' || orders.length === 0) {
      return DEMO_ORDERS;
    }

    return orders.map((o) => {
      let mappedStatus: CreativeTimOrderItem['status'] = 'Paid';
      if (o.status === 'Delivered') mappedStatus = 'Paid';
      else if (o.status === 'In progress') mappedStatus = 'In progress';
      else if (o.status === 'In Review') mappedStatus = 'In Review';
      else if (o.status === 'Backlog') mappedStatus = 'Cancel';
      else mappedStatus = 'In progress';

      return {
        id: o.id,
        orderNumber: `#${o.id.replace('ORD-', '')}`,
        date: new Date(o.createdAt || Date.now()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        status: mappedStatus,
        customerEmail: `${o.closer.toLowerCase()}@auracad.local`,
        product: o.title,
        revenue: o.value || 3500,
        originalOrder: o
      };
    });
  }, [dataSource, orders]);

  // Filter & Search
  const filteredData = useMemo(() => {
    return tableData.filter((item) => {
      const matchesSearch = 
        item.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product.toLowerCase().includes(searchQuery.toLowerCase());
      
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
      setSelectedIds(new Set(paginatedData.map(d => d.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExport = () => {
    const rows = filteredData.map(d => ({
      Order: d.orderNumber,
      Date: d.date,
      Status: d.status,
      Customer: d.customerEmail,
      Product: d.product,
      Revenue: `$${d.revenue.toFixed(2)}`
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `creative-tim-orders-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getStatusBadge = (status: CreativeTimOrderItem['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <span 
            data-slot="badge" 
            className="inline-flex items-center justify-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1 overflow-hidden w-max shadow-xs"
          >
            Paid
          </span>
        );
      case 'Refunded':
        return (
          <span 
            data-slot="badge" 
            className="inline-flex items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1 overflow-hidden w-max shadow-xs"
          >
            Refunded
          </span>
        );
      case 'Cancel':
        return (
          <span 
            data-slot="badge" 
            className="inline-flex items-center justify-center rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1 overflow-hidden w-max shadow-xs"
          >
            Cancel
          </span>
        );
      case 'In progress':
        return (
          <span 
            data-slot="badge" 
            className="inline-flex items-center justify-center rounded-md border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1 overflow-hidden w-max shadow-xs"
          >
            In progress
          </span>
        );
      case 'In Review':
        return (
          <span 
            data-slot="badge" 
            className="inline-flex items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 gap-1 overflow-hidden w-max shadow-xs"
          >
            In Review
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

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 md:p-6 select-none font-sans">
      {/* Creative Tim Orders Table Card */}
      <div 
        data-slot="card" 
        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col gap-6 rounded-2xl border border-slate-200 dark:border-slate-800 py-6 shadow-sm overflow-hidden"
      >
        {/* Card Header */}
        <div 
          data-slot="card-header" 
          className="m-0 flex w-full flex-wrap items-center justify-between gap-4 px-6 pb-2"
        >
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Orders Table
              </h2>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                @creative-tim/ui block
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Comprehensive orders tracking table with real-time filters, selection checkboxes, and action triggers
            </p>
          </div>

          <div className="flex w-full items-center gap-2.5 sm:w-max">
            {/* Data Source Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setDataSource('auracad')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  dataSource === 'auracad'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                AuraCAD Studio ({orders.length})
              </button>
              <button
                onClick={() => setDataSource('demo')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  dataSource === 'demo'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Demo Catalog (8)
              </button>
            </div>

            {/* Filter Toggle Button */}
            <button 
              onClick={() => setShowFilters(!showFilters)}
              data-slot="button" 
              className={`justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all border shadow-xs h-8 px-3 flex items-center gap-1.5 cursor-pointer ${
                showFilters 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Filter</span>
            </button>

            {/* Export Button */}
            <button 
              onClick={handleExport}
              data-slot="button" 
              className="justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 h-8 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="mx-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-150">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by ID, customer email, product..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="In progress">In progress</option>
                <option value="In Review">In Review</option>
                <option value="Refunded">Refunded</option>
                <option value="Cancel">Cancel</option>
              </select>
            </div>

            {(searchQuery || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('All');
                  setCurrentPage(1);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Selected Banner */}
        {selectedIds.size > 0 && (
          <div className="mx-6 px-4 py-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
            <span className="font-semibold">{selectedIds.size} row(s) selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedIds(new Set())}
                className="hover:underline font-medium"
              >
                Deselect All
              </button>
              <button
                onClick={handleExport}
                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 cursor-pointer"
              >
                Export Selected
              </button>
            </div>
          </div>
        )}

        {/* Table Content */}
        <div data-slot="card-content" className="overflow-x-auto rounded-none p-0">
          <table className="w-full min-w-max table-auto text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-y border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <th className="p-4 w-12">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                      onChange={toggleSelectAll}
                      className="size-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      id="select-all"
                    />
                    <label htmlFor="select-all" className="cursor-pointer">ID</label>
                  </div>
                </th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product / Piece</th>
                <th className="p-4">Revenue</th>
                <th className="p-4 w-12 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    No matching orders found. Try adjusting your search query or status filter.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const isChecked = selectedIds.has(item.id);
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-colors ${
                        isChecked 
                          ? 'bg-blue-50/50 dark:bg-blue-950/20' 
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {/* ID with Checkbox */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectRow(item.id)}
                            className="size-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            id={`check-${item.id}`}
                          />
                          <label 
                            htmlFor={`check-${item.id}`} 
                            className="font-mono font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
                          >
                            {item.orderNumber}
                          </label>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4 text-slate-600 dark:text-slate-300">
                        {item.date}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px] uppercase">
                            {item.customerEmail.charAt(0)}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">
                            {item.customerEmail}
                          </span>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="p-4">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {item.product}
                        </span>
                      </td>

                      {/* Revenue */}
                      <td className="p-4 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        ${item.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Actions Dropdown */}
                      <td className="p-4 text-end">
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild>
                            <button 
                              data-slot="dropdown-menu-trigger" 
                              className="inline-flex items-center justify-center size-8 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              aria-label="Actions"
                            >
                              <EllipsisVertical className="size-4" />
                            </button>
                          </DropdownMenu.Trigger>

                          <DropdownMenu.Portal>
                            <DropdownMenu.Content 
                              className="z-50 min-w-[160px] bg-white dark:bg-slate-800 rounded-xl p-1.5 shadow-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in-80"
                              sideOffset={5}
                              align="end"
                            >
                              {item.originalOrder && onSelectOrder && (
                                <DropdownMenu.Item 
                                  onClick={() => onSelectOrder(item.originalOrder!)}
                                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer outline-none font-medium"
                                >
                                  <Eye className="size-3.5 text-blue-500" />
                                  <span>Inspect CAD Order</span>
                                </DropdownMenu.Item>
                              )}

                              <DropdownMenu.Item 
                                onClick={() => copyToClipboard(item.orderNumber, item.id)}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer outline-none font-medium"
                              >
                                {copiedId === item.id ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
                                <span>{copiedId === item.id ? 'Copied!' : 'Copy Order ID'}</span>
                              </DropdownMenu.Item>

                              <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-700 my-1" />

                              <DropdownMenu.Item 
                                onClick={() => {
                                  alert(`Order ${item.orderNumber} receipt exported.`);
                                }}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer outline-none font-medium"
                              >
                                <Download className="size-3.5" />
                                <span>Export Invoice</span>
                              </DropdownMenu.Item>
                            </DropdownMenu.Content>
                          </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Card Footer with Pagination */}
        <div 
          data-slot="card-footer" 
          className="flex flex-wrap items-center justify-between gap-4 px-6 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs"
        >
          <p className="text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>{' '}
            ({filteredData.length} total orders)
          </p>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage <= 1}
              data-slot="button" 
              className="justify-center whitespace-nowrap text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none h-8 rounded-lg px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Prev</span>
            </button>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              data-slot="button" 
              className="justify-center whitespace-nowrap text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none h-8 rounded-lg px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
