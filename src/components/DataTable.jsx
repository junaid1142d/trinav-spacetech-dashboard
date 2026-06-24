import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';

export default function DataTable({ dataset }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [sortField, setSortField] = useState('Timestamp');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get unique lists for dropdown filters
  const filterOptions = useMemo(() => {
    const cities = new Set();
    const stations = new Set();
    
    dataset.forEach(d => {
      if (d.City) cities.add(d.City);
      if (d.Station) stations.add(d.Station);
    });

    return {
      cities: Array.from(cities).sort(),
      stations: Array.from(stations).sort()
    };
  }, [dataset]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new fields
    }
    setCurrentPage(1);
  };

  // Filter & Search dataset
  const filteredData = useMemo(() => {
    return dataset.filter(item => {
      const matchSearch = 
        item.Station.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.City.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Pressure_hPa.toString().includes(searchTerm) ||
        item.Timestamp.includes(searchTerm);
      
      const matchCity = !selectedCity || item.City === selectedCity;
      const matchStation = !selectedStation || item.Station === selectedStation;

      return matchSearch && matchCity && matchStation;
    }).sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle numbers vs strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [dataset, searchTerm, selectedCity, selectedStation, sortField, sortOrder]);

  // Pagination Logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Export current filtered rows as CSV
  const handleExportCSV = () => {
    if (filteredData.length === 0) return;

    const headers = ['Station', 'City', 'Latitude', 'Longitude', 'Timestamp', 'Pressure_hPa'];
    const csvRows = [headers.join(',')];

    filteredData.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
        // Wrap strings containing commas in quotes
        if (typeof val === 'string' && val.includes(',')) {
          return `"${val}"`;
        }
        return val;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `trinav_filtered_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" /> : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />;
  };

  return (
    <div className="glass-panel p-5 rounded-2xl border border-brand-border space-y-4">
      {/* Table Filters header */}
      <div className="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
        <h4 className="text-sm font-bold text-white font-['Outfit'] uppercase tracking-wider select-none flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-brand-cyan" />
          Observations Ledger
        </h4>

        {/* Filter controls panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 flex-1 xl:max-w-4xl xl:justify-end">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-brand-textMuted" />
            <input
              type="text"
              placeholder="Search station, city..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-brand-dark/60 border border-brand-border/60 hover:border-brand-cyan/40 focus:border-brand-cyan focus:ring-0 rounded-xl text-xs text-white placeholder-brand-textMuted font-mono transition-all"
            />
          </div>

          {/* City dropdown */}
          <div>
            <select
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-brand-dark/60 border border-brand-border/60 hover:border-brand-cyan/40 focus:border-brand-cyan focus:ring-0 rounded-xl text-xs text-white font-mono transition-all appearance-none cursor-pointer"
            >
              <option value="">All Cities</option>
              {filterOptions.cities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Station dropdown */}
          <div>
            <select
              value={selectedStation}
              onChange={(e) => { setSelectedStation(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-brand-dark/60 border border-brand-border/60 hover:border-brand-cyan/40 focus:border-brand-cyan focus:ring-0 rounded-xl text-xs text-white font-mono transition-all appearance-none cursor-pointer truncate"
            >
              <option value="">All Stations</option>
              {filterOptions.stations.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="w-full py-2 bg-brand-cyan/15 hover:bg-brand-cyan hover:text-brand-navy border border-brand-cyan/40 hover:border-brand-cyan disabled:opacity-40 disabled:hover:bg-brand-cyan/15 disabled:hover:text-brand-cyan text-brand-cyan font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredData.length})
          </button>
        </div>
      </div>

      {/* Responsive Ledger Grid */}
      <div className="overflow-x-auto rounded-xl border border-brand-border/40">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-brand-dark/80 text-brand-textSecondary border-b border-brand-border/60 select-none">
              <th 
                onClick={() => handleSort('Station')} 
                className="p-3.5 cursor-pointer hover:bg-white/5 transition-colors font-semibold"
              >
                Station <SortIndicator field="Station" />
              </th>
              <th 
                onClick={() => handleSort('City')} 
                className="p-3.5 cursor-pointer hover:bg-white/5 transition-colors font-semibold w-[150px]"
              >
                City <SortIndicator field="City" />
              </th>
              <th 
                onClick={() => handleSort('Pressure_hPa')} 
                className="p-3.5 cursor-pointer hover:bg-white/5 transition-colors font-semibold w-[150px]"
              >
                Pressure (hPa) <SortIndicator field="Pressure_hPa" />
              </th>
              <th 
                onClick={() => handleSort('Timestamp')} 
                className="p-3.5 cursor-pointer hover:bg-white/5 transition-colors font-semibold w-[180px]"
              >
                Timestamp <SortIndicator field="Timestamp" />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-brand-textMuted bg-brand-dark/10">
                  No records match your query filters.
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr 
                  key={item.id || index}
                  className="border-b border-brand-border/30 hover:bg-white/5 transition-colors text-white"
                >
                  <td className="p-3.5 font-sans font-medium text-white max-w-[280px] truncate">{item.Station}</td>
                  <td className="p-3.5 text-brand-textSecondary">{item.City}</td>
                  <td className="p-3.5 font-bold text-brand-cyan">{item.Pressure_hPa.toFixed(2)}</td>
                  <td className="p-3.5 text-brand-textSecondary">{item.Timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between text-xs select-none">
        <span className="text-brand-textMuted font-mono">
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} records
        </span>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-brand-border bg-brand-dark/40 text-brand-textSecondary hover:text-white disabled:opacity-40 disabled:hover:text-brand-textSecondary transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center font-mono font-semibold">
            <span className="text-brand-cyan bg-brand-cyan/10 px-2.5 py-1 rounded-lg border border-brand-cyan/30">
              {currentPage}
            </span>
            <span className="mx-2 text-brand-textMuted">/</span>
            <span className="text-white px-2 py-1">
              {totalPages}
            </span>
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-brand-border bg-brand-dark/40 text-brand-textSecondary hover:text-white disabled:opacity-40 disabled:hover:text-brand-textSecondary transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
