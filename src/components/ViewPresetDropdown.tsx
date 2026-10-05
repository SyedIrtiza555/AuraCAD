import React from 'react';
import { ViewPreset } from '../types';
import { Sparkles, SlidersHorizontal } from 'lucide-react';

interface ViewPresetDropdownProps {
  currentPreset: ViewPreset;
  onPresetChange: (preset: ViewPreset) => void;
}

const PRESETS: Array<{
  id: ViewPreset;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'minimal',
    label: 'Minimal',
    sublabel: 'Ultra-clean dashboard cards • Zen view',
    icon: <Sparkles size={12} className="text-[#ff943c]" />
  },
  {
    id: 'basic',
    label: 'Basic',
    sublabel: 'Balanced cards with workflow progress',
    icon: <SlidersHorizontal size={12} className="text-blue-500" />
  }
];

export function ViewPresetDropdown({ currentPreset, onPresetChange }: ViewPresetDropdownProps) {
  const normalizedPreset: ViewPreset = currentPreset === 'basic' ? 'basic' : 'minimal';

  return (
    <div className="flex items-center p-0.5 rounded-full bg-slate-100 border border-slate-200 shadow-2xs">
      {PRESETS.map((preset) => {
        const isSelected = normalizedPreset === preset.id;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPresetChange(preset.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isSelected 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title={`${preset.label} view: ${preset.sublabel}`}
          >
            {preset.icon}
            <span className="hidden sm:inline">{preset.label}</span>
          </button>
        );
      })}
    </div>
  );
}
