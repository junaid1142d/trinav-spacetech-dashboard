import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers, RefreshCw, AlertCircle, CheckCircle2, Globe, Database,
  MapPin, Zap, Wind, Sun, X, Search, Eye, EyeOff, Crosshair,
  Info, BookOpen, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, CircleMarker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import RequestInspector from '../components/RequestInspector';
import { OGC_SERVICES, wmsGetCapabilities, wfsGetCapabilities, wfsGetFeature } from '../services/api';
import tamilnaduDistricts, { ZONE_COLORS, getSuitabilityColor, getSuitabilityLabel } from '../data/tamilnaduDistricts';
import { CURATED_WMS_LAYERS, CURATED_WFS_LAYERS, DATA_SOURCES, OGC_SERVICES_CONFIG } from '../data/curatedOGCLayers';

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
  const style = (feature) => {
    const geomType = feature.geometry?.type || '';
    if (geomType.includes('Point')) return { color: '#22D3EE', weight: 0, fillColor: '#22D3EE', fillOpacity: 0.8 };
    if (geomType.includes('Line')) return { color: '#22D3EE', weight: 2, opacity: 0.8 };
    return { color: '#22D3EE', weight: 1.5, opacity: 0.7, fillColor: '#22D3EE', fillOpacity: 0.1 };
  };
  const pointToLayer = (feature, latlng) => L.circleMarker(latlng, { radius: 5, ...style(feature) });
  const onEachFeature = (feature, layer) => {
    layer.on({
      click: () => onFeatureClick(feature),
      mouseover: (e) => { try { e.target.setStyle({ fillOpacity: 0.4, weight: 3 }); } catch {} },
      mouseout: (e) => { try { e.target.setStyle(style(feature)); } catch {} },
    });
  };
  return <GeoJSON key={Date.now()} data={data} style={style} pointToLayer={pointToLayer} onEachFeature={onEachFeature} />;
}

// ─── Tabs ──────────────────────────────────────────
const TABS = [
  { id: 'districts', label: 'TN Districts', icon: MapPin },
  { id: 'wms', label: 'WMS Layers', icon: Globe },
  { id: 'wfs', label: 'WFS Data', icon: Database },
  { id: 'sources', label: 'Data Sources', icon: BookOpen },
];

