import React from 'react';
import { Info, Cpu, Network, Database, MapPin, Gauge, Cpu as SensorIcon } from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      title: "Geospatial Monitoring",
      description: "Visualizes barometric sensors on an interactive GIS map layered with coordinates, metadata parameters, and regional bounds.",
      icon: MapPin,
      color: "text-brand-cyan"
    },
    {
      title: "Historical Analysis",
      description: "Aggregates temporal series data across customizable filters, tracking pressure means, standard deviation spikes, and climate variances.",
      icon: Gauge,
      color: "text-brand-blue"
    },
    {
      title: "Temporal Visualization",
      description: "Animates pressure distributions over time utilizing play, pause, speed, and timeline seek parameters.",
      icon: Network,
      color: "text-purple-400"
    },
    {
      title: "Atmospheric Analytics",
      description: "Generates custom frequency histograms and regional progression trends to detect cyclones or high-pressure systems.",
      icon: Cpu,
      color: "text-teal-400"
    }
  ];

  const badges = [
    { name: "OGC SensorThings Compatible", color: "border-brand-cyan text-brand-cyan bg-brand-cyan/10" },
    { name: "Azure Data Explorer", color: "border-blue-400 text-blue-400 bg-blue-500/10" },
    { name: "QGIS Layer", color: "border-emerald-400 text-emerald-400 bg-emerald-500/10" },
    { name: "React 19", color: "border-sky-400 text-sky-400 bg-sky-500/10" },
    { name: "Leaflet Map", color: "border-amber-400 text-amber-400 bg-amber-500/10" },
    { name: "Recharts Engine", color: "border-purple-400 text-purple-400 bg-purple-500/10" },
    { name: "Azure Ready", color: "border-indigo-400 text-indigo-400 bg-indigo-500/10" }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-brand-navy/60 px-6 py-4 border border-brand-border/40 rounded-2xl">
        <div>
          <span className="text-[10px] text-brand-textMuted uppercase font-mono tracking-wider block">SYSTEM PROFILE</span>
          <h2 className="text-xl font-extrabold text-white font-['Outfit']">About Trinav Spacetech</h2>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
          <Info className="w-5 h-5" />
        </div>
      </div>

      {/* Hero Overview */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-brand-border space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit']">Platform Objective</h3>
        <p className="text-brand-textSecondary text-sm leading-relaxed max-w-4xl">
          This platform demonstrates an atmospheric pressure monitoring system built using the OGC SensorThings data model, Azure Data Explorer, GIS visualization, and time-series analytics. It is designed to emulate systems used by meteorological departments, research institutes, and space technology companies to track barometric anomalies and predict weather fronts.
        </p>
        <div className="text-[11px] text-brand-textMuted font-mono">
          Developed by: <span className="text-white font-semibold">Junaid Ahmed</span>
        </div>
      </div>

      {/* System Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-brand-border flex gap-4">
              <div className={`w-10 h-10 rounded-xl bg-brand-dark flex items-center justify-center border border-brand-border/40 ${f.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1">
                <h4 className="text-sm font-bold text-white font-['Outfit']">{f.title}</h4>
                <p className="text-brand-textSecondary text-xs leading-relaxed">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* OGC Schema block */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-6">
        <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3">
          <Cpu className="w-4.5 h-4.5 text-brand-cyan" />
          <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">OGC SensorThings Architecture</h4>
        </div>
        
        <p className="text-brand-textSecondary text-xs leading-relaxed">
          The dataset and database models are structured mapping directly to the Open Geospatial Consortium (OGC) SensorThings API standard, facilitating telemetry streaming into Azure Data Explorer.
        </p>

        {/* Schema Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 font-mono text-[10px] text-center">
          <div className="p-3 bg-brand-dark/40 border border-brand-border/20 rounded-xl">
            <span className="text-brand-cyan font-bold block mb-1">THING (Station)</span>
            <span className="text-brand-textMuted">Entity representing the physical weather observation station.</span>
          </div>
          <div className="p-3 bg-brand-dark/40 border border-brand-border/20 rounded-xl">
            <span className="text-brand-blue font-bold block mb-1">DATASTREAM (Telemetry)</span>
            <span className="text-brand-textMuted">Combines observations for a specific ObservedProperty (Pressure).</span>
          </div>
          <div className="p-3 bg-brand-dark/40 border border-brand-border/20 rounded-xl">
            <span className="text-purple-400 font-bold block mb-1">OBSERVATION (Reading)</span>
            <span className="text-brand-textMuted">The raw barometric reading value linked with a specific timestamp.</span>
          </div>
        </div>
      </div>

      {/* Tech Badges */}
      <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-brand-textSecondary border-b border-brand-border/30 pb-3">Technology Badges Stack</h4>
        <div className="flex flex-wrap gap-2.5">
          {badges.map((b, i) => (
            <span key={i} className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-semibold select-none ${b.color}`}>
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
