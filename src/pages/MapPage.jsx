import React, { useState, useMemo, useEffect } from 'react';
import { Compass, X, Radio, Download } from 'lucide-react';
import TamilNaduMap from '../components/TamilNaduMap';
import TemporalPlayback from '../components/TemporalPlayback';
import AnalyticsPanel from '../components/AnalyticsPanel';

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

  useEffect(() => {
    if (timestamps.length) setSimIndex(timestamps.length - 1);
  }, [timestamps]);

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
