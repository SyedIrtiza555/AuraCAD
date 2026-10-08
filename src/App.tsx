// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeDatabase } from './db/database';
import { INITIAL_ORDERS } from './data';
import { Order } from './types';
import { OrdersTable } from './components/creative-tim/blocks/orders-table';
import { RoleManagementModal } from './components/RoleManagementModal';
import { 
  getCurrentUser, 
  checkServerHealth, 
  PBUser, 
  UserRole 
} from './lib/pocketbase';
import { 
  LayoutDashboard, 
  Compass, 
  PhoneCall, 
  Shield, 
  Crown, 
  Settings, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';

export default function App() {
  // 1. Initialize Dexie IndexedDB offline persistence
  useEffect(() => {
    initializeDatabase();
  }, []);

  const liveOrders = useLiveQuery(() => db.orders.toArray(), []);
  const [localOrders, setLocalOrders] = useState<Order[]>(INITIAL_ORDERS);
  const orders = liveOrders && liveOrders.length > 0 ? liveOrders : localOrders;

  // 2. Auth & Superuser State
  const [currentUser, setCurrentUser] = useState<PBUser>(() => getCurrentUser());
  const [activeRoleView, setActiveRoleView] = useState<'all' | 'admin' | 'designer' | 'agent' | 'superagent'>('all');
  const [isRoleManagerOpen, setIsRoleManagerOpen] = useState(false);

  // 3. Navigation & Layout State
  const [currentModule, setCurrentModule] = useState<'orders' | 'designer' | 'crm' | 'admin'>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 4. Server Health Ping
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

  const handleSelectOrder = (order: Order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none">
      {/* Left Navigation Rail (Collapsible) */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-60' : 'w-16'
        } border-r border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl flex flex-col h-full shrink-0 transition-all duration-200 z-30`}
      >
        {/* Rail Top Branding */}
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
              onClick={() => alert('New Order creation will be connected in Step 2.')}
              className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Plus size={13} strokeWidth={2.5} className="text-[#ff943c]" />
              <span>New Bespoke Order</span>
            </button>
          </div>
        )}

        {/* Navigation Workstations */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {/* 1. Orders Workstation (Creative Tim Table) */}
          <button
            onClick={() => setCurrentModule('orders')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'orders'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <LayoutDashboard size={15} className={currentModule === 'orders' ? 'text-white' : 'text-blue-500'} />
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

          {/* 2. 3D CAD Designer Bench (Step 3) */}
          <button
            onClick={() => setCurrentModule('designer')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'designer'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Compass size={15} className={currentModule === 'designer' ? 'text-white' : 'text-purple-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>3D CAD Bench</span>
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold border border-purple-400/20">
                  Step 3
                </span>
              </div>
            )}
          </button>

          {/* 3. Sales CRM & Powerdialler (Step 4) */}
          <button
            onClick={() => setCurrentModule('crm')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'crm'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <PhoneCall size={15} className={currentModule === 'crm' ? 'text-white' : 'text-emerald-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>CRM & Dialler</span>
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-400/20">
                  Step 4
                </span>
              </div>
            )}
          </button>

          {/* 4. Studio Admin & Metrics (Step 5) */}
          <button
            onClick={() => setCurrentModule('admin')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'admin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Shield size={15} className={currentModule === 'admin' ? 'text-white' : 'text-amber-500'} />
            {isSidebarOpen && (
              <div className="flex-1 flex items-center justify-between text-left">
                <span>Studio Admin</span>
                <span className="text-[9px] font-mono uppercase px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-400/20">
                  Step 5
                </span>
              </div>
            )}
          </button>
        </nav>

        {/* User Card & PocketBase Superuser Monogram */}
        <div className="p-2 border-t border-slate-200/80 dark:border-slate-800">
          <button
            onClick={() => setIsRoleManagerOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400/60 transition-all cursor-pointer group text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                <Crown size={12} className="text-amber-500" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold truncate">
                    Role: {currentUser.role}
                  </span>
                </div>
              )}
            </div>

            {isSidebarOpen && (
              <div className="text-slate-400 group-hover:text-amber-500 transition-colors">
                <Settings size={13} />
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Frosted Apple Pro Top Header */}
        <header className="h-14 px-6 border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>
                {currentModule === 'orders' && 'Studio Orders Workstation'}
                {currentModule === 'designer' && 'CAD Designer Workbench (Step 3)'}
                {currentModule === 'crm' && 'Sales CRM & Powerdialler Hub (Step 4)'}
                {currentModule === 'admin' && 'Studio Administration & RBAC (Step 5)'}
              </span>
            </h1>

            {/* PocketBase Live Ping Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
              <span className={`w-2 h-2 rounded-full ${
                serverHealth.online 
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' 
                  : 'bg-rose-500'
              }`} />
              <span className="text-slate-600 dark:text-slate-400 font-mono">PocketBase:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {serverHealth.online ? `${serverHealth.latencyMs}ms` : 'offline'}
              </span>
            </div>
          </div>

          {/* Header Controls & Perspectives */}
          <div className="flex items-center gap-3">
            {/* Role Switcher Pill */}
            <button
              onClick={() => setIsRoleManagerOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/40 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Crown size={12} className="text-amber-500" />
              <span>Owner Mode</span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono">({currentUser.username})</span>
            </button>

            {/* PocketBase Admin Dashboard Link */}
            <a
              href="/_/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-all shadow-xs"
            >
              <span>PB Admin</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Central Stage Canvas */}
        <main className="flex-1 overflow-y-auto">
          {currentModule === 'orders' && (
            <div className="p-4 md:p-6 max-w-7xl mx-auto">
              <OrdersTable 
                orders={orders} 
                onSelectOrder={handleSelectOrder}
              />
            </div>
          )}

          {currentModule === 'designer' && (
            <div className="p-8 max-w-3xl mx-auto my-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-400/30 text-purple-500 flex items-center justify-center mx-auto mb-4">
                <Compass size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Step 3: 3D CAD Designer Workbench
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Procedural Three.js jewelry CAD inspector with PBR precious metals (18K gold, platinum), gemstone dispersion, and casting shrinkage tolerance verification.
              </p>
              <button
                onClick={() => setCurrentModule('orders')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-all cursor-pointer shadow-xs"
              >
                <span>Back to Orders Table</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {currentModule === 'crm' && (
            <div className="p-8 max-w-3xl mx-auto my-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                <PhoneCall size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Step 4: Sales CRM & Powerdialler Hub
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Prospect acquisition pipeline, 1-click powerdialler lead queue, active call timer, and live PocketBase call log synchronization.
              </p>
              <button
                onClick={() => setCurrentModule('orders')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-all cursor-pointer shadow-xs"
              >
                <span>Back to Orders Table</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}

          {currentModule === 'admin' && (
            <div className="p-8 max-w-3xl mx-auto my-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <Shield size={24} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Step 5: Studio Administration & Financials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
                Atelier production throughput, revenue pacing, team workload distribution, and superuser RBAC administration.
              </p>
              <button
                onClick={() => setIsRoleManagerOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-500 transition-all cursor-pointer shadow-xs"
              >
                <span>Open Role Management Console</span>
                <Crown size={13} />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Role Management Modal (Superuser RBAC) */}
      <RoleManagementModal
        isOpen={isRoleManagerOpen}
        onClose={() => setIsRoleManagerOpen(false)}
        activeRoleView={activeRoleView}
        onSelectRoleView={(rv) => {
          setActiveRoleView(rv);
          if (rv === 'designer') setCurrentModule('designer');
          else if (rv === 'agent') setCurrentModule('crm');
          else if (rv === 'admin') setCurrentModule('admin');
          else setCurrentModule('orders');
        }}
        onUserRoleChanged={(u) => {
          if (u.id === currentUser.id) {
            setCurrentUser(u);
          }
        }}
      />
    </div>
  );
}
