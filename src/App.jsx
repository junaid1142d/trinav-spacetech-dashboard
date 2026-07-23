import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Cpu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import OGCViewerPage from './pages/OGCViewerPage';
import AboutPage from './pages/AboutPage';
import { generateMockObservations } from './utils/mockDataLoader';

const LINKEDIN = 'https://www.linkedin.com/in/junaid-ahmed-442025280/';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rawDataset, setRawDataset] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [pressureUnit] = useState('hPa');

  useEffect(() => { setRawDataset(generateMockObservations()); }, []);

  const convertPressure = useCallback((hpa) => {
    if (pressureUnit === 'inHg') return parseFloat((hpa * 0.02953).toFixed(2));
    if (pressureUnit === 'mmHg') return parseFloat((hpa * 0.750062).toFixed(2));
    return hpa;
  }, [pressureUnit]);

  const displayDataset = useMemo(() =>
    rawDataset.map(obs => ({ ...obs, Pressure_hPa: convertPressure(obs.Pressure_hPa) })),
    [rawDataset, convertPressure]
  );

  const handleDataLoaded = (data) => { setRawDataset(data); setSelectedStation(null); };

  const handleDownloadStation = (stationName) => {
    const logs = rawDataset.filter(o => o.Station === stationName);
    if (!logs.length) return;
    const headers = ['Station', 'City', 'Latitude', 'Longitude', 'Timestamp', 'Pressure_hPa'];
    const rows = [headers.join(','), ...logs.map(r => headers.map(h => { const v = r[h]; return typeof v === 'string' && v.includes(',') ? `"${v}"` : v; }).join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
    a.download = `${stationName.replace(/\s+/g, '_').toLowerCase()}_telemetry.csv`;
    a.click();
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard dataset={displayDataset} onDataLoaded={handleDataLoaded} setActivePage={setActivePage} />;
      case 'map': return <MapPage dataset={displayDataset} selectedStation={selectedStation} setSelectedStation={setSelectedStation} onDownloadStationData={handleDownloadStation} />;
      case 'ogc': return <OGCViewerPage />;
      case 'about': return <AboutPage />;
      default: return <Dashboard dataset={displayDataset} onDataLoaded={handleDataLoaded} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-black flex font-sans antialiased text-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'pl-60' : 'pl-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-black/90 backdrop-blur-lg flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            <div>
              <p className="text-[8px] text-[#404040] font-mono uppercase tracking-widest">OGC SensorThings</p>
              <p className="text-[11px] font-semibold text-[#D4D4D4]">Tamil Nadu Atmospheric Console</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111] border border-white/[0.06] rounded-md text-[#525252]">
              <Database className="w-3 h-3 text-[#22D3EE]" />{rawDataset.length.toLocaleString()} rows
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111] border border-white/[0.06] rounded-md text-[#525252]">
              <Cpu className="w-3 h-3 text-[#737373]" />{pressureUnit}
            </span>
            <span className="text-[9px] text-[#404040]">
              by <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="linkedin-link">Junaid Ahmed</a>
            </span>
          </div>
        </header>

        {/* Main */}
        <main className={`flex-1 ${activePage === 'ogc' ? '' : 'p-5 md:p-6 max-w-[1500px] mx-auto w-full'}`}>
          <AnimatePresence mode="wait">
            <motion.div key={activePage} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}
              className={activePage === 'ogc' ? 'h-full' : ''}>
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer - hidden on OGC page */}
        {activePage !== 'ogc' && (
          <footer className="mt-auto border-t border-white/[0.04] bg-black py-4 px-6">
            <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-[9px] text-[#404040] font-mono">
              <div className="flex items-center gap-3">
                <span>OGC SensorThings Compatible</span>
                <span className="w-1 h-1 rounded-full bg-[#252525]" />
                <span>Powered by Azure Data Explorer</span>
              </div>
              <div>
                Developed by{' '}
                <a href={LINKEDIN} target="_blank" rel="noopener noreferrer" className="linkedin-link">Junaid Ahmed ↗</a>
                <span className="mx-2 text-[#252525]">|</span>
                <span>Trinav Spacetech © 2026</span>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
