import { LayoutDashboard, Users, Plus, PanelLeftClose, PanelLeftOpen, AlertTriangle } from "lucide-react";
import React from 'react';

interface SidebarProps {
  onNewOrder: () => void;
  isOpen?: boolean;
  onToggle?: () => void;
  currentModule?: 'orders' | 'crm' | 'complaints';
  onModuleChange?: (module: 'orders' | 'crm' | 'complaints') => void;
  onDropToModule?: (module: string, data: any) => void;
  ordersCount?: number;
  clientsCount?: number;
  complaintsCount?: number;
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
  complaintsCount
}: SidebarProps) {
  if (!isOpen) {
    return (
      <aside className="w-12 border-r border-slate-200 bg-white/90 backdrop-blur-2xl flex flex-col h-screen shrink-0 items-center py-4 z-20">
        <button 
          onClick={onToggle} 
          className="text-slate-500 hover:text-slate-900 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer" 
          title="Open Sidebar"
        >
          <PanelLeftOpen size={14} />
        </button>
      </aside>
    );
  }

  return (
    <aside className="w-52 border-r border-slate-200 bg-white/95 backdrop-blur-2xl flex flex-col h-screen shrink-0 relative select-none z-20 transition-all duration-300">
      {/* Top Header: Brand & Collapse */}
      <div className="flex items-center justify-between px-3.5 pt-4 pb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/15 via-[#ff943c]/15 to-purple-500/15 border border-amber-300/60 backdrop-blur-xl shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#ff943c] shadow-[0_0_8px_rgba(255,148,60,0.9)] animate-pulse" />
          <span className="text-xs font-bold tracking-tight text-slate-900 font-mono">AuraCAD</span>
          <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded-full bg-[#ff943c] text-black">v1</span>
        </div>

        <button 
          onClick={onToggle} 
          className="text-slate-400 hover:text-slate-700 transition-colors p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          title="Collapse Sidebar"
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="px-3 pb-3">
        <button 
          onClick={onNewOrder}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-1.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-98 cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} className="text-[#ff943c]" />
          <span>New Order</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        <NavItem 
          icon={<LayoutDashboard size={15} />} 
          label="Orders" 
          active={currentModule === 'orders'} 
          count={ordersCount}
          onClick={() => onModuleChange?.('orders')} 
          onDrop={(data) => onDropToModule?.('orders', data)}
        />
        <NavItem 
          icon={<Users size={15} />} 
          label="Clients" 
          active={currentModule === 'crm'} 
          count={clientsCount}
          onClick={() => onModuleChange?.('crm')} 
          onDrop={(data) => onDropToModule?.('crm', data)}
        />
        <NavItem 
          icon={<AlertTriangle size={15} />} 
          label="Complaints" 
          active={currentModule === 'complaints'} 
          count={complaintsCount}
          badgeColor="bg-rose-500 text-white"
          onClick={() => onModuleChange?.('complaints')} 
          onDrop={(data) => onDropToModule?.('complaints', data)}
        />
      </nav>

      {/* Bottom User Monogram */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400 text-amber-800 flex items-center justify-center text-[10px] font-bold">
            JD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-semibold text-slate-800 truncate">Studio Lead</span>
          </div>
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
          ? 'bg-amber-500/10 text-amber-900 border border-amber-300/60 shadow-xs' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
      } ${isDragOver ? 'bg-amber-100 text-amber-900' : ''}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={active ? 'text-[#ff943c]' : 'text-slate-500'}>{icon}</span>
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
          badgeColor ? badgeColor : (active ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500')
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
