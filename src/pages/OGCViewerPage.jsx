import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers, RefreshCw, AlertCircle, CheckCircle2, Globe, Database,
  MapPin, Zap, Wind, Sun, ChevronDown, ChevronUp, X, ExternalLink,
  Search, Info, Eye, EyeOff, Crosshair
} from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, CircleMarker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import RequestInspector from '../components/RequestInspector';
import { OGC_SERVICES, wmsGetCapabilities, wfsGetCapabilities, wfsGetFeature } from '../services/api';
import tamilnaduDistricts, { ZONE_COLORS, getSuitabilityColor, getSuitabilityLabel } from '../data/tamilnaduDistricts';

// ─── Map Controller ────────────────────────────────
function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [40, 40], animate: true });
  }, [bounds, map]);
  return null;
}

// ─── WFS GeoJSON Layer ─────────────────────────────
function WFSGeoJSONLayer({ data, onFeatureClick }) {
  if (!data?.features?.length) return null;

  const style = (feature) => ({
    color: '#22D3EE',
    weight: 1.5,
    opacity: 0.8,
    fillColor: '#22D3EE',
    fillOpacity: 0.12,
  });

  const onEachFeature = (feature, layer) => {
    layer.on({ click: () => onFeatureClick(feature) });
    layer.on({
      mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.35, weight: 2.5 }); },
      mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.12, weight: 1.5 }); },
    });
  };

  return <GeoJSON data={data} style={style} onEachFeature={onEachFeature} />;
}

// ─── Tabs ──────────────────────────────────────────
const TABS = [
  { id: 'districts', label: 'TN Districts', icon: MapPin },
  { id: 'wms', label: 'WMS Layers', icon: Globe },
  { id: 'wfs', label: 'WFS Features', icon: Database },
];

