import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, X, Radio, ArrowRight, Download, Info, BarChart2 } from 'lucide-react';
import TamilNaduMap from '../components/TamilNaduMap';
import TemporalPlayback from '../components/TemporalPlayback';
import AnalyticsPanel from '../components/AnalyticsPanel';

export default function MapPage({ 
  dataset, 
  selectedStation, 
  setSelectedStation,
  onDownloadStationData 
}) {
  // Extract unique stations with their static metadata (e.g. coords)
  const stations = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];
    
    const stationMap = new Map();
    dataset.forEach(obs => {
      if (!stationMap.has(obs.Station)) {
        stationMap.set(obs.Station, {
          name: obs.Station,
          city: obs.City,
          lat: obs.Latitude,
          lng: obs.Longitude
        });
      }
    });
    return Array.from(stationMap.values());
  }, [dataset]);

  // Extract all unique timestamps, sorted ascending
  const uniqueTimestamps = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];
    const timestamps = Array.from(new Set(dataset.map(obs => obs.Timestamp)));
    return timestamps.sort((a, b) => new Date(a) - new Date(b));
  }, [dataset]);

  const [simIndex, setSimIndex] = useState(uniqueTimestamps.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Sync simIndex to the latest timestamp whenever dataset changes
  useEffect(() => {
    if (uniqueTimestamps.length > 0) {
      setSimIndex(uniqueTimestamps.length - 1);
    }
  }, [uniqueTimestamps]);

  // Filter observations to only show records matching the current simulation timestamp
  const currentObservations = useMemo(() => {
    if (!dataset || dataset.length === 0 || uniqueTimestamps.length === 0) return [];
    const activeTime = uniqueTimestamps[simIndex];
    return dataset.filter(obs => obs.Timestamp === activeTime);
  }, [dataset, uniqueTimestamps, simIndex]);

  // Extract all historical observations for the selected station (for the chart)
  const selectedStationObservations = useMemo(() => {
    if (!selectedStation || !dataset) return [];
    return dataset.filter(obs => obs.Station === selectedStation.Station);
  }, [selectedStation, dataset]);

  // Find active observation for the selected station at the current simulation timestamp
  const selectedStationActiveObs = useMemo(() => {
    if (!selectedStation || currentObservations.length === 0) return null;
    return currentObservations.find(obs => obs.Station === selectedStation.Station) || null;
  }, [selectedStation, currentObservations]);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-6.5rem)] overflow-hidden">
      {/* Map & Playback Container */}
      <div className="flex-1 flex flex-col gap-4 min-w-[320px] h-full overflow-y-auto pr-1">
        {/* Header bar */}
        <div className="flex justify-between items-center bg-brand-dark/40 px-4 py-2 border border-brand-border/40 rounded-xl select-none">
          <span className="text-[10px] text-brand-textMuted uppercase font-mono tracking-wider block">GEOSPATIAL SPATIAL VIEWER</span>
          <div className="flex items-center gap-2 text-xs text-brand-cyan font-mono font-bold">
            <Compass className="w-4 h-4 animate-spin-slow" />
            TAMIL NADU GRID
          </div>
        </div>

        {/* Leaflet Map */}
        <div className="flex-1 min-h-[360px] relative">
          <TamilNaduMap 
            stations={stations}
            currentObservations={currentObservations}
            onStationSelect={(obs) => setSelectedStation(obs)}
            selectedStation={selectedStation}
            onDownloadStationData={onDownloadStationData}
          />
        </div>

        {/* Temporal Playback Slider */}
        <div className="flex-shrink-0">
          <TemporalPlayback 
            timestamps={uniqueTimestamps}
            currentIndex={simIndex}
            setCurrentIndex={setSimIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
          />
        </div>
      </div>

      {/* Side drawer drawer details / analytical plots */}
      <div className="w-full xl:w-[420px] h-full overflow-y-auto flex flex-col gap-4">
        {selectedStation ? (
          <div className="space-y-4">
            {/* Metadata Drawer Card */}
            <div className="glass-panel p-5 rounded-2xl border border-brand-border bg-brand-navy/60 relative select-none">
              <button 
                onClick={() => setSelectedStation(null)}
                className="absolute top-4 right-4 p-1 rounded-lg border border-brand-border/60 hover:bg-brand-cyan/20 hover:text-brand-cyan transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/15 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
                  <Radio className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-brand-textMuted font-mono uppercase tracking-wider block">METEOROLOGICAL STATION PROFILE</span>
                  <h4 className="text-sm font-bold text-white font-['Outfit'] truncate max-w-[280px]">
                    {selectedStation.Station}
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 font-mono text-[10px] mb-4">
                <div className="p-2.5 rounded-lg bg-brand-dark/40 border border-brand-border/20">
                  <span className="text-brand-textSecondary block">City Jurisdiction</span>
                  <span className="text-white font-bold text-xs mt-1 block">{selectedStation.City}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-dark/40 border border-brand-border/20">
                  <span className="text-brand-textSecondary block">Current Simulation</span>
                  <span className="text-brand-cyan font-bold text-xs mt-1 block">
                    {selectedStationActiveObs ? `${selectedStationActiveObs.Pressure_hPa} hPa` : 'No Reading'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-dark/40 border border-brand-border/20">
                  <span className="text-brand-textSecondary block">Coordinates</span>
                  <span className="text-white text-xs mt-1 block truncate">
                    {selectedStation.Latitude.toFixed(4)}, {selectedStation.Longitude.toFixed(4)}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-brand-dark/40 border border-brand-border/20">
                  <span className="text-brand-textSecondary block">Observation Clock</span>
                  <span className="text-white text-xs mt-1 block truncate">
                    {selectedStationActiveObs ? selectedStationActiveObs.Timestamp.split(' ')[1] : '-'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onDownloadStationData(selectedStation.Station)}
                  className="w-full py-2 bg-brand-cyan/20 border border-brand-cyan/40 hover:bg-brand-cyan hover:text-brand-navy text-brand-cyan text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Station Data
                </button>
              </div>
            </div>

            {/* Time-Series Analytics component */}
            <AnalyticsPanel 
              stationName={selectedStation.Station}
              stationObservations={selectedStationObservations}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 rounded-2xl glass-panel border border-brand-border text-center select-none">
            <div className="w-12 h-12 rounded-full bg-brand-slate border border-brand-cyan/20 text-brand-cyan flex items-center justify-center mb-4 shadow-cyan-glow">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-white text-sm font-bold mb-1.5 font-['Outfit']">Telemetry Inspector</h4>
            <p className="text-brand-textSecondary text-xs leading-relaxed max-w-[260px] mb-4">
              Click any meteorological marker on the Tamil Nadu map to inspect station metadata, current parameters, and historical barometric series.
            </p>
            <div className="text-[10px] text-brand-textMuted font-mono bg-brand-dark/40 px-3 py-1.5 rounded-lg border border-brand-border/20">
              Aura sizing scales with system zoom levels
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
