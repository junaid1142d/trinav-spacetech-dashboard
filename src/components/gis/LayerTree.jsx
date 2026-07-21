import React from 'react';
import { Layers, Eye, EyeOff, Map as MapIcon, Globe, Database } from 'lucide-react';

export default function LayerTree({
  baseMap, setBaseMap,
  showDistricts, setShowDistricts,
  districtOpacity, setDistrictOpacity,
  activeWMS, setActiveWMS,
  wmsOpacity, setWmsOpacity,
  activeWFS, setActiveWFS,
  wfsData,
  curatedWMS,
  curatedWFS,
}) {
  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4 space-y-4 font-mono text-[10px]">
      <div className="flex items-center gap-2 pb-2.5 border-b border-white/[0.06]">
        <Layers className="w-4 h-4 text-[#22D3EE]" />
        <h4 className="text-xs font-bold text-white font-display uppercase tracking-wider">GIS Layer Tree</h4>
      </div>

      {/* BASEMAPS */}
      <div className="space-y-2">
        <p className="text-[8px] text-[#525252] uppercase tracking-wider">Basemap Provider</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'dark', label: 'CartoDB Dark' },
            { id: 'osm', label: 'OpenStreetMap' },
            { id: 'sat', label: 'ESRI Satellite' },
          ].map(bm => (
            <button
              key={bm.id}
              onClick={() => setBaseMap(bm.id)}
              className={`py-1.5 px-2 rounded-md border text-center transition-all ${
                baseMap === bm.id
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-[#111] border-white/[0.06] text-[#737373] hover:text-white'
              }`}
            >
              {bm.label}
            </button>
          ))}
        </div>
      </div>

      {/* OPERATIONAL LAYERS */}
      <div className="space-y-2">
        <p className="text-[8px] text-[#525252] uppercase tracking-wider">Operational Layers</p>
        
        {/* District Suitability Layer */}
        <div className="bg-[#111] border border-white/[0.06] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="w-3.5 h-3.5 text-[#22C55E]" />
              <span className="text-white font-medium">TN 38-District Suitability</span>
            </div>
            <button onClick={() => setShowDistricts(!showDistricts)} className="text-[#737373] hover:text-white">
              {showDistricts ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </div>
          {showDistricts && (
            <div className="space-y-1 pt-1 border-t border-white/[0.04]">
              <div className="flex justify-between text-[8px] text-[#525252]">
                <span>Layer Opacity</span>
                <span className="text-[#22C55E]">{Math.round(districtOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={districtOpacity}
                onChange={e => setDistrictOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#22C55E] cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* OGC SERVICES */}
      <div className="space-y-2">
        <p className="text-[8px] text-[#525252] uppercase tracking-wider">OGC Services</p>

        {/* WMS Layer Selection */}
        <div className="bg-[#111] border border-white/[0.06] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
              <span className="text-white font-medium">NASA GIBS WMS</span>
            </div>
          </div>
          <select
            value={activeWMS?.name || ''}
            onChange={e => {
              const selected = curatedWMS.find(l => l.name === e.target.value);
              setActiveWMS(selected || null);
            }}
            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white outline-none"
          >
            <option value="">None (Disabled)</option>
            {curatedWMS.map(l => (
              <option key={l.name} value={l.name}>{l.title}</option>
            ))}
          </select>
          {activeWMS && (
            <div className="space-y-1 pt-1 border-t border-white/[0.04]">
              <div className="flex justify-between text-[8px] text-[#525252]">
                <span>WMS Opacity</span>
                <span className="text-[#22D3EE]">{Math.round(wmsOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={wmsOpacity}
                onChange={e => setWmsOpacity(parseFloat(e.target.value))}
                className="w-full accent-[#22D3EE] cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* WFS Vector Layer Selection */}
        <div className="bg-[#111] border border-white/[0.06] rounded-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-white" />
              <span className="text-white font-medium">GeoServer WFS</span>
            </div>
          </div>
          <select
            value={activeWFS?.name || ''}
            onChange={e => {
              const selected = curatedWFS.find(l => l.name === e.target.value);
              setActiveWFS(selected || null);
            }}
            className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white outline-none"
          >
            <option value="">None (Disabled)</option>
            {curatedWFS.map(l => (
              <option key={l.name} value={l.name}>{l.title}</option>
            ))}
          </select>
          {wfsData?.features?.length > 0 && (
            <p className="text-[8px] text-[#22C55E] pt-1">
              ✓ Loaded {wfsData.features.length} vector features (BBOX)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
