// src/App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  db, 
  initializeDatabase, 
  resetDatabaseToDefaults,
  dbAddOrder,
  dbUpdateOrderStatus,
  dbUpdateOrder,
  dbAddDesigner,
  dbDeleteDesigner,
  dbAddProspect,
  dbDeleteProspect,
  dbUpdateInvoice,
  dbAddCorrection
} from './db/database';
import { 
  INITIAL_ORDERS, 
  INITIAL_DESIGNERS, 
  INITIAL_PROSPECTS, 
  INITIAL_INVOICES, 
  INITIAL_CORRECTIONS, 
  INITIAL_STATUS_HISTORY 
} from './data';
import { 
  Order, 
  Designer, 
  Prospect, 
  Invoice, 
  Correction, 
  OrderStatusHistory, 
  OrderStatus,
  InvoiceStatus,
  EffortLevel
} from './types';
import { OrdersTable } from './components/creative-tim/blocks/orders-table';
import { DesignersTableView } from './components/digital-office/DesignersTableView';
import { ProspectsTableView } from './components/digital-office/ProspectsTableView';
import { InvoicesTableView } from './components/digital-office/InvoicesTableView';
import { OrderDetailDrawer } from './components/digital-office/OrderDetailDrawer';
import { NewOrderModal } from './components/digital-office/NewOrderModal';
import { NewDesignerModal } from './components/digital-office/NewDesignerModal';
import { NewProspectModal } from './components/digital-office/NewProspectModal';
import { RoleManagementModal } from './components/RoleManagementModal';
import { 
  getCurrentUser, 
  checkServerHealth, 
  PBUser, 
  UserRole 
} from './lib/pocketbase';
import { 
  ShoppingBag, 
  Users, 
  Building2, 
  Receipt, 
  Shield, 
  Crown, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function App() {
  // 1. Initialize Dexie IndexedDB
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Live queries from Dexie tables
  const liveOrders = useLiveQuery(() => db.orders.toArray(), []);
  const liveDesigners = useLiveQuery(() => db.designers.toArray(), []);
  const liveProspects = useLiveQuery(() => db.prospects.toArray(), []);
  const liveInvoices = useLiveQuery(() => db.invoices.toArray(), []);
  const liveCorrections = useLiveQuery(() => db.corrections.toArray(), []);
  const liveStatusHistory = useLiveQuery(() => db.status_history.toArray(), []);

  // Fallback to initial seeds while IndexedDB initializes
  const rawOrders = liveOrders && liveOrders.length > 0 ? liveOrders : INITIAL_ORDERS;
  const designers = liveDesigners && liveDesigners.length > 0 ? liveDesigners : INITIAL_DESIGNERS;
  const prospects = liveProspects && liveProspects.length > 0 ? liveProspects : INITIAL_PROSPECTS;
  const invoices = liveInvoices && liveInvoices.length > 0 ? liveInvoices : INITIAL_INVOICES;
  const corrections = liveCorrections && liveCorrections.length > 0 ? liveCorrections : INITIAL_CORRECTIONS;
  const statusHistory = liveStatusHistory && liveStatusHistory.length > 0 ? liveStatusHistory : INITIAL_STATUS_HISTORY;

  // Enrich orders with relational data in memory
  const orders: Order[] = useMemo(() => {
    return rawOrders.map((ord) => {
      const designer = designers.find(d => d.id === ord.designer_id);
      const prospect = prospects.find(p => p.id === ord.prospect_id);
      const invoice = invoices.find(inv => inv.order_id === ord.id);
      const orderCorrections = corrections.filter(c => c.order_id === ord.id);
      const orderHistory = statusHistory.filter(sh => sh.order_id === ord.id);

      return {
        ...ord,
        designer,
        prospect,
        invoice,
        corrections: orderCorrections,
        status_history: orderHistory
      };
    });
  }, [rawOrders, designers, prospects, invoices, corrections, statusHistory]);

  // 2. Auth & Roles State
  const [currentUser, setCurrentUser] = useState<PBUser>(() => getCurrentUser());
  const [activeRoleView, setActiveRoleView] = useState<'all' | 'admin' | 'designer' | 'agent' | 'superagent'>('all');
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);

  // 3. Navigation & Modules (Orders | Designers | Prospects | Invoices)
  const [currentModule, setCurrentModule] = useState<'orders' | 'designers' | 'prospects' | 'invoices'>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 4. Drawer & Modals State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewDesignerOpen, setIsNewDesignerOpen] = useState(false);
  const [isNewProspectOpen, setIsNewProspectOpen] = useState(false);
  const [preselectedProspect, setPreselectedProspect] = useState<Prospect | null>(null);

  // Keep selectedOrder in sync when orders update
  useEffect(() => {
    if (selectedOrder) {
      const refreshed = orders.find(o => o.id === selectedOrder.id);
      if (refreshed) {
        setSelectedOrder(refreshed);
      }
    }
  }, [orders]);

  // 5. Server Health Ping
  const [serverHealth, setServerHealth] = useState<{ online: boolean; latencyMs: number }>({
    online: false,
    latencyMs: 0
  });

  useEffect(() => {
    checkServerHealth().then(health => setServerHealth(health));
    const interval = setInterval(() => {
      checkServerHealth().then(health => setServerHealth(health));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // 6. Action Handlers
  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    await dbUpdateOrderStatus(orderId, newStatus);
  };

  const handleUpdateOrderDesigner = async (orderId: string, designerId: string) => {
    await dbUpdateOrder(orderId, { designer_id: designerId });
  };

  const handleUpdateInvoiceStatus = async (invoiceId: string, status: InvoiceStatus) => {
    await dbUpdateInvoice(invoiceId, { status });
  };

  const handleAddCorrection = async (
    orderId: string, 
    message: string, 
    authorName: string, 
    imageUrl?: string
  ) => {
    const attachments = imageUrl ? [{
      id: `att-${Date.now()}`,
      correction_id: '',
      file_url: imageUrl,
      file_name: 'reference_proof.jpg'
    }] : [];
    await dbAddCorrection(orderId, message, authorName, attachments);
  };

  const handleCreateOrder = async (orderData: {
    order_code: string;
    name: string;
    status: OrderStatus;
    effort_level: EffortLevel;
    order_value: number;
    created_at: string;
    designer_id: string;
    prospect_id: string;
  }) => {
    const newOrd = await dbAddOrder(orderData);
    setSelectedOrder(newOrd);
  };

  const handleCreateDesigner = async (designerData: {
    name: string;
    email: string;
    phone: string;
    specialty: string;
  }) => {
    await dbAddDesigner(designerData);
  };

  const handleDeleteDesigner = async (designerId: string) => {
    if (confirm('Are you sure you want to remove this designer?')) {
      await dbDeleteDesigner(designerId);
    }
  };

  const handleCreateProspect = async (prospectData: {
    name: string;
    company: string;
    email: string;
    phone: string;
  }) => {
    await dbAddProspect(prospectData);
  };

  const handleDeleteProspect = async (prospectId: string) => {
    if (confirm('Are you sure you want to remove this client profile?')) {
      await dbDeleteProspect(prospectId);
    }
  };

  const handleCreateOrderForProspect = (prospect: Prospect) => {
    setPreselectedProspect(prospect);
    setIsNewOrderOpen(true);
  };

  const handleResetDatabase = async () => {
    if (confirm('Reset digital office database back to clean demo seed data?')) {
      await resetDatabaseToDefaults();
      setSelectedOrder(null);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none">
      {/* Left Navigation Rail */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-60' : 'w-16'
        } border-r border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl flex flex-col h-full shrink-0 transition-all duration-200 z-30`}
      >
        {/* Rail Top Header */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-[#ff943c]/15 to-purple-500/15 border border-amber-300/60 dark:border-amber-500/40 backdrop-blur-xl shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#ff943c] shadow-[0_0_8px_rgba(255,148,60,0.9)] animate-pulse" />
                <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">AuraCAD</span>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-[#ff943c] text-black">v0-b</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff943c] shadow-[0_0_8px_rgba(255,148,60,0.9)]" />
            </div>
          )}

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isSidebarOpen ? "Collapse Navigation Rail" : "Expand Navigation Rail"}
          >
            {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>
        </div>

        {/* Primary Action Button */}
        {isSidebarOpen && (
          <div className="p-3 pb-1">
            <button 
              onClick={() => {
                setPreselectedProspect(null);
                setIsNewOrderOpen(true);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>New Bespoke Order</span>
            </button>
          </div>
        )}

        {/* Digital Office Navigation Tabs (Strictly ER Aligned) */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* 1. Orders */}
          <button
            onClick={() => setCurrentModule('orders')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'orders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ShoppingBag size={15} className={currentModule === 'orders' ? 'text-white' : 'text-blue-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>Studio Orders</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  currentModule === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {orders.length}
                </span>
              </div>
            )}
          </button>

          {/* 2. Designers */}
          <button
            onClick={() => setCurrentModule('designers')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'designers'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Users size={15} className={currentModule === 'designers' ? 'text-white' : 'text-purple-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>CAD Designers</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  currentModule === 'designers' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {designers.length}
                </span>
              </div>
            )}
          </button>

          {/* 3. Prospects */}
          <button
            onClick={() => setCurrentModule('prospects')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'prospects'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Building2 size={15} className={currentModule === 'prospects' ? 'text-white' : 'text-emerald-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>Clients & Prospects</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  currentModule === 'prospects' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {prospects.length}
                </span>
              </div>
            )}
          </button>

          {/* 4. Invoices */}
          <button
            onClick={() => setCurrentModule('invoices')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'invoices'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Receipt size={15} className={currentModule === 'invoices' ? 'text-white' : 'text-amber-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>Invoices & Billing</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  currentModule === 'invoices' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {invoices.length}
                </span>
              </div>
            )}
          </button>
        </nav>

        {/* Rail Bottom Info & Staff Switcher */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          {/* Active Role Pill */}
          <button
            onClick={() => setIsRoleManagerOpen(true)}
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between transition-colors cursor-pointer text-left"
            title="Click to Switch User Role in PocketBase"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                {currentUser?.role === 'owner' ? <Crown size={13} /> : <Shield size={13} />}
              </div>
              {isSidebarOpen && (
                <div className="truncate text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser?.name || 'Staff User'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 capitalize">
                    {currentUser?.role || 'owner'}
                  </div>
                </div>
              )}
            </div>
            {isSidebarOpen && <ChevronRight size={13} className="text-slate-400 shrink-0" />}
          </button>

          {/* Quick Database Reset Tool */}
          {isSidebarOpen && (
            <button
              onClick={handleResetDatabase}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Reseed IndexedDB with default sample records"
            >
              <RefreshCw size={11} />
              <span>Reseed Demo DB</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Top Navbar */}
        <header className="h-14 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Digital Office
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {currentModule === 'orders' && 'Bespoke Studio Orders'}
              {currentModule === 'designers' && 'CAD Design Specialists'}
              {currentModule === 'prospects' && 'Clients & Prospects'}
              {currentModule === 'invoices' && 'Invoices & Billing'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* PocketBase Live Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${
                serverHealth.online ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]' : 'bg-slate-400'
              }`} />
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                {serverHealth.online ? `PocketBase ${serverHealth.latencyMs}ms` : 'Local IndexedDB Active'}
              </span>
            </div>

            {/* Quick Action Button based on active view */}
            {currentModule === 'orders' && (
              <button
                onClick={() => {
                  setPreselectedProspect(null);
                  setIsNewOrderOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>New Order</span>
              </button>
            )}

            {currentModule === 'designers' && (
              <button
                onClick={() => setIsNewDesignerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Designer</span>
              </button>
            )}

            {currentModule === 'prospects' && (
              <button
                onClick={() => setIsNewProspectOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Prospect</span>
              </button>
            )}
          </div>
        </header>

        {/* Content View Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentModule === 'orders' && (
            <OrdersTable 
              orders={orders}
              onSelectOrder={handleSelectOrder}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          )}

          {currentModule === 'designers' && (
            <DesignersTableView 
              designers={designers}
              orders={orders}
              onOpenNewDesignerModal={() => setIsNewDesignerOpen(true)}
              onSelectOrder={handleSelectOrder}
              onDeleteDesigner={handleDeleteDesigner}
            />
          )}

          {currentModule === 'prospects' && (
            <ProspectsTableView 
              prospects={prospects}
              orders={orders}
              onOpenNewProspectModal={() => setIsNewProspectOpen(true)}
              onSelectOrder={handleSelectOrder}
              onDeleteProspect={handleDeleteProspect}
              onCreateOrderForProspect={handleCreateOrderForProspect}
            />
          )}

          {currentModule === 'invoices' && (
            <InvoicesTableView 
              invoices={invoices}
              orders={orders}
              prospects={prospects}
              onSelectOrder={handleSelectOrder}
              onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            />
          )}
        </div>
      </main>

      {/* Order Detail Inspector Drawer */}
      <OrderDetailDrawer 
        order={selectedOrder}
        designers={designers}
        prospects={prospects}
        invoices={invoices}
        corrections={corrections}
        statusHistory={statusHistory}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdateDesigner={handleUpdateOrderDesigner}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
        onAddCorrection={handleAddCorrection}
      />

      {/* New Order Modal */}
      <NewOrderModal 
        isOpen={isNewOrderOpen}
        designers={designers}
        prospects={prospects}
        preselectedProspect={preselectedProspect}
        onClose={() => {
          setIsNewOrderOpen(false);
          setPreselectedProspect(null);
        }}
        onSubmit={handleCreateOrder}
      />

      {/* New Designer Modal */}
      <NewDesignerModal 
        isOpen={isNewDesignerOpen}
        onClose={() => setIsNewDesignerOpen(false)}
        onSubmit={handleCreateDesigner}
      />

      {/* New Prospect Modal */}
      <NewProspectModal 
        isOpen={isNewProspectOpen}
        onClose={() => setIsNewProspectOpen(false)}
        onSubmit={handleCreateProspect}
      />

      {/* PocketBase Staff Role Management Modal */}
      <RoleManagementModal 
        isOpen={isRoleManagerOpen}
        onClose={() => setIsRoleManagerOpen(false)}
        activeRoleView={activeRoleView}
        onSelectRoleView={setActiveRoleView}
        onUserRoleChanged={(updatedUser) => setCurrentUser(updatedUser)}
      />
    </div>
  );
}
