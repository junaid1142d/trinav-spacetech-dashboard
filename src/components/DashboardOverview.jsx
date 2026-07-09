import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Eye, Gauge, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { calculateMetrics } from '../services/api';

export default function DashboardOverview({ dataset }) {
  const m = calculateMetrics(dataset);

  const latestObs = dataset?.length
    ? [...dataset].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))[0]
    : null;

  const cards = [
    { title: 'Active Stations', value: m.totalStations, sub: 'Tamil Nadu Network', icon: Radio, accent: '#FFFFFF' },
    { title: 'Total Observations', value: m.totalRecords.toLocaleString(), sub: `${m.dateRange.start} → ${m.dateRange.end}`, icon: Eye, accent: '#22D3EE' },
    { title: 'Average Pressure', value: `${m.avgPressure} hPa`, sub: 'Barometric Mean', icon: Gauge, accent: '#FFFFFF' },
    { title: 'Highest Reading', value: `${m.maxPressure} hPa`, sub: 'Maximum Recorded', icon: TrendingUp, accent: '#EF4444' },
    { title: 'Lowest Reading', value: `${m.minPressure} hPa`, sub: 'Minimum Recorded', icon: TrendingDown, accent: '#22D3EE' },
    {
      title: 'Latest Observation',
      value: latestObs ? `${latestObs.Pressure_hPa} hPa` : '—',
      sub: latestObs ? `${latestObs.City} · ${latestObs.Timestamp.split(' ')[1] || ''}` : 'No data',
      icon: Clock,
      accent: '#A855F7',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 120 }}
            whileHover={{ scale: 1.015 }}
            className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5 flex items-center justify-between hover:border-white/20 transition-colors"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <span className="text-[9px] text-[#525252] uppercase tracking-widest font-mono block">{card.title}</span>
              <p className="text-xl font-bold text-white font-display truncate">{card.value}</p>
              <p className="text-[10px] text-[#525252] truncate font-mono">{card.sub}</p>
            </div>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-4"
              style={{ background: `${card.accent}12`, border: `1px solid ${card.accent}30` }}
            >
              <Icon className="w-5 h-5" style={{ color: card.accent }} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
