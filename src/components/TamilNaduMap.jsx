import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Maximize, Minimize, ShieldAlert, Layers } from 'lucide-react';

// Custom component to handle map bounds, zoom, and canvas heatmap drawing
function MapController({ stations, currentObservations, showHeatmap, heatmapOpacity }) {
  const map = useMap();
  const canvasRef = useRef(null);

  // Auto-fit map bounds to station markers when dataset changes
  useEffect(() => {
    if (stations && stations.length > 0) {
      const bounds = L.latLngBounds(stations.map(s => [s.lat, s.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10, animate: true, duration: 1.5 });
    }
  }, [stations, map]);

  // Canvas Heatmap rendering logic
  useEffect(() => {
    if (!showHeatmap || !canvasRef.current || !currentObservations || currentObservations.length === 0) {
      // Clear canvas if heatmap is disabled
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const drawHeatmap = () => {
      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;
      ctx.clearRect(0, 0, size.x, size.y);

      currentObservations.forEach(obs => {
        const point = map.latLngToContainerPoint([obs.Latitude, obs.Longitude]);
        const press = obs.Pressure_hPa;
        
        // Define color gradient based on pressure
        // Low (<1008) -> Blue, Normal (1008-1018) -> Yellow/Green, High (>1018) -> Red
        let gradientColor = '0, 210, 238'; // Cyan default
        if (press < 1008) {
          gradientColor = '34, 211, 238'; // Blue-Cyan
        } else if (press > 1018) {
          gradientColor = '239, 68, 68'; // Red
        } else {
          gradientColor = '234, 179, 8'; // Yellow
        }

        // Draw radial gradient for weather aura
        const radius = map.getZoom() * 15; // Dynamic sizing based on zoom level
        const radGrad = ctx.createRadialGradient(point.x, point.y, 2, point.x, point.y, radius);
        radGrad.addColorStop(0, `rgba(${gradientColor}, 0.8)`);
        radGrad.addColorStop(0.5, `rgba(${gradientColor}, 0.35)`);
        radGrad.addColorStop(1, `rgba(${gradientColor}, 0)`);

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        ctx.fill();
      });
    };

    // Draw initially and bind to map movements
    drawHeatmap();
    map.on('viewreset move', drawHeatmap);

    return () => {
      map.off('viewreset move', drawHeatmap);
    };
  }, [map, currentObservations, showHeatmap, heatmapOpacity]);

  return showHeatmap ? (
    <div 
      className="absolute top-0 left-0 pointer-events-none z-[400]" 
      style={{ opacity: heatmapOpacity, mixBlendMode: 'screen' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  ) : null;
}

export default function TamilNaduMap({ 
  stations, 
  currentObservations, 
  onStationSelect,
  selectedStation,
  onDownloadStationData 
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const mapContainerRef = useRef(null);

  const getPressureColor = (press) => {
    if (press < 1008) return 'blue';
    if (press > 1018) return 'red';
    return 'yellow';
  };

  const getPressureLabel = (press) => {
    if (press < 1008) return 'Low (< 1008 hPa)';
    if (press > 1018) return 'High (> 1018 hPa)';
    return 'Normal (1008 - 1018 hPa)';
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Fullscreen request failed: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keep state synced with document fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={mapContainerRef} 
      className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-brand-border h-[520px] ${
        isFullscreen ? 'h-screen w-screen rounded-none' : ''
      }`}
    >
      {/* Map Control Bar (Overlays) */}
      <div className="absolute top-4 right-4 z-[500] flex flex-col sm:flex-row gap-2.5">
        {/* Heatmap controls */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-brand-navy/95 border border-brand-border/80 text-xs font-semibold backdrop-blur shadow-lg select-none">
          <label className="flex items-center gap-1.5 cursor-pointer text-white">
            <input 
              type="checkbox" 
              checked={showHeatmap} 
              onChange={() => setShowHeatmap(!showHeatmap)} 
              className="rounded bg-brand-dark border-brand-border text-brand-cyan focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
            />
            <Layers className="w-3.5 h-3.5 text-brand-cyan" />
            Atmospheric Heatmap
          </label>
          
          {showHeatmap && (
            <div className="flex items-center gap-1.5 border-l border-brand-border/40 pl-3">
              <span className="text-[10px] text-brand-textSecondary">Opacity:</span>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05"
                value={heatmapOpacity}
                onChange={(e) => setHeatmapOpacity(parseFloat(e.target.value))}
                className="w-16 accent-brand-cyan h-1 bg-brand-slate rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-brand-cyan w-6">{Math.round(heatmapOpacity * 100)}%</span>
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button 
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-brand-navy/95 border border-brand-border/80 text-brand-cyan hover:bg-brand-cyan hover:text-brand-navy transition-all shadow-lg flex items-center justify-center"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* Map Legend (Bottom Left overlay) */}
      <div className="absolute bottom-4 left-4 z-[500] p-4 rounded-xl bg-brand-navy/95 border border-brand-border/80 text-xs backdrop-blur shadow-lg select-none max-w-[200px]">
        <h5 className="font-bold text-white mb-2.5 font-['Outfit'] border-b border-brand-border/30 pb-1.5">Barometric Index</h5>
        <div className="space-y-2 font-mono text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 border border-white/20 inline-block shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
            <span className="text-brand-textSecondary">Low (&lt; 1008 hPa)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 border border-white/20 inline-block shadow-[0_0_8px_rgba(234,179,8,0.5)]"></span>
            <span className="text-brand-textSecondary">Normal (1008-1018 hPa)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 border border-white/20 inline-block shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
            <span className="text-brand-textSecondary">High (&gt; 1018 hPa)</span>
          </div>
        </div>
      </div>

      {/* Map Instance */}
      <MapContainer 
        center={[11.1271, 78.6569]} 
        zoom={7} 
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Custom controller for heatmap and zooming */}
        <MapController 
          stations={stations} 
          currentObservations={currentObservations}
          showHeatmap={showHeatmap}
          heatmapOpacity={heatmapOpacity}
        />

        {/* Plotting Markers */}
        {currentObservations.map((obs) => {
          const colorClass = getPressureColor(obs.Pressure_hPa);
          
          // Custom HTML icon using pulsing CSS animations
          const customIcon = L.divIcon({
            className: `custom-leaflet-marker`,
            html: `<div class="w-5 h-5 flex items-center justify-center pulse-marker-${colorClass} shadow-lg"><div class="w-1.5 h-1.5 rounded-full bg-white"></div></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          const isSelected = selectedStation && selectedStation.Station === obs.Station;

          return (
            <Marker 
              key={obs.id}
              position={[obs.Latitude, obs.Longitude]}
              icon={customIcon}
              eventHandlers={{
                click: () => {
                  onStationSelect(obs);
                }
              }}
            >
              <Popup>
                <div className="p-1 min-w-[200px] select-none text-xs">
                  <h4 className="font-extrabold text-white text-sm mb-1.5 font-['Outfit'] border-b border-brand-cyan/20 pb-1">{obs.Station}</h4>
                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-brand-textSecondary">City:</span>
                      <span className="text-white font-bold">{obs.City}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-textSecondary">Coordinates:</span>
                      <span className="text-white">{obs.Latitude.toFixed(4)}, {obs.Longitude.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-border/20 pt-1">
                      <span className="text-brand-textSecondary">Pressure:</span>
                      <span className={`font-bold ${
                        colorClass === 'blue' ? 'text-brand-cyan' : colorClass === 'red' ? 'text-red-400' : 'text-yellow-400'
                      }`}>{obs.Pressure_hPa} hPa</span>
                    </div>
                    <div className="text-[9px] text-brand-textMuted mt-1">
                      Status: {getPressureLabel(obs.Pressure_hPa)}
                    </div>
                    <div className="text-[9px] text-brand-textMuted">
                      Log: {obs.Timestamp}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3 pt-2 border-t border-brand-border/20">
                    <button 
                      onClick={() => onStationSelect(obs)}
                      className="flex-1 py-1 rounded bg-brand-cyan/20 border border-brand-cyan/40 hover:bg-brand-cyan hover:text-brand-navy transition-all font-bold text-[9px] text-brand-cyan text-center"
                    >
                      View Analytics
                    </button>
                    <button 
                      onClick={() => onDownloadStationData(obs.Station)}
                      className="py-1 px-2 rounded border border-brand-border hover:bg-brand-slate transition-all text-[9px] text-brand-textSecondary hover:text-white"
                      title="Download telemetry logs"
                    >
                      Export
                    </button>
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
