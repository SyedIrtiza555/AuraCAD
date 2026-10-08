import { 
  LayoutDashboard, 
  Users, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen, 
  AlertTriangle,
  Compass,
  PhoneCall,
  Crown,
  Shield,
  Settings,
  Database,
  TableProperties
} from "lucide-react";
import React from 'react';
import { PBUser, UserRole } from '../lib/pocketbase';

interface SidebarProps {
  onNewOrder: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  currentModule?: 'orders' | 'crm' | 'complaints' | 'designer_bench' | 'agent_crm' | 'creative_tim_orders';
  onModuleChange?: (module: 'orders' | 'crm' | 'complaints' | 'designer_bench' | 'agent_crm' | 'creative_tim_orders') => void;
  onDropToModule?: (module: string, data: any) => void;
  ordersCount?: number;
  clientsCount?: number;
  complaintsCount?: number;
  currentUser?: PBUser;
  activeRoleView?: 'all' | 'admin' | 'designer' | 'agent' | 'superagent';
  onOpenRoleManager?: () => void;
}

export function Sidebar({ 
  onNewOrder, 
  isOpen = true, 
  onToggle, 
  currentModule = 'orders', 
  onModuleChange, 
  onDropToModule,
  ordersCount,
  clientsCount,
  complaintsCount,
  currentUser,
  activeRoleView = 'all',
  onOpenRoleManager
}: SidebarProps) {
  if (!isOpen) {
    return (
      <aside className="w-12 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl flex flex-col h-screen shrink-0 items-center py-4 z-20">
        <button 
          onClick={onToggle} 
          className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" 
          title="Open Sidebar"
        >
          <PanelLeftOpen size={14} />
        </button>
      </aside>
    );
  }

  const role = currentUser?.role || 'owner';
  const isGod = role === 'owner' || currentUser?.username === 'dev';

  return (
    <aside className="w-56 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl flex flex-col h-screen shrink-0 relative select-none z-20 transition-all duration-300">
      {/* Top Header: Brand & Collapse */}
      <div className="flex items-center justify-between px-3.5 pt-4 pb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-[#ff943c]/15 to-purple-500/15 border border-amber-300/60 dark:border-amber-500/40 backdrop-blur-xl shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#ff943c] shadow-[0_0_8px_rgba(255,148,60,0.9)] animate-pulse" />
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">AuraCAD</span>
          <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-[#ff943c] text-black">v0-b</span>
        </div>

        <button 
          onClick={onToggle} 
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title="Collapse Sidebar"
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Primary Action Button (Hidden in Agent pure mode) */}
      {activeRoleView !== 'agent' && (
        <div className="px-3 pb-3">
          <button 
            onClick={onNewOrder}
            className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
          >
            <Plus size={13} strokeWidth={2.5} className="text-[#ff943c]" />
            <span>New Order</span>
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {/* Core Studio / Admin Views */}
        {(activeRoleView === 'all' || activeRoleView === 'admin') && (
          <>
            <div className="px-2 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Studio Suite
            </div>
            <NavItem 
              icon={<LayoutDashboard size={15} />} 
              label="CAD Orders" 
              active={currentModule === 'orders'} 
              count={ordersCount}
              onClick={() => onModuleChange?.('orders')} 
              onDrop={(data) => onDropToModule?.('orders', data)}
            />
            <NavItem 
              icon={<TableProperties size={15} className="text-blue-500" />} 
              label="Creative Tim Table" 
              active={currentModule === 'creative_tim_orders'} 
              badgeColor="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
              onClick={() => onModuleChange?.('creative_tim_orders')} 
            />
            <NavItem 
              icon={<Users size={15} />} 
              label="Client Ledger" 
              active={currentModule === 'crm'} 
              count={clientsCount}
              onClick={() => onModuleChange?.('crm')} 
              onDrop={(data) => onDropToModule?.('crm', data)}
            />
            <NavItem 
              icon={<AlertTriangle size={15} />} 
              label="Disputes & Anomalies" 
              active={currentModule === 'complaints'} 
              count={complaintsCount}
              badgeColor="bg-rose-500 text-white"
              onClick={() => onModuleChange?.('complaints')} 
              onDrop={(data) => onDropToModule?.('complaints', data)}
            />
          </>
        )}

        {/* Designer Workbench View */}
        {(activeRoleView === 'all' || activeRoleView === 'designer') && (
          <>
            <div className="px-2 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Compass size={11} />
              <span>Designer Suite</span>
            </div>
            <NavItem 
              icon={<Compass size={15} className="text-purple-500" />} 
              label="3D CAD Bench" 
              active={currentModule === 'designer_bench'} 
              count={ordersCount}
              badgeColor="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
              onClick={() => onModuleChange?.('designer_bench')} 
            />
          </>
        )}

        {/* Agent CRM & Powerdialler View */}
        {(activeRoleView === 'all' || activeRoleView === 'agent') && (
          <>
            <div className="px-2 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <PhoneCall size={11} />
              <span>CRM & Dialler</span>
            </div>
            <NavItem 
              icon={<PhoneCall size={15} className="text-emerald-500" />} 
              label="Powerdialler Hub" 
              active={currentModule === 'agent_crm'} 
              badgeColor="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              onClick={() => onModuleChange?.('agent_crm')} 
            />
          </>
        )}
      </nav>

      {/* PocketBase Superuser & Role Manager Monogram */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onOpenRoleManager}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 hover:border-amber-400/60 dark:hover:border-amber-400/60 transition-all cursor-pointer text-left group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              isGod 
                ? 'bg-amber-500/20 border border-amber-400 text-amber-700 dark:text-amber-300' 
                : 'bg-blue-500/20 border border-blue-400 text-blue-700 dark:text-blue-300'
            }`}>
              {isGod ? <Crown size={12} className="text-amber-500" /> : <Shield size={12} />}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                  {currentUser?.name || 'God User (Dev)'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold truncate">
                Role: {role}
              </span>
            </div>
          </div>

          <div className="p-1 rounded-lg text-slate-400 group-hover:text-amber-500 transition-colors">
            <Settings size={13} />
          </div>
        </button>

        {/* Backend status indicator */}
        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            <span>PB :8090</span>
          </div>
          <span className="text-slate-500">v0.25.9</span>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ 
  icon, 
  label, 
  count,
  active = false, 
  badgeColor,
  onClick, 
  onDrop 
}: { 
  icon: React.ReactNode; 
  label: string; 
  count?: number;
  active?: boolean; 
  badgeColor?: string;
  onClick?: () => void; 
  onDrop?: (data: any) => void;
}) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    if (onDrop) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (onDrop) {
      e.preventDefault();
      setIsDragOver(false);
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        onDrop(data);
      } catch (err) {}
    }
  };

  return (
    <button 
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        active 
          ? 'bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-300/60 dark:border-amber-500/40 shadow-xs' 
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${isDragOver ? 'bg-amber-100 text-amber-900' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? 'text-[#ff943c]' : 'text-slate-500 dark:text-slate-400'}>{icon}</span>
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
          badgeColor ? badgeColor : (active ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
