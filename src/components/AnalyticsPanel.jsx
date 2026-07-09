import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Area, AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, Info } from 'lucide-react';

const FILTERS = [
  { id: '24h', label: '24H' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: 'all', label: 'ALL' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
        <p className="text-[#737373] mb-1 text-[10px]">{label}</p>
        <p className="text-white font-bold">{Number(payload[0].value).toFixed(2)} <span className="text-[#737373]">hPa</span></p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPanel({ stationName, stationObservations }) {
  const [timeFilter, setTimeFilter] = useState('7d');

  const sorted = useMemo(() =>
    [...stationObservations].sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp)),
    [stationObservations]
  );

  const filtered = useMemo(() => {
    if (!sorted.length) return [];
    const latest = new Date(sorted[sorted.length - 1].Timestamp);
    return sorted.filter(o => {
      const diff = (latest - new Date(o.Timestamp)) / 86400000;
      if (timeFilter === '24h') return diff <= 1;
      if (timeFilter === '7d') return diff <= 7;
      if (timeFilter === '30d') return diff <= 30;
      return true;
    });
  }, [sorted, timeFilter]);

  const stats = useMemo(() => {
    if (!filtered.length) return { current: 0, avg: 0, min: 0, max: 0, trend: 'stable' };
    const ps = filtered.map(o => o.Pressure_hPa);
    const current = ps[ps.length - 1];
    const avg = parseFloat((ps.reduce((a, b) => a + b, 0) / ps.length).toFixed(2));
    let trend = 'stable';
    if (ps.length > 1) {
      const d = current - ps[ps.length - 2];
      if (d > 0.05) trend = 'rising';
      else if (d < -0.05) trend = 'falling';
    }
    return { current, avg, min: Math.min(...ps), max: Math.max(...ps), trend };
  }, [filtered]);

  const avgLine = stats.avg;

  const formatTick = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (timeFilter === '24h') return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
  };

  const TrendIcon = stats.trend === 'rising' ? TrendingUp : stats.trend === 'falling' ? TrendingDown : Minus;
  const trendColor = stats.trend === 'rising' ? '#22C55E' : stats.trend === 'falling' ? '#22D3EE' : '#737373';

  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <p className="text-[9px] text-[#737373] font-mono uppercase tracking-wider">Station Analytics</p>
          <h4 className="text-sm font-semibold text-white truncate max-w-[260px]">{stationName}</h4>
        </div>
        <div className="flex bg-[#111] rounded-lg p-0.5 border border-white/[0.06]">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setTimeFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all ${
                timeFilter === f.id ? 'bg-white text-black' : 'text-[#737373] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        {[
          { label: 'Current', value: `${stats.current.toFixed(2)}`, unit: 'hPa', color: 'text-white' },
          { label: 'Average', value: `${stats.avg.toFixed(2)}`, unit: 'hPa', color: 'text-[#22D3EE]' },
          { label: 'Min', value: `${stats.min.toFixed(2)}`, unit: 'hPa', color: 'text-[#737373]' },
          { label: 'Max', value: `${stats.max.toFixed(2)}`, unit: 'hPa', color: 'text-[#737373]' },
        ].map(s => (
          <div key={s.label} className="px-3 py-3 flex flex-col">
            <span className="text-[9px] text-[#737373] font-mono uppercase">{s.label}</span>
            <span className={`text-sm font-bold ${s.color} font-mono mt-0.5`}>{s.value}</span>
            <span className="text-[8px] text-[#404040] font-mono">{s.unit}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-[#404040] text-xs border border-dashed border-white/[0.06] rounded-lg">
            <Calendar className="w-6 h-6 mb-2" />
            No data in this time range
          </div>
        ) : (
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filtered} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="pressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="Timestamp"
                  tickFormatter={formatTick}
                  stroke="#2a2a2a"
                  tick={{ fill: '#525252', fontSize: 8, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={{ stroke: '#1a1a1a' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  stroke="#2a2a2a"
                  tick={{ fill: '#525252', fontSize: 8, fontFamily: 'JetBrains Mono' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={avgLine}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="4 4"
                  label={{ value: `AVG ${avgLine}`, position: 'right', fill: '#525252', fontSize: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="Pressure_hPa"
                  stroke="#22D3EE"
                  strokeWidth={1.5}
                  fill="url(#pressGrad)"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1, fill: '#22D3EE' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Trend indicator */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
            <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
            <span className="text-[10px] font-mono capitalize" style={{ color: trendColor }}>{stats.trend}</span>
          </div>
          <span className="text-[9px] text-[#525252] font-mono">
            {filtered.length} observations · {timeFilter === 'all' ? 'full dataset' : `last ${timeFilter}`}
          </span>
        </div>
      </div>
    </div>
  );
}
