import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  Crosshair, Home, Layers, LocateFixed, Maximize, Minimize, Search
} from 'lucide-react';

const TN_BOUNDS = [[7.9, 76.2], [13.5, 80.6]];
const TN_POLYGON = [
  [13.5, 76.2],
  [13.5, 80.6],
  [7.9, 80.6],
  [7.9, 76.2],
];

const BASEMAPS = {
  dark: {
    label: 'Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  osm: {
    label: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  terrain: {
    label: 'Terrain',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data &copy; OpenStreetMap, SRTM | OpenTopoMap',
  },
};

function ScaleControl() {
  const map = useMap();
  useEffect(() => {
    const scale = L.control.scale({ imperial: false, position: 'bottomright' });
    scale.addTo(map);
    return () => scale.remove();
  }, [map]);
  return null;
}

function CoordinateTracker({ onMove }) {
  useMapEvents({
    mousemove: (event) => onMove(event.latlng),
    mouseout: () => onMove(null),
  });
  return null;
}

function MapController({ stations, currentObservations, showHeatmap, heatmapOpacity, focusTarget, onFocused }) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (stations?.length) {
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 10, animate: true });
    }
  }, [stations, map]);

  useEffect(() => {
    if (!focusTarget) return;
    map.flyTo(focusTarget.center, focusTarget.zoom || 10, { animate: true, duration: 0.8 });
    onFocused?.();
  }, [focusTarget, map, onFocused]);

  useEffect(() => {
    if (!showHeatmap || !canvasRef.current || !currentObservations?.length) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return undefined;
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

function MapActions({ onHome, onLocate }) {
  const map = useMap();
  return (
    <div className="absolute top-3 left-3 z-[500] flex flex-col gap-2">
      <button title="Home extent" onClick={() => { map.fitBounds(TN_BOUNDS, { padding: [45, 45] }); onHome?.(); }}
        className="p-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[#A3A3A3] hover:text-white transition-all">
        <Home className="w-4 h-4" />
      </button>
      <button title="Locate me" onClick={() => {
        map.locate({ setView: true, maxZoom: 11 });
        onLocate?.();
      }}
        className="p-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[#A3A3A3] hover:text-[#22D3EE] transition-all">
        <LocateFixed className="w-4 h-4" />
      </button>
    </div>
  );
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

function MiniTrend({ values, color }) {
  if (!values?.length) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 120;
    const y = 34 - ((value - min) / span) * 28;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 120 40" className="w-full h-10 mt-2">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const getPressureColor = (p) => p < 1008 ? '#22D3EE' : p > 1018 ? '#EF4444' : '#EAB308';
const getPressureLabel = (p) => p < 1008 ? 'Low Pressure' : p > 1018 ? 'High Pressure' : 'Normal';

export default function TamilNaduMap({
  stations,
  currentObservations,
  stationHistory,
  onStationSelect,
  selectedStation,
  onDownloadStationData,
}) {
  const [fullscreen, setFullscreen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.55);
  const [basemap, setBasemap] = useState('dark');
  const [search, setSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [coordSearch, setCoordSearch] = useState('');
  const [cursor, setCursor] = useState(null);
  const [focusTarget, setFocusTarget] = useState(null);
  const containerRef = useRef(null);

  const districtOptions = useMemo(() => [...new Set(currentObservations.map(o => o.City))].sort(), [currentObservations]);

  const searchStation = () => {
    const term = search.trim().toLowerCase();
    const match = currentObservations.find(obs =>
      obs.Station.toLowerCase().includes(term) || obs.City.toLowerCase().includes(term)
    );
    if (!match) return;
    onStationSelect(match);
    setFocusTarget({ center: [match.Latitude, match.Longitude], zoom: 11 });
  };

  const searchDistrict = (city) => {
    setDistrictSearch(city);
    const match = currentObservations.find(obs => obs.City === city);
    if (!match) return;
    setFocusTarget({ center: [match.Latitude, match.Longitude], zoom: 10 });
  };

  const searchCoordinates = () => {
    const [lat, lng] = coordSearch.split(',').map(v => Number(v.trim()));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    setFocusTarget({ center: [lat, lng], zoom: 11 });
  };

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
      className={`relative w-full overflow-hidden border border-white/[0.08] bg-[#050505] ${fullscreen ? 'h-screen rounded-none' : 'h-[560px] rounded-xl'}`}
    >
      <div className="absolute top-3 right-3 z-[500] w-[min(360px,calc(100%-72px))] space-y-2">
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#525252]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchStation()}
              placeholder="Search station or city"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[11px] text-white placeholder-[#525252] outline-none focus:border-[#22D3EE]/60"
            />
          </div>
          <button onClick={searchStation} title="Search station" className="px-3 py-2 rounded-lg bg-white text-black text-[11px] font-bold">Go</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select value={districtSearch} onChange={e => searchDistrict(e.target.value)}
            className="px-2 py-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[10px] text-white outline-none">
            <option value="">District search</option>
            {districtOptions.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
          <select value={basemap} onChange={e => setBasemap(e.target.value)}
            className="px-2 py-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[10px] text-white outline-none">
            {Object.entries(BASEMAPS).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <Crosshair className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#525252]" />
            <input
              value={coordSearch}
              onChange={e => setCoordSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCoordinates()}
              placeholder="Lat, Lng"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[11px] text-white placeholder-[#525252] outline-none focus:border-[#22D3EE]/60"
            />
          </div>
          <button onClick={searchCoordinates} title="Search coordinates" className="px-3 py-2 rounded-lg border border-white/10 bg-[#0A0A0A]/95 text-white text-[11px] font-bold">Fly</button>
        </div>

        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[10px] font-mono">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#D4D4D4]">
            <input type="checkbox" checked={showHeatmap} onChange={() => setShowHeatmap(v => !v)} className="w-3 h-3 accent-[#22D3EE]" />
            <Layers className="w-3 h-3" /> Heatmap
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[#D4D4D4]">
            <input type="checkbox" checked={showBoundary} onChange={() => setShowBoundary(v => !v)} className="w-3 h-3 accent-[#22D3EE]" />
            Boundary
          </label>
          <input type="range" min="0.1" max="1" step="0.05" value={heatmapOpacity}
            onChange={e => setHeatmapOpacity(parseFloat(e.target.value))}
            className="w-16 accent-[#22D3EE] cursor-pointer" />
          <button onClick={toggleFullscreen} title="Fullscreen" className="p-1.5 rounded-md border border-white/10 text-[#737373] hover:text-white transition-all">
            {fullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-[500] px-3 py-2.5 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[10px] font-mono">
        <p className="text-[#525252] mb-1.5 uppercase tracking-wider text-[8px]">Pressure Index</p>
        {[['#22D3EE', '< 1008 hPa - Low'], ['#EAB308', '1008-1018 hPa - Normal'], ['#EF4444', '> 1018 hPa - High']].map(([c, l]) => (
          <div key={l} className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 6px ${c}` }} />
            <span className="text-[#737373]">{l}</span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-3 right-20 z-[500] px-2.5 py-1.5 rounded-lg bg-[#0A0A0A]/95 border border-white/10 text-[9px] text-[#A3A3A3] font-mono">
        {cursor ? `${cursor.lat.toFixed(4)}, ${cursor.lng.toFixed(4)}` : 'Move cursor for coordinates'}
      </div>

      <MapContainer center={[11.1271, 78.6569]} zoom={7} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
        <TileLayer key={basemap} url={BASEMAPS[basemap].url} attribution={BASEMAPS[basemap].attribution} />
        <ScaleControl />
        <CoordinateTracker onMove={setCursor} />
        <MapActions />
        <MapController
          stations={stations}
          currentObservations={currentObservations}
          showHeatmap={showHeatmap}
          heatmapOpacity={heatmapOpacity}
          focusTarget={focusTarget}
          onFocused={() => setFocusTarget(null)}
        />
        {showBoundary && (
          <Polygon positions={TN_POLYGON} pathOptions={{ color: '#22D3EE', weight: 1.5, opacity: 0.75, fillOpacity: 0.03, dashArray: '6 6' }} />
        )}
        {currentObservations.map((obs, i) => {
          const isSelected = selectedStation?.Station === obs.Station;
          const color = getPressureColor(obs.Pressure_hPa);
          const history = stationHistory?.[obs.Station]?.slice(-18).map(row => row.Pressure_hPa) || [];
          return (
            <Marker
              key={`${obs.Station}-${i}`}
              position={[obs.Latitude, obs.Longitude]}
              icon={createMarkerIcon(color, isSelected)}
              eventHandlers={{ click: () => onStationSelect(obs) }}
            >
              <Popup>
                <div className="min-w-[210px] text-[11px]">
                  <p className="font-bold text-white text-sm mb-2 border-b border-white/10 pb-1.5">{obs.Station}</p>
                  <div className="space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between"><span className="text-[#737373]">City:</span><span className="text-white">{obs.City}</span></div>
                    <div className="flex justify-between"><span className="text-[#737373]">Coords:</span><span className="text-white">{obs.Latitude.toFixed(4)}, {obs.Longitude.toFixed(4)}</span></div>
                    <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                      <span className="text-[#737373]">Pressure:</span>
                      <span className="font-bold" style={{ color }}>{obs.Pressure_hPa} hPa</span>
                    </div>
                    <div className="flex justify-between"><span className="text-[#737373]">Status:</span><span style={{ color }}>{getPressureLabel(obs.Pressure_hPa)}</span></div>
                    <div className="text-[#525252] mt-1">Observed {obs.Timestamp}</div>
                  </div>
                  <MiniTrend values={history} color={color} />
                  <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                    <button onClick={() => onStationSelect(obs)} className="flex-1 py-1 bg-white text-black rounded text-[9px] font-bold hover:bg-white/90 transition-colors">Analytics</button>
                    <button onClick={() => onDownloadStationData(obs.Station)} className="px-2 py-1 border border-white/15 rounded text-[9px] text-[#737373] hover:text-white transition-colors">CSV</button>
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