// ─── MAIN COMPONENT ────────────────────────────────
export default function OGCViewerPage() {
  const [activeTab, setActiveTab] = useState('districts');
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistricts, setShowDistricts] = useState(true);
  const [colorBy, setColorBy] = useState('overall_score');

  // WMS
  const [activeWMSLayer, setActiveWMSLayer] = useState(null);
  const [wmsOpacity, setWmsOpacity] = useState(0.7);
  const [showAllWMS, setShowAllWMS] = useState(false);
  const [allWmsLayers, setAllWmsLayers] = useState([]);
  const [loadingAllWMS, setLoadingAllWMS] = useState(false);
  const [wmsError, setWmsError] = useState(null);

  // WFS
  const [activeWFSLayer, setActiveWFSLayer] = useState(null);
  const [wfsData, setWfsData] = useState(null);
  const [loadingWFSData, setLoadingWFSData] = useState(false);
  const [selectedWFSFeature, setSelectedWFSFeature] = useState(null);
  const [wfsError, setWfsError] = useState(null);

  const abortRef = useRef(null);
  const tnBounds = [[7.9, 76.2], [13.5, 80.6]];

  // Filtered districts
  const filteredDistricts = useMemo(() => {
    const s = districtSearch.toLowerCase();
    return tamilnaduDistricts.features.filter(f =>
      !s || f.properties.name.toLowerCase().includes(s) || f.properties.zone.toLowerCase().includes(s)
    );
  }, [districtSearch]);

  const getMarkerColor = (props) => {
    if (colorBy === 'overall_score') return getSuitabilityColor(props.overall_score);
    if (colorBy === 'suitability_solar') return getSuitabilityColor(props.suitability_solar);
    if (colorBy === 'suitability_wind') return getSuitabilityColor(props.suitability_wind);
    if (colorBy === 'zone') return ZONE_COLORS[props.zone] || '#737373';
    return '#FFFFFF';
  };

  // WMS: Discover all layers
  const discoverAllWMS = async () => {
    setLoadingAllWMS(true); setWmsError(null);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const layers = await wmsGetCapabilities(OGC_SERVICES_CONFIG.WMS.url, abortRef.current.signal);
      setAllWmsLayers(layers);
      setShowAllWMS(true);
    } catch (e) {
      if (e.name !== 'AbortError') setWmsError(e.message);
    } finally { setLoadingAllWMS(false); }
  };

  // WFS: Load features for a curated layer
  const loadCuratedWFS = async (layer) => {
    setActiveWFSLayer(layer); setLoadingWFSData(true); setWfsData(null); setSelectedWFSFeature(null); setWfsError(null);
    try {
      const data = await wfsGetFeature(OGC_SERVICES_CONFIG.WFS.url, layer.name, layer.defaultBBOX, null, layer.maxFeatures);
      if (!data?.features?.length) {
        setWfsData({ features: [], note: 'No features found in this bounding box.' });
      } else {
        setWfsData(data);
      }
    } catch (e) {
      setWfsError(e.message);
      setWfsData(null);
    } finally { setLoadingWFSData(false); }
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  const activateWMSFromCurated = (layer) => {
    if (activeWMSLayer?.name === layer.name) {
      setActiveWMSLayer(null);
    } else {
      setActiveWMSLayer({ ...layer, serviceUrl: OGC_SERVICES_CONFIG.WMS.url, type: 'WMS' });
    }
  };

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
            <p className="text-[8px] text-[#404040] font-mono uppercase tracking-widest">Renewable Energy Land Suitability Assessment · Tamil Nadu · 38 Districts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeWMSLayer && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-[#22D3EE]/10 border border-[#22D3EE]/25 rounded-md text-[9px] font-mono text-[#22D3EE]">
              <Globe className="w-3 h-3" />WMS: {activeWMSLayer.title?.substring(0, 20)}
              <button onClick={() => setActiveWMSLayer(null)} className="hover:text-white"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
          {wfsData?.features?.length > 0 && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/15 rounded-md text-[9px] font-mono text-white">
              <Database className="w-3 h-3" />{wfsData.features.length} WFS features
              <button onClick={() => { setWfsData(null); setActiveWFSLayer(null); }} className="hover:text-red-400"><X className="w-2.5 h-2.5" /></button>
            </span>
          )}
        </div>
      </div>

      {/* Main workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* ─── LEFT: SIDE PANEL ─── */}
        <div className="w-80 flex-shrink-0 border-r border-white/[0.06] bg-[#050505] flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] flex-shrink-0">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2.5 text-[9px] font-mono font-bold transition-all border-b-2 ${
                    activeTab === t.id ? 'border-[#22D3EE] text-[#22D3EE] bg-[#22D3EE]/5' : 'border-transparent text-[#525252] hover:text-white'
                  }`}>
                  <Icon className="w-3 h-3" />{t.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ── DISTRICTS TAB ── */}
            {activeTab === 'districts' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/[0.06] space-y-2 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3 h-3 text-[#525252]" />
                    <input type="text" placeholder="Search districts or zones..." value={districtSearch}
                      onChange={e => setDistrictSearch(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 bg-[#111] border border-white/[0.08] rounded-lg text-[10px] text-white placeholder-[#404040] font-mono outline-none focus:border-white/20" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-[#404040] font-mono uppercase">Color:</span>
                      <select value={colorBy} onChange={e => setColorBy(e.target.value)}
                        className="bg-[#111] border border-white/[0.08] rounded text-[9px] text-white font-mono px-1.5 py-0.5 outline-none cursor-pointer">
                        <option value="overall_score">Overall</option>
                        <option value="suitability_solar">Solar</option>
                        <option value="suitability_wind">Wind</option>
                        <option value="zone">Zone</option>
                      </select>
                    </div>
                    <button onClick={() => setShowDistricts(v => !v)}
                      className="p-1 rounded border border-white/[0.06] text-[#525252] hover:text-white transition-colors">
                      {showDistricts ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
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
                          <p className="text-[9px] text-[#404040] font-mono">{p.zone} · {p.terrain}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] font-bold font-mono" style={{ color }}>{p.overall_score}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                  <p className="text-[8px] text-[#404040] font-mono uppercase tracking-wider mb-2">Suitability Scale</p>
                  <div className="flex gap-1.5">
                    {[{ l: '85+', c: '#22C55E', t: 'Excellent' }, { l: '70+', c: '#84CC16', t: 'Good' }, { l: '55+', c: '#EAB308', t: 'Moderate' }, { l: '40+', c: '#F97316', t: 'Low' }, { l: '<40', c: '#EF4444', t: 'Poor' }].map(s => (
                      <div key={s.l} className="flex-1 text-center">
                        <div className="h-1.5 rounded-full mb-1" style={{ background: s.c }} />
                        <p className="text-[7px] text-[#525252] font-mono">{s.t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── WMS TAB ── */}
            {activeTab === 'wms' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/[0.06] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white">{OGC_SERVICES_CONFIG.WMS.name}</p>
                      <p className="text-[8px] text-[#404040] font-mono truncate">WMS {OGC_SERVICES_CONFIG.WMS.version} · {OGC_SERVICES_CONFIG.WMS.crs}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-[#525252] leading-relaxed mb-2">
                    Curated satellite layers relevant to solar irradiance, wind resource, terrain, and land cover assessment.
                  </p>
                </div>

                {/* Curated layers */}
                <div className="flex-1 overflow-y-auto">
                  <div className="px-3 py-2 text-[8px] text-[#404040] font-mono uppercase tracking-wider bg-[#080808] border-b border-white/[0.04]">
                    Recommended for Energy Assessment ({CURATED_WMS_LAYERS.length} layers)
                  </div>
                  {CURATED_WMS_LAYERS.map(l => {
                    const isActive = activeWMSLayer?.name === l.name;
                    return (
                      <button key={l.name} onClick={() => activateWMSFromCurated(l)}
                        className={`w-full text-left px-3 py-3 border-b border-white/[0.04] transition-all ${
                          isActive ? 'bg-[#22D3EE]/5 border-l-2 border-l-[#22D3EE]' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                        }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-sm flex-shrink-0 mt-0.5">{l.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-[10px] font-semibold truncate ${isActive ? 'text-[#22D3EE]' : 'text-white'}`}>{l.title}</p>
                              {isActive && <CheckCircle2 className="w-3 h-3 text-[#22D3EE] flex-shrink-0" />}
                            </div>
                            <p className="text-[8px] text-[#22D3EE]/60 font-mono">{l.category}</p>
                            <p className="text-[8px] text-[#404040] mt-1 leading-relaxed">{l.relevance}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Discover All */}
                  <div className="p-3 border-t border-white/[0.06]">
                    <button onClick={discoverAllWMS} disabled={loadingAllWMS}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-white/10 text-[#737373] text-[9px] font-mono rounded-lg hover:bg-white/[0.03] hover:text-white disabled:opacity-50 transition-all">
                      {loadingAllWMS ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                      Discover All via GetCapabilities ({allWmsLayers.length || '...'})
                    </button>
                    {wmsError && <p className="text-[9px] text-red-400 font-mono mt-2"><AlertCircle className="w-3 h-3 inline mr-1" />{wmsError}</p>}
                  </div>

                  {showAllWMS && allWmsLayers.length > 0 && (
                    <>
                      <div className="px-3 py-2 text-[8px] text-[#404040] font-mono uppercase tracking-wider bg-[#080808] border-b border-white/[0.04] flex items-center justify-between">
                        <span>All Available Layers ({allWmsLayers.length})</span>
                        <button onClick={() => setShowAllWMS(false)} className="text-[#525252] hover:text-white"><X className="w-3 h-3" /></button>
                      </div>
                      {allWmsLayers.slice(0, 40).map(l => (
                        <button key={l.name} onClick={() => setActiveWMSLayer(activeWMSLayer?.name === l.name ? null : l)}
                          className={`w-full text-left px-3 py-2 border-b border-white/[0.04] transition-all text-[9px] font-mono ${
                            activeWMSLayer?.name === l.name ? 'bg-[#22D3EE]/5 text-[#22D3EE]' : 'text-[#525252] hover:bg-white/[0.02] hover:text-white'
                          }`}>
                          <p className="truncate">{l.title}</p>
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {activeWMSLayer && (
                  <div className="p-3 border-t border-white/[0.06] space-y-2 flex-shrink-0">
                    <div className="flex items-center justify-between text-[9px] font-mono">
                      <span className="text-[#525252]">Opacity</span>
                      <span className="text-[#22D3EE]">{Math.round(wmsOpacity * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.05" value={wmsOpacity}
                      onChange={e => setWmsOpacity(parseFloat(e.target.value))} className="w-full accent-[#22D3EE] cursor-pointer" />
                    <p className="text-[8px] text-[#404040] font-mono">REQUEST=GetMap&LAYERS={activeWMSLayer.name}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── WFS TAB ── */}
            {activeTab === 'wfs' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/[0.06] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-3.5 h-3.5 text-white" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white">{OGC_SERVICES_CONFIG.WFS.name}</p>
                      <p className="text-[8px] text-[#404040] font-mono truncate">WFS {OGC_SERVICES_CONFIG.WFS.version} · {OGC_SERVICES_CONFIG.WFS.crs}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-[#525252] leading-relaxed mb-2">
                    Vector datasets for geographic context. Each layer is queried with a Tamil Nadu BBOX filter via GetFeature.
                  </p>
                  <div className="px-2 py-1.5 bg-[#111] border border-white/[0.06] rounded-lg text-[8px] text-[#404040] font-mono">
                    BBOX: 76.2°E, 7.9°N → 80.6°E, 13.5°N (Tamil Nadu)
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="px-3 py-2 text-[8px] text-[#404040] font-mono uppercase tracking-wider bg-[#080808] border-b border-white/[0.04]">
                    Project-Relevant Layers ({CURATED_WFS_LAYERS.length})
                  </div>
                  {CURATED_WFS_LAYERS.map(l => {
                    const isActive = activeWFSLayer?.name === l.name;
                    const isLoading = loadingWFSData && isActive;
                    return (
                      <button key={l.name} onClick={() => !isLoading && loadCuratedWFS(l)}
                        disabled={isLoading}
                        className={`w-full text-left px-3 py-3 border-b border-white/[0.04] transition-all ${
                          isActive ? 'bg-white/[0.05] border-l-2 border-l-white' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'
                        }`}>
                        <div className="flex items-start gap-2">
                          <span className="text-sm flex-shrink-0 mt-0.5">{l.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <p className={`text-[10px] font-semibold truncate ${isActive ? 'text-white' : 'text-[#737373]'}`}>{l.title}</p>
                              {isLoading && <RefreshCw className="w-3 h-3 text-white animate-spin flex-shrink-0" />}
                              {isActive && !isLoading && wfsData?.features?.length > 0 && <CheckCircle2 className="w-3 h-3 text-[#22C55E] flex-shrink-0" />}
                            </div>
                            <p className="text-[8px] text-white/40 font-mono">{l.category} · {l.name}</p>
                            <p className="text-[8px] text-[#404040] mt-1 leading-relaxed">{l.relevance}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {wfsError && (
                  <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-1.5 px-2 py-1.5 bg-red-950/20 border border-red-500/20 rounded-lg text-[9px] text-red-400 font-mono">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />{wfsError}
                    </div>
                  </div>
                )}
                {wfsData?.features?.length > 0 && (
                  <div className="p-3 border-t border-white/[0.06] flex-shrink-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span className="text-[9px] text-[#22C55E] font-mono font-bold">{wfsData.features.length} features loaded</span>
                    </div>
                    <p className="text-[8px] text-[#404040] font-mono">Click any feature on the map to inspect its attributes.</p>
                    <p className="text-[7px] text-[#303030] font-mono mt-1">REQUEST=GetFeature&TYPENAMES={activeWFSLayer?.name}&OUTPUTFORMAT=application/json</p>
                  </div>
                )}
              </div>
            )}

            {/* ── DATA SOURCES TAB ── */}
            {activeTab === 'sources' && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-white/[0.06] flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#22D3EE]" />
                    <p className="text-[10px] font-bold text-white">Data Sources & Methodology</p>
                  </div>
                  <p className="text-[9px] text-[#525252] mt-1.5 leading-relaxed">
                    All district-level renewable energy suitability scores are derived from authoritative geospatial datasets.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {DATA_SOURCES.map(ds => (
                    <div key={ds.metric} className="px-3 py-3 border-b border-white/[0.04]">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-semibold text-white">{ds.metric}</p>
                        {ds.url && (
                          <a href={ds.url} target="_blank" rel="noopener noreferrer"
                            className="text-[#22D3EE] hover:text-white transition-colors">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[9px] text-[#22D3EE] font-mono">{ds.source}</p>
                      <p className="text-[8px] text-[#404040] mt-1 leading-relaxed">{ds.method}</p>
                    </div>
                  ))}

                  {/* OGC Endpoints */}
                  <div className="px-3 py-2 text-[8px] text-[#404040] font-mono uppercase tracking-wider bg-[#080808] border-b border-white/[0.04]">
                    OGC Service Endpoints
                  </div>
                  {[OGC_SERVICES_CONFIG.WMS, OGC_SERVICES_CONFIG.WFS].map(svc => (
                    <div key={svc.name} className="px-3 py-3 border-b border-white/[0.04]">
                      <p className="text-[10px] font-semibold text-white">{svc.name}</p>
                      <p className="text-[8px] text-[#22D3EE] font-mono mt-0.5 break-all">{svc.url}</p>
                      <p className="text-[8px] text-[#404040] mt-1">Version {svc.version} · {svc.crs}</p>
                      <p className="text-[8px] text-[#404040]">{svc.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTER: MAP ─── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 relative">
            <MapContainer center={[10.8, 78.6]} zoom={7} style={{ width: '100%', height: '100%' }} scrollWheelZoom zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <FitBounds bounds={tnBounds} />

              {activeWMSLayer && (
                <WMSTileLayer
                  url={OGC_SERVICES_CONFIG.WMS.url}
                  layers={activeWMSLayer.name}
                  format="image/png"
                  transparent={true}
                  version="1.3.0"
                  opacity={wmsOpacity}
                />
              )}

              {wfsData && !wfsData.error && wfsData.features?.length > 0 && (
                <WFSGeoJSONLayer data={wfsData} onFeatureClick={setSelectedWFSFeature} />
              )}

              {showDistricts && tamilnaduDistricts.features.map(f => {
                const p = f.properties;
                const [lng, lat] = f.geometry.coordinates;
                const color = getMarkerColor(p);
                const isSelected = selectedDistrict?.properties.name === p.name;
                return (
                  <CircleMarker key={p.name} center={[lat, lng]} radius={isSelected ? 10 : 7}
                    pathOptions={{ color: isSelected ? '#FFF' : color, weight: isSelected ? 2.5 : 1.5, fillColor: color, fillOpacity: isSelected ? 0.9 : 0.7 }}
                    eventHandlers={{ click: () => setSelectedDistrict(f) }}>
                    <Popup>
                      <div className="min-w-[220px] text-[11px]">
                        <div className="border-b border-white/10 pb-2 mb-2">
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-[9px] text-[#525252] font-mono">{p.zone} · {p.terrain}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                          {[
                            ['Overall', p.overall_score, getSuitabilityColor(p.overall_score)],
                            ['Solar', p.suitability_solar, '#EAB308'],
                            ['Wind', p.suitability_wind, '#22D3EE'],
                            ['Grid', `${p.grid_proximity_km}km`, '#FFF'],
                          ].map(([lbl, val, clr]) => (
                            <div key={lbl} className="bg-[#111] rounded p-1.5 border border-white/[0.06]">
                              <span className="text-[#404040] block">{lbl}</span>
                              <span className="font-bold" style={{ color: clr }}>{typeof val === 'number' ? `${val}/100` : val}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 space-y-0.5 font-mono text-[9px]">
                          <div className="flex justify-between"><span className="text-[#525252]">Irradiance:</span><span className="text-white">{p.solar_irradiance_kwh} kWh/m²/d</span></div>
                          <div className="flex justify-between"><span className="text-[#525252]">Wind:</span><span className="text-white">{p.wind_density_wm2} W/m²</span></div>
                          <div className="flex justify-between"><span className="text-[#525252]">Area:</span><span className="text-white">{p.area_sqkm.toLocaleString()} km²</span></div>
                          <div className="flex justify-between"><span className="text-[#525252]">Land Use:</span><span className="text-white">{p.land_use}</span></div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>

            {/* Active layer badges */}
            <div className="absolute top-3 right-3 z-[500] flex flex-col gap-2">
              {activeWMSLayer && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0A0A0A]/95 border border-[#22D3EE]/25 rounded-lg text-[9px] font-mono text-[#22D3EE] backdrop-blur-sm">
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">{activeWMSLayer.title}</span>
                  <button onClick={() => setActiveWMSLayer(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                </div>
              )}
              {wfsData?.features?.length > 0 && (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#0A0A0A]/95 border border-white/15 rounded-lg text-[9px] font-mono text-white backdrop-blur-sm">
                  <Database className="w-3 h-3" />
                  <span>{activeWFSLayer?.title} ({wfsData.features.length})</span>
                  <button onClick={() => { setWfsData(null); setActiveWFSLayer(null); }} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
              )}
            </div>
          </div>

          {/* District detail bar */}
          {selectedDistrict && (
            <div className="h-40 border-t border-white/[0.06] bg-[#050505] px-5 py-3 flex gap-5 overflow-x-auto flex-shrink-0 relative">
              <div className="flex items-start gap-3 flex-shrink-0 w-48">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${getSuitabilityColor(selectedDistrict.properties.overall_score)}15`, border: `1px solid ${getSuitabilityColor(selectedDistrict.properties.overall_score)}40` }}>
                  <MapPin className="w-4 h-4" style={{ color: getSuitabilityColor(selectedDistrict.properties.overall_score) }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedDistrict.properties.name}</p>
                  <p className="text-[9px] text-[#525252] font-mono">{selectedDistrict.properties.zone}</p>
                  <p className="text-[9px] text-[#404040] font-mono mt-1">{selectedDistrict.properties.terrain} · {selectedDistrict.properties.land_use}</p>
                  <p className="text-[9px] text-[#404040] font-mono">{selectedDistrict.properties.area_sqkm.toLocaleString()} km²</p>
                </div>
              </div>
              {[
                { label: 'Overall', value: selectedDistrict.properties.overall_score, color: getSuitabilityColor(selectedDistrict.properties.overall_score), icon: Zap, sub: getSuitabilityLabel(selectedDistrict.properties.overall_score) },
                { label: 'Solar', value: selectedDistrict.properties.suitability_solar, color: '#EAB308', icon: Sun, sub: `${selectedDistrict.properties.solar_irradiance_kwh} kWh/m²/d` },
                { label: 'Wind', value: selectedDistrict.properties.suitability_wind, color: '#22D3EE', icon: Wind, sub: `${selectedDistrict.properties.wind_density_wm2} W/m²` },
                { label: 'Grid', value: null, color: '#FFF', icon: Crosshair, sub: `${selectedDistrict.properties.grid_proximity_km} km` },
              ].map(c => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="flex-shrink-0 w-32 bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3 flex flex-col justify-between">
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ color: c.color }} />
                      <span className="text-[8px] text-[#404040] font-mono uppercase">{c.label}</span>
                    </div>
                    {c.value !== null ? (
                      <>
                        <p className="text-2xl font-bold font-display" style={{ color: c.color }}>{c.value}</p>
                        <div>
                          <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                          </div>
                          <p className="text-[8px] text-[#525252] font-mono mt-1">{c.sub}</p>
                        </div>
                      </>
                    ) : (
                      <><p className="text-lg font-bold text-white font-mono">{c.sub}</p><p className="text-[8px] text-[#525252] font-mono">to grid</p></>
                    )}
                  </div>
                );
              })}
              <button onClick={() => setSelectedDistrict(null)}
                className="absolute right-4 top-3 p-1.5 rounded-lg border border-white/10 text-[#525252] hover:text-white transition-all">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* WFS Feature detail */}
          {selectedWFSFeature && !selectedDistrict && (
            <div className="h-28 border-t border-white/[0.06] bg-[#050505] px-5 py-3 flex-shrink-0 relative">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-[#22D3EE]" />
                <span className="text-sm font-bold text-white">WFS Feature Attributes</span>
                <span className="text-[9px] font-mono text-[#525252] bg-[#111] px-1.5 py-0.5 rounded">{selectedWFSFeature.geometry?.type}</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto">
                {Object.entries(selectedWFSFeature.properties || {}).filter(([,v]) => v != null).slice(0, 10).map(([k, v]) => (
                  <div key={k} className="flex-shrink-0 bg-[#0A0A0A] border border-white/[0.06] rounded-lg px-3 py-2 min-w-[90px]">
                    <p className="text-[7px] text-[#404040] font-mono uppercase truncate">{k}</p>
                    <p className="text-[10px] text-white font-mono font-semibold truncate mt-0.5">{String(v)}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedWFSFeature(null)}
                className="absolute right-4 top-3 p-1 rounded border border-white/10 text-[#525252] hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Request Inspector */}
          <div className="flex-shrink-0"><RequestInspector /></div>
        </div>
      </div>
    </div>
  );
}