// ─── MAIN COMPONENT ────────────────────────────────
export default function OGCViewerPage() {
  // State
  const [activeTab, setActiveTab] = useState('districts');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistricts, setShowDistricts] = useState(true);
  const [colorBy, setColorBy] = useState('overall_score');

  // WMS
  const [wmsLayers, setWmsLayers] = useState([]);
  const [loadingWMS, setLoadingWMS] = useState(false);
  const [wmsError, setWmsError] = useState(null);
  const [activeWMSLayer, setActiveWMSLayer] = useState(null);
  const [wmsOpacity, setWmsOpacity] = useState(0.7);
  const [wmsSearch, setWmsSearch] = useState('');

  // WFS
  const [wfsLayers, setWfsLayers] = useState([]);
  const [loadingWFS, setLoadingWFS] = useState(false);
  const [wfsError, setWfsError] = useState(null);
  const [activeWFSLayer, setActiveWFSLayer] = useState(null);
  const [wfsData, setWfsData] = useState(null);
  const [loadingWFSData, setLoadingWFSData] = useState(false);
  const [selectedWFSFeature, setSelectedWFSFeature] = useState(null);

  // Inspector
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const abortRef = useRef(null);

  // Tamil Nadu bounds
  const tnBounds = [[7.9, 76.2], [13.5, 80.6]];

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    const s = districtSearch.toLowerCase();
    return tamilnaduDistricts.features.filter(f =>
      !s || f.properties.name.toLowerCase().includes(s) || f.properties.zone.toLowerCase().includes(s)
    );
  }, [districtSearch]);

  // Filtered WMS layers
  const filteredWMS = useMemo(() => {
    const s = wmsSearch.toLowerCase();
    return wmsLayers.filter(l => !s || l.title.toLowerCase().includes(s) || l.name.toLowerCase().includes(s));
  }, [wmsLayers, wmsSearch]);

  // Marker color
  const getMarkerColor = (props) => {
    if (colorBy === 'overall_score') return getSuitabilityColor(props.overall_score);
    if (colorBy === 'suitability_solar') return getSuitabilityColor(props.suitability_solar);
    if (colorBy === 'suitability_wind') return getSuitabilityColor(props.suitability_wind);
    if (colorBy === 'zone') return ZONE_COLORS[props.zone] || '#737373';
    return '#FFFFFF';
  };

  // WMS GetCapabilities
  const loadWMSCapabilities = async () => {
    setLoadingWMS(true); setWmsError(null);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const layers = await wmsGetCapabilities(OGC_SERVICES.NASA_GIBS.url, abortRef.current.signal);
      setWmsLayers(layers.slice(0, 60));
    } catch (e) {
      if (e.name !== 'AbortError') setWmsError(e.message);
    } finally { setLoadingWMS(false); }
  };

  // WFS GetCapabilities
  const loadWFSCapabilities = async () => {
    setLoadingWFS(true); setWfsError(null);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const layers = await wfsGetCapabilities(OGC_SERVICES.GEOSERVER.url, abortRef.current.signal);
      setWfsLayers(layers.slice(0, 40));
    } catch (e) {
      if (e.name !== 'AbortError') setWfsError(e.message);
    } finally { setLoadingWFS(false); }
  };

  // WFS GetFeature with Tamil Nadu BBOX
  const loadWFSFeatures = async (layer) => {
    setActiveWFSLayer(layer); setLoadingWFSData(true); setWfsData(null); setSelectedWFSFeature(null);
    try {
      const bbox = '76.2,7.9,80.6,13.5';
      const data = await wfsGetFeature(OGC_SERVICES.GEOSERVER.url, layer.name, bbox, null, 100);
      setWfsData(data);
    } catch (e) {
      setWfsData({ error: e.message });
    } finally { setLoadingWFSData(false); }
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  // ─── RENDER ──────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#050505] border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-[#22D3EE]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white font-display">OGC Services Workspace</h2>
            <p className="text-[8px] text-[#404040] font-mono uppercase tracking-widest">Renewable Energy Land Suitability · Tamil Nadu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeWMSLayer && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-[#22D3EE]/10 border border-[#22D3EE]/25 rounded-md text-[9px] font-mono text-[#22D3EE]">
              <Globe className="w-3 h-3" /> WMS: {activeWMSLayer.title.substring(0, 25)}...
            </span>
          )}
          {wfsData?.features?.length > 0 && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/15 rounded-md text-[9px] font-mono text-white">
              <Database className="w-3 h-3" /> {wfsData.features.length} WFS features
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.04] border border-white/[0.06] rounded-md text-[9px] font-mono text-[#525252]">
            <MapPin className="w-3 h-3" /> 38 districts
          </span>
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: SIDE PANEL (25%) ─── */}
        <div className="w-80 flex-shrink-0 border-r border-white/[0.06] bg-[#050505] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] flex-shrink-0">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-mono font-bold transition-all border-b-2 ${
                    activeTab === t.id ? 'border-[#22D3EE] text-[#22D3EE] bg-[#22D3EE]/5' : 'border-transparent text-[#525252] hover:text-white'
                  }`}>
                  <Icon className="w-3 h-3" />{t.label}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* ── DISTRICTS TAB ── */}
            {activeTab === 'districts' && (
              <div className="flex flex-col h-full">
                {/* Controls */}
                <div className="p-3 border-b border-white/[0.06] space-y-2 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3 h-3 text-[#525252]" />
                    <input type="text" placeholder="Search districts..." value={districtSearch}
                      onChange={e => setDistrictSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 bg-[#111] border border-white/[0.08] rounded-lg text-[10px] text-white placeholder-[#404040] font-mono outline-none focus:border-white/20 transition-colors" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-[#404040] font-mono uppercase">Color by:</span>
                      <select value={colorBy} onChange={e => setColorBy(e.target.value)}
                        className="bg-[#111] border border-white/[0.08] rounded text-[9px] text-white font-mono px-1.5 py-0.5 outline-none cursor-pointer">
                        <option value="overall_score">Overall Score</option>
                        <option value="suitability_solar">Solar</option>
                        <option value="suitability_wind">Wind</option>
                        <option value="zone">Zone</option>
                      </select>
                    </div>
                    <button onClick={() => setShowDistricts(v => !v)}
                      className="p-1 rounded border border-white/[0.06] text-[#525252] hover:text-white transition-colors" title="Toggle markers">
                      {showDistricts ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* District list */}
                <div className="flex-1 overflow-y-auto">
                  {filteredDistricts.map(f => {
                    const p = f.properties;
                    const color = getMarkerColor(p);
                    const active = selectedDistrict?.properties.name === p.name;
                    return (
                      <button key={p.name} onClick={() => setSelectedDistrict(f)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-white/[0.04] text-left transition-all ${
                          active ? 'bg-white/[0.06] border-l-2 border-l-[#22D3EE]' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                        }`}>
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}60` }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-white font-medium truncate">{p.name}</p>
                          <p className="text-[9px] text-[#404040] font-mono">{p.zone} · Score: {p.overall_score}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-bold font-mono" style={{ color }}>{p.overall_score}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                  <p className="text-[8px] text-[#404040] font-mono uppercase tracking-wider mb-2">Suitability Scale</p>
                  <div className="flex gap-1.5">
                    {[
                      { label: '85+', color: '#22C55E', tag: 'Excellent' },
                      { label: '70+', color: '#84CC16', tag: 'Good' },
                      { label: '55+', color: '#EAB308', tag: 'Moderate' },
                      { label: '40+', color: '#F97316', tag: 'Low' },
                      { label: '<40', color: '#EF4444', tag: 'Poor' },
                    ].map(s => (
                      <div key={s.label} className="flex-1 text-center">
                        <div className="h-1.5 rounded-full mb-1" style={{ background: s.color }} />
                        <p className="text-[7px] text-[#525252] font-mono">{s.tag}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── WMS TAB ── */}
            {activeTab === 'wms' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/[0.06] space-y-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-white">NASA GIBS WMS</p>
                      <p className="text-[8px] text-[#404040] font-mono truncate">gibs.earthdata.nasa.gov</p>
                    </div>
                    <button onClick={loadWMSCapabilities} disabled={loadingWMS}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-black text-[9px] font-bold rounded-lg disabled:opacity-50 hover:bg-white/90 transition-colors">
                      {loadingWMS ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Discover
                    </button>
                  </div>
                  {wmsLayers.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3 h-3 text-[#525252]" />
                      <input type="text" placeholder="Filter layers..." value={wmsSearch}
                        onChange={e => setWmsSearch(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-[#111] border border-white/[0.08] rounded-lg text-[10px] text-white placeholder-[#404040] font-mono outline-none focus:border-white/20 transition-colors" />
                    </div>
                  )}
                  {wmsError && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg text-[9px] text-red-400 font-mono">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />{wmsError}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {wmsLayers.length === 0 && !loadingWMS && (
                    <div className="p-6 text-center text-[10px] text-[#404040] font-mono space-y-2">
                      <Globe className="w-6 h-6 mx-auto text-[#252525]" />
                      <p>Click "Discover" to fetch WMS GetCapabilities.</p>
                      <p className="text-[8px]">SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities</p>
                    </div>
                  )}
                  {loadingWMS && (
                    <div className="p-6 flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin" />
                      <p className="text-[9px] text-[#525252] font-mono">Parsing GetCapabilities XML...</p>
                    </div>
                  )}
                  {filteredWMS.map(l => (
                    <button key={l.name} onClick={() => setActiveWMSLayer(activeWMSLayer?.name === l.name ? null : l)}
                      className={`w-full flex items-start gap-2 px-3 py-2.5 border-b border-white/[0.04] text-left transition-all text-[10px] font-mono ${
                        activeWMSLayer?.name === l.name ? 'bg-[#22D3EE]/5 border-l-2 border-l-[#22D3EE]' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                      }`}>
                      {activeWMSLayer?.name === l.name
                        ? <CheckCircle2 className="w-3 h-3 text-[#22D3EE] flex-shrink-0 mt-0.5" />
                        : <div className="w-3 h-3 rounded-full border border-[#404040] flex-shrink-0 mt-0.5" />
                      }
                      <div className="min-w-0">
                        <p className={`truncate ${activeWMSLayer?.name === l.name ? 'text-[#22D3EE]' : 'text-[#737373]'}`}>{l.title}</p>
                        {l.abstract && <p className="text-[8px] text-[#404040] truncate mt-0.5">{l.abstract.substring(0, 80)}</p>}
                      </div>
                    </button>
                  ))}
                </div>

                {activeWMSLayer && (
                  <div className="p-3 border-t border-white/[0.06] space-y-2 flex-shrink-0">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[#525252]">Opacity</span>
                      <span className="text-[#22D3EE]">{Math.round(wmsOpacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.05" value={wmsOpacity}
                      onChange={e => setWmsOpacity(parseFloat(e.target.value))}
                      className="w-full accent-[#22D3EE] cursor-pointer" style={{ height: '3px' }} />
                    <p className="text-[8px] text-[#404040] font-mono truncate">Layer: {activeWMSLayer.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── WFS TAB ── */}
            {activeTab === 'wfs' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/[0.06] space-y-2 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-white">GeoServer WFS</p>
                      <p className="text-[8px] text-[#404040] font-mono truncate">ahocevar.com/geoserver</p>
                    </div>
                    <button onClick={loadWFSCapabilities} disabled={loadingWFS}
                      className="flex items-center gap-1 px-2.5 py-1.5 border border-white/15 text-white text-[9px] font-bold rounded-lg disabled:opacity-50 hover:bg-white/5 transition-colors">
                      {loadingWFS ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Discover
                    </button>
                  </div>
                  <div className="px-2 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-[8px] text-[#404040] font-mono">
                    BBOX Query: 76.2,7.9,80.6,13.5 (Tamil Nadu extent)
                  </div>
                  {wfsError && (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg text-[9px] text-red-400 font-mono">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />{wfsError}
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  {wfsLayers.length === 0 && !loadingWFS && (
                    <div className="p-6 text-center text-[10px] text-[#404040] font-mono space-y-2">
                      <Database className="w-6 h-6 mx-auto text-[#252525]" />
                      <p>Click "Discover" to fetch WFS GetCapabilities.</p>
                      <p className="text-[8px]">SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities</p>
                    </div>
                  )}
                  {loadingWFS && (
                    <div className="p-6 flex flex-col items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                      <p className="text-[9px] text-[#525252] font-mono">Parsing WFS capabilities...</p>
                    </div>
                  )}
                  {wfsLayers.map(l => (
                    <button key={l.name} onClick={() => loadWFSFeatures(l)}
                      className={`w-full flex items-start gap-2 px-3 py-2.5 border-b border-white/[0.04] text-left transition-all text-[10px] font-mono ${
                        activeWFSLayer?.name === l.name ? 'bg-white/[0.05] border-l-2 border-l-white' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                      }`}>
                      <div className="w-3 h-3 rounded-sm border border-current flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className={`truncate ${activeWFSLayer?.name === l.name ? 'text-white' : 'text-[#737373]'}`}>{l.title}</p>
                        {l.abstract && <p className="text-[8px] text-[#404040] truncate mt-0.5">{l.abstract.substring(0, 80)}</p>}
                      </div>
                    </button>
                  ))}
                </div>

                {loadingWFSData && (
                  <div className="p-3 border-t border-white/[0.06] flex items-center gap-2 text-[9px] text-[#525252] font-mono flex-shrink-0">
                    <div className="w-3.5 h-3.5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    Loading WFS features...
                  </div>
                )}
                {wfsData && !wfsData.error && !loadingWFSData && (
                  <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span className="text-[9px] text-[#22C55E] font-mono font-bold">{wfsData.features?.length || 0} features loaded via GetFeature</span>
                    </div>
                    <p className="text-[8px] text-[#404040] font-mono">Click features on the map to inspect attributes.</p>
                  </div>
                )}
                {wfsData?.error && (
                  <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                    <p className="text-[9px] text-red-400 font-mono">{wfsData.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTER: MAP (75%) ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative">
            <MapContainer center={[10.8, 78.6]} zoom={7} style={{ width: '100%', height: '100%' }} scrollWheelZoom zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <FitBounds bounds={tnBounds} />

              {/* WMS overlay */}
              {activeWMSLayer && (
                <WMSTileLayer
                  url={OGC_SERVICES.NASA_GIBS.url}
                  layers={activeWMSLayer.name}
                  format="image/png"
                  transparent={true}
                  version="1.3.0"
                  opacity={wmsOpacity}
                  attribution=""
                />
              )}

              {/* WFS GeoJSON overlay */}
              {wfsData && !wfsData.error && (
                <WFSGeoJSONLayer data={wfsData} onFeatureClick={setSelectedWFSFeature} />
              )}

              {/* Tamil Nadu district markers */}
              {showDistricts && tamilnaduDistricts.features.map(f => {
                const p = f.properties;
                const [lng, lat] = f.geometry.coordinates;
                const color = getMarkerColor(p);
                const isSelected = selectedDistrict?.properties.name === p.name;
                return (
                  <CircleMarker
                    key={p.name}
                    center={[lat, lng]}
                    radius={isSelected ? 10 : 7}
                    pathOptions={{
                      color: isSelected ? '#FFFFFF' : color,
                      weight: isSelected ? 2.5 : 1.5,
                      fillColor: color,
                      fillOpacity: isSelected ? 0.9 : 0.7,
                    }}
                    eventHandlers={{ click: () => setSelectedDistrict(f) }}
                  >
                    <Popup>
                      <div className="min-w-[220px] text-[11px]">
                        <div className="border-b border-white/10 pb-2 mb-2">
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-[9px] text-[#525252] font-mono">{p.zone} · {p.terrain}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                          <div className="bg-[#111] rounded p-1.5 border border-white/[0.06]">
                            <span className="text-[#404040] block">Overall</span>
                            <span className="font-bold" style={{ color: getSuitabilityColor(p.overall_score) }}>{p.overall_score}/100</span>
                          </div>
                          <div className="bg-[#111] rounded p-1.5 border border-white/[0.06]">
                            <span className="text-[#404040] block">Solar</span>
                            <span className="font-bold text-[#EAB308]">{p.suitability_solar}/100</span>
                          </div>
                          <div className="bg-[#111] rounded p-1.5 border border-white/[0.06]">
                            <span className="text-[#404040] block">Wind</span>
                            <span className="font-bold text-[#22D3EE]">{p.suitability_wind}/100</span>
                          </div>
                          <div className="bg-[#111] rounded p-1.5 border border-white/[0.06]">
                            <span className="text-[#404040] block">Grid</span>
                            <span className="font-bold text-white">{p.grid_proximity_km} km</span>
                          </div>
                        </div>
                        <div className="mt-2 space-y-0.5 font-mono text-[9px]">
                          <div className="flex justify-between"><span className="text-[#525252]">Solar Irradiance:</span><span className="text-white">{p.solar_irradiance_kwh} kWh/m²/day</span></div>
                          <div className="flex justify-between"><span className="text-[#525252]">Wind Density:</span><span className="text-white">{p.wind_density_wm2} W/m²</span></div>
                          <div className="flex justify-between"><span className="text-[#525252]">Area:</span><span className="text-white">{p.area_sqkm.toLocaleString()} km²</span></div>
                          <div className="flex justify-between"><span className="text-[#525252]">Land Use:</span><span className="text-white">{p.land_use}</span></div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Map overlay: Active layers badge */}
            <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
              {activeWMSLayer && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0A0A0A]/95 border border-[#22D3EE]/25 rounded-lg text-[9px] font-mono text-[#22D3EE]">
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[160px]">{activeWMSLayer.title}</span>
                  <button onClick={() => setActiveWMSLayer(null)} className="p-0.5 hover:text-white"><X className="w-3 h-3" /></button>
                </div>
              )}
              {wfsData?.features?.length > 0 && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0A0A0A]/95 border border-white/15 rounded-lg text-[9px] font-mono text-white">
                  <Database className="w-3 h-3" />
                  <span>{wfsData.features.length} WFS features</span>
                  <button onClick={() => { setWfsData(null); setActiveWFSLayer(null); }} className="p-0.5 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>

          {/* ─── Selected district detail bar ─── */}
          {selectedDistrict && (
            <div className="h-40 border-t border-white/[0.06] bg-[#050505] px-5 py-3 flex gap-6 overflow-x-auto flex-shrink-0">
              <div className="flex items-start gap-3 flex-shrink-0 w-52">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${getSuitabilityColor(selectedDistrict.properties.overall_score)}15`, border: `1px solid ${getSuitabilityColor(selectedDistrict.properties.overall_score)}40` }}>
                  <MapPin className="w-4 h-4" style={{ color: getSuitabilityColor(selectedDistrict.properties.overall_score) }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedDistrict.properties.name}</p>
                  <p className="text-[9px] text-[#525252] font-mono">{selectedDistrict.properties.zone}</p>
                  <p className="text-[9px] text-[#404040] font-mono mt-1">{selectedDistrict.properties.terrain} · {selectedDistrict.properties.land_use}</p>
                  <p className="text-[9px] text-[#404040] font-mono">{selectedDistrict.properties.area_sqkm.toLocaleString()} km² · Pop: {selectedDistrict.properties.population?.toLocaleString()}</p>
                </div>
              </div>
              {/* Score cards */}
              {[
                { label: 'Overall Score', value: selectedDistrict.properties.overall_score, color: getSuitabilityColor(selectedDistrict.properties.overall_score), icon: Zap, tag: getSuitabilityLabel(selectedDistrict.properties.overall_score) },
                { label: 'Solar Potential', value: selectedDistrict.properties.suitability_solar, color: '#EAB308', icon: Sun, tag: `${selectedDistrict.properties.solar_irradiance_kwh} kWh/m²/day` },
                { label: 'Wind Potential', value: selectedDistrict.properties.suitability_wind, color: '#22D3EE', icon: Wind, tag: `${selectedDistrict.properties.wind_density_wm2} W/m²` },
                { label: 'Grid Access', value: null, color: '#FFFFFF', icon: Crosshair, tag: `${selectedDistrict.properties.grid_proximity_km} km to grid` },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex-shrink-0 w-36 bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3" style={{ color: c.color }} />
                      <span className="text-[8px] text-[#404040] font-mono uppercase tracking-wider">{c.label}</span>
                    </div>
                    {c.value !== null ? (
                      <>
                        <p className="text-2xl font-bold font-display" style={{ color: c.color }}>{c.value}</p>
                        <div className="mt-1">
                          <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${c.value}%`, background: c.color }} />
                          </div>
                          <p className="text-[8px] text-[#525252] font-mono mt-1">{c.tag}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-bold text-white font-mono">{c.tag.split(' ')[0]}</p>
                        <p className="text-[8px] text-[#525252] font-mono">{c.tag}</p>
                      </>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setSelectedDistrict(null)}
                className="absolute right-5 top-auto p-1.5 rounded-lg border border-white/10 text-[#525252] hover:text-white hover:border-white/25 transition-all self-start flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─── Selected WFS feature ─── */}
          {selectedWFSFeature && !selectedDistrict && (
            <div className="h-32 border-t border-white/[0.06] bg-[#050505] px-5 py-3 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#22D3EE]" />
                  <span className="text-sm font-bold text-white">WFS Feature Attributes</span>
                  <span className="text-[9px] font-mono text-[#525252] bg-[#111] px-1.5 py-0.5 rounded">{selectedWFSFeature.geometry?.type}</span>
                </div>
                <button onClick={() => setSelectedWFSFeature(null)}
                  className="p-1 rounded border border-white/10 text-[#525252] hover:text-white transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto">
                {Object.entries(selectedWFSFeature.properties || {}).slice(0, 8).map(([k, v]) => (
                  <div key={k} className="flex-shrink-0 bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 min-w-[100px]">
                    <p className="text-[8px] text-[#404040] font-mono uppercase truncate">{k}</p>
                    <p className="text-[11px] text-white font-mono font-semibold truncate mt-0.5">{String(v ?? '—')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Request Inspector ─── */}
          <div className="flex-shrink-0">
            <RequestInspector defaultOpen={inspectorOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}
