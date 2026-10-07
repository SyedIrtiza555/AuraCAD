// src/components/views/AgentCrmView.tsx
import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  PhoneForwarded, 
  PhoneOff, 
  Clock, 
  User, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw,
  Send,
  MessageSquare,
  ShieldCheck,
  Headphones
} from 'lucide-react';
import { PBCallLog, fetchCallLogs, recordCallLog } from '../../lib/pocketbase';
import { Prospect, Client } from '../../types';

interface AgentCrmViewProps {
  prospects: Prospect[];
  clients: Client[];
  onOpenProspect?: (prospect: Prospect) => void;
}

export function AgentCrmView({ prospects, clients, onOpenProspect }: AgentCrmViewProps) {
  const [callLogs, setCallLogs] = useState<PBCallLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Powerdialler Active Call Simulation State
  const [activeCallTarget, setActiveCallTarget] = useState<{ name: string; phone: string; budget?: number; jewelryType?: string } | null>(null);
  const [callTimer, setCallTimer] = useState<number>(0);
  const [callOutcome, setCallOutcome] = useState<PBCallLog['outcome']>('Qualified');
  const [callNotes, setCallNotes] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    const logs = await fetchCallLogs();
    setCallLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Timer tick for active dial
  useEffect(() => {
    let interval: any;
    if (activeCallTarget) {
      interval = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } else {
      setCallTimer(0);
    }
    return () => clearInterval(interval);
  }, [activeCallTarget]);

  const handleStartCall = (target: { name: string; phone: string; budget?: number; jewelryType?: string }) => {
    setActiveCallTarget(target);
    setCallTimer(0);
    setCallOutcome('Qualified');
    setCallNotes('');
  };

  const handleEndCall = async () => {
    if (!activeCallTarget) return;

    const newLog: PBCallLog = {
      contact_name: activeCallTarget.name,
      phone: activeCallTarget.phone,
      agent_name: 'Marcus Vance (CRM Agent)',
      status: 'Completed',
      duration_seconds: callTimer,
      outcome: callOutcome,
      notes: callNotes.trim() || `Discovery call for ${activeCallTarget.jewelryType || 'bespoke jewelry piece'}.`,
      call_time: new Date().toISOString()
    };

    await recordCallLog(newLog);
    setActiveCallTarget(null);
    loadLogs();
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const filteredProspects = prospects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.jewelryType?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/60 dark:bg-slate-950 overflow-hidden">
      {/* Top Banner: Powerdialler Command Strip */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <Headphones size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100">Agent CRM & Powerdialler Hub</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-400/30">
                PocketBase Linked
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-functionality CRM pipeline ready for automated dialler sweeps & discovery logging
            </p>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 mr-1.5">Leads in Queue:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{prospects.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-slate-400 mr-1.5">Calls Logged:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{callLogs.length}</span>
          </div>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh PocketBase Records"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Left Col: Lead Queue (7 Cols) */}
        <div className="col-span-7 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PhoneCall size={15} className="text-emerald-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Powerdialler Outbound Queue
              </h2>
            </div>

            <div className="relative w-56">
              <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredProspects.map(prospect => (
              <div 
                key={prospect.id} 
                className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between"
              >
                <div className="space-y-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">{prospect.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                      {prospect.stage}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3">
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      ${prospect.budget?.toLocaleString() || 'Bespoke'}
                    </span>
                    <span>•</span>
                    <span className="truncate">{prospect.jewelryType || 'Custom Request'}</span>
                    <span>•</span>
                    <span className="font-mono">{prospect.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStartCall({
                      name: prospect.name,
                      phone: prospect.phone,
                      budget: prospect.budget,
                      jewelryType: prospect.jewelryType
                    })}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs hover:shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer"
                  >
                    <Phone size={12} />
                    <span>Quick Dial</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Active Dial Simulator & Recent PocketBase Call Logs (5 Cols) */}
        <div className="col-span-5 flex flex-col gap-6 overflow-hidden">
          {/* Active Call HUD */}
          {activeCallTarget ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl text-white space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">Active Call in Progress</span>
                </div>
                <div className="font-mono font-bold text-lg text-emerald-300">
                  {formatSeconds(callTimer)}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold">{activeCallTarget.name}</h3>
                <p className="text-xs font-mono text-emerald-400/90">{activeCallTarget.phone} • Est. Budget: ${activeCallTarget.budget?.toLocaleString()}</p>
                <p className="text-xs text-slate-300 mt-0.5">{activeCallTarget.jewelryType}</p>
              </div>

              {/* Call Outcome Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Call Outcome Tag</label>
                <select 
                  value={callOutcome} 
                  onChange={e => setCallOutcome(e.target.value as any)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium"
                >
                  <option value="Qualified">Qualified — Ready for CAD</option>
                  <option value="Follow-up Needed">Follow-up Needed</option>
                  <option value="Bespoke Quote Sent">Bespoke Quote Sent</option>
                  <option value="Deposit Taken">Deposit Taken ($1,000+)</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              {/* Call Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Intake / Powerdialler Notes</label>
                <textarea 
                  rows={2}
                  value={callNotes}
                  onChange={e => setCallNotes(e.target.value)}
                  placeholder="Record client diamond preference, finger size, budget flexibility..."
                  className="w-full text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              {/* Action */}
              <button
                onClick={handleEndCall}
                className="w-full py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <PhoneOff size={14} />
                <span>End Call & Sync to PocketBase</span>
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
                <Phone size={18} />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Powerdialler Idle</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Select any lead in the outbound queue to simulate powerdialler connection and auto-sync call history into PocketBase.
              </p>
            </div>
          )}

          {/* Recent Call Logs Feed */}
          <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  PocketBase Call Activity
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-semibold">{callLogs.length} logged</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-1">
              {callLogs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No calls recorded yet.
                </div>
              ) : (
                callLogs.map((log, idx) => (
                  <div key={log.id || idx} className="p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{log.contact_name}</span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {log.duration_seconds > 0 ? `${log.duration_seconds}s` : 'Logged'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                        {log.outcome}
                      </span>
                      <span className="text-slate-400 font-mono">{log.phone}</span>
                    </div>
                    {log.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
