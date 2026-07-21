import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area
} from 'recharts';
import { Activity, BarChart3, LineChart as LineIcon } from 'lucide-react';
import { calculateMetrics } from '../services/api';

const Tip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div className="bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-[#737373] mb-1 text-[9px]">{label}</p>
      <p className="text-white font-bold">{Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
  return null;
};

export default function AnalyticsPage({ dataset }) {
  const m = calculateMetrics(dataset);

  const stationAverages = useMemo(() => {
    if (!dataset?.length) return [];
    const map = {};
    dataset.forEach(o => {
      if (!map[o.Station]) map[o.Station] = { total: 0, count: 0, min: Infinity, max: -Infinity };
      map[o.Station].total += o.Pressure_hPa;
      map[o.Station].count++;
      if (o.Pressure_hPa < map[o.Station].min) map[o.Station].min = o.Pressure_hPa;
      if (o.Pressure_hPa > map[o.Station].max) map[o.Station].max = o.Pressure_hPa;
    });
    return Object.keys(map).map(name => ({
      Station: name.split(' ')[0],
      FullName: name,
      Average: parseFloat((map[name].total / map[name].count).toFixed(2)),
      Variance: parseFloat((map[name].max - map[name].min).toFixed(2)),
    })).sort((a, b) => b.Average - a.Average);
  }, [dataset]);

  const distribution = useMemo(() => {
    if (!dataset?.length) return [];
    const bins = { '<1000': 0, '1000-1005': 0, '1005-1010': 0, '1010-1015': 0, '1015-1020': 0, '>1020': 0 };
    dataset.forEach(o => {
      const p = o.Pressure_hPa;
      if (p < 1000) bins['<1000']++;
      else if (p < 1005) bins['1000-1005']++;
      else if (p < 1010) bins['1005-1010']++;
      else if (p < 1015) bins['1010-1015']++;
      else if (p < 1020) bins['1015-1020']++;
      else bins['>1020']++;
    });
    return Object.entries(bins).map(([Range, Count]) => ({ Range, Count }));
  }, [dataset]);

  const dailyTrend = useMemo(() => {
    if (!dataset?.length) return [];
    const day = {};
    dataset.forEach(o => {
      const d = o.Timestamp?.split(' ')[0];
      if (!d) return;
      if (!day[d]) day[d] = { total: 0, count: 0 };
      day[d].total += o.Pressure_hPa;
      day[d].count++;
    });
    return Object.entries(day)
      .map(([date, v]) => ({ Date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }), DateStr: date, Average: parseFloat((v.total / v.count).toFixed(2)) }))
      .sort((a, b) => new Date(a.DateStr) - new Date(b.DateStr));
  }, [dataset]);

  const insights = useMemo(() => {
    if (!stationAverages.length) return { volatile: '—', stable: '—' };
    const sorted = [...stationAverages].sort((a, b) => b.Variance - a.Variance);
    return { volatile: sorted[0]?.FullName || '—', stable: sorted[sorted.length - 1]?.FullName || '—' };
  }, [stationAverages]);

  const barColor = (avg) => avg < 1008 ? '#22D3EE' : avg > 1018 ? '#EF4444' : '#FFFFFF';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Atmospheric Analysis</p>
          <h2 className="text-xl font-bold text-white font-display">Analytics Reports</h2>
        </div>
        <Activity className="w-5 h-5 text-[#22D3EE]" />
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Most Volatile Station', value: insights.volatile, sub: `Variance: ${stationAverages.find(s => s.FullName === insights.volatile)?.Variance ?? 0} hPa`, color: '#EF4444' },
          { label: 'Most Stable Station', value: insights.stable, sub: `Variance: ${stationAverages.find(s => s.FullName === insights.stable)?.Variance ?? 0} hPa`, color: '#22D3EE' },
          { label: 'Regional Mean', value: `${m.avgPressure} hPa`, sub: `${m.totalRecords.toLocaleString()} total observations`, color: '#FFFFFF' },
        ].map(c => (
          <div key={c.label} className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5">
            <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider mb-2">{c.label}</p>
            <p className="text-sm font-bold text-white truncate" style={{ color: c.color }} title={c.value}>{c.value}</p>
            <p className="text-[10px] text-[#525252] font-mono mt-1">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Station Averages */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.06]">
            <BarChart3 className="w-4 h-4 text-[#737373]" />
            <h4 className="text-sm font-semibold text-white">Mean Pressure by Station</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationAverages} layout="vertical" margin={{ top: 0, right: 5, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[990, 1025]} stroke="#1a1a1a" tick={{ fill: '#404040', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="Station" stroke="#1a1a1a" tick={{ fill: '#737373', fontSize: 9 }} tickLine={false} axisLine={false} width={55} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="Average" radius={[0, 3, 3, 0]} maxBarSize={14}>
                  {stationAverages.map((e, i) => <Cell key={i} fill={barColor(e.Average)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.06]">
            <BarChart3 className="w-4 h-4 text-[#737373]" />
            <h4 className="text-sm font-semibold text-white">Barometric Distribution</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 0, right: 5, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="Range" stroke="#1a1a1a" tick={{ fill: '#404040', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <YAxis stroke="#1a1a1a" tick={{ fill: '#404040', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="Count" fill="#22D3EE" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Trend - full width */}
        <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.06]">
            <LineIcon className="w-4 h-4 text-[#737373]" />
            <h4 className="text-sm font-semibold text-white">Regional Daily Average Trend</h4>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#22D3EE" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="Date" stroke="#1a1a1a" tick={{ fill: '#404040', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={{ stroke: '#1a1a1a' }} />
                <YAxis domain={['auto', 'auto']} stroke="#1a1a1a" tick={{ fill: '#404040', fontSize: 8, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<Tip />} />
                <Area type="monotone" dataKey="Average" stroke="#22D3EE" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 4, stroke: '#fff', strokeWidth: 1 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
