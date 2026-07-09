import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingDown, ChevronRight, Upload } from 'lucide-react';
import DashboardOverview from '../components/DashboardOverview';
import DataIngestion from '../components/DataIngestion';

const LINKEDIN = 'https://www.linkedin.com/in/junaid-ahmed-442025280/';

export default function Dashboard({ dataset, onDataLoaded, setActivePage }) {
  const anomalies = useMemo(() => {
    if (!dataset?.length) return { low: [], high: [] };
    const latest = new Map();
    dataset.forEach(obs => {
      const ex = latest.get(obs.Station);
      if (!ex || new Date(obs.Timestamp) > new Date(ex.Timestamp)) latest.set(obs.Station, obs);
    });
    const readings = [...latest.values()];
    return {
      low: readings.filter(o => o.Pressure_hPa < 1008).sort((a, b) => a.Pressure_hPa - b.Pressure_hPa).slice(0, 3),
      high: readings.filter(o => o.Pressure_hPa > 1018).sort((a, b) => b.Pressure_hPa - a.Pressure_hPa).slice(0, 3),
    };
  }, [dataset]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080808] p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(34,211,238,0.04),transparent_60%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-[9px] font-mono text-[#737373] uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Telemetry Active
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight font-display">TRINAV SPACETECH</h1>
            <p className="text-lg text-[#737373] font-display">Atmospheric Pressure Monitoring Dashboard</p>
            <p className="text-sm text-[#525252] leading-relaxed max-w-xl">
              Real-time geospatial atmospheric monitoring powered by Azure Data Explorer and OGC SensorThings-compatible architecture.
            </p>
            <div className="text-[11px] text-[#404040] font-mono">
              Developed by{' '}
              <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="linkedin-link">Junaid Ahmed ↗</a>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => setActivePage('map')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition-colors">
              Open Map <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={() => setActivePage('ogc')}
              className="flex items-center gap-2 px-5 py-2 border border-white/15 text-[#737373] hover:text-white text-xs font-semibold rounded-xl transition-colors">
              OGC Services
            </button>
          </div>
        </div>
        {/* Badges */}
        <div className="relative mt-6 flex flex-wrap gap-2">
          {['OGC SensorThings Compatible', 'Azure Data Explorer Ready', 'QGIS Compatible', 'React + Leaflet'].map(b => (
            <span key={b} className="px-2.5 py-1 rounded-md border border-white/[0.08] text-[9px] font-mono text-[#525252] bg-white/[0.02]">{b}</span>
          ))}
        </div>
      </div>

      {/* CSV Ingestion */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-l-2 border-white pl-3">
          <Upload className="w-4 h-4 text-[#737373]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Data Ingestion</h3>
        </div>
        <DataIngestion onDataLoaded={onDataLoaded} currentDataset={dataset} />
      </section>

      {/* KPIs */}
      <section className="space-y-3">
        <div className="border-l-2 border-white pl-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Metrics</h3>
        </div>
        <DashboardOverview dataset={dataset} />
      </section>

      {/* Alerts */}
      {dataset?.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AlertPanel title="Low-Pressure Watch" color="#22D3EE" items={anomalies.low} emptyMsg="No low-pressure anomalies detected." icon={TrendingDown} />
          <AlertPanel title="High-Pressure Ridge" color="#EF4444" items={anomalies.high} emptyMsg="No high-pressure anomalies detected." icon={ShieldAlert} />
        </section>
      )}
    </div>
  );
}

function AlertPanel({ title, color, items, emptyMsg, icon: Icon }) {
  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5">
      <div className="flex items-center gap-2 pb-3 mb-4 border-b border-white/[0.06]">
        <Icon className="w-4 h-4" style={{ color }} />
        <h4 className="text-sm font-bold text-white">{title}</h4>
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-[#525252] font-mono py-3">{emptyMsg}</p>
      ) : items.map(obs => (
        <div key={obs.Station} className="flex justify-between items-center py-2.5 border-b border-white/[0.04] last:border-0">
          <div>
            <p className="text-white text-[11px] font-medium">{obs.Station}</p>
            <p className="text-[9px] text-[#525252] font-mono">{obs.City} · {obs.Timestamp?.split(' ')[1]}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold font-mono" style={{ color }}>{obs.Pressure_hPa} hPa</p>
          </div>
        </div>
      ))}
    </div>
  );
}
