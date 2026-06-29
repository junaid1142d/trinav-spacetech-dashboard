import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { formatDateTime, formatPressure, trendLabel } from '../utils/format.js';

function StationTable({ stations }) {
  return (
    <div className="glass-panel overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-zinc-500">
            <tr>
              <th className="px-4 py-3 font-medium">Station</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Pressure</th>
              <th className="px-4 py-3 font-medium">Trend</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Analytics</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {stations.map((station) => (
              <tr key={station.id} className="transition hover:bg-white/[0.04]">
                <td className="px-4 py-4 font-medium text-white">{station.station}</td>
                <td className="px-4 py-4 text-zinc-300">{station.city}</td>
                <td className="px-4 py-4 text-white">{formatPressure(station.current)}</td>
                <td className="px-4 py-4 text-zinc-300">{trendLabel(station.trend)}</td>
                <td className="px-4 py-4 text-zinc-400">{formatDateTime(station.timestamp)}</td>
                <td className="px-4 py-4">
                  <Link
                    to={`/analytics?station=${station.id}`}
                    className="inline-grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
                    title={`Open ${station.station} analytics`}
                  >
                    <BarChart3 size={17} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(StationTable);
