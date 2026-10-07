import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/Kanban';
import { OrderModal } from './components/OrderModal';
import { EntitySidebar, ActiveEntity, PeekMode } from './components/EntitySidebar';
import { CRM } from './components/CRM';
import { OrderTable } from './components/views/Table';
import { OrderCalendar } from './components/views/Calendar';
import { TeamView } from './components/views/Team';
import { SmartCardsView } from './components/views/SmartCardsView';
import { FloatingViewSwitcher } from './components/FloatingViewSwitcher';
import { LiquidGlassFAB } from './components/LiquidGlassFAB';
import { ViewPresetDropdown } from './components/ViewPresetDropdown';
import { ComplaintsView } from './components/views/ComplaintsView';
import { AuraColorRule } from './theme/auraTheme';
import { v4 as uuidv4 } from 'uuid';
import { CommandPalette } from './components/CommandPalette';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  db,
  initializeDatabase,
  dbAddOrder,
  dbUpdateOrder,
  dbDeleteOrder,
  dbAddClient,
  dbUpdateClient,
  dbAddProspect,
  dbUpdateProspect,
  dbConvertProspectToOrder,
  resetDatabaseToDefaults
} from './db/database';
import { INITIAL_ORDERS, INITIAL_CLIENTS, INITIAL_PROSPECTS } from './data';
import { Order, Client, OrderStatus, OrderType, ORDER_TYPES, Prospect, STATUSES, ViewPreset, detectOrderType } from './types';
import { 
  Bell, 
  Search, 
  Filter, 
  Moon, 
  Sun, 
  PanelRightClose, 
  PanelRightOpen, 
  List,
  Lock,
  Unlock,
  ChevronRight,
  Activity,
  Diamond,
  Medal,
  Watch,
  Sparkles,
  Tag,
  Crown,
  UserCheck,
  Compass,
  PhoneCall
} from 'lucide-react';
import { RoleManagementModal } from './components/RoleManagementModal';
import { DesignerBenchView } from './components/views/DesignerBenchView';
import { AgentCrmView } from './components/views/AgentCrmView';
import { getCurrentUser, PBUser, UserRole } from './lib/pocketbase';

