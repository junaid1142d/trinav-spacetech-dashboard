import React, { useState } from 'react';
import { Ruler, Bookmark, Crosshair, Navigation, Maximize, Square, MapPin } from 'lucide-react';

const BOOKMARKS = [
  { name: 'Chennai Observatory', bounds: [[12.9, 80.1], [13.2, 80.4]] },
  { name: 'Coimbatore Wind Hub', bounds: [[10.8, 76.8], [11.2, 77.2]] },
  { name: 'Madurai Station', bounds: [[9.8, 78.0], [10.1, 78.3]] },
  { name: 'Kanyakumari Southern Tip', bounds: [[7.9, 77.3], [8.3, 77.7]] },
];

export default function GISToolbar({ mapInstance, mouseCoords }) {
  const [activeTool, setActiveTool] = useState(null);
  const [measurementResult, setMeasurementResult] = useState(null);

  const handleBookmark = (bm) => {
    if (mapInstance) {
      mapInstance.fitBounds(bm.bounds, { animate: true });
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-white/[0.08] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono">
      {/* Tools Group */}
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] text-[#525252] uppercase tracking-wider mr-1">GIS Tools:</span>
        <button
          onClick={() => {
            setActiveTool(activeTool === 'distance' ? null : 'distance');
            setMeasurementResult(activeTool === 'distance' ? null : 'Click 2 points on map to measure line distance');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
            activeTool === 'distance' ? 'bg-[#22D3EE] text-black font-bold border-[#22D3EE]' : 'bg-[#111] border-white/10 text-[#737373] hover:text-white'
          }`}
        >
          <Ruler className="w-3 h-3" /> Distance
        </button>

        <button
          onClick={() => {
            setActiveTool(activeTool === 'area' ? null : 'area');
            setMeasurementResult(activeTool === 'area' ? null : 'Click bounding region to estimate surface area');
          }}
          className={`flex items-center gap-1 px-2.5 py-1 rounded border transition-all ${
            activeTool === 'area' ? 'bg-[#22D3EE] text-black font-bold border-[#22D3EE]' : 'bg-[#111] border-white/10 text-[#737373] hover:text-white'
          }`}
        >
          <Square className="w-3 h-3" /> Area
        </button>
      </div>

      {/* Bookmarks */}
      <div className="flex items-center gap-1.5">
        <Bookmark className="w-3 h-3 text-[#EAB308]" />
        <span className="text-[8px] text-[#525252] uppercase tracking-wider">Bookmarks:</span>
        {BOOKMARKS.map(bm => (
          <button
            key={bm.name}
            onClick={() => handleBookmark(bm)}
            className="px-2 py-1 rounded bg-[#111] border border-white/[0.06] text-[#737373] hover:text-white transition-colors"
          >
            {bm.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Mouse Coordinates */}
      <div className="flex items-center gap-2 bg-[#111] border border-white/[0.06] px-2.5 py-1 rounded text-[9px]">
        <Crosshair className="w-3 h-3 text-[#22D3EE]" />
        <span className="text-[#525252]">Lat:</span>
        <span className="text-white font-bold">{mouseCoords ? mouseCoords.lat.toFixed(4) : '10.8000'}</span>
        <span className="text-[#525252]">Lng:</span>
        <span className="text-white font-bold">{mouseCoords ? mouseCoords.lng.toFixed(4) : '78.6000'}</span>
      </div>

      {measurementResult && (
        <div className="w-full text-[9px] text-[#22D3EE] bg-[#22D3EE]/10 border border-[#22D3EE]/20 rounded px-2.5 py-1">
          ℹ {measurementResult}
        </div>
      )}
    </div>
  );
}
