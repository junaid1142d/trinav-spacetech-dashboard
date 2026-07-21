import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Compass, X, Radio, Download, Globe, Database, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import TamilNaduMap from '../components/TamilNaduMap';
import TemporalPlayback from '../components/TemporalPlayback';
import AnalyticsPanel from '../components/AnalyticsPanel';
import { CURATED_WMS_LAYERS, CURATED_WFS_LAYERS, OGC_SERVICES_CONFIG } from '../data/curatedOGCLayers';
import { wfsGetFeature } from '../services/api';

export default function MapPage({ dataset, selectedStation, setSelectedStation, onDownloadStationData }) {
  const stations = useMemo(() => {
    const map = new Map();
    dataset?.forEach(obs => { if (!map.has(obs.Station)) map.set(obs.Station, { name: obs.Station, city: obs.City, lat: obs.Latitude, lng: obs.Longitude }); });
    return [...map.values()];
  }, [dataset]);

  const timestamps = useMemo(() => {
    const ts = [...new Set(dataset?.map(o => o.Timestamp) || [])];
    return ts.sort((a, b) => new Date(a) - new Date(b));
  }, [dataset]);

  const [simIndex, setSimIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [activeWMSLayer, setActiveWMSLayer] = useState(null);
  const [wmsOpacity, setWmsOpacity] = useState(0.7);
  const [wmsLoadState, setWmsLoadState] = useState('idle');
  const [wmsLoadError, setWmsLoadError] = useState(null);

  const [activeWFSLayer, setActiveWFSLayer] = useState(null);
  const [wfsData, setWfsData] = useState(null);
  const [wfsError, setWfsError] = useState(null);
  const [loadingWFSData, setLoadingWFSData] = useState(false);
  const wfsAbortRef = useRef(null);
  const wfsRequestIdRef = useRef(0);

  useEffect(() => {
    if (timestamps.length) setSimIndex(timestamps.length - 1);
  }, [timestamps]);

  useEffect(() => () => wfsAbortRef.current?.abort(), []);

  const currentObs = useMemo(() => {
    if (!dataset?.length || !timestamps.length) return [];
    const active = timestamps[simIndex];
    return dataset.filter(o => o.Timestamp === active);
  }, [dataset, timestamps, simIndex]);

  const stationObs = useMemo(() => {
    if (!selectedStation || !dataset) return [];
    return dataset.filter(o => o.Station === selectedStation.Station);
  }, [selectedStation, dataset]);

  const stationHistory = useMemo(() => {
    const history = {};
    dataset?.forEach(obs => {
      if (!history[obs.Station]) history[obs.Station] = [];
      history[obs.Station].push(obs);
    });
    Object.values(history).forEach(rows => rows.sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)));
    return history;
  }, [dataset]);

  const loadWFSLayer = async (layer) => {
    if (wfsAbortRef.current) wfsAbortRef.current.abort();
    wfsAbortRef.current = new AbortController();
    const requestId = Date.now();
    wfsRequestIdRef.current = requestId;
    setActiveWFSLayer(layer);
    setLoadingWFSData(true);
    setWfsError(null);
    setWfsData(null);

    try {
      const data = await wfsGetFeature(
        OGC_SERVICES_CONFIG.WFS.url,
        layer.name,
        layer.defaultBBOX,
        wfsAbortRef.current.signal,
        layer.maxFeatures
      );
      if (wfsRequestIdRef.current !== requestId) return;
      setWfsData(data?.features?.length ? data : { type: 'FeatureCollection', features: [] });
    } catch (error) {
      if (error?.name === 'AbortError') return;
      if (wfsRequestIdRef.current !== requestId) return;
      setWfsError(error?.message || 'Failed to fetch WFS features.');
      setWfsData(null);
    } finally {
      if (wfsRequestIdRef.current === requestId) {
        setLoadingWFSData(false);
      }
    }
  };

  const toggleWMSLayer = (layer) => {
    setWmsLoadError(null);
    setWmsLoadState(layer ? 'loading' : 'idle');
    setActiveWMSLayer(layer);
  };

  const toggleWFSLayer = (layer) => {
    if (activeWFSLayer?.name === layer.name) {
      if (wfsAbortRef.current) wfsAbortRef.current.abort();
      setActiveWFSLayer(null);
      setWfsData(null);
      setWfsError(null);
      setLoadingWFSData(false);
      wfsRequestIdRef.current = 0;
      return;
    }
    loadWFSLayer(layer);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-5 h-[calc(100vh-5rem)] overflow-hidden">
      {/* Map + Playback */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto min-w-0">
        <div className="flex items-center justify-between px-4 py-2 bg-[#0A0A0A] border border-white/[0.06] rounded-xl">
          <span className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Tamil Nadu · Geospatial Grid</span>
          <div className="flex items-center gap-1.5 text-[10px] text-[#737373] font-mono">
            <Compass className="w-3.5 h-3.5" />
            <span>{currentObs.length} markers</span>
          </div>
        </div>
        <div className="flex-1 min-h-[400px]">
          <TamilNaduMap
            stations={stations}
            currentObservations={currentObs}
            stationHistory={stationHistory}
            onStationSelect={setSelectedStation}
            selectedStation={selectedStation}
            onDownloadStationData={onDownloadStationData}
            activeWMSLayer={activeWMSLayer}
            wmsOpacity={wmsOpacity}
            wfsData={wfsData}
            onWmsStatusChange={setWmsLoadState}
            onWmsError={setWmsLoadError}
          />
        </div>
        <TemporalPlayback
          timestamps={timestamps}
          currentIndex={simIndex}
          setCurrentIndex={setSimIndex}
          isPlaying={playing}
          setIsPlaying={setPlaying}
          playbackSpeed={speed}
          setPlaybackSpeed={setSpeed}
        />
      </div>

      {/* Side panel */}
      <div className="w-full xl:w-96 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE]">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Integrated OGC Explorer</p>
              <h4 className="text-sm font-bold text-white">WMS + WFS in Interactive Map</h4>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[9px] text-[#404040] font-mono mb-1.5 uppercase">WMS Overlay</p>
              <select
                value={activeWMSLayer?.name || ''}
                onChange={(e) => {
                  const selected = CURATED_WMS_LAYERS.find(l => l.name === e.target.value) || null;
                  toggleWMSLayer(selected);
                }}
                className="w-full px-2 py-2 rounded-lg bg-[#111] border border-white/[0.08] text-[10px] text-white outline-none"
              >
                <option value="">None (disabled)</option>
                {CURATED_WMS_LAYERS.map(layer => (
                  <option key={layer.name} value={layer.name}>{layer.title}</option>
                ))}
              </select>
              {activeWMSLayer && (
                <div className="mt-2 space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-[#525252]">Opacity</span>
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
                  <div className={`text-[9px] font-mono ${
                    wmsLoadState === 'ready' ? 'text-[#22C55E]' : wmsLoadState === 'error' ? 'text-red-400' : 'text-amber-300'
                  }`}>
                    WMS status: {wmsLoadState}
                  </div>
                  {wmsLoadError && <p className="text-[9px] text-red-400 font-mono">{wmsLoadError}</p>}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/[0.06]">
              <p className="text-[9px] text-[#404040] font-mono mb-1.5 uppercase">WFS Vector Layer</p>
              <select
                value={activeWFSLayer?.name || ''}
                onChange={(e) => {
                  const selected = CURATED_WFS_LAYERS.find(l => l.name === e.target.value) || null;
                  if (!selected) {
                    if (wfsAbortRef.current) wfsAbortRef.current.abort();
                    setActiveWFSLayer(null);
                    setWfsData(null);
                    setWfsError(null);
                    setLoadingWFSData(false);
                    return;
                  }
                  toggleWFSLayer(selected);
                }}
                className="w-full px-2 py-2 rounded-lg bg-[#111] border border-white/[0.08] text-[10px] text-white outline-none"
              >
                <option value="">None (disabled)</option>
                {CURATED_WFS_LAYERS.map(layer => (
                  <option key={layer.name} value={layer.name}>{layer.title}</option>
                ))}
              </select>

              {loadingWFSData && (
                <p className="mt-2 text-[9px] text-white font-mono flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Fetching WFS features...
                </p>
              )}
              {wfsError && (
                <div className="mt-2 space-y-2">
                  <p className="text-[9px] text-red-400 font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> {wfsError}
                  </p>
                  {activeWFSLayer && (
                    <button
                      onClick={() => loadWFSLayer(activeWFSLayer)}
                      className="w-full px-3 py-1.5 rounded-md bg-white text-black text-[10px] font-bold"
                    >
                      Retry WFS
                    </button>
                  )}
                </div>
              )}
              {wfsData?.features?.length > 0 && (
                <p className="mt-2 text-[9px] text-[#22C55E] font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Loaded {wfsData.features.length} features
                </p>
              )}
              {activeWFSLayer && !loadingWFSData && !wfsError && wfsData?.features?.length === 0 && (
                <p className="mt-2 text-[9px] text-[#737373] font-mono flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> No features in the configured BBOX
                </p>
              )}
            </div>
          </div>
        </div>

        {selectedStation ? (
          <>
            {/* Station card */}
            <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4 relative">
              <button onClick={() => setSelectedStation(null)}
                className="absolute top-3 right-3 p-1 rounded-md border border-white/10 text-[#737373] hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center text-[#22D3EE]">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Selected Station</p>
                  <h4 className="text-sm font-bold text-white truncate max-w-[260px]">{selectedStation.Station}</h4>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-[10px] font-mono mb-4">
                {[
                  ['City', selectedStation.City],
                  ['Pressure', `${selectedStation.Pressure_hPa} hPa`],
                  ['Latitude', selectedStation.Latitude?.toFixed(4)],
                  ['Longitude', selectedStation.Longitude?.toFixed(4)],
                ].map(([k, v]) => (
                  <div key={k} className="bg-[#111] border border-white/[0.06] rounded-lg p-2.5">
                    <span className="text-[#525252] block text-[9px] mb-0.5">{k}</span>
                    <span className="text-white font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => onDownloadStationData(selectedStation.Station)}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition-colors">
                <Download className="w-3.5 h-3.5" /> Download Station Data
              </button>
            </div>
            {/* Analytics */}
            <AnalyticsPanel stationName={selectedStation.Station} stationObservations={stationObs} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0A0A0A] border border-white/[0.08] rounded-xl text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#737373] mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white mb-2">Telemetry Inspector</h4>
            <p className="text-[11px] text-[#525252] leading-relaxed max-w-[220px]">
              Click any station marker on the map to inspect metadata and barometric analytics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
