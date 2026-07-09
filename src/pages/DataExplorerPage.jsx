import React from 'react';
import { Database } from 'lucide-react';
import DataTable from '../components/DataTable';

export default function DataExplorerPage({ dataset }) {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Query Workbench</p>
          <h2 className="text-xl font-bold text-white font-display">Data Explorer</h2>
        </div>
        <Database className="w-5 h-5 text-[#22D3EE]" />
      </div>
      <div className="px-4 py-3 bg-[#0A0A0A] border border-white/[0.06] rounded-xl text-[11px] text-[#525252] font-mono leading-relaxed">
        All queries resolve client-side from the active CSV dataset. Filtering, sorting, and exports are performed in-browser.
        The service layer is pre-wired for Azure Data Explorer KQL cluster integration.
      </div>
      <DataTable dataset={dataset} />
    </div>
  );
}
