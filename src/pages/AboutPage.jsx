import React from 'react';
import { Info, MapPin, Gauge, Network, Cpu } from 'lucide-react';

const LINKEDIN = 'https://www.linkedin.com/in/junaid-ahmed-442025280/';

const features = [
  { icon: MapPin, title: 'Geospatial Monitoring', desc: 'Interactive GIS map with animated station markers, heatmap overlays, and spatial filtering across Tamil Nadu.', color: '#22D3EE' },
  { icon: Gauge, title: 'Historical Analysis', desc: 'Aggregates temporal barometric series with mean, variance, min/max statistics and trend detection.', color: '#FFFFFF' },
  { icon: Network, title: 'Temporal Visualization', desc: 'Animates pressure distributions chronologically with configurable playback speed and timeline controls.', color: '#A855F7' },
  { icon: Cpu, title: 'OGC Integration', desc: 'Live NASA GIBS WMS and GeoServer WFS via GetCapabilities discovery with request inspection.', color: '#22C55E' },
];

const badges = [
  ['OGC SensorThings Compatible', 'border-[#22D3EE]/30 text-[#22D3EE]'],
  ['Azure Data Explorer', 'border-blue-400/30 text-blue-400'],
  ['NASA GIBS WMS', 'border-orange-400/30 text-orange-400'],
  ['GeoServer WFS', 'border-green-400/30 text-green-400'],
  ['React 19 + Vite', 'border-white/20 text-[#737373]'],
  ['React Leaflet', 'border-white/20 text-[#737373]'],
  ['Recharts', 'border-white/20 text-[#737373]'],
  ['Framer Motion', 'border-white/20 text-[#737373]'],
  ['PapaParse', 'border-white/20 text-[#737373]'],
];

export default function AboutPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">System Profile</p>
          <h2 className="text-xl font-bold text-white font-display">About</h2>
        </div>
        <Info className="w-5 h-5 text-[#737373]" />
      </div>

      {/* Overview */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold text-white font-display">TRINAV SPACETECH</h3>
        <h4 className="text-sm text-[#737373]">Atmospheric Pressure Monitoring Dashboard</h4>
        <p className="text-[12px] text-[#525252] leading-relaxed">
          This platform demonstrates an atmospheric pressure monitoring system built using the OGC SensorThings data model,
          Azure Data Explorer, GIS visualization with React Leaflet, and time-series analytics with Recharts.
          OGC services are integrated via live NASA GIBS WMS and GeoServer WFS with dynamic GetCapabilities discovery.
        </p>
        <div className="text-[11px] font-mono text-[#404040] pt-2 border-t border-white/[0.04]">
          Developed by{' '}
          <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="linkedin-link">Junaid Ahmed ↗</a>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 flex gap-4">
              <div className="w-9 h-9 rounded-lg bg-[#111] border border-white/[0.06] flex items-center justify-center flex-shrink-0" style={{ color: f.color }}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">{f.title}</h4>
                <p className="text-[11px] text-[#525252] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* OGC Schema */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 space-y-4">
        <h4 className="text-sm font-bold text-white border-b border-white/[0.06] pb-3">OGC SensorThings Architecture</h4>
        <div className="grid grid-cols-3 gap-3 font-mono text-[10px]">
          {[
            { label: 'THING (Station)', color: '#22D3EE', desc: 'Physical weather station entity.' },
            { label: 'DATASTREAM', color: '#A855F7', desc: 'Pressure observations series for a station.' },
            { label: 'OBSERVATION', color: '#22C55E', desc: 'Single barometric reading with timestamp.' },
          ].map(s => (
            <div key={s.label} className="bg-[#111] border border-white/[0.06] rounded-lg p-3 text-center">
              <span className="font-bold block mb-1.5" style={{ color: s.color }}>{s.label}</span>
              <span className="text-[#525252] text-[9px]">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 space-y-3">
        <h4 className="text-[10px] font-mono text-[#525252] uppercase tracking-wider border-b border-white/[0.06] pb-3">Technology Stack</h4>
        <div className="flex flex-wrap gap-2">
          {badges.map(([name, cls]) => (
            <span key={name} className={`px-2.5 py-1 rounded-md border text-[9px] font-mono ${cls}`}>{name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
