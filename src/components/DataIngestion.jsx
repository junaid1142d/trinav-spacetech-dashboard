import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, Download, BarChart2 } from 'lucide-react';
import { parseCSVData, validateCSVColumns, calculateMetrics } from '../services/api';

export default function DataIngestion({ onDataLoaded, currentDataset }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Calculate metrics for summary
  const metrics = calculateMetrics(currentDataset);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const processFile = (file) => {
    setError(null);
    setSuccessMsg(null);
    
    if (!file.name.endsWith('.csv')) {
      setError("Unsupported file format. Please upload a valid CSV file (.csv).");
      return;
    }

    setUploading(true);
    setProgress(15);
    
    // Simulate upload progress bar for nice UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    parseCSVData(
      file,
      (percent) => {
        // Handle stream-based progress if needed
      },
      (data) => {
        clearInterval(interval);
        setProgress(100);
        
        setTimeout(() => {
          setUploading(false);
          if (!data || data.length === 0) {
            setError("The CSV file appears to be empty.");
            return;
          }

          // Validate headers from first object keys
          const headers = Object.keys(data[0]);
          const validation = validateCSVColumns(headers);
          
          if (!validation.isValid) {
            setError(`Invalid CSV structure. Missing columns: ${validation.missingFields.join(', ')}`);
            return;
          }

          // Clean and format coordinates and pressure
          const cleanedData = data.map((row, index) => ({
            ...row,
            Latitude: parseFloat(row.Latitude),
            Longitude: parseFloat(row.Longitude),
            Pressure_hPa: parseFloat(row.Pressure_hPa),
            // Ensure unique ID if not present
            id: row.id || `row-${index}-${Date.now()}`
          })).filter(row => 
            !isNaN(row.Latitude) && 
            !isNaN(row.Longitude) && 
            !isNaN(row.Pressure_hPa) && 
            row.Station && 
            row.Timestamp
          );

          if (cleanedData.length === 0) {
            setError("No valid atmospheric data records were found (check latitude, longitude, and pressure values).");
            return;
          }

          onDataLoaded(cleanedData);
          setSuccessMsg(`Successfully parsed ${cleanedData.length} records across ${new Set(cleanedData.map(d=>d.Station)).size} weather stations.`);
        }, 400);
      },
      (err) => {
        clearInterval(interval);
        setUploading(false);
        setError(`CSV Parsing Error: ${err.message || err}`);
      }
    );
  };

  // Generate Sample CSV download URI
  const downloadSampleTemplate = () => {
    const sampleCSV = `Station,City,Latitude,Longitude,Timestamp,Pressure_hPa
Chennai Atmospheric Monitoring Station,Chennai,13.0827,80.2707,2026-06-16 08:00:00,1008.11
Coimbatore High-Altitude Center,Coimbatore,11.0168,76.9558,2026-06-16 08:00:00,1012.30
Ooty Mountain Station,Ooty,11.4102,76.6950,2026-06-16 08:00:00,994.45
Madurai Weather Lab,Madurai,9.9252,78.1198,2026-06-16 08:00:00,1015.10
Kanyakumari Coast Tracker,Kanyakumari,8.0883,77.5385,2026-06-16 08:00:00,1019.20
Chennai Atmospheric Monitoring Station,Chennai,13.0827,80.2707,2026-06-16 12:00:00,1007.45
Coimbatore High-Altitude Center,Coimbatore,11.0168,76.9558,2026-06-16 12:00:00,1011.90
Ooty Mountain Station,Ooty,11.4102,76.6950,2026-06-16 12:00:00,993.80
Madurai Weather Lab,Madurai,9.9252,78.1198,2026-06-16 12:00:00,1014.20
Kanyakumari Coast Tracker,Kanyakumari,8.0883,77.5385,2026-06-16 12:00:00,1018.60`;

    const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "trinav_atmospheric_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* CSV Upload Dropzone */}
        <div className="flex-1">
          <form 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onSubmit={(e) => e.preventDefault()}
            className={`relative glass-panel rounded-2xl p-8 border-2 border-dashed flex flex-col items-center justify-center min-h-[220px] transition-all duration-300 ${
              dragActive 
                ? 'border-brand-cyan bg-brand-cyan/10 shadow-cyan-glow-lg scale-[1.01]' 
                : 'border-brand-border hover:border-brand-cyan/40 hover:bg-white/5'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept=".csv"
              onChange={handleChange}
            />

            {uploading ? (
              <div className="w-full flex flex-col items-center py-4">
                <div className="w-12 h-12 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin mb-4"></div>
                <p className="text-white text-sm font-semibold mb-2">Ingesting Atmospheric Observations...</p>
                <div className="w-4/5 bg-brand-dark/60 rounded-full h-2 overflow-hidden border border-brand-border">
                  <div 
                    className="bg-gradient-to-r from-brand-cyan to-brand-blue h-full rounded-full transition-all duration-200" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-brand-textSecondary mt-2 font-mono">{progress}%</span>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-brand-slate flex items-center justify-center border border-brand-cyan/30 text-brand-cyan mb-4 shadow-cyan-glow">
                  <Upload className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-white text-base font-bold mb-1 font-['Outfit']">Drag and drop your atmospheric dataset</h4>
                <p className="text-brand-textSecondary text-xs mb-4">CSV file containing Station, City, Latitude, Longitude, Timestamp, Pressure_hPa</p>
                
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={triggerFileInput}
                    className="px-5 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/80 text-brand-navy font-bold text-xs flex items-center gap-2 transition-all shadow-cyan-glow"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Select CSV File
                  </button>
                  <button 
                    type="button"
                    onClick={downloadSampleTemplate}
                    className="px-4 py-2.5 rounded-xl border border-brand-border bg-brand-dark/40 hover:bg-brand-slate text-brand-textSecondary hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Template
                  </button>
                </div>
              </div>
            )}
          </form>
          
          {/* Notifications */}
          {error && (
            <div className="mt-3 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4.5 h-4.5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Dataset Ingestion Refused:</span> {error}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Dataset Verified:</span> {successMsg}
              </div>
            </div>
          )}
        </div>

        {/* Dataset Summary Cards */}
        <div className="w-full md:w-[320px] flex flex-col justify-between glass-panel p-5 rounded-2xl border border-brand-border">
          <div>
            <h5 className="text-white text-xs font-bold uppercase tracking-wider font-mono border-b border-brand-border pb-3 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-brand-cyan" />
              Active Dataset Profile
            </h5>
            
            <div className="space-y-3.5 py-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-textSecondary">Total Observations</span>
                <span className="font-mono font-bold text-white bg-brand-dark/60 border border-brand-border px-2 py-0.5 rounded">
                  {metrics.totalRecords.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-textSecondary">Active Weather Stations</span>
                <span className="font-mono font-bold text-white bg-brand-dark/60 border border-brand-border px-2 py-0.5 rounded">
                  {metrics.totalStations}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-textSecondary">Temporal Span</span>
                <span className="font-mono text-brand-cyan text-[11px] text-right truncate max-w-[170px]" title={`${metrics.dateRange.start} to ${metrics.dateRange.end}`}>
                  {metrics.dateRange.start} <ArrowRight className="inline w-3 h-3 mx-0.5" /> {metrics.dateRange.end}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-textSecondary">Mean Barometric Value</span>
                <span className="font-mono font-bold text-brand-blue">
                  {metrics.avgPressure} hPa
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-[10px] text-brand-textMuted border-t border-brand-border/40 pt-3 font-mono leading-relaxed select-none">
            Upload custom CSV telemetry logs using the standard headers format to dynamically override these parameters.
          </div>
        </div>
      </div>
    </div>
  );
}
