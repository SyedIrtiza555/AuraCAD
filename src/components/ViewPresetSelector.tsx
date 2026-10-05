import React, { useState, useRef, useEffect } from 'react';
import { ViewPreset } from '../types';
import { ChevronDown, Check, Sparkles, SlidersHorizontal } from 'lucide-react';

interface ViewPresetSelectorProps {
  currentPreset: ViewPreset;
  onPresetChange: (preset: ViewPreset) => void;
}

const PRESETS: { id: ViewPreset; label: string; desc: string; icon: React.ReactNode }[] = [
  { 
    id: 'minimal', 
    label: '1. Minimal', 
    desc: 'Zen mode: Pure visual renders & essential value', 
    icon: <Sparkles size={13} className="text-[#ff943c]" /> 
  },
  { 
    id: 'basic', 
    label: '2. Basic', 
    desc: 'Balanced: Timeline progress, assignees & workflow details', 
    icon: <SlidersHorizontal size={13} className="text-blue-500" /> 
  },
];

export function ViewPresetSelector({ currentPreset, onPresetChange }: ViewPresetSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedPreset: ViewPreset = currentPreset === 'basic' ? 'basic' : 'minimal';
  const activePresetInfo = PRESETS.find(p => p.id === normalizedPreset) || PRESETS[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-2xs cursor-pointer"
        title="Change view preset"
      >
        <span className="flex items-center gap-1.5">
          {activePresetInfo.icon}
          <span className="font-semibold text-slate-800">{activePresetInfo.label}</span>
        </span>
        <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1 border-b border-slate-100 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">View Preset</span>
          </div>

          <div className="space-y-0.5">
            {PRESETS.map((preset) => {
              const isSelected = preset.id === normalizedPreset;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    onPresetChange(preset.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-100 text-slate-900 font-semibold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="mt-0.5 shrink-0">{preset.icon}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 leading-tight">{preset.label}</p>
                      <p className="text-[10px] text-slate-500 leading-tight truncate mt-0.5">{preset.desc}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <Check size={13} className="text-[#ff943c] shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
