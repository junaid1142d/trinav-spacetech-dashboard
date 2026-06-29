import { memo } from 'react';
import { formatPressure } from '../utils/format.js';

function StatisticsCard({ title, station }) {
  const items = [
    ['Current', station ? formatPressure(station.current) : '--'],
    ['Average', station ? formatPressure(station.average) : '--'],
    ['Maximum', station ? formatPressure(station.max) : '--'],
    ['Minimum', station ? formatPressure(station.min) : '--'],
  ];

  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(StatisticsCard);
