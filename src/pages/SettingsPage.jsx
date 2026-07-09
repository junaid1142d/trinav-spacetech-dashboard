import React, { useState } from 'react';
import { Settings, RefreshCw, Info } from 'lucide-react';

export default function SettingsPage({ pressureThresholds, setPressureThresholds, pressureUnit, setPressureUnit, onResetToDefault }) {
  const [localLow, setLocalLow] = useState(String(pressureThresholds.low));
  const [localHigh, setLocalHigh] = useState(String(pressureThresholds.high));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const low = parseFloat(localLow);
    const high = parseFloat(localHigh);
    if (!isNaN(low) && !isNaN(high) && low < high) {
      setPressureThresholds({ low, high });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const UNITS = [
    { id: 'hPa', label: 'Hectopascal (hPa)', desc: 'Standard meteorological unit' },
    { id: 'inHg', label: 'Inches of Mercury (inHg)', desc: 'Aviation & maritime standard' },
    { id: 'mmHg', label: 'Millimeters of Mercury (mmHg)', desc: 'Scientific / physics unit' },
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Configuration</p>
          <h2 className="text-xl font-bold text-white font-display">Settings</h2>
        </div>
        <Settings className="w-5 h-5 text-[#737373]" />
      </div>

      {/* Thresholds */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">Pressure Thresholds</h4>
        <p className="text-[11px] text-[#525252] font-mono leading-relaxed">
          Stations below the Low threshold display as blue; above the High threshold display as red.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#737373] font-mono uppercase tracking-wider block">Low Pressure (hPa)</label>
            <input
              type="number"
              value={localLow}
              onChange={e => setLocalLow(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-white/[0.08] hover:border-white/20 focus:border-white/30 rounded-lg text-sm text-white font-mono outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-[#737373] font-mono uppercase tracking-wider block">High Pressure (hPa)</label>
            <input
              type="number"
              value={localHigh}
              onChange={e => setLocalHigh(e.target.value)}
              className="w-full px-3 py-2 bg-[#111] border border-white/[0.08] hover:border-white/20 focus:border-white/30 rounded-lg text-sm text-white font-mono outline-none transition-colors"
            />
          </div>
        </div>
        <button onClick={handleSave}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${saved ? 'bg-[#22C55E] text-black' : 'bg-white text-black hover:bg-white/90'}`}>
          {saved ? '✓ Saved' : 'Apply Thresholds'}
        </button>
      </div>

      {/* Units */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">Display Unit</h4>
        <div className="space-y-2">
          {UNITS.map(u => (
            <button
              key={u.id}
              onClick={() => setPressureUnit(u.id)}
              className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                pressureUnit === u.id
                  ? 'bg-white text-black border-white'
                  : 'bg-[#111] border-white/[0.08] text-[#737373] hover:border-white/20 hover:text-white'
              }`}
            >
              <div>
                <p className="text-xs font-bold">{u.label}</p>
                <p className={`text-[10px] font-mono ${pressureUnit === u.id ? 'text-[#525252]' : 'text-[#404040]'}`}>{u.desc}</p>
              </div>
              {pressureUnit === u.id && <span className="text-sm">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-white border-b border-white/[0.06] pb-3">Maintenance</h4>
        <p className="text-[11px] text-[#525252] font-mono leading-relaxed">
          Resets all settings and restores the default Tamil Nadu 30-day mock atmospheric dataset.
        </p>
        <button onClick={onResetToDefault}
          className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-black text-xs font-bold rounded-lg transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Restore Defaults
        </button>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 px-4 py-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl text-[10px] text-[#525252] font-mono">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#22D3EE] mt-0.5" />
        <span>Settings apply immediately to the active dataset. Unit changes convert all displayed pressure values. No server-side persistence in this client-only build.</span>
      </div>
    </div>
  );
}
