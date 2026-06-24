import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell
} from 'recharts';
import { BarChart3, LineChart as LineIcon, Activity, RefreshCw } from 'lucide-react';
import { calculateMetrics } from '../services/api';

export default function AnalyticsPage({ dataset }) {
  const metrics = calculateMetrics(dataset);

  // 1. Station-by-Station Average Pressure Comparison
  const stationAverages = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];
    
    const stationsData = {};
    dataset.forEach(obs => {
      if (!stationsData[obs.Station]) {
        stationsData[obs.Station] = { total: 0, count: 0, min: Infinity, max: -Infinity };
      }
      stationsData[obs.Station].total += obs.Pressure_hPa;
      stationsData[obs.Station].count += 1;
      if (obs.Pressure_hPa < stationsData[obs.Station].min) stationsData[obs.Station].min = obs.Pressure_hPa;
      if (obs.Pressure_hPa > stationsData[obs.Station].max) stationsData[obs.Station].max = obs.Pressure_hPa;
    });

    return Object.keys(stationsData).map(name => {
      const avg = parseFloat((stationsData[name].total / stationsData[name].count).toFixed(2));
      const variance = parseFloat((stationsData[name].max - stationsData[name].min).toFixed(2));
      return {
        Station: name.split(' ')[0], // Shorten name for display
        FullName: name,
        Average: avg,
        Variance: variance
      };
    }).sort((a, b) => b.Average - a.Average);
  }, [dataset]);

  // 2. Pressure Distribution (Histogram Bins)
  const pressureDistribution = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];

    // Bins: < 1000, 1000-1005, 1005-1010, 1010-1015, 1015-1020, > 1020
    const bins = {
      'Storm (<1000)': 0,
      'Low (1000-1005)': 0,
      'Low-Norm (1005-1010)': 0,
      'Normal (1010-1015)': 0,
      'High-Norm (1015-1020)': 0,
      'High (>1020)': 0
    };

    dataset.forEach(obs => {
      const p = obs.Pressure_hPa;
      if (p < 1000) bins['Storm (<1000)']++;
      else if (p < 1005) bins['Low (1000-1005)']++;
      else if (p < 1010) bins['Low-Norm (1005-1010)']++;
      else if (p < 1015) bins['Normal (1010-1015)']++;
      else if (p < 1020) bins['High-Norm (1015-1020)']++;
      else bins['High (>1020)']++;
    });

    return Object.keys(bins).map(bin => ({
      Range: bin,
      Observations: bins[bin]
    }));
  }, [dataset]);

  // 3. Daily Average regional pressure trend
  const dailyAverageTrend = useMemo(() => {
    if (!dataset || dataset.length === 0) return [];

    const dayData = {};
    dataset.forEach(obs => {
      const date = obs.Timestamp.split(' ')[0]; // Extract YYYY-MM-DD
      if (!dayData[date]) {
        dayData[date] = { total: 0, count: 0 };
      }
      dayData[date].total += obs.Pressure_hPa;
      dayData[date].count += 1;
    });

    return Object.keys(dayData).map(date => {
      const formattedDate = new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
      return {
        DateStr: date,
        Date: formattedDate,
        Average: parseFloat((dayData[date].total / dayData[date].count).toFixed(2))
      };
    }).sort((a, b) => new Date(a.DateStr) - new Date(b.DateStr));
  }, [dataset]);

  // Analytical insights
  const insights = useMemo(() => {
    if (stationAverages.length === 0) return { variable: '-', stable: '-', avgVar: 0 };
    const sortedByVar = [...stationAverages].sort((a, b) => b.Variance - a.Variance);
    
    return {
      variable: sortedByVar[0]?.FullName || '-',
      stable: sortedByVar[sortedByVar.length - 1]?.FullName || '-',
      avgVar: parseFloat((sortedByVar.reduce((acc, s) => acc + s.Variance, 0) / sortedByVar.length).toFixed(2))
    };
  }, [stationAverages]);

  // Custom Chart Tooltips
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-brand-cyan/40 bg-brand-navy/95 shadow-xl text-xs font-mono select-none">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-brand-cyan flex justify-between gap-4">
            <span>Average:</span>
            <span>{payload[0].value.toFixed(2)} hPa</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomHistogramTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-brand-cyan/40 bg-brand-navy/95 shadow-xl text-xs font-mono select-none">
          <p className="text-white font-bold mb-1">{label}</p>
          <p className="text-brand-blue flex justify-between gap-4">
            <span>Readings:</span>
            <span>{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-brand-dark/40 px-6 py-4 border border-brand-border/40 rounded-2xl">
        <div>
          <span className="text-[10px] text-brand-textMuted uppercase font-mono tracking-wider block">METEOROLOGICAL ANALYSIS PANEL</span>
          <h2 className="text-xl font-extrabold text-white font-['Outfit']">Atmospheric Analytics Reports</h2>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
      </div>

      {/* Analytical Insights summary grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-brand-border">
          <span className="text-[10px] text-brand-textMuted uppercase font-mono">Most Volatile Node</span>
          <h4 className="text-base font-bold text-white font-['Outfit'] mt-1 truncate" title={insights.variable}>
            {insights.variable}
          </h4>
          <p className="text-xs text-brand-cyan font-mono mt-1">Variance: {stationAverages.find(s => s.FullName === insights.variable)?.Variance || 0} hPa</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border">
          <span className="text-[10px] text-brand-textMuted uppercase font-mono">Most Stable Node</span>
          <h4 className="text-base font-bold text-white font-['Outfit'] mt-1 truncate" title={insights.stable}>
            {insights.stable}
          </h4>
          <p className="text-xs text-brand-blue font-mono mt-1">Variance: {stationAverages.find(s => s.FullName === insights.stable)?.Variance || 0} hPa</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-brand-border">
          <span className="text-[10px] text-brand-textMuted uppercase font-mono">Average Station Fluctuation</span>
          <h4 className="text-base font-bold text-white font-['Outfit'] mt-1">
            {insights.avgVar} hPa
          </h4>
          <p className="text-xs text-brand-textSecondary font-mono mt-1">Delta standard deviation</p>
        </div>
      </div>

      {/* Grid of Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Station comparison */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3 text-brand-cyan select-none">
            <BarChart3 className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">Mean Barometric Value by Station</h4>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stationAverages}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[990, 1025]} 
                  stroke="#64748B" 
                  fontSize={8} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="Station" 
                  stroke="#94A3B8" 
                  fontSize={9} 
                  width={60} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="Average" fill="#22D3EE" radius={[0, 4, 4, 0]} maxBarSize={16}>
                  {stationAverages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Average < 1008 ? '#38BDF8' : entry.Average > 1018 ? '#EF4444' : '#EAB308'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pressure Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4">
          <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3 text-brand-blue select-none">
            <BarChart3 className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">Barometric Frequency Distribution</h4>
          </div>
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pressureDistribution}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="Range" 
                  stroke="#64748B" 
                  fontSize={7.5} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748B" 
                  fontSize={9} 
                  fontFamily="JetBrains Mono"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomHistogramTooltip />} />
                <Bar dataKey="Observations" fill="#38BDF8" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Average regional trend */}
        <div className="glass-panel p-6 rounded-2xl border border-brand-border space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-brand-border/30 pb-3 text-brand-cyan select-none">
            <LineIcon className="w-4.5 h-4.5" />
            <h4 className="font-bold text-sm uppercase tracking-wider font-['Outfit'] text-white">Regional Progression Timeline (Daily Mean)</h4>
          </div>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailyAverageTrend}
                margin={{ top: 10, right: 15, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="Date" 
                  stroke="#64748B" 
                  fontSize={8} 
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
                <Tooltip content={<CustomBarTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="Average" 
                  stroke="#22D3EE" 
                  strokeWidth={2.5} 
                  dot={{ fill: '#0B1020', stroke: '#22D3EE', strokeWidth: 1.5, r: 3 }}
                  activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
