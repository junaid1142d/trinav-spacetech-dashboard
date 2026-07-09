import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Maximize, Minimize, Layers, X } from 'lucide-react';

function MapController({ stations, currentObservations, showHeatmap, heatmapOpacity }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (stations?.length) {
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10, animate: true });
    }
  }, [stations, map]);

  useEffect(() => {
    if (!showHeatmap || !canvasRef.current || !currentObservations?.length) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      ctx.clearRect(0, 0, size.x, size.y);
      currentObservations.forEach(obs => {
        const pt = map.latLngToContainerPoint([obs.Latitude, obs.Longitude]);
        const p = obs.Pressure_hPa;
        const rgb = p < 1008 ? '34,211,238' : p > 1018 ? '239,68,68' : '234,179,8';
        const r = Math.max(20, map.getZoom() * 12);
        const grad = ctx.createRadialGradient(pt.x, pt.y, 2, pt.x, pt.y, r);
        grad.addColorStop(0, `rgba(${rgb},0.7)`);
        grad.addColorStop(0.5, `rgba(${rgb},0.25)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, 2 * Math.PI);
        ctx.fill();
      });
    };
    draw();
    map.on('viewreset move zoom', draw);
    return () => map.off('viewreset move zoom', draw);
  }, [map, currentObservations, showHeatmap]);

  return showHeatmap ? (
    <div className="absolute top-0 left-0 pointer-events-none z-[400]" style={{ opacity: heatmapOpacity, mixBlendMode: 'screen' }}>
      <canvas ref={canvasRef} />
    </div>
  ) : null;
}

function createMarkerIcon(color, selected) {
  const size = selected ? 22 : 16;
  const border = selected ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.5)';
  const shadow = selected ? `0 0 12px ${color}` : `0 0 6px ${color}80`;
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:${border};box-shadow:${shadow};transition:all 0.2s"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const getPressureColor = (p) => p < 1008 ? '#22D3EE' : p > 1018 ? '#EF4444' : '#EAB308';
const getPressureLabel = (p) => p < 1008 ? 'Low Pressure' : p > 1018 ? 'High Pressure' : 'Normal';

export default function TamilNaduMap({ stations, currentObservations, onStationSelect, selectedStation, onDownloadStationData }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.55);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden border border-white/[0.08] ${fullscreen ? 'h-screen rounded-none' : 'h-[500px]'}`}
    >
      {/* Controls */}
      <div className="absolute top-3 right-3 z-[500] flex gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[10px] font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#D4D4D4]">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={() => setShowHeatmap(v => !v)}
              className="w-3 h-3 accent-[#22D3EE]"
            />
            <Layers className="w-3 h-3" />
            Heatmap
          </label>
          {showHeatmap && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <span className="text-[#525252]">Opacity:</span>
              <input
                type="range" min="0.1" max="1" step="0.05"
                value={heatmapOpacity}
                onChange={e => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-14 accent-[#22D3EE] cursor-pointer"
              />
              <span className="text-[#22D3EE] w-5">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
          )}
        </div>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[#737373] hover:text-white hover:border-white/25 transition-all"
        >
          {fullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[500] px-3 py-2.5 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[10px] font-mono">
        <p className="text-[#525252] mb-1.5 uppercase tracking-wider text-[8px]">Pressure Index</p>
        {[['#22D3EE', '< 1008 hPa — Low'], ['#EAB308', '1008–1018 hPa — Normal'], ['#EF4444', '> 1018 hPa — High']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
            <span className="text-[#737373]">{l}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapController stations={stations} currentObservations={currentObservations} showHeatmap={showHeatmap} heatmapOpacity={heatmapOpacity} />
        {currentObservations.map((obs, i) => {
          const isSelected = selectedStation?.Station === obs.Station;
          const color = getPressureColor(obs.Pressure_hPa);
          return (
            <Marker
              key={`${obs.Station}-${i}`}
              position={[obs.Latitude, obs.Longitude]}
              icon={createMarkerIcon(color, isSelected)}
              eventHandlers={{ click: () => onStationSelect(obs) }}
            >
              <Popup>
                <div className="min-w-[180px] text-[11px]">
                  <p className="font-bold text-white text-sm mb-2 border-b border-white/10 pb-1.5">{obs.Station}</p>
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between"><span className="text-[#737373]">City:</span><span className="text-white">{obs.City}</span></div>
                    <div className="flex justify-between"><span className="text-[#737373]">Coords:</span><span className="text-white">{obs.Latitude.toFixed(4)}, {obs.Longitude.toFixed(4)}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                      <span className="text-[#737373]">Pressure:</span>
                      <span className="font-bold" style={{ color }}>{obs.Pressure_hPa} hPa</span>
                    </div>
                    <div className="flex justify-between"><span className="text-[#737373]">Status:</span><span style={{ color }}>{getPressureLabel(obs.Pressure_hPa)}</span></div>
                    <div className="text-[#525252] mt-1">{obs.Timestamp}</div>
                  </div>
                  <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                    <button onClick={() => onStationSelect(obs)} className="flex-1 py-1 bg-white text-black rounded text-[9px] font-bold hover:bg-white/90 transition-colors">Analytics</button>
                    <button onClick={() => onDownloadStationData(obs.Station)} className="px-2 py-1 border border-white/15 rounded text-[9px] text-[#737373] hover:text-white transition-colors">Export</button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
