import { memo } from 'react';
import { X } from 'lucide-react';
import { formatCoordinate, formatDateTime, formatPressure, trendLabel } from '../utils/format.js';
import StatisticsCard from './StatisticsCard.jsx';
import TimeSeriesChart from './TimeSeriesChart.jsx';

function StationDrawer({ station, series, onClose }) {
  if (!station) return null;

  return (
    <aside className="fixed inset-y-0 right-0 z-[850] w-full max-w-xl overflow-y-auto border-l border-white/10 bg-black/92 p-5 backdrop-blur-2xl sm:p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">Analytics panel</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{station.station}</h2>
          <p className="text-zinc-400">{station.city}</p>
        </div>
        <button
          type="button"
          aria-label="Close station drawer"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/5 text-white"
        >
          <X size={18} />
        </button>
      </div>
      <dl className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-zinc-500">Current</dt>
          <dd className="font-semibold text-white">{formatPressure(station.current)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Trend</dt>
          <dd className="font-semibold text-white">{trendLabel(station.trend)} ({station.trend.toFixed(2)} hPa)</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Updated</dt>
          <dd className="text-right font-semibold text-white">{formatDateTime(station.timestamp)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-zinc-500">Coordinates</dt>
          <dd className="font-semibold text-white">
            {formatCoordinate(station.latitude)}, {formatCoordinate(station.longitude)}
          </dd>
        </div>
      </dl>
      <div className="grid gap-5">
        <StatisticsCard title="Station pressure envelope" station={station} />
        <TimeSeriesChart data={series} title="Pressure vs Time" />
      </div>
    </aside>
  );
}

export default memo(StationDrawer);
