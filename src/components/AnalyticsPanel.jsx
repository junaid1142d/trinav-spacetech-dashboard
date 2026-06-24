import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info, Calendar } from 'lucide-react';

export default function AnalyticsPanel({ stationName, stationObservations }) {
  const [timeFilter, setTimeFilter] = useState('7d'); // 24h, 7d, 30d, all

  // Sort observations chronologically
  const sortedObs = useMemo(() => {
    return [...stationObservations].sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));
  }, [stationObservations]);

  // Filter observations based on time filter
  const filteredObs = useMemo(() => {
    if (sortedObs.length === 0) return [];
    
    const latestDate = new Date(sortedObs[sortedObs.length - 1].Timestamp);
    
    return sortedObs.filter(obs => {
      const obsDate = new Date(obs.Timestamp);
      const diffMs = latestDate - obsDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === '24h') return diffDays <= 1;
      if (timeFilter === '7d') return diffDays <= 7;
      if (timeFilter === '30d') return diffDays <= 30;
      return true; // 'all'
    });
  }, [sortedObs, timeFilter]);

  // Calculate statistics for the filtered range
  const stats = useMemo(() => {
    if (filteredObs.length === 0) {
      return { current: 0, avg: 0, min: 0, max: 0, trend: 'stable' };
    }

    const pressures = filteredObs.map(o => o.Pressure_hPa);
    const current = pressures[pressures.length - 1];
    const total = pressures.reduce((acc, v) => acc + v, 0);
    const avg = parseFloat((total / pressures.length).toFixed(2));
    const min = Math.min(...pressures);
    const max = Math.max(...pressures);

    // Calculate trend by comparing current pressure to the previous one
    let trend = 'stable';
    if (pressures.length > 1) {
      const prev = pressures[pressures.length - 2];
      const diff = current - prev;
      if (diff > 0.05) trend = 'rising';
      else if (diff < -0.05) trend = 'falling';
    }

    return { current, avg, min, max, trend };
  }, [filteredObs]);

  // Format date for chart labels
  const formatChartDate = (tickItem) => {
    if (!tickItem) return '';
    const date = new Date(tickItem);
    if (timeFilter === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.toLocaleTimeString([], { hour: '2-digit' })}`;
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-brand-cyan/40 bg-brand-navy/95 shadow-xl text-xs font-mono select-none">
          <p className="text-brand-textSecondary mb-1.5">{label}</p>
          <p className="text-brand-cyan font-bold flex justify-between gap-4">
            <span>Pressure:</span>
            <span>{payload[0].value.toFixed(2)} hPa</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-6">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-brand-border pb-4">
        <div>
          <span className="text-[10px] text-brand-textMuted uppercase font-mono tracking-wider block">Station Telemetry Drawer</span>
          <h4 className="text-lg font-bold text-white font-['Outfit'] truncate max-w-[280px]" title={stationName}>
            {stationName}
          </h4>
        </div>
        
        {/* Time Filters */}
        <div className="flex bg-brand-dark/60 rounded-xl p-0.5 border border-brand-border/60">
          {[
            { id: '24h', label: '24 Hours' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: 'all', label: 'All Logs' }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setTimeFilter(filter.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                timeFilter === filter.id 
                  ? 'bg-brand-cyan text-brand-navy font-bold shadow-cyan-glow' 
                  : 'text-brand-textSecondary hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3 bg-brand-dark/40 border border-brand-border/30 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-brand-textMuted font-mono">Current Reading</span>
          <span className="text-lg font-extrabold text-white mt-1.5">{stats.current ? `${stats.current} hPa` : '-'}</span>
        </div>
        
        <div className="p-3 bg-brand-dark/40 border border-brand-border/30 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-brand-textMuted font-mono">Pressure Mean</span>
          <span className="text-lg font-extrabold text-brand-blue mt-1.5">{stats.avg ? `${stats.avg} hPa` : '-'}</span>
        </div>

        <div className="p-3 bg-brand-dark/40 border border-brand-border/30 rounded-xl flex flex-col justify-between">
          <span className="text-[10px] text-brand-textMuted font-mono">Min / Max Baro</span>
          <span className="text-xs font-bold text-white mt-1.5">
            {stats.min ? `${stats.min} / ${stats.max}` : '-'} <span className="text-[9px] text-brand-textMuted">hPa</span>
          </span>
        </div>

        <div className="p-3 bg-brand-dark/40 border border-brand-border/30 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-brand-textMuted font-mono">Pressure Trend</span>
            <span className="text-xs font-bold text-white mt-1 select-none capitalize">
              {stats.trend}
            </span>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            stats.trend === 'rising' 
              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30' 
              : stats.trend === 'falling' 
                ? 'bg-blue-950/40 text-brand-cyan border border-brand-cyan/30' 
                : 'bg-slate-900 text-slate-400 border border-slate-700/50'
          }`}>
            {stats.trend === 'rising' ? <TrendingUp className="w-4 h-4" /> : 
             stats.trend === 'falling' ? <TrendingDown className="w-4 h-4" /> : 
             <Minus className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Recharts Graphical Display */}
      <div className="w-full h-[255px]">
        {filteredObs.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-brand-border rounded-2xl bg-brand-dark/20 text-brand-textSecondary text-xs">
            <Calendar className="w-8 h-8 text-brand-cyan/40 mb-2" />
            No readings recorded inside this temporal range.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredObs}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pressureColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              
              <XAxis 
                dataKey="Timestamp" 
                tickFormatter={formatChartDate} 
                stroke="#64748B"
                fontSize={9}
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
              />
              
              <YAxis 
                domain={['auto', 'auto']}
                stroke="#64748B"
                fontSize={9}
                fontFamily="JetBrains Mono"
                tickLine={false}
                axisLine={false}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="Pressure_hPa" 
                stroke="url(#pressureColor)" 
                strokeWidth={2.5}
                dot={filteredObs.length < 50 ? { stroke: '#22D3EE', strokeWidth: 1.5, r: 3 } : false}
                activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 1 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer hint */}
      <div className="flex items-center gap-1.5 p-3 rounded-xl bg-brand-dark/30 border border-brand-border/20 text-[10px] text-brand-textSecondary">
        <Info className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
        <span>Hover nodes on the chart to read exact millibar barometric records. Data points represent direct OGC-compliant observation keys.</span>
      </div>
    </div>
  );
}
