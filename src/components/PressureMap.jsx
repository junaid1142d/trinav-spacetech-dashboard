import { memo, useMemo } from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import { appConfig } from '../config.js';
import StationPopup from './StationPopup.jsx';

function PressureMap({ stations, height = '620px', selectedStationId, onStationClick }) {
  const iconCache = useMemo(() => new Map(), []);
  const getIcon = (station) => {
    const key = station.current >= 1013 ? 'high' : 'default';
    if (!iconCache.has(key)) {
      iconCache.set(
        key,
        divIcon({
          className: '',
          html: `<div class="station-marker ${key === 'high' ? 'is-high' : ''}"></div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        }),
      );
    }
    return iconCache.get(key);
  };

  return (
    <section className="glass-panel overflow-hidden rounded-lg">
      <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-white">Tamil Nadu pressure field</h2>
          <p className="text-sm text-zinc-500">Interactive station markers centered on Tamil Nadu</p>
        </div>
        <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300">
          {stations.length} active stations
        </span>
      </div>
      <div style={{ height }} className="relative">
        <MapContainer
          center={appConfig.map.center}
          zoom={appConfig.map.zoom}
          minZoom={6}
          maxBounds={appConfig.map.bounds}
          zoomControl={false}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
          {stations.map((station) => (
            <Marker
              key={station.id}
              position={[station.latitude, station.longitude]}
              icon={getIcon(station)}
              eventHandlers={{
                click: () => onStationClick?.(station),
              }}
              opacity={selectedStationId && selectedStationId !== station.id ? 0.62 : 1}
            >
              <Popup>
                <StationPopup station={station} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}

export default memo(PressureMap);
