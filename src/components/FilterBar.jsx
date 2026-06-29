import { memo } from 'react';
import { ArrowDownUp, Gauge } from 'lucide-react';

function FilterBar({ sortBy, setSortBy, pressureBand, setPressureBand }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-300">
        <ArrowDownUp size={17} className="text-zinc-500" />
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="w-full bg-transparent text-white outline-none"
        >
          <option className="bg-zinc-950" value="station">Station</option>
          <option className="bg-zinc-950" value="city">City</option>
          <option className="bg-zinc-950" value="pressure-desc">Pressure high to low</option>
          <option className="bg-zinc-950" value="pressure-asc">Pressure low to high</option>
        </select>
      </label>
      <label className="flex h-11 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-zinc-300">
        <Gauge size={17} className="text-zinc-500" />
        <select
          value={pressureBand}
          onChange={(event) => setPressureBand(event.target.value)}
          className="w-full bg-transparent text-white outline-none"
        >
          <option className="bg-zinc-950" value="all">All pressure bands</option>
          <option className="bg-zinc-950" value="high">High pressure</option>
          <option className="bg-zinc-950" value="normal">Normal pressure</option>
          <option className="bg-zinc-950" value="low">Low pressure</option>
        </select>
      </label>
    </div>
  );
}

export default memo(FilterBar);
