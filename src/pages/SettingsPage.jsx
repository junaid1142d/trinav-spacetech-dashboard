import React from 'react';
import { Settings, RefreshCcw, Sliders, Info } from 'lucide-react';

export default function SettingsPage({ 
  pressureThresholds, 
  setPressureThresholds, 
  pressureUnit, 
  setPressureUnit, 
  onResetToDefault 
}) {
  const handleThresholdChange = (key, value) => {
    const parsedVal = parseFloat(value);
    if (!isNaN(parsedVal)) {
      setPressureThresholds(prev => ({
        ...prev,
        [key]: parsedVal
      }));
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-brand-navy/60 px-6 py-4 border border-brand-border/40 rounded-2xl">
        <div>
          <span className="text-[10px] text-brand-textMuted uppercase font-mono tracking-wider block">SYSTEM PREFERENCES</span>
          <h2 className="text-xl font-extrabold text-white font-['Outfit']">Settings & Controls</h2>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
          <Settings className="w-5 h-5" />
        </div>
      </div>

      {/* Threshold configuration card */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
        <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3">
          <Sliders className="w-4.5 h-4.5 text-brand-cyan" />
          <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">Barometric Index Thresholds</h4>
        </div>
        
        <p className="text-brand-textSecondary text-xs leading-relaxed max-w-2xl">
          Adjust the barometric pressure limits (in hPa) to change map color-coding indexes. 
          Stations below the Low boundary display as Blue, and above the High boundary display as Red.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <label className="text-xs text-brand-textSecondary font-mono block">Low Pressure Threshold (hPa)</label>
            <input 
              type="number"
              value={pressureThresholds.low}
              onChange={(e) => handleThresholdChange('low', e.target.value)}
              className="w-full px-3.5 py-2 bg-brand-dark/60 border border-brand-border/60 hover:border-brand-cyan/40 focus:border-brand-cyan focus:ring-0 rounded-xl text-xs text-white font-mono transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-brand-textSecondary font-mono block">High Pressure Threshold (hPa)</label>
            <input 
              type="number"
              value={pressureThresholds.high}
              onChange={(e) => handleThresholdChange('high', e.target.value)}
              className="w-full px-3.5 py-2 bg-brand-dark/60 border border-brand-border/60 hover:border-brand-cyan/40 focus:border-brand-cyan focus:ring-0 rounded-xl text-xs text-white font-mono transition-all"
            />
          </div>
        </div>
      </div>

      {/* Unit system configuration */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
        <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white border-b border-brand-border/30 pb-3">Display Measurement Unit</h4>
        <p className="text-brand-textSecondary text-xs leading-relaxed max-w-2xl">
          Choose the preferred scale for pressure reporting across charts, tables, and map tooltips.
        </p>
        
        <div className="flex flex-wrap gap-2.5 pt-2">
          {[
            { id: 'hPa', label: 'Hectopascal (hPa)', desc: 'Standard meteorological unit' },
            { id: 'inHg', label: 'Inches of Mercury (inHg)', desc: 'Common aviation / maritime unit' },
            { id: 'mmHg', label: 'Millimeters of Mercury (mmHg)', desc: 'Scientific / physics pressure unit' }
          ].map((unit) => (
            <button
              key={unit.id}
              onClick={() => setPressureUnit(unit.id)}
              className={`flex-1 min-w-[200px] text-left p-4 rounded-xl border transition-all ${
                pressureUnit === unit.id 
                  ? 'bg-brand-cyan/10 border-brand-cyan text-white shadow-cyan-glow' 
                  : 'bg-brand-dark/40 border-brand-border/60 text-brand-textSecondary hover:border-brand-cyan/30 hover:text-white'
              }`}
            >
              <span className="text-xs font-bold font-mono block">{unit.label}</span>
              <span className="text-[10px] text-brand-textMuted font-sans block mt-1">{unit.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Factory Reset controls */}
      <div className="glass-panel p-6 rounded-2xl border border-red-500/10 space-y-4">
        <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white border-b border-red-500/10 pb-3">Platform Maintenance</h4>
        <p className="text-brand-textSecondary text-xs leading-relaxed max-w-2xl">
          Reset all local modifications and clear the active uploaded telemetry cache, restoring the default 30-day mock observations for Tamil Nadu weather stations.
        </p>

        <div className="pt-2 select-none">
          <button 
            onClick={onResetToDefault}
            className="px-5 py-2.5 bg-red-950/20 hover:bg-red-500 border border-red-500/40 hover:border-red-500 text-red-300 hover:text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restore Default Tamil Nadu Dataset
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-3 rounded-xl bg-brand-dark/30 border border-brand-border/20 text-[10px] text-brand-textSecondary">
        <Info className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
        <span>Changes made here are applied instantly to the client execution thread and persist until page reload.</span>
      </div>
    </div>
  );
}
