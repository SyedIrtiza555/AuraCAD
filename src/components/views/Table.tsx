import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
  VisibilityState
} from '@tanstack/react-table';
import { Order, OrderStatus, STATUSES, detectOrderType } from '../../types';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Diamond,
  Medal,
  Watch,
  Sparkles,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  Clock,
  User,
  MoreHorizontal
} from 'lucide-react';
import { OrderPictureCarousel } from '../OrderPictureCarousel';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { AuraColorRule, getOrderAura } from '../../theme/auraTheme';

interface OrderTableProps {
  getClientName: (id: string) => string;
  orders: Order[];
  onOrderClick: (order: Order) => void;
  sortConfig?: { key: keyof Order; direction: 'asc' | 'desc' } | null;
  onSort?: (key: keyof Order) => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  colorRule?: AuraColorRule;
  onBatchStatusChange?: (orderIds: string[], newStatus: OrderStatus) => void;
}

export function OrderTable({
  orders,
  onOrderClick,
  getClientName,
  onStatusChange,
  colorRule = 'status',
  onBatchStatusChange
}: OrderTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [isDense, setIsDense] = useState(false);

  const getOrderTypeBadge = (order: Order) => {
    const type = detectOrderType(order);
    switch (type) {
      case 'Ring':
        return { label: 'Ring', icon: <Diamond size={11} className="text-[#ff943c]" />, badge: 'text-[#ff943c] bg-[#ff943c]/10 border-[#ff943c]/25' };
      case 'Bracelet':
        return { label: 'Bracelet', icon: <Watch size={11} className="text-blue-400" />, badge: 'text-blue-300 bg-blue-500/10 border-blue-500/25' };
      case 'Pendant':
        return { label: 'Pendant', icon: <Medal size={11} className="text-amber-400" />, badge: 'text-amber-300 bg-amber-500/10 border-amber-500/25' };
      case 'Earring':
        return { label: 'Earring', icon: <Sparkles size={11} className="text-purple-400" />, badge: 'text-purple-300 bg-purple-500/10 border-purple-500/25' };
    }
  };

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              table.toggleAllPageRowsSelected(!table.getIsAllPageRowsSelected());
            }}
            className="p-1 hover:text-white text-zinc-400 transition-colors"
          >
            {table.getIsAllPageRowsSelected() ? (
              <CheckSquare size={14} className="text-[#ff943c]" />
            ) : table.getIsSomePageRowsSelected() ? (
              <Square size={14} className="text-amber-400" />
            ) : (
              <Square size={14} />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              row.toggleSelected();
            }}
            className="p-1 hover:text-white text-zinc-400 transition-colors"
          >
            {row.getIsSelected() ? (
              <CheckSquare size={14} className="text-[#ff943c]" />
            ) : (
              <Square size={14} />
            )}
          </button>
        ),
        enableSorting: false,
        size: 32
      },
      {
        id: 'visual',
        header: 'CAD Visual',
        cell: ({ row }) => (
          <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/40 shadow-sm relative group/img">
            <OrderPictureCarousel
              images={row.original.images || []}
              title={row.original.title}
              aspectRatio="square"
              className="w-full h-full"
            />
          </div>
        ),
        enableSorting: false,
        size: 70
      },
      {
        accessorKey: 'id',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold text-zinc-400 hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            ID
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={11} className="text-[#ff943c]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={11} className="text-[#ff943c]" />
            ) : (
              <ArrowUpDown size={11} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-300">
            {row.original.id}
          </div>
        )
      },
      {
        accessorKey: 'title',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Design Brief
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={11} className="text-[#ff943c]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={11} className="text-[#ff943c]" />
            ) : (
              <ArrowUpDown size={11} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const badge = getOrderTypeBadge(row.original);
          return (
            <div className="flex flex-col gap-1 max-w-[280px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${badge.badge}`}>
                  {badge.icon}
                  {badge.label}
                </span>
                <span className="font-semibold text-xs text-slate-900 dark:text-zinc-100 truncate group-hover:text-[#ff943c] transition-colors">
                  {row.original.title}
                </span>
              </div>
              {row.original.cadStage && (
                <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  Stage: {row.original.cadStage}
                </span>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'clientId',
        header: 'Client',
        cell: ({ row }) => (
          <div className="text-xs text-slate-800 dark:text-zinc-300 font-medium flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-800 border border-slate-300 dark:border-white/10 flex items-center justify-center text-[10px] font-bold text-slate-800 dark:text-zinc-300">
              {getClientName(row.original.clientId).charAt(0)}
            </span>
            <span className="truncate max-w-[120px]">{getClientName(row.original.clientId)}</span>
          </div>
        )
      },
      {
        id: 'assignees',
        header: 'Assignees',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <span 
              title={`CAD Designer: ${row.original.designer}`}
              className="w-6 h-6 rounded-md bg-cyan-100 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-cyan-800 dark:text-cyan-300"
            >
              {row.original.designer?.charAt(0) || 'D'}
            </span>
            <span 
              title={`Closer: ${row.original.closer}`}
              className="w-6 h-6 rounded-md bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-800 dark:text-amber-300"
            >
              {row.original.closer?.charAt(0) || 'C'}
            </span>
            <span 
              title={`Forge: ${row.original.production}`}
              className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-800 dark:text-purple-300"
            >
              {row.original.production?.charAt(0) || 'F'}
            </span>
          </div>
        )
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Status
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={11} className="text-[#ff943c]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={11} className="text-[#ff943c]" />
            ) : (
              <ArrowUpDown size={11} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <OrderStatusBadge
              order={row.original}
              variant="pill"
              size="sm"
            />
          </div>
        )
      },
      {
        accessorKey: 'value',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Value
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={11} className="text-[#ff943c]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={11} className="text-[#ff943c]" />
            ) : (
              <ArrowUpDown size={11} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => (
          <div className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-200">
            ${(row.original.value || 0).toLocaleString()}
          </div>
        )
      },
      {
        accessorKey: 'dueDate',
        header: ({ column }) => (
          <button
            className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Due Date
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp size={11} className="text-[#ff943c]" />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown size={11} className="text-[#ff943c]" />
            ) : (
              <ArrowUpDown size={11} className="opacity-40" />
            )}
          </button>
        ),
        cell: ({ row }) => {
          const isOverdue = new Date(row.original.dueDate) < new Date() && row.original.status !== 'Delivered';
          return (
            <div className={`flex items-center gap-1 font-mono text-[11px] ${isOverdue ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-zinc-400'}`}>
              <Clock size={11} />
              {row.original.dueDate}
            </div>
          );
        }
      }
    ],
    [getClientName, onStatusChange, colorRule]
  );

  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
      columnVisibility
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const selectedRows = table.getSelectedRowModel().rows;

  const handleExportJSON = () => {
    const dataToExport = selectedRows.length > 0 ? selectedRows.map(r => r.original) : orders;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracad_orders_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchStatus = (status: OrderStatus) => {
    const ids = selectedRows.map(r => r.original.id);
    if (ids.length === 0) return;
    if (onBatchStatusChange) {
      onBatchStatusChange(ids, status);
    } else {
      ids.forEach(id => onStatusChange?.(id, status));
    }
    table.resetRowSelection();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* TanStack Table Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white/95 dark:bg-zinc-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search orders, clients, designs..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-zinc-200 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c]"
          />
        </div>

        {/* Batch Actions & Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-semibold">
              <span>{selectedRows.length} selected</span>
              <div className="h-3 w-px bg-orange-500/30 mx-1" />
              <button
                onClick={() => handleBatchStatus('In progress')}
                className="hover:underline text-[11px]"
              >
                Start
              </button>
              <button
                onClick={() => handleBatchStatus('In Review')}
                className="hover:underline text-[11px]"
              >
                Review
              </button>
              <button
                onClick={() => handleBatchStatus('Delivered')}
                className="hover:underline text-[11px]"
              >
                Deliver
              </button>
            </div>
          )}

          <button
            onClick={() => setIsDense(!isDense)}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              isDense 
                ? 'bg-slate-900 dark:bg-white/10 text-white border-slate-900 dark:border-white/20' 
                : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-400 hover:bg-slate-50 dark:hover:text-zinc-200'
            }`}
          >
            {isDense ? 'Compact' : 'Comfortable'}
          </button>

          <button
            onClick={handleExportJSON}
            title="Export orders as JSON"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-black/30 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 text-xs transition-colors"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* TanStack Data Grid */}
      <div className="w-full overflow-x-auto pb-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-zinc-900/40 backdrop-blur-2xl shadow-sm">
        <table className="w-full text-left border-collapse min-w-[950px]">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-white/10 bg-slate-50/90 dark:bg-white/[0.02]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="py-2.5 px-3 text-[10px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider select-none"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-500 text-sm">
                  No orders matched your search or filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onOrderClick(row.original)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: row.original.id }));
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group active:cursor-grabbing ${
                    row.getIsSelected() ? 'bg-orange-500/[0.06]' : ''
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-3 ${isDense ? 'py-2' : 'py-3.5'} align-middle`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* TanStack Table Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 px-4 rounded-xl bg-white/95 dark:bg-zinc-900/40 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-zinc-400 shadow-sm">
        <div className="flex items-center gap-2">
          <span>
            Page <strong className="text-slate-900 dark:text-zinc-200">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong className="text-slate-900 dark:text-zinc-200">{table.getPageCount() || 1}</strong>
          </span>
          <span className="text-slate-300 dark:text-zinc-600">|</span>
          <span>{table.getFilteredRowModel().rows.length} total orders</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-slate-800 dark:text-zinc-300 focus:outline-none"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>

          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