export default function App() {
  // Dexie.js Reactive Offline Persistence Layer
  useEffect(() => {
    initializeDatabase();
  }, []);

  const liveOrders = useLiveQuery(() => db.orders.toArray(), []);
  const liveClients = useLiveQuery(() => db.clients.toArray(), []);
  const liveProspects = useLiveQuery(() => db.prospects.toArray(), []);

  const [localOrders, setLocalOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [localClients, setLocalClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [localProspects, setLocalProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);

  const orders = liveOrders && liveOrders.length > 0 ? liveOrders : localOrders;
  const clients = liveClients && liveClients.length > 0 ? liveClients : localClients;
  const prospects = liveProspects && liveProspects.length > 0 ? liveProspects : localProspects;

  const setOrders = (val: Order[] | ((prev: Order[]) => Order[])) => {
    setLocalOrders(val);
  };
  const setClients = (val: Client[] | ((prev: Client[]) => Client[])) => {
    setLocalClients(val);
  };
  const setProspects = (val: Prospect[] | ((prev: Prospect[]) => Prospect[])) => {
    setLocalProspects(val);
  };

  const [focusedOrderIndex, setFocusedOrderIndex] = useState<number>(0);

  // Persistent entity inspector state (Orders & Clients in sidebar)
  const [activeEntity, setActiveEntity] = useState<ActiveEntity | null>(null);
  const [peekMode, setPeekMode] = useState<PeekMode>(() => {
    return (localStorage.getItem('aydieo_entity_peek_mode') as PeekMode) || 'sidebar';
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [currentModule, setCurrentModule] = useState<'orders' | 'crm' | 'complaints' | 'designer_bench' | 'agent_crm'>('orders');
  const [currentUser, setCurrentUser] = useState<PBUser>(() => getCurrentUser());
  const [activeRoleView, setActiveRoleView] = useState<'all' | 'admin' | 'designer' | 'agent'>('all');
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'cards' | 'table' | 'kanban' | 'calendar' | 'team'>('cards');
  const [viewPreset, setViewPreset] = useState<ViewPreset>(() => {
    const saved = localStorage.getItem('aydieo_view_preset');
    return saved === 'basic' ? 'basic' : 'minimal';
  });
  const [auraRule, setAuraRule] = useState<AuraColorRule>('status');

  const totalComplaintsCount = useMemo(() => {
    return orders.reduce((sum, o) => {
      const activeMsgs = (o.designerMessages || []).filter(m => !m.resolved && !m.isArchived).length;
      return sum + activeMsgs;
    }, 0);
  }, [orders]);

  const [filterType, setFilterType] = useState<'All' | OrderType>('All');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'All'>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Backlog state: Lockable and small
  const [backlogIds, setBacklogIds] = useState<string[]>([]);
  const [isBacklogLocked, setIsBacklogLocked] = useState(false);
  const [isBacklogExpanded, setIsBacklogExpanded] = useState(false);
  const [isBacklogHovered, setIsBacklogHovered] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order; direction: 'asc' | 'desc' } | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
  });

  const getClientName = (clientId: string) => {
    return clients.find(c => c.id === clientId)?.name || 'UNKNOWN CLIENT';
  };

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      document.body.classList.remove('theme-dark');
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  const handleSaveOrder = (orderData: Partial<Order>) => {
    const targetId = activeEntity?.type === 'order' && activeEntity.id ? activeEntity.id : selectedOrder?.id;
    if (targetId) {
      const existing = orders.find(o => o.id === targetId);
      if (existing) {
        const updated = { ...existing, ...orderData } as Order;
        if (existing.status !== updated.status) {
          updated.history = [...(existing.history || []), { status: updated.status, date: new Date().toISOString() }];
        }
        dbUpdateOrder(targetId, updated);
        setOrders(orders.map(o => o.id === targetId ? updated : o));
      }
    } else {
      const newOrder: Order = {
        ...orderData,
        id: `ORD-${uuidv4().substring(0, 8).toUpperCase()}`,
        status: orderData.status || 'Inbox',
        orderType: orderData.orderType || 'Ring',
        createdAt: new Date().toISOString(),
        images: orderData.images && orderData.images.length > 0 ? orderData.images : [
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
        ],
        history: [{ status: orderData.status || 'Inbox', date: new Date().toISOString() }]
      } as Order;
      dbAddOrder(newOrder);
      setOrders([newOrder, ...orders]);
    }
  };

  const handleSaveClient = (clientData: Partial<Client>) => {
    if (activeEntity?.type === 'client' && activeEntity.id) {
      dbUpdateClient(activeEntity.id, clientData);
      setClients(clients.map(c => c.id === activeEntity.id ? { ...c, ...clientData } as Client : c));
    } else {
      const newClient: Client = {
        id: `CLI-00${clients.length + 1}`,
        name: clientData.name || 'New Client',
        email: clientData.email || '',
        phone: clientData.phone || '',
        status: clientData.status || 'Active',
        notes: clientData.notes || ''
      };
      dbAddClient(newClient);
      setClients([newClient, ...clients]);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    dbUpdateOrder(orderId, { status: newStatus });
    setOrders(orders.map(o => {
      if (o.id === orderId && o.status !== newStatus) {
        return { 
          ...o, 
          status: newStatus,
          history: [...(o.history || []), { status: newStatus, date: new Date().toISOString() }]
        };
      }
      return o;
    }));
  };

  const handleBatchStatusChange = (orderIds: string[], newStatus: OrderStatus) => {
    orderIds.forEach(id => {
      handleStatusChange(id, newStatus);
    });
  };

  const handleAssignTeamMember = (orderId: string, role: string, name: string) => {
    dbUpdateOrder(orderId, { [role]: name });
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          [role]: name
        };
      }
      return o;
    }));
  };

  const handleSort = (key: keyof Order) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Prospect CRM Handlers
  const handleUpdateProspect = (updated: Prospect) => {
    dbUpdateProspect(updated.id, updated);
    setProspects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleAddProspect = (newProspect: Prospect) => {
    dbAddProspect(newProspect);
    setProspects(prev => [newProspect, ...prev]);
  };

  const handleConvertToOrder = async (prospect: Prospect) => {
    const newOrder = await dbConvertProspectToOrder(prospect.id, {
      title: prospect.jewelryType,
      orderType: 'Ring'
    });
    setOrders(prev => [newOrder, ...prev]);
    setProspects(prev => prev.map(p => p.id === prospect.id ? { 
      ...p, 
      orderId: newOrder.id,
      stage: 'Approved / Active Order'
    } : p));

    setSelectedOrder(newOrder);
    setIsModalOpen(true);
  };

  const handleUpdateOrderFields = (orderId: string, updatedFields: Partial<Order>) => {
    dbUpdateOrder(orderId, updatedFields);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { ...o, ...updatedFields };
      }
      return o;
    }));
  };

  const handlePresetChange = (preset: ViewPreset) => {
    setViewPreset(preset);
    localStorage.setItem('aydieo_view_preset', preset);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter(o => {
      if (backlogIds.includes(o.id)) return false;
      if (filterStatus !== 'All' && o.status !== filterStatus) return false;
      if (filterType !== 'All' && detectOrderType(o) !== filterType) return false;
      return true;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        if ((a[sortConfig.key] ?? '') < (b[sortConfig.key] ?? '')) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if ((a[sortConfig.key] ?? '') > (b[sortConfig.key] ?? '')) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [orders, sortConfig, filterStatus, filterType, backlogIds]);

  // Desktop Power-User Keyboard Shortcut Matrix
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setActiveEntity({ type: 'order', isNew: true });
        return;
      }

      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
        setActiveEntity(null);
        setIsModalOpen(false);
        return;
      }

      if (isInput) return;

      // J / K for order list keyboard traversal
      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredAndSortedOrders.length === 0) return;
        setFocusedOrderIndex(prev => {
          const next = (prev + 1) % filteredAndSortedOrders.length;
          const target = filteredAndSortedOrders[next];
          if (target) setActiveEntity({ type: 'order', id: target.id });
          return next;
        });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredAndSortedOrders.length === 0) return;
        setFocusedOrderIndex(prev => {
          const next = (prev - 1 + filteredAndSortedOrders.length) % filteredAndSortedOrders.length;
          const target = filteredAndSortedOrders[next];
          if (target) setActiveEntity({ type: 'order', id: target.id });
          return next;
        });
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (activeEntity) {
          setActiveEntity(null);
        } else if (filteredAndSortedOrders.length > 0) {
          const target = filteredAndSortedOrders[focusedOrderIndex] || filteredAndSortedOrders[0];
          setActiveEntity({ type: 'order', id: target.id });
        }
      } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const activeOrderId = activeEntity?.type === 'order' && activeEntity.id 
          ? activeEntity.id 
          : filteredAndSortedOrders[focusedOrderIndex]?.id;
        if (activeOrderId) {
          e.preventDefault();
          const statusMap: Record<string, OrderStatus> = {
            '1': 'Inbox',
            '2': 'In progress',
            '3': 'In Review',
            '4': 'Delivered',
            '5': 'Backlog'
          };
          handleStatusChange(activeOrderId, statusMap[e.key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredAndSortedOrders, focusedOrderIndex, activeEntity]);

  // Native Windows clipboard paste for active order images
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const activeOrderId = activeEntity?.type === 'order' ? activeEntity.id : null;
      if (!activeOrderId) return;

      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (uploadEvent) => {
                const base64 = uploadEvent.target?.result as string;
                if (base64) {
                  const targetOrder = orders.find(o => o.id === activeOrderId);
                  if (targetOrder) {
                    handleUpdateOrderFields(activeOrderId, {
                      images: [...(targetOrder.images || []), base64]
                    });
                  }
                }
              };
              reader.readAsDataURL(file);
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeEntity, orders]);

  const renderOrdersView = () => {
    switch (currentView) {
      case 'cards':
        return (
          <SmartCardsView 
            orders={filteredAndSortedOrders}
            getClientName={getClientName}
            onOrderClick={(order) => setActiveEntity({ type: 'order', id: order.id })}
            onStatusChange={handleStatusChange}
            preset={viewPreset}
            colorRule={auraRule}
            onUpdateOrder={handleUpdateOrderFields}
          />
        );
      case 'table':
        return (
          <OrderTable 
            getClientName={getClientName}
            orders={filteredAndSortedOrders}
            onOrderClick={(order) => setActiveEntity({ type: 'order', id: order.id })}
            sortConfig={sortConfig}
            onSort={handleSort}
            onStatusChange={handleStatusChange}
            colorRule={auraRule}
            onBatchStatusChange={handleBatchStatusChange}
          />
        );
      case 'kanban':
        return (
          <KanbanBoard 
            getClientName={getClientName} 
            orders={filteredAndSortedOrders}
            onOrderClick={(order) => setActiveEntity({ type: 'order', id: order.id })}
            onStatusChange={handleStatusChange}
            onAssignTeamMember={handleAssignTeamMember}
            colorRule={auraRule}
            onUpdateOrder={handleUpdateOrderFields}
          />
        );
      case 'calendar':
        return (
          <OrderCalendar 
            getClientName={getClientName}
            orders={filteredAndSortedOrders}
            onOrderClick={(order) => setActiveEntity({ type: 'order', id: order.id })}
            onDateChange={(orderId, newDate) => {
              setOrders(orders.map(o => o.id === orderId ? {
                ...o,
                dueDate: newDate
              } : o));
            }}
            colorRule={auraRule}
          />
        );
      case 'team':
        return (
          <TeamView 
            orders={filteredAndSortedOrders}
            onOrderClick={(order) => setActiveEntity({ type: 'order', id: order.id })}
          />
        );
    }
  };

  const handleDropToModule = (module: string, data: any) => {
    if (data.type === 'order' || data.type === 'prospect') {
      setCurrentModule(module as any);
    }
  };

  // Backlog draw into view logic:
  // If locked, only draw if expanded. If not locked, draw on hover or expanded.
  const isBacklogDrawn = isBacklogLocked 
    ? isBacklogExpanded 
    : (isBacklogExpanded || isBacklogHovered);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden relative">
      <Sidebar 
        onNewOrder={() => setActiveEntity({ type: 'order', isNew: true })}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        currentModule={currentModule}
        onModuleChange={setCurrentModule}
        onDropToModule={handleDropToModule}
        ordersCount={filteredAndSortedOrders.length}
        clientsCount={clients.length}
        complaintsCount={totalComplaintsCount}
        currentUser={currentUser}
        activeRoleView={activeRoleView}
        onOpenRoleManager={() => setIsRoleManagerOpen(true)}
      />
      
      <main className="flex-1 flex flex-col min-w-0 bg-transparent overflow-hidden relative">
        {/* Frosted Liquid Glass Header - AuraCAD v1 Clean Bright Style */}
        <header className="h-13 border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-5 bg-white/80 backdrop-blur-2xl shrink-0 z-10 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-[#ff943c]/10 to-purple-500/10 border border-amber-300/60 backdrop-blur-xl shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#ff943c] shadow-[0_0_8px_rgba(255,148,60,0.9)] animate-pulse" />
              <span className="text-xs font-bold tracking-tight text-slate-900 font-mono">AuraCAD</span>
              <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-[#ff943c] text-black">v0-a</span>
            </div>
            <ChevronRight size={12} className="text-slate-400" />
            <h2 className="text-xs font-semibold text-slate-700 tracking-wide">
              {currentModule === 'designer_bench' || activeRoleView === 'designer' 
                ? '3D CAD Designer Workbench' 
                : currentModule === 'agent_crm' || activeRoleView === 'agent' 
                ? 'Agent CRM & Powerdialler Hub' 
                : currentModule === 'orders' 
                ? 'Orders Studio' 
                : currentModule === 'crm' 
                ? 'Clients CRM' 
                : 'Complaints & Client Changes Triage'}
            </h2>

            {/* Superuser / God Mode HUD Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/40 text-xs shadow-xs ml-2">
              <div className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 text-[11px]">
                <Crown size={11} className="text-amber-500" />
                <span>God: {currentUser.username}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <div className="flex items-center gap-1 text-[10px] font-semibold">
                <button
                  onClick={() => { setActiveRoleView('all'); setCurrentModule('orders'); }}
                  className={`px-1.5 py-0.2 rounded transition-all cursor-pointer ${activeRoleView === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  All
                </button>
                <button
                  onClick={() => { setActiveRoleView('admin'); setCurrentModule('orders'); }}
                  className={`px-1.5 py-0.2 rounded transition-all cursor-pointer ${activeRoleView === 'admin' ? 'bg-blue-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Admin
                </button>
                <button
                  onClick={() => { setActiveRoleView('designer'); setCurrentModule('designer_bench'); }}
                  className={`px-1.5 py-0.2 rounded transition-all cursor-pointer ${activeRoleView === 'designer' ? 'bg-purple-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Designer
                </button>
                <button
                  onClick={() => { setActiveRoleView('agent'); setCurrentModule('agent_crm'); }}
                  className={`px-1.5 py-0.2 rounded transition-all cursor-pointer ${activeRoleView === 'agent' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Agent
                </button>
              </div>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={() => setIsRoleManagerOpen(true)}
                className="flex items-center gap-0.5 text-[10px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                title="Manage Roles in PocketBase"
              >
                <UserCheck size={11} />
                <span>Roles</span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Complexity Preset Dropdown: 1. Ultra-Minimal, 2. Minimal, 3. Intermediate, 4. Advanced */}
            {currentModule === 'orders' && (
              <ViewPresetDropdown 
                currentPreset={viewPreset}
                onPresetChange={handlePresetChange}
              />
            )}

            {/* Filter in Orders module (Status & Order Type) - Icon only with active indicator dot */}
            {currentModule === 'orders' && (
              <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-center p-2 rounded-full border transition-all cursor-pointer shadow-xs ${
                    filterStatus !== 'All' || filterType !== 'All'
                      ? 'border-[#ff943c] text-amber-950 bg-amber-100 ring-2 ring-amber-300/40' 
                      : 'border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50'
                  }`}
                  title={filterStatus !== 'All' || filterType !== 'All' ? `Filters Active: ${filterStatus} • ${filterType}` : "Filter Orders"}
                  aria-label="Filter Orders"
                >
                  <Filter size={13} strokeWidth={2} />
                  {(filterStatus !== 'All' || filterType !== 'All') && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff943c] ml-1" />
                  )}
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-2xl shadow-xl p-2.5 z-50 flex flex-col gap-2.5 w-56 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 mb-1">
                        [Order Status]
                      </div>
                      <div className="space-y-0.5">
                        <button 
                          onClick={() => { setFilterStatus('All'); setIsFilterOpen(false); }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            filterStatus === 'All' ? 'bg-[#ff943c] text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <span>All Statuses</span>
                          <span className="text-[10px] opacity-75 font-mono">{orders.length}</span>
                        </button>
                        {STATUSES.map(status => {
                          const dotColor = 
                            status === 'Inbox' ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]' :
                            status === 'In progress' ? 'bg-[#ff943c] shadow-[0_0_6px_rgba(255,148,60,0.8)]' :
                            status === 'In Review' ? 'bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]' :
                            status === 'Delivered' ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-400';
                          return (
                            <button 
                              key={status}
                              onClick={() => { setFilterStatus(status as OrderStatus); setIsFilterOpen(false); }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                filterStatus === status ? 'bg-[#ff943c] text-white' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                                <span>{status}</span>
                              </span>
                              <span className="text-[10px] opacity-75 font-mono">
                                {orders.filter(o => o.status === status).length}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-2 py-0.5 mb-1">
                        [Order Type]
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          onClick={() => { setFilterType('All'); setIsFilterOpen(false); }}
                          className={`px-2 py-1 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                            filterType === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          All Types
                        </button>
                        {ORDER_TYPES.map(type => (
                          <button
                            key={type}
                            onClick={() => { setFilterType(type); setIsFilterOpen(false); }}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-lg border text-center transition-colors cursor-pointer ${
                              filterType === type ? 'bg-[#ff943c]/15 text-[#ff943c] border-[#ff943c]/40 font-bold' : 'text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1.5 text-slate-600 hover:text-slate-900 transition-all text-xs cursor-pointer shadow-xs"
              title="Global Search Hub (⌘K)"
            >
              <Search size={13} strokeWidth={2} />
              <kbd className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </button>

            {currentModule === 'orders' && (
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold" 
                title={`${filteredAndSortedOrders.length} Active Orders`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                <span className="tabular-nums">{filteredAndSortedOrders.length}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2.5">
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-slate-500 hover:text-slate-900 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
              </button>
              
              <button 
                onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  isRightSidebarOpen 
                    ? 'bg-slate-200 text-slate-900' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={isRightSidebarOpen ? "Hide Activity Feed" : "Show Activity Feed"}
              >
                <Activity size={13} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body with Clean White Ambience */}
        <div className="flex-1 overflow-auto relative p-4 md:p-6 pb-24">
          {currentModule === 'designer_bench' || activeRoleView === 'designer' ? (
            <DesignerBenchView 
              orders={orders} 
              onUpdateOrderStatus={(id, st) => handleUpdateOrderFields(id, { status: st })} 
            />
          ) : currentModule === 'agent_crm' || activeRoleView === 'agent' ? (
            <AgentCrmView 
              prospects={prospects} 
              clients={clients} 
              onOpenProspect={(p) => setActiveEntity({ type: 'client', id: p.id })}
            />
          ) : (
            <>
              {currentModule === 'orders' && renderOrdersView()}
              {currentModule === 'crm' && (
                <CRM 
                  clients={clients} 
                  orders={orders}
                  preset={viewPreset}
                  onSelectOrder={(order) => setActiveEntity({ type: 'order', id: order.id })}
                  onSelectClient={(client) => setActiveEntity({ type: 'client', id: client.id })}
                  onOpenNewClient={() => setActiveEntity({ type: 'client', isNew: true })}
                  onAddClient={handleSaveClient}
                />
              )}
              {currentModule === 'complaints' && (
                <ComplaintsView 
                  orders={orders}
                  getClientName={getClientName}
                  onUpdateOrder={handleUpdateOrderFields}
                  onSelectOrder={(order) => setActiveEntity({ type: 'order', id: order.id })}
                />
              )}
            </>
          )}
        </div>

        {/* Floating View Switcher (Radix UI Tabs) - Only in Orders Module when not in designer/agent view */}
        {currentModule === 'orders' && activeRoleView !== 'designer' && activeRoleView !== 'agent' && (
          <FloatingViewSwitcher 
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        )}
      </main>

      {/* Right Sidebar - Activity Feed & Workload in Clean Light Theme */}
      {isRightSidebarOpen ? (
        <aside className="w-72 border-l border-slate-200 bg-white/95 backdrop-blur-2xl flex flex-col h-screen shrink-0 overflow-y-auto hidden xl:flex relative text-slate-800">
          <button 
            onClick={() => setIsRightSidebarOpen(false)} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Collapse Panel"
          >
            <PanelRightClose size={13} />
          </button>

          <div className="p-5 pb-3">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-4">
              Real-Time Feed
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex gap-2.5">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-amber-400 shadow-xs shrink-0" />
                <div>
                  <p className="text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900 font-mono text-[10px]">ORD-A1B2C3D4</span> · CAD Rev 2 approved
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">10m ago</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-blue-500 shadow-xs shrink-0" />
                <div>
                  <p className="text-slate-700 leading-snug">
                    Prospect <span className="font-semibold text-slate-900">Julian Vance</span> discovery logged
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">1h ago</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-500 shadow-xs shrink-0" />
                <div>
                  <p className="text-slate-700 leading-snug">
                    <span className="font-semibold text-slate-900 font-mono text-[10px]">ORD-M3N4O5P6</span> casting complete
                  </p>
                  <span className="text-[9px] text-slate-400 font-mono">3h ago</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 pt-4 border-t border-slate-100">
            <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-3">
              Team Workload
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block mb-2 font-semibold">Sales Closers</span>
                <div className="flex flex-col gap-1.5">
                  {['Jerry', 'Ryan', 'Alex'].map(name => (
                    <div 
                      key={name} 
                      draggable 
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'team_member', role: 'closer', name }));
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-grab active:cursor-grabbing text-xs flex items-center justify-between transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                          {name.charAt(0)}
                        </div>
                        <span className="text-slate-700 font-medium">{name}</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block mb-2 font-semibold">CAD Modelers</span>
                <div className="flex flex-col gap-1.5">
                  {['Abdullah', 'Farooq', 'Muneeb', 'Hamza'].map(name => (
                    <div 
                      key={name} 
                      draggable 
                      onDragStart={(e) => {
                        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'team_member', role: 'designer', name }));
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 cursor-grab active:cursor-grabbing text-xs flex items-center justify-between transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center text-[9px] font-bold">
                          {name.charAt(0)}
                        </div>
                        <span className="text-amber-900 font-medium">{name}</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 pt-3 border-t border-slate-100 mt-auto">
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Pending CAD</span>
                  </div>
                  <span className="font-mono font-bold text-amber-800 tabular-nums">3</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[35%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>In Casting</span>
                  </div>
                  <span className="font-mono font-bold text-purple-800 tabular-nums">2</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full w-[25%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Delivered</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-800 tabular-nums">8</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[80%]" />
                </div>
              </div>
            </div>
          </div>
        </aside>
      ) : (
        <aside className="w-12 border-l border-slate-200 bg-white/95 backdrop-blur-2xl flex flex-col h-screen shrink-0 items-center py-4 hidden xl:flex">
          <button 
            onClick={() => setIsRightSidebarOpen(true)} 
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Expand Panel"
          >
            <PanelRightOpen size={14} />
          </button>
        </aside>
      )}

      {/* Backlog Drawer: Clean Light Theme */}
      <div 
        className="fixed bottom-0 right-24 z-40 select-none"
        onMouseEnter={() => {
          if (!isBacklogLocked) setIsBacklogHovered(true);
        }}
        onMouseLeave={() => {
          if (!isBacklogLocked) setIsBacklogHovered(false);
        }}
      >
        <div 
          className={`w-60 h-48 rounded-t-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl flex flex-col transition-all duration-300 ${
            isBacklogDrawn ? 'translate-y-0' : 'translate-y-[calc(100%-32px)]'
          }`}
        >
          {/* Header Tab with Lock Button */}
          <div 
            onClick={() => setIsBacklogExpanded(!isBacklogExpanded)}
            className="h-8 px-3 flex items-center justify-between cursor-pointer border-b border-slate-200 bg-slate-50/80 rounded-t-2xl hover:bg-slate-100/80 transition-colors"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-800">
              <List size={12} className="text-[#ff943c]" />
              <span>Backlog ({backlogIds.length})</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isBacklogLocked) {
                    setIsBacklogExpanded(isBacklogDrawn);
                    setIsBacklogLocked(true);
                  } else {
                    setIsBacklogLocked(false);
                  }
                }}
                className={`p-1 rounded-md border transition-colors cursor-pointer ${
                  isBacklogLocked 
                    ? 'bg-[#ff943c]/15 border-[#ff943c]/40 text-[#ff943c]' 
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700'
                }`}
                title={
                  isBacklogLocked 
                    ? (isBacklogExpanded ? "Locked Expanded. Click to unlock." : "Locked Collapsed. Click to unlock.")
                    : "Unlocked (Hover to draw). Click to lock in current state."
                }
              >
                {isBacklogLocked ? <Lock size={11} /> : <Unlock size={11} />}
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div 
            className="flex-1 p-2 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin"
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDrop={(e) => {
              e.preventDefault();
              try {
                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                if (data.type === 'order' && data.id) {
                  setBacklogIds(prev => Array.from(new Set([...prev, data.id])));
                }
              } catch (err) {}
            }}
          >
            {backlogIds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center border border-dashed border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] font-semibold text-slate-700">Park Dock</span>
                <p className="text-[8px] text-slate-400 uppercase font-mono mt-0.5">Drop orders to park</p>
              </div>
            ) : (
              orders.filter(o => backlogIds.includes(o.id)).map(order => (
                <div 
                  key={order.id} 
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'order', id: order.id }));
                    setBacklogIds(prev => prev.filter(id => id !== order.id));
                  }}
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-grab active:cursor-grabbing transition-colors"
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[8px] font-mono font-bold text-[#ff943c] uppercase">{order.id}</span>
                    <button 
                      onClick={() => setBacklogIds(prev => prev.filter(id => id !== order.id))}
                      className="text-slate-400 hover:text-slate-700 text-[8px] cursor-pointer"
                      title="Restore order"
                    >
                      Restore
                    </button>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-800 truncate">{order.title}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) - Frosted Liquid Glass */}
      <LiquidGlassFAB 
        onNewOrder={() => {
          setActiveEntity({ type: 'order', isNew: true });
        }}
        onNavigateClients={() => {
          setCurrentModule('crm');
        }}
        onOpenSearch={() => setIsCommandPaletteOpen(true)}
        isBacklogLocked={isBacklogLocked}
        onToggleBacklogLock={() => {
          if (!isBacklogLocked) {
            setIsBacklogExpanded(isBacklogDrawn);
            setIsBacklogLocked(true);
          } else {
            setIsBacklogLocked(false);
          }
        }}
      />

      {/* Persistent Entity Sidebar for Orders & Clients (Side Peek default / Center Peek toggleable) */}
      <EntitySidebar 
        activeEntity={activeEntity}
        onClose={() => setActiveEntity(null)}
        orders={orders}
        clients={clients}
        onSaveOrder={handleSaveOrder}
        onSaveClient={handleSaveClient}
        onSelectEntity={setActiveEntity}
        peekMode={peekMode}
        onTogglePeekMode={setPeekMode}
      />

      {/* Legacy OrderModal fallback if triggered */}
      {isModalOpen && (
        <OrderModal 
          clients={clients} 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
          onSave={handleSaveOrder}
          order={selectedOrder}
        />
      )}

      {/* Command Palette */}
      <CommandPalette 
        getClientName={getClientName} 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        orders={orders}
        clients={clients}
        onNavigate={(mod) => setCurrentModule(mod as any)}
        onCreateOrder={() => setActiveEntity({ type: 'order', isNew: true })}
        onSelectOrder={(order) => setActiveEntity({ type: 'order', id: order.id })}
        onSelectClient={(client) => setActiveEntity({ type: 'client', id: client.id })}
      />

      {/* PocketBase Superuser Role Management Modal */}
      <RoleManagementModal 
        isOpen={isRoleManagerOpen}
        onClose={() => setIsRoleManagerOpen(false)}
        activeRoleView={activeRoleView}
        onSelectRoleView={(rv) => {
          setActiveRoleView(rv);
          if (rv === 'designer') setCurrentModule('designer_bench');
          else if (rv === 'agent') setCurrentModule('agent_crm');
          else if (rv === 'admin') setCurrentModule('orders');
          setIsRoleManagerOpen(false);
        }}
        onUserRoleChanged={(updatedUser) => {
          if (updatedUser.id === currentUser.id) {
            setCurrentUser(updatedUser);
          }
        }}
      />

      {/* Desktop Keyboard Shortcuts HUD */}
      <div className="fixed bottom-3.5 left-20 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 text-[10px] text-zinc-400 select-none shadow-xl z-20">
        <span className="font-semibold text-zinc-300">Desktop Shortcuts:</span>
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-200 font-mono">J / K</span> Navigate
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-200 font-mono">1-5</span> Status
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-200 font-mono">Space</span> Peek
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-200 font-mono">Ctrl+V</span> Paste Img
        <span className="bg-white/10 px-1.5 py-0.5 rounded text-zinc-200 font-mono">Ctrl+K</span> Actions
      </div>
    </div>
  );
}
