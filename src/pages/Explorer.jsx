import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { useCSVLoader } from '../hooks/useCSVLoader.js';
import { exportRowsToCsv } from '../utils/exportCsv.js';
import { formatDateTime, formatPressure } from '../utils/format.js';

const pageSize = 12;

export default function Explorer() {
  const { loading, timeseries } = useCSVLoader();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('timestamp-desc');
  const [pressureBand, setPressureBand] = useState('all');
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return timeseries
      .filter((row) => {
        const matchesQuery =
          !normalizedQuery || `${row.station} ${row.city}`.toLowerCase().includes(normalizedQuery);
        const matchesBand =
          pressureBand === 'all' ||
          (pressureBand === 'high' && row.pressure >= 1013) ||
          (pressureBand === 'normal' && row.pressure >= 1008 && row.pressure < 1013) ||
          (pressureBand === 'low' && row.pressure < 1008);
        return matchesQuery && matchesBand;
      })
      .sort((a, b) => {
        if (sortBy === 'timestamp-asc') return a.timestampMs - b.timestampMs;
        if (sortBy === 'pressure-desc') return b.pressure - a.pressure;
        if (sortBy === 'pressure-asc') return a.pressure - b.pressure;
        return b.timestampMs - a.timestampMs;
      });
  }, [timeseries, query, sortBy, pressureBand]);

  const pageCount = Math.max(Math.ceil(rows.length / pageSize), 1);
  const safePage = Math.min(page, pageCount);
  const visibleRows = rows.slice((safePage - 1) * pageSize, safePage * pageSize);

  if (loading) return <LoadingScreen />;

  const exportRows = () =>
    exportRowsToCsv(
      'trINAV-pressure-explorer.csv',
      rows.map((row) => ({
        Station: row.station,
        City: row.city,
        Latitude: row.latitude,
        Longitude: row.longitude,
        Timestamp: row.timestamp,
        Pressure_hPa: row.pressure,
      })),
    );

  return (
    <>
      <section className="glass-panel rounded-lg p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Data explorer</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Observation records</h1>
        <p className="mt-2 max-w-3xl text-zinc-400">
          Search, filter, sort, paginate, and export CSV-backed pressure observations.
        </p>
      </section>

      <section className="glass-panel rounded-lg p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
          <SearchBar value={query} onChange={(value) => { setQuery(value); setPage(1); }} placeholder="Search station or city" />
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none">
            <option className="bg-zinc-950" value="timestamp-desc">Newest first</option>
            <option className="bg-zinc-950" value="timestamp-asc">Oldest first</option>
            <option className="bg-zinc-950" value="pressure-desc">Pressure high to low</option>
            <option className="bg-zinc-950" value="pressure-asc">Pressure low to high</option>
          </select>
          <select value={pressureBand} onChange={(event) => { setPressureBand(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none">
            <option className="bg-zinc-950" value="all">All bands</option>
            <option className="bg-zinc-950" value="high">High</option>
            <option className="bg-zinc-950" value="normal">Normal</option>
            <option className="bg-zinc-950" value="low">Low</option>
          </select>
          <button type="button" onClick={exportRows} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-zinc-200">
            <Download size={17} />
            Export
          </button>
        </div>
      </section>

      <section className="glass-panel overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.04] text-xs uppercase tracking-[0.18em] text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Station</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Latitude</th>
                <th className="px-4 py-3 font-medium">Longitude</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Pressure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {visibleRows.map((row) => (
                <tr key={`${row.id}-${row.timestamp}-${row.sourceIndex}`} className="hover:bg-white/[0.04]">
                  <td className="px-4 py-4 font-medium text-white">{row.station}</td>
                  <td className="px-4 py-4 text-zinc-300">{row.city}</td>
                  <td className="px-4 py-4 text-zinc-400">{row.latitude.toFixed(4)}</td>
                  <td className="px-4 py-4 text-zinc-400">{row.longitude.toFixed(4)}</td>
                  <td className="px-4 py-4 text-zinc-300">{formatDateTime(row.timestamp)}</td>
                  <td className="px-4 py-4 text-white">{formatPressure(row.pressure)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-500">
            Showing {visibleRows.length} of {rows.length} records
          </p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={safePage <= 1} onClick={() => setPage((value) => Math.max(value - 1, 1))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">
              Previous
            </button>
            <span className="px-2 text-sm text-zinc-400">
              Page {safePage} / {pageCount}
            </span>
            <button type="button" disabled={safePage >= pageCount} onClick={() => setPage((value) => Math.min(value + 1, pageCount))} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
