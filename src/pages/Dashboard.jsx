import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingDown, Thermometer, Wind, ChevronRight } from 'lucide-react';
import DashboardOverview from '../components/DashboardOverview';
import DataIngestion from '../components/DataIngestion';

export default function Dashboard({ dataset, onDataLoaded, setActivePage }) {
  // Sort and extract anomalous nodes (Low/High pressure outliers)
  const anomalies = useMemo(() => {
    if (!dataset || dataset.length === 0) return { low: [], high: [] };
    
    // Get the latest reading for each station
    const stationMap = new Map();
    dataset.forEach(obs => {
      const existing = stationMap.get(obs.Station);
      if (!existing || new Date(obs.Timestamp) > new Date(existing.Timestamp)) {
        stationMap.set(obs.Station, obs);
      }
    });

    const latestReadings = Array.from(stationMap.values());
    
    const sortedLow = [...latestReadings]
      .filter(obs => obs.Pressure_hPa < 1008)
      .sort((a, b) => a.Pressure_hPa - b.Pressure_hPa)
      .slice(0, 3);

    const sortedHigh = [...latestReadings]
      .filter(obs => obs.Pressure_hPa > 1018)
      .sort((a, b) => b.Pressure_hPa - a.Pressure_hPa)
      .slice(0, 3);

    return { low: sortedLow, high: sortedHigh };
  }, [dataset]);

  return (
    <div className="space-y-8 select-none">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-glow border border-brand-border/40 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.08),rgba(255,255,255,0))] pointer-events-none" />

        <div className="space-y-4 max-w-2xl relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] font-mono text-brand-cyan uppercase bg-brand-cyan/10 border border-brand-cyan/30 px-2 py-0.5 rounded">
              Telemetry Status: Active
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-['Outfit']">
            TRINAV SPACETECH
          </h1>
          <p className="text-xl md:text-2xl font-semibold text-brand-blue/90 font-['Outfit']">
            Atmospheric Pressure Monitoring Dashboard
          </p>
          <p className="text-brand-textSecondary text-sm leading-relaxed max-w-xl">
            Real-time geospatial atmospheric monitoring powered by Azure Data Explorer and OGC SensorThings-compatible architecture. Instantly ingest, visualize, and query barometric readings.
          </p>
          
          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => setActivePage('map')}
              className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/80 text-brand-navy font-bold text-xs flex items-center gap-2 transition-all shadow-cyan-glow cursor-pointer"
            >
              Launch Interactive Map
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tech Badges Stack */}
        <div className="flex flex-wrap md:flex-col gap-2.5 items-end justify-start h-full select-none">
          <div className="px-3 py-1.5 rounded-lg bg-brand-dark/80 border border-brand-border/40 text-[9px] font-mono text-white flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            OGC SENSORTHINGS COMPATIBLE
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-brand-dark/80 border border-brand-border/40 text-[9px] font-mono text-white flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse"></span>
            AZURE DATA EXPLORER READY
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-brand-dark/80 border border-brand-border/40 text-[9px] font-mono text-white flex items-center gap-1.5 shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            QGIS LAYER COMPATIBLE
          </div>
        </div>
      </div>

      {/* CSV Ingest Panel */}
      <section className="space-y-4">
        <h3 className="text-white text-base font-bold uppercase tracking-wider font-['Outfit'] border-l-2 border-brand-cyan pl-3 select-none">
          Data Ingestion Control
        </h3>
        <DataIngestion onDataLoaded={onDataLoaded} currentDataset={dataset} />
      </section>

      {/* KPI Cards Overview */}
      <section className="space-y-4">
        <h3 className="text-white text-base font-bold uppercase tracking-wider font-['Outfit'] border-l-2 border-brand-cyan pl-3 select-none">
          System Overview Metrics
        </h3>
        <DashboardOverview dataset={dataset} />
      </section>

      {/* Weather Warnings & Outlier Alerts */}
      {dataset && dataset.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
          {/* Low Pressure Alerts */}
          <div className="glass-panel p-5 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3 mb-4 text-brand-cyan">
              <TrendingDown className="w-5 h-5 text-brand-cyan" />
              <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">Low-Pressure Storm Watch</h4>
            </div>
            
            {anomalies.low.length === 0 ? (
              <p className="text-brand-textMuted text-xs font-mono py-4">No stations reporting low-pressure systems (&lt; 1008 hPa).</p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {anomalies.low.map(obs => (
                  <div key={obs.id} className="flex justify-between items-center p-3 rounded-xl bg-blue-950/20 border border-blue-500/10 hover:border-blue-500/30 transition-all">
                    <div>
                      <span className="text-white font-semibold block">{obs.Station}</span>
                      <span className="text-[10px] text-brand-textSecondary">City: {obs.City} | {obs.Timestamp.split(' ')[1]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-brand-cyan block">{obs.Pressure_hPa} hPa</span>
                      <span className="text-[9px] text-brand-textMuted font-sans">Cyclone Warning</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* High Pressure Alerts */}
          <div className="glass-panel p-5 rounded-2xl border border-red-500/20">
            <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3 mb-4 text-red-400">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">High-Pressure Ridge Watch</h4>
            </div>
            
            {anomalies.high.length === 0 ? (
              <p className="text-brand-textMuted text-xs font-mono py-4">No stations reporting high-pressure systems (&gt; 1018 hPa).</p>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {anomalies.high.map(obs => (
                  <div key={obs.id} className="flex justify-between items-center p-3 rounded-xl bg-red-950/10 border border-red-500/10 hover:border-red-500/30 transition-all">
                    <div>
                      <span className="text-white font-semibold block">{obs.Station}</span>
                      <span className="text-[10px] text-brand-textSecondary">City: {obs.City} | {obs.Timestamp.split(' ')[1]}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-red-400 block">{obs.Pressure_hPa} hPa</span>
                      <span className="text-[9px] text-brand-textMuted font-sans">Stable Ridge Air</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
