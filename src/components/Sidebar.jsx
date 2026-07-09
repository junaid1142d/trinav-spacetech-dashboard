import React from 'react';
import {
  LayoutDashboard, Map, Database, LineChart,
  Settings, Info, ChevronLeft, ChevronRight, Radio, User, Layers
} from 'lucide-react';

const LINKEDIN_URL = 'https://www.linkedin.com/in/junaid-ahmed-442025280/';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', name: 'Map & GIS', icon: Map },
  { id: 'analytics', name: 'Analytics', icon: LineChart },
  { id: 'explorer', name: 'Data Explorer', icon: Database },
  { id: 'ogc', name: 'OGC Viewer', icon: Layers },
  { id: 'settings', name: 'Settings', icon: Settings },
  { id: 'about', name: 'About', icon: Info },
];

export default function Sidebar({ activePage, setActivePage, sidebarOpen, setSidebarOpen }) {
  return (
    <aside className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${sidebarOpen ? 'w-60' : 'w-16'} flex flex-col justify-between border-r border-white/[0.06] bg-[#050505]`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between px-3 h-14 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <Radio className="w-4 h-4 text-black" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col select-none">
                <span className="font-bold text-[11px] tracking-wider text-white font-display">TRINAV SPACETECH</span>
                <span className="text-[8px] text-[#737373] tracking-widest font-mono uppercase">Atmospheric</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-md border border-white/10 text-[#737373] hover:text-white hover:border-white/25 transition-all"
          >
            {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="p-2 space-y-0.5 mt-1">
          {menuItems.map(({ id, name, icon: Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                title={!sidebarOpen ? name : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg transition-all duration-150 group
                  ${active
                    ? 'bg-white text-black'
                    : 'text-[#737373] hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-black' : 'text-[#737373] group-hover:text-white'}`} />
                {sidebarOpen && <span className="text-xs font-medium">{name}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06]">
        {sidebarOpen ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[9px] text-[#737373] uppercase tracking-wider font-mono">Developer</span>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="linkedin-link text-[11px] font-semibold truncate"
                >
                  Junaid Ahmed ↗
                </a>
              </div>
            </div>
            <div className="text-[8px] text-[#404040] font-mono text-center leading-relaxed">
              OGC SensorThings • Azure Ready
            </div>
          </div>
        ) : (
          <div className="flex justify-center group relative">
            <div className="w-7 h-7 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="absolute left-10 bottom-0 bg-[#111] border border-white/10 px-2 py-1 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              Junaid Ahmed
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
