import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Eye, Gauge, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { calculateMetrics } from '../services/api';

export default function DashboardOverview({ dataset }) {
  const metrics = calculateMetrics(dataset);

  // Find the latest observation
  let latestObs = null;
  if (dataset && dataset.length > 0) {
    latestObs = [...dataset].sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp))[0];
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const cards = [
    {
      title: "Total Stations",
      value: metrics.totalStations,
      subtext: "Tamil Nadu Network",
      icon: Radio,
      color: "from-brand-cyan to-brand-blue",
      glowColor: "rgba(34, 211, 238, 0.2)",
    },
    {
      title: "Total Observations",
      value: metrics.totalRecords.toLocaleString(),
      subtext: `Date Span: ${metrics.dateRange.start} to ${metrics.dateRange.end}`,
      icon: Eye,
      color: "from-blue-500 to-indigo-500",
      glowColor: "rgba(59, 130, 246, 0.15)",
    },
    {
      title: "Average Pressure",
      value: `${metrics.avgPressure} hPa`,
      subtext: "Barometric Mean",
      icon: Gauge,
      color: "from-teal-500 to-brand-cyan",
      glowColor: "rgba(20, 184, 166, 0.15)",
    },
    {
      title: "Highest Pressure",
      value: `${metrics.maxPressure} hPa`,
      subtext: "Maximum recorded",
      icon: TrendingUp,
      color: "from-red-500 to-rose-600",
      glowColor: "rgba(239, 68, 68, 0.15)",
    },
    {
      title: "Lowest Pressure",
      value: `${metrics.minPressure} hPa`,
      subtext: "Minimum recorded",
      icon: TrendingDown,
      color: "from-blue-600 to-sky-400",
      glowColor: "rgba(37, 99, 235, 0.15)",
    },
    {
      title: "Latest Observation",
      value: latestObs ? `${latestObs.Pressure_hPa} hPa` : '-',
      subtext: latestObs ? `${latestObs.Station.split(' ')[0]} - ${latestObs.Timestamp.split(' ')[1] || latestObs.Timestamp}` : 'No records loaded',
      icon: Clock,
      color: "from-purple-500 to-brand-blue",
      glowColor: "rgba(168, 85, 247, 0.15)",
    }
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="relative overflow-hidden glass-panel p-5 rounded-2xl border border-brand-border flex items-center justify-between"
            style={{ 
              boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.3), 0 0 15px ${card.glowColor}`
            }}
          >
            {/* Background Gradient Spot */}
            <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-tr ${card.color} opacity-[0.04] blur-xl`} />

            <div className="space-y-2 select-none">
              <span className="text-brand-textSecondary text-xs font-semibold uppercase tracking-wider font-mono block">
                {card.title}
              </span>
              <h3 className="text-2xl font-extrabold text-white tracking-tight font-['Outfit']">
                {card.value}
              </h3>
              <p className="text-brand-textMuted text-[10px] truncate max-w-[190px]">
                {card.subtext}
              </p>
            </div>

            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} p-[1px] flex items-center justify-center shadow-lg`}>
              <div className="w-full h-full rounded-[11px] bg-brand-navy flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
