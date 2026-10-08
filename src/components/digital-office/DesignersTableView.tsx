// src/components/digital-office/DesignersTableView.tsx
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Designer, Order } from '../../types';

interface DesignersTableViewProps {
  designers: Designer[];
  orders: Order[];
  onOpenNewDesignerModal: () => void;
  onSelectOrder?: (order: Order) => void;
  onDeleteDesigner?: (designerId: string) => void;
}

export function DesignersTableView({
  designers,
  orders,
  onOpenNewDesignerModal,
  onSelectOrder,
  onDeleteDesigner
}: DesignersTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filtered designers
  const filteredDesigners = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return designers.filter(d => 
      d.name.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      (d.specialty && d.specialty.toLowerCase().includes(q))
    );
  }, [designers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredDesigners.length / itemsPerPage));
  const paginatedDesigners = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDesigners.slice(start, start + itemsPerPage);
  }, [filteredDesigners, currentPage]);

  const handleExport = () => {
    const rows = filteredDesigners.map(d => ({
      Name: d.name,
      Email: d.email,
      Phone: d.phone,
      Specialty: d.specialty || 'General',
      AssignedOrders: orders.filter(o => o.designer_id === d.id).length
    }));
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-office-designers-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              CAD Design Specialists
            </h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              {filteredDesigners.length} staff
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            1:N Relationship: One designer handles multiple bespoke jewelry orders simultaneously
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenNewDesignerModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span>Add Designer</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <Download size={13} />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        {/* Table Search */}
        <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search designer name, email, specialty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Showing {paginatedDesigners.length} of {filteredDesigners.length}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 font-medium">
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Designer Specialist</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Contact Details</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Jewelry Specialty</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Active Handled Orders (1:N)</th>
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 text-center w-20">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedDesigners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No designers found matching search query.
                  </td>
                </tr>
              ) : (
                paginatedDesigners.map((designer) => {
                  const assignedOrders = orders.filter(o => o.designer_id === designer.id);
                  const activeOrders = assignedOrders.filter(o => o.status !== 'Completed' && o.status !== 'Cancelled');

                  return (
                    <tr
                      key={designer.id}
                      className="group hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs border border-purple-300 dark:border-purple-700">
                            {designer.name.charAt(0)}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-600 transition-colors">
                              {designer.name}
                            </div>
                            <div className="text-[10px] font-mono text-slate-400">
                              ID: {designer.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Mail size={11} className="text-slate-400" />
                            <span>{designer.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                            <Phone size={11} className="text-slate-400" />
                            <span>{designer.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Specialty */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                          <Sparkles size={11} className="text-purple-500" />
                          {designer.specialty || 'All CAD categories'}
                        </span>
                      </td>

                      {/* Handled Orders */}
                      <td className="p-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {activeOrders.length} active ({assignedOrders.length} total)
                          </span>
                          {assignedOrders.slice(0, 3).map(o => (
                            <button
                              key={o.id}
                              onClick={() => onSelectOrder?.(o)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:underline cursor-pointer"
                              title={o.name}
                            >
                              {o.order_code}
                            </button>
                          ))}
                          {assignedOrders.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{assignedOrders.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onDeleteDesigner?.(designer.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Designer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40 dark:bg-slate-900/40">
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
