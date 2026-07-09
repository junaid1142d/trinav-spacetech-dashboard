import React, { useState, useEffect, useRef } from 'react';
import { Layers, RefreshCw, AlertCircle, CheckCircle2, Globe, Database } from 'lucide-react';
import { MapContainer, TileLayer, WMSTileLayer, useMap } from 'react-leaflet';
import RequestInspector from '../components/RequestInspector';
import { OGC_SERVICES, wmsGetCapabilities, wfsGetCapabilities, wfsGetFeature } from '../services/api';

function WMSLayer({ url, layer, opacity }) {
  return (
    <WMSTileLayer
      url={url}
      layers={layer}
      format="image/png"
      transparent={true}
      version="1.3.0"
      opacity={opacity}
      attribution=""
    />
  );
}

export default function OGCViewerPage() {
  const [wmsLayers, setWmsLayers] = useState([]);
  const [wfsLayers, setWfsLayers] = useState([]);
  const [loadingWMS, setLoadingWMS] = useState(false);
  const [loadingWFS, setLoadingWFS] = useState(false);
  const [wmsError, setWmsError] = useState(null);
  const [wfsError, setWfsError] = useState(null);
  const [activeWMSLayer, setActiveWMSLayer] = useState(null);
  const [wmsOpacity, setWmsOpacity] = useState(0.8);
  const [activeWFSLayer, setActiveWFSLayer] = useState(null);
  const [wfsData, setWfsData] = useState(null);
  const [loadingWFSData, setLoadingWFSData] = useState(false);
  const abortRef = useRef(null);

  const loadWMSCapabilities = async () => {
    setLoadingWMS(true); setWmsError(null); setWmsLayers([]);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const layers = await wmsGetCapabilities(OGC_SERVICES.NASA_GIBS.url, abortRef.current.signal);
      setWmsLayers(layers.slice(0, 40));
    } catch (e) {
      if (e.name !== 'AbortError') setWmsError(e.message);
    } finally {
      setLoadingWMS(false);
    }
  };

  const loadWFSCapabilities = async () => {
    setLoadingWFS(true); setWfsError(null); setWfsLayers([]);
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    try {
      const layers = await wfsGetCapabilities(OGC_SERVICES.GEOSERVER.url, abortRef.current.signal);
      setWfsLayers(layers.slice(0, 30));
    } catch (e) {
      if (e.name !== 'AbortError') setWfsError(e.message);
    } finally {
      setLoadingWFS(false);
    }
  };

  const loadWFSFeatures = async (layer) => {
    setActiveWFSLayer(layer); setLoadingWFSData(true); setWfsData(null);
    try {
      const data = await wfsGetFeature(OGC_SERVICES.GEOSERVER.url, layer.name, null, null, 50);
      setWfsData(data);
    } catch (e) {
      setWfsData({ error: e.message });
    } finally {
      setLoadingWFSData(false);
    }
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">OGC Integration</p>
          <h2 className="text-xl font-bold text-white font-display">OGC Services Viewer</h2>
        </div>
        <Layers className="w-5 h-5 text-[#22D3EE]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* WMS Panel */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#22D3EE]" />
              <div>
                <p className="text-sm font-semibold text-white">NASA GIBS WMS</p>
                <p className="text-[9px] text-[#525252] font-mono truncate max-w-[200px]">{OGC_SERVICES.NASA_GIBS.url}</p>
              </div>
            </div>
            <button onClick={loadWMSCapabilities} disabled={loadingWMS}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-[10px] font-bold rounded-lg disabled:opacity-50 hover:bg-white/90 transition-colors">
              {loadingWMS ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              GetCapabilities
            </button>
          </div>

          {wmsError && (
            <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/20 rounded-lg text-[10px] text-red-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{wmsError}
            </div>
          )}

          <div className="p-4">
            {wmsLayers.length === 0 && !loadingWMS ? (
              <p className="text-[10px] text-[#525252] font-mono text-center py-6">Click GetCapabilities to discover available layers.</p>
            ) : loadingWMS ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <div className="w-6 h-6 border-2 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin" />
                <p className="text-[10px] text-[#525252] font-mono">Fetching WMS capabilities...</p>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {wmsLayers.map(l => (
                  <button key={l.name} onClick={() => setActiveWMSLayer(activeWMSLayer?.name === l.name ? null : l)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-[10px] font-mono ${
                      activeWMSLayer?.name === l.name ? 'bg-[#22D3EE]/10 border border-[#22D3EE]/30 text-[#22D3EE]' : 'hover:bg-white/[0.03] text-[#737373] border border-transparent'
                    }`}>
                    {activeWMSLayer?.name === l.name ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> : <div className="w-3 h-3 rounded-full border border-current flex-shrink-0" />}
                    <span className="truncate">{l.title}</span>
                  </button>
                ))}
              </div>
            )}

            {activeWMSLayer && (
              <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#525252]">Active: <span className="text-[#22D3EE]">{activeWMSLayer.title}</span></span>
                  <span className="text-[#525252]">Opacity: {Math.round(wmsOpacity * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="1" step="0.05" value={wmsOpacity}
                  onChange={e => setWmsOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#22D3EE] cursor-pointer" style={{ height: '3px' }} />
              </div>
            )}
          </div>
        </div>

        {/* WFS Panel */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-white" />
              <div>
                <p className="text-sm font-semibold text-white">GeoServer WFS</p>
                <p className="text-[9px] text-[#525252] font-mono truncate max-w-[200px]">{OGC_SERVICES.GEOSERVER.url}</p>
              </div>
            </div>
            <button onClick={loadWFSCapabilities} disabled={loadingWFS}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-white text-[10px] font-bold rounded-lg disabled:opacity-50 hover:bg-white/5 transition-colors">
              {loadingWFS ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              GetCapabilities
            </button>
          </div>

          {wfsError && (
            <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-red-950/20 border border-red-500/20 rounded-lg text-[10px] text-red-400 font-mono">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{wfsError}
            </div>
          )}

          <div className="p-4">
            {wfsLayers.length === 0 && !loadingWFS ? (
              <p className="text-[10px] text-[#525252] font-mono text-center py-6">Click GetCapabilities to discover feature types.</p>
            ) : loadingWFS ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <div className="w-6 h-6 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                <p className="text-[10px] text-[#525252] font-mono">Fetching WFS capabilities...</p>
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {wfsLayers.map(l => (
                  <button key={l.name} onClick={() => loadWFSFeatures(l)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-[10px] font-mono ${
                      activeWFSLayer?.name === l.name ? 'bg-white/5 border border-white/20 text-white' : 'hover:bg-white/[0.03] text-[#737373] border border-transparent'
                    }`}>
                    <div className="w-3 h-3 rounded-sm border border-current flex-shrink-0" />
                    <span className="truncate">{l.title}</span>
                  </button>
                ))}
              </div>
            )}

            {/* WFS Result */}
            {(loadingWFSData || wfsData) && (
              <div className="mt-3 pt-3 border-t border-white/[0.06]">
                {loadingWFSData ? (
                  <p className="text-[10px] text-[#525252] font-mono text-center py-2">Loading features...</p>
                ) : wfsData?.error ? (
                  <p className="text-[10px] text-red-400 font-mono">{wfsData.error}</p>
                ) : (
                  <div className="text-[10px] font-mono">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-3 h-3 text-[#22C55E]" />
                      <span className="text-[#22C55E]">{wfsData?.features?.length || 0} features loaded</span>
                    </div>
                    {wfsData?.features?.[0]?.properties && (
                      <div className="bg-[#111] border border-white/[0.06] rounded-lg p-2.5 max-h-24 overflow-y-auto">
                        {Object.entries(wfsData.features[0].properties).slice(0, 6).map(([k, v]) => (
                          <div key={k} className="flex justify-between gap-2 mb-0.5">
                            <span className="text-[#525252]">{k}:</span>
                            <span className="text-white truncate max-w-[120px]">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WMS Map Preview */}
      {activeWMSLayer && (
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <p className="text-sm font-semibold text-white">WMS Preview: <span className="text-[#22D3EE]">{activeWMSLayer.title}</span></p>
          </div>
          <div className="h-72">
            <MapContainer center={[11.1271, 78.6569]} zoom={5} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <WMSLayer url={OGC_SERVICES.NASA_GIBS.url} layer={activeWMSLayer.name} opacity={wmsOpacity} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Request Inspector */}
      <RequestInspector defaultOpen />
    </div>
  );
}
