import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Download, BarChart2, ArrowRight } from 'lucide-react';
import { parseCSVData, validateCSVColumns, calculateMetrics } from '../services/api';

export default function DataIngestion({ onDataLoaded, currentDataset }) {
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const inputRef = useRef(null);
  const metrics = calculateMetrics(currentDataset);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDrag(e.type === 'dragenter' || e.type === 'dragover');
  };

  const processFile = (file) => {
    setError(null); setSuccess(null);
    if (!file.name.endsWith('.csv')) { setError('Only .csv files are supported.'); return; }
    setUploading(true); setProgress(20);
    const interval = setInterval(() => setProgress(p => p < 85 ? p + 20 : p), 200);
    parseCSVData(
      file,
      (data) => {
        clearInterval(interval); setProgress(100);
        setTimeout(() => {
          setUploading(false);
          if (!data?.length) { setError('The CSV file is empty.'); return; }
          const validation = validateCSVColumns(Object.keys(data[0]));
          if (!validation.isValid) { setError(`Missing columns: ${validation.missingFields.join(', ')}`); return; }
          const clean = data.map((r, idx) => ({
            ...r, Latitude: parseFloat(r.Latitude), Longitude: parseFloat(r.Longitude),
            Pressure_hPa: parseFloat(r.Pressure_hPa), id: `row-${idx}`,
          })).filter(r => !isNaN(r.Latitude) && !isNaN(r.Longitude) && !isNaN(r.Pressure_hPa) && r.Station && r.Timestamp);
          if (!clean.length) { setError('No valid records found after parsing.'); return; }
          onDataLoaded(clean);
          setSuccess(`Loaded ${clean.length} records from ${new Set(clean.map(d => d.Station)).size} stations.`);
        }, 300);
      },
      (err) => { clearInterval(interval); setUploading(false); setError(`Parse error: ${err.message}`); }
    );
  };

  const downloadTemplate = () => {
    const csv = `Station,City,Latitude,Longitude,Timestamp,Pressure_hPa
Chennai Atmospheric Monitoring Station,Chennai,13.0827,80.2707,2026-06-16 08:00:00,1008.11
Coimbatore High-Altitude Center,Coimbatore,11.0168,76.9558,2026-06-16 08:00:00,1012.30`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'trinav_template.csv'; a.click();
  };

  return (
    <div className="flex flex-col md:flex-row gap-5">
      {/* Drop zone */}
      <div className="flex-1">
        <form
          onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={e => { e.preventDefault(); setDrag(false); }}
          onDrop={e => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); }}
          onSubmit={e => e.preventDefault()}
          className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center min-h-[180px] transition-all duration-200 cursor-pointer
            ${drag ? 'border-[#22D3EE] bg-[#22D3EE]/5' : 'border-white/10 hover:border-white/25 bg-[#0A0A0A]'}`}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => { if (e.target.files[0]) processFile(e.target.files[0]); e.target.value = ''; }} />
          {uploading ? (
            <div className="w-full flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#22D3EE]/20 border-t-[#22D3EE] rounded-full animate-spin" />
              <p className="text-white text-sm font-medium">Parsing CSV data...</p>
              <div className="w-3/4 bg-[#111] rounded-full h-1 overflow-hidden border border-white/5">
                <div className="bg-[#22D3EE] h-full rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-[#525252] font-mono">{progress}%</span>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#737373]">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm mb-1">Drop your atmospheric dataset here</p>
                <p className="text-[#525252] text-[11px] font-mono">Station · City · Latitude · Longitude · Timestamp · Pressure_hPa</p>
              </div>
              <div className="flex gap-2 mt-1" onClick={e => e.stopPropagation()}>
                <button type="button" onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Select File
                </button>
                <button type="button" onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-2 border border-white/15 text-[#737373] hover:text-white text-xs font-semibold rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" /> Template
                </button>
              </div>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-2.5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-950/30 border border-red-500/20 text-[11px] text-red-300 font-mono">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mt-2.5 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Summary panel */}
      <div className="w-full md:w-72 bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06] mb-4">
            <BarChart2 className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span className="text-[10px] font-mono text-[#737373] uppercase tracking-wider">Dataset Profile</span>
          </div>
          <div className="space-y-3 text-[11px] font-mono">
            {[
              ['Observations', metrics.totalRecords.toLocaleString()],
              ['Stations', metrics.totalStations],
              ['Mean Pressure', `${metrics.avgPressure} hPa`],
              ['Date Range', `${metrics.dateRange.start}`, <ArrowRight className="inline w-3 h-3 mx-0.5 text-[#525252]" />, metrics.dateRange.end],
            ].map(([label, ...vals]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-[#525252]">{label}</span>
                <span className="text-white font-semibold">{vals}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[9px] text-[#404040] font-mono mt-4 pt-3 border-t border-white/[0.04] leading-relaxed">
          Upload a CSV file using the standard column headers to populate the platform with custom telemetry data.
        </p>
      </div>
    </div>
  );
}
