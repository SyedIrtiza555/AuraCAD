// src/components/views/DesignerBenchView.tsx
import React, { useState } from 'react';
import { Jewelry3DViewer } from '../Jewelry3DViewer';
import { Order, OrderStatus } from '../../types';
import { 
  Compass, 
  Sparkles, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Ruler, 
  ShieldCheck, 
  Send,
  Sliders,
  ChevronRight,
  Gem
} from 'lucide-react';

interface DesignerBenchViewProps {
  orders: Order[];
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
}

export function DesignerBenchView({ orders, onUpdateOrderStatus }: DesignerBenchViewProps) {
  // Filter orders for CAD workbench (In progress, In Review, or Inbox)
  const designerOrders = orders.filter(o => o.status === 'In progress' || o.status === 'In Review' || o.status === 'Inbox');
  const [selectedOrderId, setSelectedOrderId] = useState<string>(designerOrders[0]?.id || orders[0]?.id);

  const activeOrder = orders.find(o => o.id === selectedOrderId) || designerOrders[0] || orders[0];

  // Procedural 3D settings
  const [metal, setMetal] = useState<'yellow_gold' | 'white_gold' | 'rose_gold' | 'platinum'>('yellow_gold');
  const [gemstone, setGemstone] = useState<'diamond' | 'ruby' | 'sapphire' | 'emerald'>('diamond');

  // Technical tolerance check state
  const [wallThicknessMm, setWallThicknessMm] = useState<number>(0.85);
  const [fingerCircumferenceMm, setFingerCircumferenceMm] = useState<number>(52.0);

  const isPlatinumSafe = metal === 'platinum' ? wallThicknessMm >= 0.75 : wallThicknessMm >= 0.65;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900 text-slate-100 overflow-hidden select-none">
      {/* Designer Bench Top Bar */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/40 text-purple-400 flex items-center justify-center shadow-xs">
            <Compass size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-100">CAD Designer Workbench</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                Elena Rostova (Lead CAD)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Procedural WebGL 3D CAD modeling, PBR alloy metals & casting tolerance verification
            </p>
          </div>
        </div>

        {/* Quick CAD Stage Selector for Current Order */}
        {activeOrder && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Stage:</span>
            <select
              value={activeOrder.status}
              onChange={(e) => onUpdateOrderStatus?.(activeOrder.id, e.target.value as OrderStatus)}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="Inbox">1. Inbox</option>
              <option value="In progress">2. In progress (CAD)</option>
              <option value="In Review">3. In Review (Client Proof)</option>
              <option value="Delivered">4. Delivered</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Bench Grid: Orders list (Left), 3D Viewer (Center), Technical Specs (Right) */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Assigned Orders Selector (3 cols) */}
        <div className="col-span-3 border-r border-slate-800 bg-slate-950/40 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400">Assigned CAD Orders</span>
            <span className="font-mono text-purple-400 font-bold">{designerOrders.length} active</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-1">
            {designerOrders.map(ord => {
              const isSelected = ord.id === activeOrder?.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-purple-500/15 border border-purple-500/50 shadow-xs' 
                      : 'hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold">{ord.id}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      ord.status === 'In progress' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-100 line-clamp-1">{ord.title}</h3>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{ord.orderType || 'Bespoke'}</span>
                    <span className="font-mono text-purple-300 font-semibold">${ord.value?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Central 3D Procedural WebGL Stage (6 cols) */}
        <div className="col-span-6 flex flex-col bg-slate-950 relative border-r border-slate-800 overflow-hidden">
          {/* 3D Top Floating Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 pointer-events-auto shadow-lg">
              <Sparkles size={13} className="text-purple-400" />
              <span className="text-xs font-bold text-slate-200">Three.js PBR Engine</span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold ml-1">WebGL 60FPS</span>
            </div>

            {/* Quick Alloy / Gem Selector Pills */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Metal */}
              <div className="bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-lg text-[11px]">
                <button
                  onClick={() => setMetal('yellow_gold')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${metal === 'yellow_gold' ? 'bg-amber-500 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  18K Gold
                </button>
                <button
                  onClick={() => setMetal('white_gold')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${metal === 'white_gold' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  White Gold
                </button>
                <button
                  onClick={() => setMetal('platinum')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${metal === 'platinum' ? 'bg-cyan-400 text-black font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Platinum
                </button>
              </div>

              {/* Gem */}
              <div className="bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-lg text-[11px]">
                <button
                  onClick={() => setGemstone('diamond')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${gemstone === 'diamond' ? 'bg-white text-black font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Diamond
                </button>
                <button
                  onClick={() => setGemstone('ruby')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${gemstone === 'ruby' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Ruby
                </button>
                <button
                  onClick={() => setGemstone('sapphire')}
                  className={`px-2 py-0.5 rounded-lg transition-all ${gemstone === 'sapphire' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Sapphire
                </button>
              </div>
            </div>
          </div>

          {/* Procedural 3D Canvas */}
          <div className="flex-1 w-full h-full">
            <Jewelry3DViewer 
              height="100%" 
              metalAlloy={metal}
              gemstoneType={gemstone}
            />
          </div>

          {/* Bottom HUD: Orbit help */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between text-[11px] text-slate-400">
            <span>Left-click + drag to orbit • Scroll to zoom • Right-click to pan</span>
            <span className="font-mono text-purple-400">Model: Solitaire Cathedral Mount</span>
          </div>
        </div>

        {/* Technical Specs & Corrections Bench (3 cols) */}
        <div className="col-span-3 flex flex-col bg-slate-950/60 overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-400">Casting Safety & Specs</span>
            <Ruler size={14} className="text-purple-400" />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
            {/* Tolerances */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Shank Wall Thickness</span>
                <span className={`font-mono font-bold ${isPlatinumSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {wallThicknessMm.toFixed(2)} mm
                </span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.05"
                value={wallThicknessMm}
                onChange={e => setWallThicknessMm(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 text-[11px]">
                {isPlatinumSafe ? (
                  <div className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck size={13} />
                    <span>Meets casting shrinkage threshold</span>
                  </div>
                ) : (
                  <div className="text-rose-400 flex items-center gap-1">
                    <AlertTriangle size={13} />
                    <span>Warning: Below min casting safety (0.75mm)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Finger Sizing */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-300">Inner Circumference</span>
                <span className="font-mono text-purple-400 font-bold">{fingerCircumferenceMm.toFixed(1)} mm</span>
              </div>
              <input 
                type="range" 
                min="44.0" 
                max="65.0" 
                step="0.5"
                value={fingerCircumferenceMm}
                onChange={e => setFingerCircumferenceMm(parseFloat(e.target.value))}
                className="w-full accent-purple-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-400">
                Corresponds to US Ring Size: <span className="font-mono text-slate-200 font-bold">6.25 (EU 52)</span>
              </div>
            </div>

            {/* Active Order Corrections / Designer Notes */}
            {activeOrder && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Intake Instructions</h4>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 italic">
                  "{activeOrder.notes || 'No specific notes recorded.'}"
                </div>

                {activeOrder.corrections && activeOrder.corrections.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Revision Tickets</h4>
                    {activeOrder.corrections.map((corr, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2">
                        <AlertTriangle size={13} className="shrink-0 text-amber-400 mt-0.5" />
                        <span>{corr}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
