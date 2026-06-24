import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ShieldAlert, Cpu, Database, Award, ArrowUpRight, HelpCircle } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DataExplorerPage from './pages/DataExplorerPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { generateMockObservations } from './utils/mockDataLoader';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Global dataset states
  const [rawDataset, setRawDataset] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  
  // Global preferences
  const [pressureThresholds, setPressureThresholds] = useState({ low: 1008, high: 1018 });
  const [pressureUnit, setPressureUnit] = useState('hPa'); // hPa, inHg, mmHg

  // Initialize dataset with default mock observations on load
  useEffect(() => {
    const defaultData = generateMockObservations();
    setRawDataset(defaultData);
  }, []);

  // Utility: Convert Pressure from hPa to selected unit
  const convertPressureValue = (hpa) => {
    if (pressureUnit === 'inHg') return parseFloat((hpa * 0.02953).toFixed(2));
    if (pressureUnit === 'mmHg') return parseFloat((hpa * 0.750062).toFixed(2));
    return hpa; // hPa
  };

  // Convert raw dataset to display dataset matching unit preference
  const displayDataset = useMemo(() => {
    return rawDataset.map(obs => ({
      ...obs,
      Pressure_hPa: convertPressureValue(obs.Pressure_hPa)
    }));
  }, [rawDataset, pressureUnit]);

  // Convert thresholds to match active units for visual calculations
  const displayThresholds = useMemo(() => {
    return {
      low: convertPressureValue(pressureThresholds.low),
      high: convertPressureValue(pressureThresholds.high)
    };
  }, [pressureThresholds, pressureUnit]);

  // Handler: Handle CSV file load
  const handleDataLoaded = (parsedData) => {
    setRawDataset(parsedData);
    setSelectedStation(null); // Reset selection
  };

  // Handler: Factory reset to default Tamil Nadu mock dataset
  const handleResetToDefault = () => {
    const defaultData = generateMockObservations();
    setRawDataset(defaultData);
    setSelectedStation(null);
    setPressureThresholds({ low: 1008, high: 1018 });
    setPressureUnit('hPa');
    alert("System database restored to default Tamil Nadu telemetry logs.");
  };

  // Handler: Download telemetry logs for a specific station
  const handleDownloadStationData = (stationName) => {
    const stationLogs = rawDataset.filter(obs => obs.Station === stationName);
    if (stationLogs.length === 0) return;

    const headers = ['Station', 'City', 'Latitude', 'Longitude', 'Timestamp', 'Pressure_hPa'];
    const csvRows = [headers.join(',')];

    stationLogs.forEach(row => {
      const values = headers.map(header => {
        const val = row[header];
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
    link.setAttribute("download", `${stationName.toLowerCase().replace(/\s+/g, '_')}_telemetry.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Page Router
  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard 
            dataset={displayDataset} 
            onDataLoaded={handleDataLoaded} 
            setActivePage={setActivePage}
          />
        );
      case 'map':
        return (
          <MapPage 
            dataset={displayDataset}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
            onDownloadStationData={handleDownloadStationData}
          />
        );
      case 'analytics':
        return <AnalyticsPage dataset={displayDataset} />;
      case 'explorer':
        return <DataExplorerPage dataset={displayDataset} />;
      case 'settings':
        return (
          <SettingsPage 
            pressureThresholds={pressureThresholds}
            setPressureThresholds={setPressureThresholds}
            pressureUnit={pressureUnit}
            setPressureUnit={setPressureUnit}
            onResetToDefault={handleResetToDefault}
          />
        );
      case 'about':
        return <AboutPage />;
      default:
        return <Dashboard dataset={displayDataset} onDataLoaded={handleDataLoaded} setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex font-sans antialiased text-white selection:bg-brand-cyan/30 selection:text-brand-cyan">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Content Layout Container */}
      <div 
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        
        {/* Global Glassmorphism Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-brand-border bg-brand-navy/80 backdrop-blur-md flex items-center justify-between px-6 select-none">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-brand-textMuted uppercase tracking-widest font-mono">OGC SensorThings Interface</span>
              <h2 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
                Tamil Nadu Barometric Monitoring Console
              </h2>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-dark/50 border border-brand-border/40 rounded-lg text-brand-textSecondary">
              <Database className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Rows: {rawDataset.length.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-dark/50 border border-brand-border/40 rounded-lg text-brand-textSecondary">
              <Cpu className="w-3.5 h-3.5 text-brand-blue" />
              <span>Scale: {pressureUnit}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Viewer Container */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Footer */}
        <footer className="mt-auto border-t border-brand-border bg-brand-darker py-5 px-6 select-none">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-brand-textMuted font-mono">
            <div className="flex items-center gap-4">
              <span>OGC SensorThings Compatible</span>
              <span className="w-1 h-1 rounded-full bg-brand-border"></span>
              <span>Powered by Azure Data Explorer</span>
            </div>
            <div className="text-center md:text-right">
              <span>Developed by <span className="text-brand-cyan">Junaid Ahmed</span></span>
              <span className="mx-2">|</span>
              <span>Trinav Spacetech Atmospheric Monitoring Platform</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
