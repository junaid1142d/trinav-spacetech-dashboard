import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

export default function DataTable({ dataset }) {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [station, setStation] = useState('');
  const [sortField, setSortField] = useState('Timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const options = useMemo(() => {
    const cities = [...new Set(dataset.map(d => d.City))].sort();
    const stations = [...new Set(dataset.map(d => d.Station))].sort();
    return { cities, stations };
  }, [dataset]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('desc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    return dataset
      .filter(item => {
        const s = search.toLowerCase();
        return (
          (!s || item.Station.toLowerCase().includes(s) || item.City.toLowerCase().includes(s) || String(item.Pressure_hPa).includes(s)) &&
          (!city || item.City === city) &&
          (!station || item.Station === station)
        );
      })
      .sort((a, b) => {
        let av = a[sortField], bv = b[sortField];
        if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
        if (av < bv) return sortOrder === 'asc' ? -1 : 1;
        if (av > bv) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [dataset, search, city, station, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = ['Station', 'City', 'Latitude', 'Longitude', 'Timestamp', 'Pressure_hPa'];
    const rows = [headers.join(','), ...filtered.map(r =>
      headers.map(h => {
        const v = r[h];
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
      }).join(',')
    )];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `trinav_export_${Date.now()}.csv`;
    a.click();
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-0.5" /> : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
  };

  const getPressureColor = (p) => {
    if (p < 1008) return '#22D3EE';
    if (p > 1018) return '#EF4444';
    return '#EAB308';
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-white/[0.06] flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#737373]" />
          <span className="text-sm font-semibold text-white">Observations Ledger</span>
          <span className="text-[10px] text-[#525252] font-mono ml-1">({filtered.length.toLocaleString()} records)</span>
        </div>
        <div className="flex flex-wrap gap-2 flex-1 lg:justify-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#525252]" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-3 py-1.5 bg-[#111] border border-white/[0.08] hover:border-white/20 focus:border-white/30 rounded-lg text-xs text-white placeholder-[#525252] font-mono outline-none transition-colors w-40"
            />
          </div>
          <select
            value={city}
            onChange={e => { setCity(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-[#111] border border-white/[0.08] rounded-lg text-xs text-white font-mono outline-none cursor-pointer hover:border-white/20 transition-colors appearance-none w-28"
          >
            <option value="">All Cities</option>
            {options.cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={station}
            onChange={e => { setStation(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-[#111] border border-white/[0.08] rounded-lg text-xs text-white font-mono outline-none cursor-pointer hover:border-white/20 transition-colors appearance-none w-40"
          >
            <option value="">All Stations</option>
            {options.stations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={exportCSV}
            disabled={!filtered.length}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg disabled:opacity-30 hover:bg-white/90 transition-colors"
          >
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.06] text-[#525252] uppercase tracking-wider text-[9px]">
              {[
                { label: 'Station', field: 'Station' },
                { label: 'City', field: 'City' },
                { label: 'Pressure', field: 'Pressure_hPa' },
                { label: 'Timestamp', field: 'Timestamp' },
              ].map(col => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className="px-4 py-3 text-left cursor-pointer hover:text-white transition-colors select-none"
                >
                  {col.label} <SortIcon field={col.field} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[#525252]">No records match your query.</td>
              </tr>
            ) : paginated.map((item, i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-2.5 text-white font-sans font-medium text-[11px] max-w-[240px] truncate">{item.Station}</td>
                <td className="px-4 py-2.5 text-[#737373]">{item.City}</td>
                <td className="px-4 py-2.5 font-bold" style={{ color: getPressureColor(item.Pressure_hPa) }}>
                  {Number(item.Pressure_hPa).toFixed(2)}
                </td>
                <td className="px-4 py-2.5 text-[#525252]">{item.Timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono">
        <span className="text-[#525252]">
          {filtered.length ? `${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}` : '0 records'}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-1 rounded border border-white/[0.08] text-[#737373] hover:text-white disabled:opacity-30 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-white">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-1 rounded border border-white/[0.08] text-[#737373] hover:text-white disabled:opacity-30 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
