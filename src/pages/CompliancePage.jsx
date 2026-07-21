import React from 'react';
import { ClipboardCheck, CheckCircle2, Info, Server, Map, Database } from 'lucide-react';

const implemented = [
  ['WMS GetCapabilities', 'Implemented', 'Live NASA GIBS layer discovery through XML capabilities parsing.'],
  ['WMS GetMap', 'Implemented', 'Leaflet WMS preview renders selected raster layers with opacity control.'],
  ['WFS GetCapabilities', 'Implemented', 'GeoServer feature type discovery is available in the service layer.'],
  ['WFS GetFeature', 'Implemented', 'GeoJSON features are requested with Tamil Nadu BBOX filtering.'],
  ['DescribeFeatureType', 'Implemented', 'URL builder and documented request pattern are included for schema inspection.'],
  ['GeoJSON Rendering', 'Implemented', 'WFS GeoJSON previews render on the OGC map with feature inspection.'],
  ['BBOX Filtering', 'Implemented', 'WFS requests use the Tamil Nadu spatial extent.'],
  ['Runtime Layer Discovery', 'Implemented', 'The OGC Explorer discovers remote WMS layers at runtime.'],
  ['SensorThings Conceptual Model', 'Implemented', 'Educational SensorThings entities are modeled and exposed by the demo API.'],
  ['Sensor Entity', 'Conceptual', 'Hardware metadata is represented in JSON for demonstration.'],
  ['FeatureOfInterest', 'Conceptual', 'Tamil Nadu regional atmosphere is modeled as a GeoJSON feature.'],
  ['HistoricalLocation', 'Conceptual', 'Station-location history is represented for standards literacy.'],
];

const cards = [
  { icon: Map, label: 'GIS Interoperability', value: 'WMS + WFS', color: '#22D3EE' },
  { icon: Database, label: 'Vector Exchange', value: 'GeoJSON', color: '#22C55E' },
  { icon: Server, label: 'IoT Model', value: 'SensorThings 1.1', color: '#FFFFFF' },
];

export default function CompliancePage() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center px-5 py-3 bg-[#0A0A0A] border border-white/[0.08] rounded-xl">
        <div>
          <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">Standards Evidence</p>
          <h2 className="text-xl font-bold text-white font-display">OGC Compliance</h2>
        </div>
        <ClipboardCheck className="w-5 h-5 text-[#22D3EE]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Icon className="w-4 h-4" style={{ color }} />
              <p className="text-[9px] text-[#525252] font-mono uppercase tracking-wider">{label}</p>
            </div>
            <p className="text-lg font-bold text-white font-display">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.2fr_0.5fr_1.8fr] px-4 py-3 bg-[#111] border-b border-white/[0.06] text-[9px] text-[#737373] font-mono uppercase tracking-wider">
          <span>Requirement</span>
          <span>Status</span>
          <span>Evidence</span>
        </div>
        {implemented.map(([requirement, status, evidence]) => (
          <div key={requirement} className="grid grid-cols-1 md:grid-cols-[1.2fr_0.5fr_1.8fr] gap-1 md:gap-0 px-4 py-3 border-b border-white/[0.04] text-[11px]">
            <span className="font-semibold text-white">{requirement}</span>
            <span className={`font-mono ${status === 'Implemented' ? 'text-[#22C55E]' : 'text-[#EAB308]'}`}>
              <CheckCircle2 className="inline w-3 h-3 mr-1" />{status}
            </span>
            <span className="text-[#737373] leading-relaxed">{evidence}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 p-4 bg-[#061316] border border-[#22D3EE]/20 rounded-xl">
        <Info className="w-5 h-5 text-[#22D3EE] flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#A3A3A3] leading-relaxed">
          This repository demonstrates OGC interoperability for education and internship assessment. WMS and WFS flows use live public services, while SensorThings entities are conceptual JSON models exposed through a lightweight demo API. It is not a certified OGC server and does not claim full SensorThings conformance.
        </p>
      </div>
    </div>
  );
}
