// src/App.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  useMantineColorScheme, 
  ActionIcon, 
  Tooltip, 
  Badge, 
  Menu, 
  Button, 
  Group, 
  Text, 
  Paper, 
  Select, 
  CopyButton 
} from '@mantine/core';
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
import { FloatingViewChanger, ViewMode } from './components/digital-office/FloatingViewChanger';
import { UniversalDataView } from './components/digital-office/UniversalDataView';


import { OrderCard } from './components/digital-office/OrderCard';
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
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  Check,
  Copy,
  ExternalLink,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
  UserCheck,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';

/**
 * Extract active role from URL (?role=... or /owner, /admin, etc.)
 */
function getRoleFromUrl(): UserRole {
  if (typeof window === 'undefined') return 'owner';
  const params = new URLSearchParams(window.location.search);
  const qRole = params.get('role')?.toLowerCase();
  const validRoles: UserRole[] = ['owner', 'admin', 'designer'];
  
  if (qRole && validRoles.includes(qRole as UserRole)) {
    return qRole as UserRole;
  }
  
  const cleanPath = window.location.pathname.replace(/^\//, '').toLowerCase();
  if (validRoles.includes(cleanPath as UserRole)) {
    return cleanPath as UserRole;
  }
  
  const match = cleanPath.match(/^role\/([a-z]+)/);
  if (match && validRoles.includes(match[1] as UserRole)) {
    return match[1] as UserRole;
  }
  
  return 'owner';
}

export default function App() {
  // Theme Color Scheme (Dark / Light with LocalStorage Persistence)
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';
  const toggleColorScheme = () => setColorScheme(isDark ? 'light' : 'dark');

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

  // 2. Active RBAC Role with URL Synchronization
  const [activeRole, setActiveRole] = useState<UserRole>(() => getRoleFromUrl());
  const [currentUser, setCurrentUser] = useState<PBUser>(() => {
    const u = getCurrentUser();
    return { ...u, role: getRoleFromUrl() };
  });

  // Listen to browser navigation (back/forward) to update role view seamlessly
  useEffect(() => {
    const handleLocationChange = () => {
      const detected = getRoleFromUrl();
      setActiveRole(detected);
      setCurrentUser(prev => ({ ...prev, role: detected }));
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Switch role and update URL
  const handleSwitchRole = (newRole: UserRole) => {
    setActiveRole(newRole);
    setCurrentUser(prev => ({ ...prev, role: newRole }));
    
    // Update URL query param without page reload
    const newUrl = `?role=${newRole}`;
    window.history.pushState({ role: newRole }, '', newUrl);

    // Default to role-appropriate starting tab
    if (newRole === 'designer') {
      setCurrentModule('orders');

    }
  };

  // Active designer selection for 'designer' role preview (default: Farooq Qureshi - FU)
  const [selectedDesignerId, setSelectedDesignerId] = useState<string>('des-2');

  // Filtered orders based on active role
  const displayedOrders = useMemo(() => {
    if (activeRole === 'designer') {
      return orders.filter(o => o.designer_id === selectedDesignerId);
    }
    return orders;
  }, [orders, activeRole, selectedDesignerId]);

  // 3. Navigation & Modules (Orders | Designers | Prospects | Invoices)
  const [currentModule, setCurrentModule] = useState<'orders' | 'designers' | 'prospects' | 'invoices'>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 4. Modals & Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isNewDesignerOpen, setIsNewDesignerOpen] = useState(false);
  const [isNewProspectOpen, setIsNewProspectOpen] = useState(false);
  const [preselectedProspect, setPreselectedProspect] = useState<Prospect | null>(null);
    const [orderViewMode, setOrderViewMode] = useState<'table' | 'details'>('table');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [cardViewMode, setCardViewMode] = useState<'sidepeek' | 'center' | 'fullscreen' | 'inline'>('sidepeek');
  const [cardSize, setCardSize] = useState<'narrow' | 'default' | 'wide'>('default');
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);

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
    name: string;
    status: OrderStatus;
    effort_level: EffortLevel;
    order_value: number;
    designer_id: string;
    prospect_id: string;
    custom_order_code?: string;
  }) => {
    const newOrd = await dbAddOrder(orderData);
    setSelectedOrder(newOrd);
  };

  const handleCreateDesigner = async (designerData: {
    name: string;
    code: string;
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
    code: string;
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

  // Computed Studio Financial Metrics for Owner
  const studioMetrics = useMemo(() => {
    const totalPipeline = orders.reduce((sum, o) => sum + (o.order_value || 0), 0);
    const paidInvoices = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);
    const inDesignCount = orders.filter(o => o.status === 'Designing').length;
    const inReviewCount = orders.filter(o => o.status === 'Review').length;
    const urgentCount = orders.filter(o => o.effort_level === 'Urgent').length;
    return { totalPipeline, paidInvoices, inDesignCount, inReviewCount, urgentCount };
  }, [orders, invoices]);

  // Current active designer object
  const currentDesigner = designers.find(d => d.id === selectedDesignerId) || designers[0];

  // RBAC Tab Visibility Rules
  const canViewDesigners = activeRole === 'owner' || activeRole === 'admin';
  const canViewInvoices = activeRole === 'owner' || activeRole === 'admin';
  const canViewProspects = activeRole !== 'designer';
  const isDesigner = activeRole === 'designer';

  // Role Metadata for Badge & Header
  const roleMeta: Record<UserRole, { label: string; badgeColor: string; icon: React.ReactNode; desc: string }> = {
    owner: {
      label: 'Owner (God)',
      badgeColor: 'yellow',
      icon: <Crown size={14} className="text-amber-500" />,
      desc: 'Full studio governance, financials & settings'
    },

    admin: {
      label: 'Admin (Operations)',
      badgeColor: 'blue',
      icon: <Shield size={14} className="text-blue-400" />,
      desc: 'Orders, designer assignments & billing'
    },
    designer: {
      label: 'Designer (CAD)',
      badgeColor: 'purple',
      icon: <Compass size={14} className="text-purple-400" />,
      desc: 'Assigned CAD orders, stage updates & revisions'
    }

  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-[#07080b] text-slate-900 dark:text-[#d5d7e0] font-sans select-none">
      
      {/* 1. Left Navigation Rail (Desktop-Only Studio Ergonomics) */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-60' : 'w-16'
        } flex flex-col h-full border-r border-slate-200 dark:border-[#1a1d28] bg-white/95 dark:bg-[#0a0b10]/95 backdrop-blur-2xl shrink-0 transition-all duration-200 z-30`}
      >
        {/* Rail Header with Brand Accents */}
        <div className="h-14 px-3 flex items-center justify-between border-b border-slate-200 dark:border-[#1a1d28]">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#29aae0]/15 via-[#83dd24]/15 to-[#ec1e25]/15 border border-[#29aae0]/30 backdrop-blur-xl shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#29aae0] shadow-[0_0_8px_rgba(41,170,224,0.9)] animate-pulse" />
                <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">AuraCAD</span>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-[#29aae0] text-black">v0-b</span>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-[#29aae0] shadow-[0_0_8px_rgba(41,170,224,0.9)]" />
            </div>
          )}

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#12141c] transition-colors cursor-pointer"
            title={isSidebarOpen ? "Collapse Navigation Rail" : "Expand Navigation Rail"}
          >
            {isSidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>
        </div>

        {/* Primary Action Button (10% Brand Cyan Accent) - Hidden for Designer role */}
        {isSidebarOpen && !isDesigner && (
          <div className="p-3 pb-1">
            <button 
              onClick={() => {
                setPreselectedProspect(null);
                setIsNewOrderOpen(true);
              }}
              className="w-full bg-[#29aae0] hover:bg-[#1f8ec0] text-white py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(41,170,224,0.35)] cursor-pointer active:scale-98"
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>New Bespoke Order</span>
            </button>
          </div>
        )}

        {/* Digital Office Navigation Tabs (Filtered by RBAC) */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* 1. Orders Tab (Available to all roles) */}
          <button
            onClick={() => {
              setCurrentModule('orders');
              setOrderViewMode('table');
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'orders'
                ? 'bg-[#29aae0] text-white shadow-[0_0_10px_rgba(41,170,224,0.3)]'
                : 'text-slate-600 dark:text-[#8c8fa3] hover:bg-slate-100 dark:hover:bg-[#12141c] hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <ShoppingBag size={15} className={currentModule === 'orders' ? 'text-white' : 'text-[#29aae0]'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>{isDesigner ? 'My CAD Orders' : 'Studio Orders'}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  currentModule === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#12141c] text-slate-500 dark:text-[#8c8fa3]'
                }`}>
                  {displayedOrders.length}
                </span>
              </div>
            )}
          </button>

          {/* 2. Designers Tab (Owner & Admin only) */}
          {canViewDesigners && (
            <button
              onClick={() => setCurrentModule('designers')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'designers'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8c8fa3] hover:bg-slate-100 dark:hover:bg-[#12141c] hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Users size={15} className={currentModule === 'designers' ? 'text-white' : 'text-purple-400'} />
              {isSidebarOpen && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>CAD Designers</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    currentModule === 'designers' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#12141c] text-slate-500 dark:text-[#8c8fa3]'
                  }`}>
                    {designers.length}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* 3. Prospects Tab (Owner, Admin) */}
          {canViewProspects && (
            <button
              onClick={() => setCurrentModule('prospects')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'prospects'
                  ? 'bg-[#83dd24] text-[#050608] shadow-[0_0_10px_rgba(131,221,36,0.3)] font-bold'
                  : 'text-slate-600 dark:text-[#8c8fa3] hover:bg-slate-100 dark:hover:bg-[#12141c] hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Building2 size={15} className={currentModule === 'prospects' ? 'text-[#050608]' : 'text-[#83dd24]'} />
              {isSidebarOpen && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>Clients & Prospects</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    currentModule === 'prospects' ? 'bg-black/15 text-black' : 'bg-slate-100 dark:bg-[#12141c] text-slate-500 dark:text-[#8c8fa3]'
                  }`}>
                    {prospects.length}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* 4. Invoices Tab (Owner & Admin only) */}
          {canViewInvoices && (
            <button
              onClick={() => setCurrentModule('invoices')}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentModule === 'invoices'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#8c8fa3] hover:bg-slate-100 dark:hover:bg-[#12141c] hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Receipt size={15} className={currentModule === 'invoices' ? 'text-white' : 'text-amber-500'} />
              {isSidebarOpen && (
                <div className="flex-1 flex items-center justify-between text-left">
                  <span>Invoices & Billing</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    currentModule === 'invoices' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-[#12141c] text-slate-500 dark:text-[#8c8fa3]'
                  }`}>
                    {invoices.length}
                  </span>
                </div>
              )}
            </button>
          )}
        </nav>

        {/* Rail Bottom Info & Staff Switcher */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1a1d28] space-y-2">
          {/* Active Role Card */}
          <div 
            onClick={() => activeRole === 'owner' && setIsRoleManagerOpen(true)}
            className={`w-full p-2 rounded-xl bg-slate-50 dark:bg-[#12141c] hover:bg-slate-100 dark:hover:bg-[#1a1d28] border border-slate-200 dark:border-[#262938] flex items-center justify-between transition-colors text-left ${activeRole === 'owner' ? 'cursor-pointer' : 'cursor-default'}`}
            title={activeRole === 'owner' ? "Click to Open PocketBase Role Management Console" : ""}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                {roleMeta[activeRole]?.icon || <Crown size={13} />}
              </div>
              {isSidebarOpen && (
                <div className="truncate text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {activeRole === 'designer' ? currentDesigner.name : 'Studio Staff'}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 capitalize">
                    {roleMeta[activeRole]?.label}
                  </div>
                </div>
              )}
            </div>
            {isSidebarOpen && <ChevronRight size={13} className="text-slate-400 shrink-0" />}
          </div>

          {/* Quick Database Reset Tool (Owner only) */}
          {isSidebarOpen && activeRole === 'owner' && (
            <button
              onClick={handleResetDatabase}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#12141c] rounded-lg transition-colors cursor-pointer"
              title="Reseed IndexedDB with default sample records"
            >
              <RefreshCw size={11} />
              <span>Reseed Demo DB</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace Area (60% Dominant Base Canvas) */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fafc] dark:bg-[#07080b]">
        
        {/* Top Navbar with Instant Role Switcher & Direct Link Actions */}
        <header className="h-14 px-6 border-b border-slate-200 dark:border-[#1a1d28] bg-white/80 dark:bg-[#0a0b10]/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20">
          
          {/* Left: Breadcrumb & Context */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Digital Office
            </span>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
              {currentModule === 'orders' && (isDesigner ? `${currentDesigner.name} (${currentDesigner.code}) CAD Bench` : 'Bespoke Studio Orders')}
              {currentModule === 'designers' && 'CAD Design Specialists'}
              {currentModule === 'prospects' && 'Clients & Prospects'}
              {currentModule === 'invoices' && 'Invoices & Billing'}
            </span>
          </div>

          {/* Center/Right: Role Switcher Dropdown, Mode Toggles, Actions */}
          <div className="flex items-center gap-3">
            
            {/* 1. Designer Switcher (Visible ONLY when in Designer role) */}
            {isDesigner && (
              <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 px-2 py-1 rounded-xl">
                <Compass size={13} className="text-purple-400" />
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Designer:</span>
                <select
                  value={selectedDesignerId}
                  onChange={(e) => setSelectedDesignerId(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-purple-900 dark:text-purple-200 outline-none cursor-pointer"
                >
                  {designers.map(d => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 2. Interactive Role Switcher Pill with Direct URL Sync */}
            <Menu shadow="md" width={260} position="bottom-end">
              <Menu.Target>
                <button 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#262938] bg-white dark:bg-[#12141c] hover:bg-slate-50 dark:hover:bg-[#1a1d28] transition-all cursor-pointer shadow-xs"
                  title="Switch Role Perspective (Updates URL directly)"
                >
                  {roleMeta[activeRole]?.icon}
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                    {roleMeta[activeRole]?.label}
                  </span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>
              </Menu.Target>

              <Menu.Dropdown className="bg-white dark:bg-[#0a0b10] border border-slate-200 dark:border-[#262938] p-1.5">
                <Menu.Label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-2 py-1">
                  Active UI Role Perspective
                </Menu.Label>

                {(['owner', 'admin', 'designer'] as UserRole[]).map((r) => {
                  const meta = roleMeta[r];
                  const isCurrent = activeRole === r;
                  return (
                    <Menu.Item
                      key={r}
                      onClick={() => handleSwitchRole(r)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        isCurrent ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 font-bold' : ''
                      }`}
                      leftSection={meta.icon}
                      rightSection={isCurrent ? <Check size={13} className="text-blue-500" /> : null}
                    >
                      <div>
                        <div className="font-semibold">{meta.label}</div>
                        <div className="text-[10px] text-slate-400 font-normal leading-tight">{meta.desc}</div>
                      </div>
                    </Menu.Item>
                  );
                })}

                <Menu.Divider />

                {/* 1-Click Copy Role URL Shortcut */}
                <CopyButton value={`${window.location.origin}/?role=${activeRole}`}>
                  {({ copied, copy }) => (
                    <Menu.Item
                      onClick={copy}
                      leftSection={copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      className="text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    >
                      {copied ? 'Copied URL to Clipboard!' : `Copy ?role=${activeRole} URL`}
                    </Menu.Item>
                  )}
                </CopyButton>
              </Menu.Dropdown>
            </Menu>

            {/* 3. Table vs Details Section Toggle (when in Orders) */}


            {/* 4. PocketBase Live Health Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#12141c] border border-slate-200 dark:border-[#262938] text-xs font-mono">
              <span className={`w-2 h-2 rounded-full ${
                serverHealth.online ? 'bg-[#83dd24] shadow-[0_0_8px_rgba(131,221,36,0.9)] animate-pulse' : 'bg-slate-400'
              }`} />
              <span className="text-[11px] text-slate-600 dark:text-[#8c8fa3]">
                {serverHealth.online ? `PocketBase ${serverHealth.latencyMs}ms` : 'Local IndexedDB Active'}
              </span>
            </div>

            {/* 5. Dark / Light Theme Toggle */}
            <Tooltip label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <ActionIcon
                variant="default"
                size="md"
                radius="md"
                onClick={toggleColorScheme}
                aria-label="Toggle theme color scheme"
                className="border-slate-200 dark:border-[#262938] bg-white dark:bg-[#12141c]"
              >
                {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-[#29aae0]" />}
              </ActionIcon>
            </Tooltip>

            {/* 6. Contextual Action Buttons based on Active Module and Role */}
            {currentModule === 'orders' && !isDesigner && (
              <button
                onClick={() => {
                  setPreselectedProspect(null);
                  setIsNewOrderOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#29aae0] hover:bg-[#1f8ec0] text-white transition-all shadow-[0_0_10px_rgba(41,170,224,0.3)] cursor-pointer active:scale-98"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>New Order</span>
              </button>
            )}

            {currentModule === 'designers' && canViewDesigners && (
              <button
                onClick={() => setIsNewDesignerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Designer</span>
              </button>
            )}

            {currentModule === 'prospects' && canViewProspects && (
              <button
                onClick={() => setIsNewProspectOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#83dd24] hover:bg-[#6ebc1c] text-[#050608] transition-all shadow-[0_0_10px_rgba(131,221,36,0.3)] cursor-pointer active:scale-98"
              >
                <Plus size={13} strokeWidth={2.5} />
                <span>Add Prospect</span>
              </button>
            )}
          </div>
        </header>

        {/* Executive / Role-Specific Context Banners */}
        {/* A. Studio Owner Financial KPI Ribbon */}
        {activeRole === 'owner' && (
          <div className="bg-white/60 dark:bg-[#0a0b10]/60 border-b border-slate-200 dark:border-[#1a1d28] px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">Studio Pipeline:</span>
                <span className="font-mono font-extrabold text-[#29aae0] text-sm">${studioMetrics.totalPipeline.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">Paid Invoices:</span>
                <span className="font-mono font-extrabold text-[#83dd24] text-sm">${studioMetrics.paidInvoices.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">CAD Workload:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{studioMetrics.inDesignCount} in Design</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px] uppercase">Pending QA:</span>
                <span className="font-mono font-bold text-amber-500">{studioMetrics.inReviewCount} in Review</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span>{designers.length} CAD Artisans</span>
              <span>•</span>
              <span>{prospects.length} Direct Clients</span>
            </div>
          </div>
        )}

        {/* B. Superagent Quality Review & Approvals Banner */}
        {activeRole === 'superagent' && (
          <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Shield size={14} className="text-indigo-400" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                Quality Review Gate:
              </span>
              <span className="bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-300 font-mono font-bold text-[11px]">
                {studioMetrics.inReviewCount} Pieces Awaiting Manager Approval
              </span>
              {studioMetrics.urgentCount > 0 && (
                <span className="bg-rose-500/20 text-rose-500 px-2 py-0.5 rounded-full font-mono font-bold text-[11px] flex items-center gap-1">
                  <Flame size={11} />
                  {studioMetrics.urgentCount} Urgent
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Invoices & Financial ledger isolated for manager view
            </span>
          </div>
        )}

        {/* C. Designer Specialty & Workbench Banner */}
        {isDesigner && (
          <div className="bg-purple-500/10 border-b border-purple-500/20 px-6 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Compass size={14} className="text-purple-400" />
              <span className="font-semibold text-purple-700 dark:text-purple-300">
                Artisan Workbench: {currentDesigner.name} ({currentDesigner.code})
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Specialty: {currentDesigner.specialty}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-purple-400">
              <span>{displayedOrders.length} Allocated Orders</span>
              <span>•</span>
              <span>Financials Masked</span>
            </div>
          </div>
        )}

        {/* Content View Container (Desktop Studio Ergonomics) */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === 'table' ? (
            <>
              {currentModule === 'orders' && (
                <OrdersTable 
                  orders={displayedOrders}
                  onSelectOrder={(ord) => handleSelectOrder(ord)}
                  onUpdateStatus={handleUpdateOrderStatus}
                  hideFinancials={isDesigner}
                />
              )}

              {currentModule === 'designers' && canViewDesigners && (
                <DesignersTableView 
                  designers={designers}
                  orders={orders}
                  onOpenNewDesignerModal={() => setIsNewDesignerOpen(true)}
                  onSelectOrder={handleSelectOrder}
                  onDeleteDesigner={handleDeleteDesigner}
                />
              )}

              {currentModule === 'prospects' && canViewProspects && (
                <ProspectsTableView 
                  prospects={prospects}
                  orders={orders}
                  onOpenNewProspectModal={() => setIsNewProspectOpen(true)}
                  onSelectOrder={handleSelectOrder}
                  onDeleteProspect={handleDeleteProspect}
                  onCreateOrderForProspect={handleCreateOrderForProspect}
                />
              )}

              {currentModule === 'invoices' && canViewInvoices && (
                <InvoicesTableView 
                  invoices={invoices}
                  orders={orders}
                  prospects={prospects}
                  onSelectOrder={handleSelectOrder}
                  onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                />
              )}
            </>
          ) : (
            <UniversalDataView 
              module={currentModule}
              viewMode={viewMode}
              data={
                currentModule === 'orders' ? displayedOrders :
                currentModule === 'designers' ? designers :
                currentModule === 'prospects' ? prospects :
                invoices
              }
              onItemClick={(item) => currentModule === 'orders' ? handleSelectOrder(item) : null}
            />
          )}
        </div>
      
        <FloatingViewChanger currentView={viewMode} onChange={setViewMode} />
      </main>

      {/* Unified Order Card Modal/Drawer */}
      <OrderCard 
        order={selectedOrder}
        designers={designers}
        prospects={prospects}
        invoices={invoices}
        corrections={corrections}
        statusHistory={statusHistory}
        role={activeRole}
        viewMode={cardViewMode}
        size={cardSize}
        onViewModeChange={(m) => setCardViewMode(m)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdateDesigner={handleUpdateOrderDesigner}
        onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
        onAddCorrection={handleAddCorrection}
      />

      {/* Modals for Digital Office CRUD Operations */}
      <NewOrderModal 
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        designers={designers}
        prospects={prospects}
        preselectedProspect={preselectedProspect}
        onSubmit={handleCreateOrder}
      />

      <NewDesignerModal 
        isOpen={isNewDesignerOpen}
        onClose={() => setIsNewDesignerOpen(false)}
        onSubmit={handleCreateDesigner}
      />

      <NewProspectModal 
        isOpen={isNewProspectOpen}
        onClose={() => setIsNewProspectOpen(false)}
        onSubmit={handleCreateProspect}
      />

      {/* PocketBase Role Management Console */}
      <RoleManagementModal 
        isOpen={isRoleManagerOpen}
        onClose={() => setIsRoleManagerOpen(false)}
        activeRoleView={activeRole === 'owner' ? 'all' : activeRole}
        onSelectRoleView={(r) => {
          const mappedRole = r === 'all' ? 'owner' : r;
          handleSwitchRole(mappedRole);
        }}
        onUserRoleChanged={(u) => {
          setCurrentUser(u);
        }}
      />
    </div>
  );
}

