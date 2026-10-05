import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, LayoutGrid, Users, Plus, Diamond, FileText } from 'lucide-react';
import { Order, Client } from '../types';

interface CommandPaletteProps {
  getClientName: (id: string) => string;
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  clients: Client[];
  onNavigate: (module: 'orders' | 'crm') => void;
  onCreateOrder: () => void;
  onSelectOrder: (order: Order) => void;
  onSelectClient?: (client: Client) => void;
}

export function CommandPalette({ isOpen, onClose, orders, clients, onNavigate, onCreateOrder, onSelectOrder, onSelectClient, getClientName }: CommandPaletteProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredOrders = query ? orders.filter(o => 
    o.title.toLowerCase().includes(query.toLowerCase()) || 
    o.id.toLowerCase().includes(query.toLowerCase()) ||
    getClientName(o.clientId).toLowerCase().includes(query.toLowerCase())
  ) : [];

  const filteredClients = query ? clients.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.id.toLowerCase().includes(query.toLowerCase())
  ) : [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800"
        >
          <div className="flex items-center px-6 border-b border-slate-100">
            <Search className="text-slate-400 mr-4" size={20} />
            <input 
              type="text" 
              autoFocus
              placeholder="Search orders, clients, or type a command..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent py-5 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200 px-2 py-1 rounded bg-slate-50">ESC</div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {!query && (
              <div className="p-4 space-y-1">
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick Actions</div>
                <button 
                  onClick={() => { onNavigate('orders'); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors rounded-xl text-left"
                >
                  <LayoutGrid size={15} className="text-[#ff943c]" /> Go to Orders Studio
                </button>
                <button 
                  onClick={() => { onNavigate('crm'); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors rounded-xl text-left"
                >
                  <Users size={15} className="text-blue-500" /> Go to Clients CRM
                </button>
                <button 
                  onClick={() => { onCreateOrder(); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors rounded-xl text-left"
                >
                  <Plus size={15} className="text-emerald-500" /> Create New Order
                </button>
              </div>
            )}

            {query && (
              <div className="p-4 space-y-4">
                {filteredOrders.length > 0 && (
                  <div>
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">Orders ({filteredOrders.length})</div>
                    <div className="space-y-1">
                      {filteredOrders.map(order => (
                        <button 
                          key={order.id}
                          onClick={() => { onSelectOrder(order); onClose(); }}
                          className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors rounded-xl text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                              {order.id}
                            </span>
                            <span className="truncate text-slate-900 font-medium">{order.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{getClientName(order.clientId)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {filteredOrders.length === 0 && filteredClients.length === 0 && (
                  <div className="py-12 text-center text-slate-400 text-xs font-medium">
                    No matching orders or clients found
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
