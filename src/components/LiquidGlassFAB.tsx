import React, { useState } from 'react';
import { Plus, Users, Search, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiquidGlassFABProps {
  onNewOrder: () => void;
  onNavigateClients?: () => void;
  onOpenSearch: () => void;
  isBacklogLocked: boolean;
  onToggleBacklogLock: () => void;
}

export function LiquidGlassFAB({
  onNewOrder,
  onNavigateClients,
  onOpenSearch,
  isBacklogLocked,
  onToggleBacklogLock
}: LiquidGlassFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="absolute bottom-16 right-0 mb-2 flex flex-col gap-1 min-w-[190px] p-1.5 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200 shadow-xl"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                onNewOrder();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-[#ff943c]/15 border border-[#ff943c]/30 flex items-center justify-center text-[#ff943c]">
                <Plus size={13} strokeWidth={2.5} />
              </div>
              <span>New Order</span>
            </button>

            {onNavigateClients && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateClients();
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-left cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                  <Users size={13} strokeWidth={2} />
                </div>
                <span>Clients Directory</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenSearch();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Search size={13} strokeWidth={2} />
              </div>
              <span>Search Hub (⌘K)</span>
            </button>

            <div className="h-px bg-slate-100 my-0.5" />

            <button
              onClick={() => {
                onToggleBacklogLock();
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                {isBacklogLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </div>
              <span>{isBacklogLocked ? 'Lock Active' : 'Lock Backlog'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Primary Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-[#ff943c]/90 hover:bg-[#ff943c] backdrop-blur-2xl text-white shadow-[0_8px_32px_0_rgba(255,148,60,0.45),inset_0_1px_0_0_rgba(255,255,255,0.4)] border border-white/30 flex items-center justify-center transition-all duration-300 active:scale-95 group"
        title="Quick Actions"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </motion.div>
      </button>
    </div>
  );
}

