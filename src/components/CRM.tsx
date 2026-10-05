import React, { useState, useMemo } from 'react';
import { Client, Order, ViewPreset } from '../types';
import { AURA_PALETTE, AuraColorId } from '../theme/auraTheme';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Diamond, 
  User, 
  X, 
  ExternalLink
} from 'lucide-react';

interface CRMProps {
  clients: Client[];
  orders?: Order[];
  onSelectOrder?: (order: Order) => void;
  onSelectClient?: (client: Client) => void;
  onOpenNewClient?: () => void;
  onAddClient?: (client: Client) => void;
  preset?: ViewPreset;
}

export function CRM({ 
  clients, 
  orders = [], 
  onSelectOrder, 
  onSelectClient,
  onOpenNewClient,
  onAddClient,
  preset = 'minimal' 
}: CRMProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Lead' | 'Inactive'>('All');

  // Form state for new client
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientStatus, setNewClientStatus] = useState<'Active' | 'Lead'>('Active');
  const [newClientNotes, setNewClientNotes] = useState('');

  const isMinimal = preset === 'minimal' || (preset as string) === 'ultra-minimal';

  const handleClientClick = (client: Client) => {
    if (onSelectClient) {
      onSelectClient(client);
    } else {
      setSelectedClient(client);
    }
  };

  const enrichedClients = useMemo(() => {
    return clients.map(client => {
      const clientOrders = orders.filter(o => o.clientId === client.id);
      const totalSpend = clientOrders.reduce((sum, o) => sum + (o.value || 0), 0);
      const activeOrders = clientOrders.filter(o => o.status !== 'Delivered');
      return {
        ...client,
        orders: clientOrders,
        totalSpend,
        activeOrders
      };
    });
  }, [clients, orders]);

  const filteredClients = useMemo(() => {
    return enrichedClients.filter(c => {
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) || 
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  }, [enrichedClients, searchQuery, statusFilter]);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: Client = {
      id: `CLI-${String(clients.length + 1).padStart(3, '0')}`,
      name: newClientName.trim(),
      email: newClientEmail.trim() || `${newClientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: newClientPhone.trim() || '+1 (555) 000-0000',
      status: newClientStatus,
      notes: newClientNotes.trim()
    };

    if (onAddClient) {
      onAddClient(newClient);
    }
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-wrap items-center justify-between pb-4 gap-2.5 shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#ff943c] shadow-xs transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Status pill filter */}
          <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
            {(['All', 'Active', 'Lead'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-0.5 rounded-full transition-all cursor-pointer font-medium ${
                  statusFilter === st 
                    ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            <span className="text-slate-900 font-semibold">{filteredClients.length}</span> clients
          </span>

          <button 
            onClick={() => onOpenNewClient ? onOpenNewClient() : setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ff943c] hover:bg-[#e07d2c] text-white font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Create New Client"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Client</span>
          </button>
        </div>
      </div>

      {/* Grid of Client Cards: Minimal vs Basic */}
      <div className={
        isMinimal
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 overflow-y-auto pb-24"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-24"
      }>
        {filteredClients.map((client) => {
          const initials = client.name
            .split(' ')
            .map(n => n[0])
            .filter(Boolean)
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'CL';

          const clientAura = client.color && AURA_PALETTE[client.color as AuraColorId]
            ? AURA_PALETTE[client.color as AuraColorId]
            : (client.status === 'Active' ? AURA_PALETTE.emerald : AURA_PALETTE.blue);

          // 1. MINIMAL (Zen Mode)
          if (isMinimal) {
            return (
              <div 
                key={client.id}
                onClick={() => handleClientClick(client)}
                className={`group flex flex-col p-3 rounded-2xl ${clientAura.glassBg} ${clientAura.border} transition-all duration-200 shadow-2xs hover:shadow-xs cursor-pointer select-none`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg ${clientAura.badge} flex items-center justify-center font-bold text-xs shrink-0`}>
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-slate-900 truncate group-hover:text-[#ff943c] transition-colors">
                      {client.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{client.id}</p>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">
                    {client.activeOrders.length > 0 ? `${client.activeOrders.length} active` : 'No active'}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${clientAura.dot}`} />
                </div>
              </div>
            );
          }

          // 2. BASIC (Balanced Mode with Contact & Projects)
          return (
            <div 
              key={client.id}
              onClick={() => handleClientClick(client)}
              className={`group flex flex-col p-3.5 rounded-2xl ${clientAura.glassBg} ${clientAura.border} transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer select-none`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-xl ${clientAura.badge} flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs`}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#ff943c] transition-colors truncate">
                      {client.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono truncate block">{client.id}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${
                  client.status === 'Active' 
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300' 
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {client.status}
                </span>
              </div>

              {/* Active Jewelry Projects Chips */}
              {client.activeOrders.length > 0 ? (
                <div className="my-1.5 p-1.5 rounded-xl bg-white/80 border border-slate-200/80">
                  <div className="flex gap-1 overflow-x-auto scrollbar-none">
                    {client.activeOrders.map(ord => (
                      <div 
                        key={ord.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectOrder) onSelectOrder(ord);
                        }}
                        className="flex items-center gap-1 p-1 rounded-lg bg-white border border-slate-200 shrink-0 hover:border-[#ff943c] transition-colors"
                        title={`${ord.title} (${ord.status})`}
                      >
                        {ord.images && ord.images[0] && (
                          <img src={ord.images[0]} alt="cad" className="w-5 h-5 object-cover rounded" />
                        )}
                        <span className="text-[10px] font-mono text-slate-800 pr-1 truncate max-w-[80px]">{ord.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-auto pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span className="truncate max-w-[120px]">{client.email}</span>
                {client.totalSpend > 0 && (
                  <span className="font-bold text-slate-900 tabular-nums">${(client.totalSpend / 1000).toFixed(1)}k</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 rounded-2xl border border-slate-200 bg-white shadow-xs">
          <User size={28} className="text-slate-300 mb-2" />
          <h3 className="text-xs font-semibold text-slate-700">No Clients Found</h3>
        </div>
      )}

      {/* Client Detail Slide-Over Sidebar Panel */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setSelectedClient(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-14">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 p-5 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col h-full overflow-hidden text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shadow-xs">
                    {selectedClient.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedClient.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{selectedClient.id}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedClient(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Email</span>
                    <a href={`mailto:${selectedClient.email}`} className="text-slate-900 hover:text-[#ff943c] font-medium transition-colors truncate block">
                      {selectedClient.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Phone</span>
                    <a href={`tel:${selectedClient.phone}`} className="text-slate-900 hover:text-[#ff943c] font-medium transition-colors block">
                      {selectedClient.phone}
                    </a>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block mb-1">Preferences & Notes</span>
                    <p className="text-slate-700 leading-relaxed text-xs">{selectedClient.notes}</p>
                  </div>
                )}

                {/* Connected Orders */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-semibold">
                      Client Orders ({orders.filter(o => o.clientId === selectedClient.id).length})
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {orders.filter(o => o.clientId === selectedClient.id).length === 0 ? (
                      <p className="text-slate-400 italic py-2 text-xs">No orders recorded yet.</p>
                    ) : (
                      orders.filter(o => o.clientId === selectedClient.id).map(ord => (
                        <div 
                          key={ord.id}
                          onClick={() => {
                            setSelectedClient(null);
                            if (onSelectOrder) onSelectOrder(ord);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-2">
                            {ord.images && ord.images[0] && (
                              <img src={ord.images[0]} alt="cad" className="w-7 h-7 object-cover rounded-lg border border-slate-200" />
                            )}
                            <div>
                              <span className="font-semibold text-slate-900 block text-xs">{ord.title}</span>
                              <span className="text-[9px] font-mono text-slate-400">{ord.id} • {ord.status}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {ord.value && (
                              <span className="font-mono text-slate-800 font-bold text-xs">${ord.value.toLocaleString()}</span>
                            )}
                            <ExternalLink size={11} className="text-slate-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedClient(null)}
                  className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Slide-Over Panel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            onClick={() => setIsAddModalOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-14">
            <form 
              onSubmit={handleCreateClient}
              className="w-screen max-w-md bg-white border-l border-slate-200 p-5 shadow-2xl animate-in slide-in-from-right duration-200 flex flex-col h-full overflow-hidden text-slate-800"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
                <h3 className="text-sm font-bold text-slate-900">New Client</h3>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs flex-1 overflow-y-auto pr-1">
                <div>
                  <label className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Julian Vance" 
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Email</label>
                    <input 
                      type="email" 
                      placeholder="julian@example.com" 
                      value={newClientEmail}
                      onChange={e => setNewClientEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c]"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Phone</label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 234-5678" 
                      value={newClientPhone}
                      onChange={e => setNewClientPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Status</label>
                  <select
                    value={newClientStatus}
                    onChange={e => setNewClientStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c]"
                  >
                    <option value="Active">Active</option>
                    <option value="Lead">Lead</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono text-slate-500 font-bold block mb-1">Notes</label>
                  <textarea 
                    rows={3}
                    placeholder="Preferences, custom diamond specs..."
                    value={newClientNotes}
                    onChange={e => setNewClientNotes(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#ff943c] resize-none"
                  />
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1 rounded-full bg-[#ff943c] hover:bg-[#e07d2c] text-white font-bold text-xs shadow-xs"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
