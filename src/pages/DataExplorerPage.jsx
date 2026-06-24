import React from 'react';
import { Database, HelpCircle, HardDriveDownload } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function DataExplorerPage({ dataset }) {
  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-brand-navy/60 px-6 py-4 border border-brand-border/40 rounded-2xl">
        <div>
          <span className="text-[10px] text-brand-textMuted uppercase font-mono tracking-wider block">DATA EXPLORER WORKBENCH</span>
          <h2 className="text-xl font-extrabold text-white font-['Outfit']">Telemetry Search & Query</h2>
        </div>
        <div className="w-9 h-9 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan shadow-cyan-glow">
          <Database className="w-5 h-5" />
        </div>
      </div>

      {/* Helper Context Panel */}
      <div className="p-4 rounded-xl bg-brand-dark/40 border border-brand-border/20 text-xs flex gap-3 items-start select-none">
        <HelpCircle className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-semibold text-white">How to query the ADX / SensorThings ledger:</h5>
          <p className="text-brand-textSecondary leading-relaxed">
            Use the text search field to filter by specific Station tags or City names, and refine results by selecting standard jurisdiction parameters. All queries are resolved client-side in the current CSV model sandbox and are ready to map to Azure Data Explorer KQL clusters.
          </p>
        </div>
      </div>

      {/* Main Ledger Table */}
      <DataTable dataset={dataset} />
    </div>
  );
}
